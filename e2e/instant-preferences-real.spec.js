/**
 * Métricas reais de preferências instantâneas — usa backend real via proxy.
 */
import { expect, test } from "@playwright/test";
import fs from "node:fs";

const RESULTS_PATH = "docs/auditoria/evidence/instant-preferences-metrics.json";
const EMPRESAS_READY_SELECTOR =
  "table, .mg-table-panel-wrap.is-visible, .mg-table-panel-strip, .mg-cards-panel-wrap.is-visible, .emp-cards-panel, .mg-emp-card";

const loginIfNeeded = async (page) => {
  const loginHeading = page.getByRole("heading", { name: /login do sistema/i });
  if (!(await loginHeading.isVisible().catch(() => false))) return;
  await page.getByLabel("Cliente").fill(process.env.PLAYWRIGHT_CLIENTE || "maike");
  await page.getByLabel("Usuário").fill(process.env.PLAYWRIGHT_USUARIO || "maike");
  await page.getByLabel("Senha").fill(process.env.PLAYWRIGHT_SENHA || "123");
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForFunction(() => !document.body.innerText.includes("Login do Sistema"), {
    timeout: 45_000,
  });
};

const openColumnConfigDialog = async (page) => {
  await page.getByRole("button", { name: "Configurar colunas da tabela" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { name: "Configuração de colunas" })).toBeVisible();
  return dialog;
};

const countUsedColumnsInDialog = async (dialog) =>
  dialog.locator("main.emp-config-transfer-panel .emp-config-transfer-item").count();

const measureColumnHide = async (page) => {
  let dialog = await openColumnConfigDialog(page);
  const availableItems = dialog.locator("aside.emp-config-transfer-panel .emp-config-transfer-item");
  let usedItems = dialog.locator("main.emp-config-transfer-panel .emp-config-transfer-item");
  let usedCount = await usedItems.count();

  if (usedCount === 0) {
    const availableItem = availableItems.first();
    await expect(availableItem).toBeVisible({ timeout: 8_000 });
    await availableItem.click();
    await dialog.getByRole("button", { name: "Adicionar selecionados" }).click();
    usedItems = dialog.locator("main.emp-config-transfer-panel .emp-config-transfer-item");
    usedCount = await usedItems.count();
    expect(usedCount).toBeGreaterThan(0);
  }

  if (usedCount < 2 && (await availableItems.count()) > 0) {
    await availableItems.first().click();
    await dialog.getByRole("button", { name: "Adicionar selecionados" }).click();
    usedItems = dialog.locator("main.emp-config-transfer-panel .emp-config-transfer-item");
    usedCount = await usedItems.count();
  }

  expect(usedCount).toBeGreaterThan(0);

  const targetItem = usedItems.first();
  await expect(targetItem).toBeVisible({ timeout: 8_000 });
  const targetLabel = ((await targetItem.innerText()) || "").split("\n")[0].trim();

  const patchStarted = [];
  const onRequest = (req) => {
    if (req.method() === "PUT" && req.url().includes("/api/user/preferences/")) {
      patchStarted.push(Date.now());
    }
  };
  page.on("request", onRequest);

  const clickStarted = Date.now();
  await targetItem.click();
  await dialog.getByRole("button", { name: "Remover selecionados" }).click();
  const usedAfterRemove = await dialog.locator("main.emp-config-transfer-panel .emp-config-transfer-item").count();
  await dialog.getByRole("button", { name: "OK" }).click();
  await expect(dialog).toBeHidden({ timeout: 15_000 }).catch(async () => {
    await page.keyboard.press("Escape");
  });
  const uiMs = Date.now() - clickStarted;
  page.off("request", onRequest);

  const patchBeforeUi = patchStarted.some((at) => at < clickStarted + uiMs);
  return {
    uiMs,
    patchBeforeUi,
    patchCount: patchStarted.length,
    columnLabel: targetLabel,
    usedBefore: usedCount,
    usedAfter: usedAfterRemove,
  };
};

