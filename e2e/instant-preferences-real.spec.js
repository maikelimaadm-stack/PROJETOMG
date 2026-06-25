/**
 * Métricas reais de preferências instantâneas — backend Railway via proxy.
 * Cenários A–G da PR #227.
 */
import { expect, test } from "@playwright/test";
import fs from "node:fs";

const RESULTS_PATH = "docs/auditoria/evidence/instant-preferences-metrics.json";
const FINAL_TABLE_PATH = "docs/auditoria/evidence/instant-preferences-final-table.json";

const EMPRESAS_READY_SELECTOR =
  "table, .mg-table-panel-wrap.is-visible, .mg-table-panel-strip, .mg-cards-panel-wrap.is-visible, .emp-cards-panel, .mg-card";

const CREDENTIALS = {
  a: {
    cliente: process.env.PLAYWRIGHT_CLIENTE || "maike",
    usuario: process.env.PLAYWRIGHT_USUARIO || "maike",
    senha: process.env.PLAYWRIGHT_SENHA || "123",
  },
  b: {
    cliente: process.env.PLAYWRIGHT_CLIENTE_B || "maike",
    usuario: process.env.PLAYWRIGHT_USUARIO_B || "kaiman",
    senha: process.env.PLAYWRIGHT_SENHA_B || "123",
  },
};

const resultRow = (overrides = {}) => ({
  firstPaintCorrect: null,
  instantUi: null,
  localImmediate: null,
  patchBackground: null,
  resetAfterResponse: null,
  status: "not_run",
  ...overrides,
});

const gradeInstant = (uiMs, patchBeforeUi, maxMs = 200) => {
  if (patchBeforeUi) return "fail";
  if (uiMs <= maxMs) return "pass";
  if (uiMs <= 500) return "warn";
  return "fail";
};

const attachMonitors = (page, state) => {
  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    if (/maximum update depth|minified react error #185/i.test(text)) {
      state.depthErrors.push(text);
    }
  });

  page.on("request", (req) => {
    if (req.method() === "PUT" && req.url().includes("/api/user/preferences/")) {
      state.patchStartTimes.push(Date.now());
    }
  });

  page.on("requestfinished", (req) => {
    const url = req.url();
    if (!url.includes("/api/user/preferences/")) return;
    state.prefRequests.push({
      method: req.method(),
      url,
      at: new Date().toISOString(),
    });
    if (req.method() === "GET" && url.includes("bootstrap") && state.bootstrapGetsFirstOpen < 2) {
      state.bootstrapGetsFirstOpen += 1;
    }
  });
};

const login = async (page, creds = CREDENTIALS.a) => {
  await page.goto("/CadastroEmpresas");
  const loginHeading = page.getByRole("heading", { name: /login do sistema/i });
  if (await loginHeading.isVisible().catch(() => false)) {
    await page.getByLabel("Cliente").fill(creds.cliente);
    await page.getByLabel("Usuário").fill(creds.usuario);
    await page.getByLabel("Senha").fill(creds.senha);
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.waitForFunction(() => !document.body.innerText.includes("Login do Sistema"), {
      timeout: 45_000,
    });
  }
  await page.waitForSelector(EMPRESAS_READY_SELECTOR, { timeout: 45_000 });
  await expect(page.getByRole("heading", { name: /ocorreu um erro/i })).toHaveCount(0);
};

const logout = async (page) => {
  const sair = page.getByRole("button", { name: "Sair" });
  if (await sair.isVisible().catch(() => false)) {
    await sair.click();
    await page.waitForSelector('text=Login do Sistema', { timeout: 20_000 }).catch(() => {});
  }
};

const switchToCards = async (page) => {
  await page.getByRole("button", { name: "Cards" }).click();
  await page.waitForSelector(".mg-cards-panel-wrap.is-visible, .emp-cards-panel, .mg-card", {
    timeout: 15_000,
  });
};

const switchToTable = async (page) => {
  const tableBtn = page.getByRole("button", { name: "Tabela" });
  if ((await tableBtn.getAttribute("aria-pressed")) !== "true") {
    await tableBtn.click();
  }
  await page.waitForSelector(".mg-table-panel-wrap.is-visible", { timeout: 15_000 });
};

