/**
 * Etapa 1 — Stress de hidratação TBLEMP (PR #222).
 * Valida ausência de "Maximum update depth exceeded" e loops GET/PUT.
 *
 * Uso: npx playwright test --config=playwright.stress.config.js
 */
import { expect, test } from "@playwright/test";
import fs from "node:fs";

const STORAGE_KEYS = {
  visible: "emp_col_visiveis",
  visibleInit: "emp_col_vis_initialized_v1",
  order: "emp_col_ordem",
  filters: "emp_col_filters_v2",
  filterLayout: "emp_filter_fields_layout_v1",
  cardsVis: "emp_search_vis_fields_v2",
  cardsLayout: "emp_cards_layout_v1",
};

const results = [];

const createMonitor = () => ({
  consoleErrors: [],
  reactDepthErrors: [],
  prefBootstrapGets: 0,
  prefListagemGets: 0,
  prefListagemPuts: 0,
  prefFormPuts: 0,
  crashUiSeen: false,
});

const attachMonitor = async (page, monitor) => {
  await page.route("**/api/user/preferences/**", async (route) => {
    const req = route.request();
    const url = req.url();
    const method = req.method();
    if (url.includes("/bootstrap") && method === "GET") monitor.prefBootstrapGets += 1;
    if (url.includes("/empresas/listagem")) {
      if (method === "GET") monitor.prefListagemGets += 1;
      if (method === "PUT") monitor.prefListagemPuts += 1;
    }
    if (url.includes("/empresas/form_layout") && method === "PUT") monitor.prefFormPuts += 1;
    await route.continue();
  });

  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    monitor.consoleErrors.push(text);
    if (/maximum update depth|minified react error #185/i.test(text)) {
      monitor.reactDepthErrors.push(text);
    }
  });

  page.on("pageerror", (error) => {
    monitor.consoleErrors.push(error.message);
    if (/maximum update depth/i.test(error.message)) {
      monitor.reactDepthErrors.push(error.message);
    }
  });
};

const assertHealthy = async (page, monitor, label) => {
  const crashUi = page.getByRole("heading", { name: /ocorreu um erro na interface/i });
  monitor.crashUiSeen = await crashUi.isVisible().catch(() => false);

  const getsBefore = monitor.prefBootstrapGets + monitor.prefListagemGets;
  const putsBefore = monitor.prefListagemPuts + monitor.prefFormPuts;
  await page.waitForTimeout(800);
  const getsDelta = monitor.prefBootstrapGets + monitor.prefListagemGets - getsBefore;
  const putsDelta = monitor.prefListagemPuts + monitor.prefFormPuts - putsBefore;

  const row = {
    cenario: label,
    consoleSemErro: monitor.reactDepthErrors.length === 0 && !monitor.crashUiSeen,
    semLoopRender: monitor.reactDepthErrors.length === 0 && !monitor.crashUiSeen,
    semLoopGetPut: getsDelta <= 2 && putsDelta <= 1,
    telaUtilizavel: !monitor.crashUiSeen,
    status:
      monitor.reactDepthErrors.length === 0 &&
      !monitor.crashUiSeen &&
      getsDelta <= 2 &&
      putsDelta <= 1
        ? "PASS"
        : "FAIL",
    detalhes: {
      reactDepthErrors: [...monitor.reactDepthErrors],
      crashUi: monitor.crashUiSeen,
      getsDelta,
      putsDelta,
      consoleErrorCount: monitor.consoleErrors.length,
    },
  };
  results.push(row);
  expect(monitor.reactDepthErrors, `${label}: React depth error`).toHaveLength(0);
  expect(monitor.crashUiSeen, `${label}: crash UI`).toBe(false);
  return row;
};

const waitEmpresasReady = async (page) => {
  await page.goto("/CadastroEmpresas");
  await page.waitForSelector("table, .mg-table-panel, .mg-cards-panel", { timeout: 45_000 });
  await expect(page.getByRole("heading", { name: /ocorreu um erro/i })).toHaveCount(0);
};

const ensureTableView = async (page) => {
  const table = page.locator("table").first();
  if (await table.isVisible().catch(() => false)) return;
  const tableBtn = page.getByRole("button", { name: "Tabela" });
  if (await tableBtn.isVisible().catch(() => false)) {
    await tableBtn.click();
    await page.waitForSelector("table", { timeout: 15_000 });
  }
};

const switchToCards = async (page) => {
  await page.getByRole("button", { name: "Cards" }).click();
  await page.waitForTimeout(400);
};

const switchToTable = async (page) => {
  await page.getByRole("button", { name: "Tabela" }).click();
  await page.waitForTimeout(400);
};

const openCloseForm = async (page) => {
  await page.getByRole("button", { name: "Novo" }).click();
  await page.waitForTimeout(500);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);
  const closeBtn = page.getByRole("button", { name: /fechar|voltar|cancelar/i }).first();
  if (await closeBtn.isVisible().catch(() => false)) {
    await closeBtn.click();
  }
};

const hideTelefoneColumn = async (page) => {
  await page.getByRole("button", { name: "Configurar colunas da tabela" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { name: "Configuração de colunas" })).toBeVisible();
  await dialog.locator(".emp-config-transfer-item").filter({ hasText: "Telefone" }).first().click();
  await dialog.getByRole("button", { name: "Remover selecionados" }).click();
  await dialog.getByRole("button", { name: "OK" }).click();
  await page.waitForTimeout(900);
};

const tweakCardsPreference = async (page) => {
  await switchToCards(page);
  await page.getByRole("button", { name: "Configurar campos dos cards" }).click();
  const panel = page.locator(".mg-cards-config-menu.open, [role='dialog']").first();
  await expect(panel).toBeVisible({ timeout: 8_000 });
  const firstCheckbox = panel.locator('input[type="checkbox"]').first();
  if (await firstCheckbox.count()) await firstCheckbox.click();
  await panel.getByRole("button", { name: /^Ok$/i }).click();
  await page.waitForTimeout(600);
  await switchToTable(page);
};