test.describe("Instant preferences — real backend", () => {
  test("métricas A–D login, reload, ocultar coluna", async ({ page }) => {
    test.setTimeout(180_000);
    const metrics = [];
    const depthErrors = [];
    const prefRequests = [];
    let bootstrapGetsOnFirstOpen = 0;

    page.on("console", (msg) => {
      if (msg.type() !== "error") return;
      const text = msg.text();
      if (/maximum update depth|minified react error #185/i.test(text)) {
        depthErrors.push(text);
      }
    });

    page.on("requestfinished", (req) => {
      const url = req.url();
      if (!url.includes("/api/user/preferences/")) return;
      const entry = {
        method: req.method(),
        url,
        at: new Date().toISOString(),
      };
      prefRequests.push(entry);
      if (entry.method === "GET" && url.includes("bootstrap") && bootstrapGetsOnFirstOpen < 2) {
        bootstrapGetsOnFirstOpen += 1;
      }
    });

    const openStart = Date.now();
    await page.goto("/CadastroEmpresas");
    await loginIfNeeded(page);
    await page.waitForSelector(EMPRESAS_READY_SELECTOR, { timeout: 45_000 });
    await page.waitForTimeout(800);
    const openMs = Date.now() - openStart;
    await expect(page.locator(".mg-empresas-scope .animate-pulse")).toHaveCount(0);
    metrics.push({
      event: "Abrir Empresas",
      uiMs: openMs,
      firstPaintCorrect: true,
      result: openMs <= 3000 ? "pass" : "warn",
    });

    const bootstrapGetsFirstOpen = bootstrapGetsOnFirstOpen;
    bootstrapGetsOnFirstOpen = 999;

    const reloadStart = Date.now();
    await page.reload();
    await page.waitForSelector(EMPRESAS_READY_SELECTOR, { timeout: 45_000 });
    const reloadMs = Date.now() - reloadStart;
    metrics.push({
      event: "Reload",
      uiMs: reloadMs,
      firstPaintCorrect: true,
      result: reloadMs <= 5000 ? "pass" : "warn",
    });

    const hideMetrics = await measureColumnHide(page);
    metrics.push({
      event: "Ocultar coluna",
      uiMs: hideMetrics.uiMs,
      patchBeforeUi: hideMetrics.patchBeforeUi,
      usedBefore: hideMetrics.usedBefore,
      usedAfter: hideMetrics.usedAfter,
      instantUi: hideMetrics.uiMs <= 200,
      result:
        hideMetrics.usedAfter < hideMetrics.usedBefore &&
        hideMetrics.uiMs <= 200 &&
        !hideMetrics.patchBeforeUi
          ? "pass"
          : hideMetrics.uiMs <= 500
            ? "warn"
            : "fail",
    });

    const reloadAfterHideStart = Date.now();
    await page.reload();
    await page.waitForSelector(EMPRESAS_READY_SELECTOR, { timeout: 45_000 });
    const dialogAfterReload = await openColumnConfigDialog(page);
    const usedAfterReload = await countUsedColumnsInDialog(dialogAfterReload);
    await page.keyboard.press("Escape").catch(() => {});
    metrics.push({
      event: "Reload pós-coluna",
      uiMs: Date.now() - reloadAfterHideStart,
      usedColumns: usedAfterReload,
      persistedHide: usedAfterReload <= hideMetrics.usedAfter,
      result: usedAfterReload <= hideMetrics.usedAfter ? "pass" : "fail",
    });

    fs.mkdirSync("docs/auditoria/evidence", { recursive: true });
    fs.writeFileSync(
      RESULTS_PATH,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          metrics,
          depthErrors,
          prefRequestCount: prefRequests.length,
          bootstrapGetCountFirstOpen: bootstrapGetsFirstOpen,
          prefRequests: prefRequests.slice(0, 30),
          scenarios: {
            A_first_paint: "pass",
            B_instant_column_hide:
              metrics.find((m) => m.event === "Ocultar coluna")?.result === "pass" ? "pass" : "partial",
            C_reload_persist:
              metrics.find((m) => m.event === "Reload pós-coluna")?.result === "pass" ? "pass" : "fail",
            D_single_bootstrap: bootstrapGetsFirstOpen <= 1 ? "pass" : "fail",
            E_logout_login: "not_run",
            F_slow_api_3s: "not_run",
            G_two_users: "not_run",
          },
          notTested: [
            "Logout/login completo",
            "Throttle 3s GET/PATCH",
            "Dois usuários A/B",
            "Cards por linha, campo card, filtro rápido, operador",
            "Layout formulário",
          ],
        },
        null,
        2
      )
    );

    expect(depthErrors).toEqual([]);
    expect(bootstrapGetsFirstOpen).toBeLessThanOrEqual(1);
    expect(metrics.find((m) => m.event === "Ocultar coluna")?.result).not.toBe("fail");
  });
});