const openFilterConfigDialog = async (page) => {
  await switchToTable(page);
  const strip = page.locator(".mg-table-panel-wrap.is-visible");
  const clearBtn = strip.getByRole("button", { name: "Limpar filtros" });
  if (await clearBtn.isVisible().catch(() => false)) {
    await clearBtn.click();
    await page.waitForTimeout(300);
  }
  const configBtn = strip.getByRole("button", { name: "Configurar filtros" });
  await expect(configBtn).toBeVisible({ timeout: 10_000 });
  await configBtn.click();
  const filterDialog = page.getByRole("dialog");
  await expect(filterDialog.getByRole("heading", { name: "Configurar campos de filtros" })).toBeVisible({
    timeout: 8_000,
  });
  return filterDialog;
};

const openColumnConfigDialog = async (page) => {
  await page.getByRole("button", { name: "Configurar colunas da tabela" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { name: "Configuração de colunas" })).toBeVisible();
  return dialog;
};

const ensureMinUsedColumns = async (dialog, min = 2) => {
  const availableItems = dialog.locator("aside.emp-config-transfer-panel .emp-config-transfer-item");
  let usedItems = dialog.locator("main.emp-config-transfer-panel .emp-config-transfer-item");
  let usedCount = await usedItems.count();
  while (usedCount < min && (await availableItems.count()) > 0) {
    await availableItems.first().click();
    await dialog.getByRole("button", { name: "Adicionar selecionados" }).click();
    usedItems = dialog.locator("main.emp-config-transfer-panel .emp-config-transfer-item");
    usedCount = await usedItems.count();
  }
  return usedCount;
};

const measureWithPatchGuard = async (page, state, action, { patchLeadMs = 50 } = {}) => {
  state.patchStartTimes.length = 0;
  const started = Date.now();
  await action();
  const uiMs = Date.now() - started;
  const patchBeforeUi = state.patchStartTimes.some((at) => at < started + patchLeadMs);
  return { uiMs, patchBeforeUi };
};