const tweakFilterPreference = async (page) => {
  await page.getByLabel("Configurar filtros").click();
  const dialog = page.getByRole("dialog");
  if (await dialog.isVisible().catch(() => false)) {
    const checkbox = dialog.locator('input[type="checkbox"]').first();
    if (await checkbox.count()) await checkbox.click();
    await dialog.getByRole("button", { name: /^OK$|^Ok$|Salvar/i }).first().click().catch(() => {});
  }
  await page.keyboard.press("Escape");
  await page.waitForTimeout(600);
};

const seedLocalStorage = async (page, entries) => {
  await page.addInitScript((pairs) => {
    pairs.forEach(([key, value]) => {
      if (value == null) window.localStorage.removeItem(key);
      else window.localStorage.setItem(key, value);
    });
  }, entries);
};

test.describe("PR #222 render stress — TBLEMP hydration", () => {
  test.afterAll(() => {
    fs.writeFileSync(
      "e2e/empresas-render-stress.results.json",
      JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2)
    );
  });

  test("stress completo desktop", async ({ page }) => {
    test.setTimeout(600_000);
    const monitor = createMonitor();
    await attachMonitor(page, monitor);

    await waitEmpresasReady(page);
    await ensureTableView(page);
    await assertHealthy(page, monitor, "1. Primeira abertura Empresas");

    for (let i = 1; i <= 10; i += 1) {
      await page.reload();
      await page.waitForSelector("table, .mg-table-panel, .mg-cards-panel", { timeout: 45_000 });
      await ensureTableView(page);
      await assertHealthy(page, monitor, `2.${i} Reload ${i}/10`);
    }

    for (let i = 1; i <= 10; i += 1) {
      await switchToCards(page);
      await assertHealthy(page, monitor, `3.${i}a Tabela→Cards ${i}/10`);
      await switchToTable(page);
      await assertHealthy(page, monitor, `3.${i}b Cards→Tabela ${i}/10`);
    }

    for (let i = 1; i <= 10; i += 1) {
      await openCloseForm(page);
      await assertHealthy(page, monitor, `4.${i} Abrir/fechar formulário ${i}/10`);
    }

    await hideTelefoneColumn(page);
    await assertHealthy(page, monitor, "5. Alterar preferência coluna");
    await page.reload();
    await page.waitForSelector("table, .mg-table-panel, .mg-cards-panel", { timeout: 45_000 });
    await ensureTableView(page);
    await assertHealthy(page, monitor, "5b. Reload após coluna");

    await tweakCardsPreference(page);
    await assertHealthy(page, monitor, "6. Alterar preferência cards");
    await page.reload();
    await page.waitForSelector("table, .mg-cards-panel", { timeout: 45_000 });
    await assertHealthy(page, monitor, "6b. Reload após cards");

    await tweakFilterPreference(page);
    await assertHealthy(page, monitor, "7. Alterar preferência filtros");
    await page.reload();
    await page.waitForSelector("table, .mg-cards-panel", { timeout: 45_000 });
    await assertHealthy(page, monitor, "7b. Reload após filtros");
  });

  test("preferência vazia e corrompida", async ({ page }) => {
    test.setTimeout(180_000);

    await seedLocalStorage(page, [
      [STORAGE_KEYS.visible, "[]"],
      [STORAGE_KEYS.visibleInit, "true"],
      [STORAGE_KEYS.order, "[]"],
    ]);
    const monitorEmpty = createMonitor();
    await attachMonitor(page, monitorEmpty);
    await waitEmpresasReady(page);
    await ensureTableView(page);
    await assertHealthy(page, monitorEmpty, "8. Preferência vazia (colunas [])");

    await seedLocalStorage(page, [
      [STORAGE_KEYS.visible, "{invalid-json"],
      [STORAGE_KEYS.filters, "not-json-at-all"],
      [STORAGE_KEYS.filterLayout, "{{"],
    ]);
    const monitorCorrupt = createMonitor();
    await attachMonitor(page, monitorCorrupt);
    await page.reload();
    await page.waitForSelector("table, .mg-table-panel, .mg-cards-panel", { timeout: 45_000 });
    await ensureTableView(page);
    await assertHealthy(page, monitorCorrupt, "9. Preferência corrompida localStorage");
  });

  test("stress mobile viewport", async ({ page }) => {
    test.setTimeout(300_000);
    await page.setViewportSize({ width: 390, height: 844 });
    const monitor = createMonitor();
    await attachMonitor(page, monitor);

    await waitEmpresasReady(page);
    await assertHealthy(page, monitor, "10a. Mobile — primeira abertura");

    for (let i = 1; i <= 5; i += 1) {
      await page.reload();
      await page.waitForSelector("table, .mg-cards-panel, .mg-table-panel", { timeout: 45_000 });
      await assertHealthy(page, monitor, `10b.${i} Mobile reload ${i}/5`);
    }

    for (let i = 1; i <= 5; i += 1) {
      const cardsBtn = page.getByRole("button", { name: "Cards" });
      if (await cardsBtn.isVisible().catch(() => false)) {
        await cardsBtn.click();
        await assertHealthy(page, monitor, `10c.${i}a Mobile Cards ${i}/5`);
      }
      const tableBtn = page.getByRole("button", { name: "Tabela" });
      if (await tableBtn.isVisible().catch(() => false)) {
        await tableBtn.click();
        await assertHealthy(page, monitor, `10c.${i}b Mobile Tabela ${i}/5`);
      }
    }
  });
});