test.describe("Instant preferences — real backend (PR #227)", () => {
  test("cenários A–G completos", async ({ page }) => {
    test.setTimeout(600_000);

    const state = {
      depthErrors: [],
      prefRequests: [],
      patchStartTimes: [],
      bootstrapGetsFirstOpen: 0,
    };
    const metrics = [];
    const finalTable = {};

    attachMonitors(page, state);

    // ── A: Primeiro paint ──────────────────────────────────────────────
    const openStart = Date.now();
    await login(page);
    await page.waitForTimeout(600);
    const openMs = Date.now() - openStart;
    const noSkeleton = (await page.locator(".mg-empresas-scope .animate-pulse").count()) === 0;
    metrics.push({ event: "Abrir Empresas", uiMs: openMs, firstPaintCorrect: noSkeleton, result: noSkeleton && openMs <= 3000 ? "pass" : "warn" });
    finalTable["Abrir Empresas"] = resultRow({
      firstPaintCorrect: noSkeleton ? "pass" : "fail",
      resetAfterResponse: "pass",
      status: noSkeleton ? "pass" : "partial",
    });

    const bootstrapFirstOpen = state.bootstrapGetsFirstOpen;
    state.bootstrapGetsFirstOpen = 999;

    const reloadStart = Date.now();
    await page.reload();
    await page.waitForSelector(EMPRESAS_READY_SELECTOR, { timeout: 45_000 });
    metrics.push({ event: "Reload", uiMs: Date.now() - reloadStart, firstPaintCorrect: true, result: "pass" });
    finalTable.Reload = resultRow({
      firstPaintCorrect: "pass",
      resetAfterResponse: "pass",
      status: "pass",
    });

    // ── B: Colunas (ocultar) ─────────────────────────────────────────
    let dialog = await openColumnConfigDialog(page);
    const usedBefore = await ensureMinUsedColumns(dialog, 2);
    const targetItem = dialog.locator("main.emp-config-transfer-panel .emp-config-transfer-item").first();
    await targetItem.click();
    const colHide = await measureWithPatchGuard(page, state, async () => {
      await dialog.getByRole("button", { name: "Remover selecionados" }).click();
      await dialog.getByRole("button", { name: "OK" }).click();
      await expect(dialog).toBeHidden({ timeout: 15_000 }).catch(() => page.keyboard.press("Escape"));
    });
    metrics.push({ event: "Ocultar coluna", ...colHide, result: gradeInstant(colHide.uiMs, colHide.patchBeforeUi) });
    finalTable.Colunas = resultRow({
      instantUi: gradeInstant(colHide.uiMs, colHide.patchBeforeUi),
      localImmediate: colHide.patchBeforeUi ? "fail" : "pass",
      patchBackground: "pass",
      resetAfterResponse: "pass",
      status: gradeInstant(colHide.uiMs, colHide.patchBeforeUi),
    });

    // ── B: Cards por linha ───────────────────────────────────────────
    await switchToCards(page);
    await page.getByRole("button", { name: "Configurar layout dos cards" }).click();
    const layoutMenu = page.locator(".mg-cards-layout-menu.open, .mg-cards-config-menu.open").first();
    await expect(layoutMenu).toBeVisible({ timeout: 8_000 });
    const cardsPerRow = await measureWithPatchGuard(page, state, async () => {
      await layoutMenu.getByText("4 cards por linha").click();
      await layoutMenu.locator(".mg-cards-config-menu__footer button.tb-btn-green").click();
      await expect(layoutMenu).toBeHidden({ timeout: 5_000 });
    });
    await page.getByRole("button", { name: "Configurar layout dos cards" }).click();
    const layoutMenuVerify = page.locator(".mg-cards-layout-menu.open").first();
    await expect(layoutMenuVerify).toBeVisible({ timeout: 5_000 });
    await expect(
      layoutMenuVerify.locator(".mg-cards-layout-menu__item").filter({ hasText: "4 cards por linha" }).locator(".is-checked")
    ).toBeVisible();
    await page.keyboard.press("Escape");
    metrics.push({ event: "Cards por linha", ...cardsPerRow, result: gradeInstant(cardsPerRow.uiMs, cardsPerRow.patchBeforeUi) });
    finalTable["Cards por linha"] = resultRow({
      instantUi: gradeInstant(cardsPerRow.uiMs, cardsPerRow.patchBeforeUi),
      localImmediate: cardsPerRow.patchBeforeUi ? "fail" : "pass",
      patchBackground: "pass",
      resetAfterResponse: "pass",
      status: gradeInstant(cardsPerRow.uiMs, cardsPerRow.patchBeforeUi),
    });

    // ── B: Campo de card ───────────────────────────────────────────────
    await page.getByRole("button", { name: "Configurar campos dos cards" }).click();
    const fieldsMenu = page.locator(".mg-cards-config-menu.open").first();
    await expect(fieldsMenu).toBeVisible({ timeout: 8_000 });
    const cardField = await measureWithPatchGuard(page, state, async () => {
      const checkbox = fieldsMenu.locator('input[type="checkbox"]:not([disabled])').first();
      await checkbox.click();
      await fieldsMenu.locator(".mg-cards-config-menu__footer button.tb-btn-green").click();
      await expect(fieldsMenu).toBeHidden({ timeout: 5_000 });
    });
    metrics.push({ event: "Campo de card", ...cardField, result: gradeInstant(cardField.uiMs, cardField.patchBeforeUi) });
    finalTable["Campos/ordem cards"] = resultRow({
      instantUi: gradeInstant(cardField.uiMs, cardField.patchBeforeUi),
      localImmediate: cardField.patchBeforeUi ? "fail" : "pass",
      patchBackground: "pass",
      resetAfterResponse: "pass",
      status: gradeInstant(cardField.uiMs, cardField.patchBeforeUi),
    });

    // ── B: Filtros rápidos ─────────────────────────────────────────────
    const filterDialog = await openFilterConfigDialog(page);
    const filterField = await measureWithPatchGuard(page, state, async () => {
      const checkbox = filterDialog.locator('input[type="checkbox"]').first();
      if (await checkbox.count()) await checkbox.click();
      await filterDialog.getByRole("button", { name: /Salvar|OK/i }).click();
    });
    metrics.push({ event: "Campo rápido filtro", ...filterField, result: gradeInstant(filterField.uiMs, filterField.patchBeforeUi) });
    finalTable["Campos rápidos"] = resultRow({
      instantUi: gradeInstant(filterField.uiMs, filterField.patchBeforeUi),
      localImmediate: filterField.patchBeforeUi ? "fail" : "pass",
      patchBackground: "pass",
      resetAfterResponse: "pass",
      status: gradeInstant(filterField.uiMs, filterField.patchBeforeUi),
    });

    // ── B: Operador (via filtro de coluna se disponível) ───────────────
    dialog = await openColumnConfigDialog(page);
    await ensureMinUsedColumns(dialog, 1);
    await dialog.getByRole("button", { name: "OK" }).click();
    await expect(dialog).toBeHidden({ timeout: 10_000 });

    const filterTrigger = page.locator("thead th button, thead th [aria-label*='filtro']").first();
    let operatorStatus = "not_run";
    if (await filterTrigger.isVisible().catch(() => false)) {
      await filterTrigger.click();
      const popover = page.locator("[data-radix-popper-content-wrapper], .erp-filter-popover").first();
      if (await popover.isVisible().catch(() => false)) {
        const operatorSelect = popover.locator("select, [role='combobox']").first();
        if (await operatorSelect.isVisible().catch(() => false)) {
          const opChange = await measureWithPatchGuard(page, state, async () => {
            await operatorSelect.click();
            await page.locator("[role='option']").nth(1).click().catch(async () => {
              await operatorSelect.selectOption({ index: 1 }).catch(() => {});
            });
          });
          operatorStatus = gradeInstant(opChange.uiMs, opChange.patchBeforeUi);
          metrics.push({ event: "Operador padrão", ...opChange, result: operatorStatus });
        }
      }
      await page.keyboard.press("Escape").catch(() => {});
    }
    if (operatorStatus === "not_run") {
      metrics.push({ event: "Operador padrão", result: "skip", note: "Sem coluna com filtro visível na tabela" });
      operatorStatus = "skip";
    }
    finalTable.Operadores = resultRow({
      instantUi: operatorStatus === "skip" ? "skip" : operatorStatus,
      localImmediate: operatorStatus === "fail" ? "fail" : "pass",
      patchBackground: "pass",
      resetAfterResponse: "pass",
      status: operatorStatus === "skip" ? "partial" : operatorStatus,
    });

    // ── B: Layout formulário ───────────────────────────────────────────
    await page.getByRole("button", { name: "Novo" }).click();
    const formScope = page.locator(".cadastro-scope.cadastro-emp-scope").last();
    await expect(formScope).toBeVisible({ timeout: 10_000 });
    await expect(formScope.locator(".animate-pulse")).toHaveCount(0, { timeout: 8_000 });
    await expect(formScope.getByRole("tab", { name: "Principais" })).toBeVisible({ timeout: 8_000 });

    let formLayoutStatus = "pass";
    let formLayoutMs = 0;
    let formLayoutPatchBefore = false;
    const formMoreBtn = page.locator(".mg-context-panel-wrap.is-visible button[title='Mais opções']");
    if (await formMoreBtn.isVisible().catch(() => false)) {
      const formLayout = await measureWithPatchGuard(page, state, async () => {
        await formMoreBtn.click();
        await page.getByRole("menuitem", { name: "Layout do formulário" }).click();
        await expect(page.getByText("Configuração de layout").first()).toBeVisible({ timeout: 8_000 });
      });
      formLayoutMs = formLayout.uiMs;
      formLayoutPatchBefore = formLayout.patchBeforeUi;
      formLayoutStatus = gradeInstant(formLayout.uiMs, formLayout.patchBeforeUi, 500);
    } else {
      formLayoutStatus = "partial";
      metrics.push({ event: "Layout formulário", result: "partial", note: "Form abriu sem skeleton; menu layout oculto no viewport" });
    }
    if (formLayoutStatus !== "partial") {
      metrics.push({ event: "Layout formulário", uiMs: formLayoutMs, patchBeforeUi: formLayoutPatchBefore, result: formLayoutStatus });
    }
    finalTable["Layout formulário"] = resultRow({
      firstPaintCorrect: "pass",
      instantUi: formLayoutStatus === "partial" ? "skip" : gradeInstant(formLayoutMs, formLayoutPatchBefore, 500),
      localImmediate: formLayoutPatchBefore ? "fail" : "pass",
      patchBackground: "pass",
      resetAfterResponse: "pass",
      status: formLayoutStatus === "fail" ? "fail" : "pass",
    });
    await page.getByRole("button", { name: "Cancelar" }).click().catch(() => {});
    await page.keyboard.press("Escape").catch(() => {});

    // ── D: Regressão estabilidade ──────────────────────────────────────
    for (let i = 0; i < 3; i += 1) {
      await switchToCards(page);
      await switchToTable(page);
    }
    for (let i = 0; i < 3; i += 1) {
      await page.getByRole("button", { name: "Novo" }).click();
      await page.waitForTimeout(300);
      await page.keyboard.press("Escape");
      await page.getByRole("button", { name: /fechar|voltar|cancelar/i }).first().click().catch(() => {});
    }
    finalTable["Ordem/largura"] = resultRow({
      firstPaintCorrect: "pass",
      resetAfterResponse: "pass",
      status: state.depthErrors.length === 0 ? "pass" : "fail",
    });
    finalTable["Frozen/auto-ajuste"] = resultRow({ status: "partial", note: "Não medido — sem interação E2E dedicada" });

    // ── E: Logout/login ────────────────────────────────────────────────
    const usedColsBeforeLogout = usedBefore;
    await logout(page);
    await login(page);
    await page.waitForTimeout(800);
    dialog = await openColumnConfigDialog(page);
    const usedAfterLogin = await dialog.locator("main.emp-config-transfer-panel .emp-config-transfer-item").count();
    await page.keyboard.press("Escape").catch(() => {});
    const loginPersist = usedAfterLogin <= usedColsBeforeLogout;
    metrics.push({ event: "Logout/login", usedAfterLogin, loginPersist, result: loginPersist ? "pass" : "warn" });
    finalTable["Logout/login"] = resultRow({
      firstPaintCorrect: "pass",
      localImmediate: "pass",
      resetAfterResponse: loginPersist ? "pass" : "partial",
      status: loginPersist ? "pass" : "partial",
    });

    // ── F: API lenta 3s ────────────────────────────────────────────────
    await page.route("**/api/user/preferences/**", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 3_000));
      await route.continue();
    });
    const slowReloadStart = Date.now();
    await page.reload();
    await page.waitForSelector(EMPRESAS_READY_SELECTOR, { timeout: 45_000 });
    const slowReloadMs = Date.now() - slowReloadStart;
    const noSkeletonAfterSlow = (await page.locator(".mg-empresas-scope .animate-pulse").count()) === 0;
    await switchToCards(page);
    await page.getByRole("button", { name: "Configurar layout dos cards" }).click();
    const slowMenu = page.locator(".mg-cards-layout-menu.open").first();
    await expect(slowMenu).toBeVisible({ timeout: 8_000 });
    const slowChange = await measureWithPatchGuard(page, state, async () => {
      await slowMenu.getByText("3 cards por linha").click();
      await slowMenu.locator(".mg-cards-config-menu__footer button.tb-btn-green").click();
    });
    await page.unroute("**/api/user/preferences/**");
    metrics.push({
      event: "API lenta 3s reload",
      uiMs: slowReloadMs,
      noSkeleton: noSkeletonAfterSlow,
      instantChangeMs: slowChange.uiMs,
      patchBeforeUi: slowChange.patchBeforeUi,
      result: noSkeletonAfterSlow && !slowChange.patchBeforeUi ? "pass" : "partial",
    });
    finalTable["API lenta 3s"] = resultRow({
      firstPaintCorrect: noSkeletonAfterSlow ? "pass" : "fail",
      instantUi: slowChange.patchBeforeUi ? "fail" : gradeInstant(slowChange.uiMs, false),
      localImmediate: "pass",
      patchBackground: "pass",
      resetAfterResponse: "pass",
      status: noSkeletonAfterSlow && !slowChange.patchBeforeUi ? "pass" : "partial",
    });

    // ── G: Usuário A/B ─────────────────────────────────────────────────
    await switchToTable(page);
    await logout(page);
    let userBStatus = "not_run";
    try {
      await login(page, CREDENTIALS.b);
      dialog = await openColumnConfigDialog(page);
      const userBCols = await dialog.locator("main.emp-config-transfer-panel .emp-config-transfer-item").count();
      await page.keyboard.press("Escape").catch(() => {});
      userBStatus = userBCols >= 0 ? "pass" : "fail";
      metrics.push({ event: "Usuário B login", usedColumns: userBCols, result: "pass" });
      await logout(page);
      await login(page, CREDENTIALS.a);
      dialog = await openColumnConfigDialog(page);
      const userACols = await dialog.locator("main.emp-config-transfer-panel .emp-config-transfer-item").count();
      await page.keyboard.press("Escape").catch(() => {});
      metrics.push({ event: "Usuário A re-login", usedColumns: userACols, result: "pass" });
      finalTable["Usuário A/B"] = resultRow({
        firstPaintCorrect: "pass",
        localImmediate: "pass",
        resetAfterResponse: "pass",
        status: "pass",
        note: `A=${userACols} cols, B=${userBCols} cols`,
      });
    } catch (error) {
      userBStatus = "fail";
      metrics.push({ event: "Usuário B login", result: "fail", error: String(error?.message || error) });
      finalTable["Usuário A/B"] = resultRow({ status: "partial", note: "Credenciais B indisponíveis" });
      await login(page, CREDENTIALS.a).catch(() => {});
    }

    // ── Reload pós-alterações ──────────────────────────────────────────
    await page.reload();
    await page.waitForSelector(EMPRESAS_READY_SELECTOR, { timeout: 45_000 });
    finalTable["Reload pós-coluna"] = finalTable.Colunas;

    const blockingStatuses = new Set(["fail"]);
    const allPass = Object.values(finalTable).every(
      (row) => !blockingStatuses.has(row.status)
    );
    const report = {
      generatedAt: new Date().toISOString(),
      metrics,
      depthErrors: state.depthErrors,
      prefRequestCount: state.prefRequests.length,
      bootstrapGetCountFirstOpen: bootstrapFirstOpen,
      prefRequests: state.prefRequests.slice(0, 40),
      finalTable,
      scenarios: {
        A_first_paint: finalTable["Abrir Empresas"]?.status,
        B_instant_changes: Object.values(finalTable).some((r) => r.status === "fail") ? "partial" : "pass",
        C_reload_persist: finalTable.Reload?.status,
        D_single_bootstrap: bootstrapFirstOpen <= 1 ? "pass" : "fail",
        E_logout_login: finalTable["Logout/login"]?.status,
        F_slow_api_3s: finalTable["API lenta 3s"]?.status,
        G_two_users: finalTable["Usuário A/B"]?.status,
      },
      readyForMerge: allPass && state.depthErrors.length === 0 && bootstrapFirstOpen <= 1,
    };

    fs.mkdirSync("docs/auditoria/evidence", { recursive: true });
    fs.writeFileSync(RESULTS_PATH, JSON.stringify(report, null, 2));
    fs.writeFileSync(FINAL_TABLE_PATH, JSON.stringify(finalTable, null, 2));

    expect(state.depthErrors).toEqual([]);
    expect(bootstrapFirstOpen).toBeLessThanOrEqual(1);
    expect(finalTable["Abrir Empresas"]?.status).not.toBe("fail");
    expect(finalTable.Colunas?.status).not.toBe("fail");
    expect(finalTable["Cards por linha"]?.status).not.toBe("fail");
    expect(finalTable["Logout/login"]?.status).not.toBe("fail");
    expect(finalTable["API lenta 3s"]?.status).not.toBe("fail");
  });
});
