/**
 * Métricas reais de preferências instantâneas — usa backend real via proxy.
 * Grava preferências do usuário de teste; restaura estado quando possível.
 */
import { expect, test } from "@playwright/test";
import fs from "node:fs";

const RESULTS_PATH = "docs/auditoria/evidence/instant-preferences-metrics.json";

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

const measureUiMutation = async (page, action) => {
  const started = Date.now();
  await action();
  const uiMs = Date.now() - started;
  return { uiMs };
};

test.describe("Instant preferences — real backend", () => {
  test("métricas A–D login, reload, alteração coluna", async ({ page }) => {
    test.setTimeout(180_000);
    const metrics = [];
    const depthErrors = [];
    const prefRequests = [];

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
      prefRequests.push({
        method: req.method(),
        url,
        at: new Date().toISOString(),
      });
    });

    const openStart = Date.now();
    await page.goto("/CadastroEmpresas");
    await loginIfNeeded(page);
    await page.waitForSelector("table", { timeout: 45_000 });
    const openMs = Date.now() - openStart;
    await expect(page.locator(".mg-empresas-scope .animate-pulse")).toHaveCount(0);
    metrics.push({
      event: "Abrir Empresas",
      uiMs: openMs,
      localStorageMs: null,
      apiMs: null,
      uiChangedAfterResponse: false,
      result: openMs <= 3000 ? "pass" : "warn",
    });

    const reloadStart = Date.now();
    await page.reload();
    await page.waitForSelector("table", { timeout: 45_000 });
    const reloadMs = Date.now() - reloadStart;
    metrics.push({
      event: "Reload",
      uiMs: reloadMs,
      localStorageMs: null,
      apiMs: null,
      uiChangedAfterResponse: false,
      result: reloadMs <= 5000 ? "pass" : "warn",
    });

    const tableBtn = page.getByRole("button", { name: "Tabela" });
    if (await tableBtn.isVisible().catch(() => false)) {
      const cardsSwitchStart = Date.now();
      await page.getByRole("button", { name: "Cards" }).click();
      await page.waitForTimeout(200);
      await tableBtn.click();
      await page.waitForSelector("table", { timeout: 15_000 });
      metrics.push({
        event: "Trocar tabela/cards",
        uiMs: Date.now() - cardsSwitchStart,
        localStorageMs: null,
        apiMs: null,
        uiChangedAfterResponse: false,
        result: "pass",
      });
    }

    metrics.push({
      event: "Ocultar coluna",
      uiMs: null,
      localStorageMs: null,
      apiMs: null,
      uiChangedAfterResponse: false,
      result: "not_run_selector",
      note: "Dialog selector pendente — validar manualmente em staging",
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
          prefRequests: prefRequests.slice(0, 30),
          scenarios: {
            A: metrics.some((m) => m.event === "Ocultar coluna" && m.result === "pass") ? "pass" : "partial",
            B: metrics.some((m) => m.event === "Reload pós-coluna") ? "pass" : "fail",
            C: "not_run",
            D: "not_run",
            E: "not_run_v2_disabled",
            F: "not_run",
            G: "not_run",
          },
          notTested: [
            "C logout/login completo",
            "D throttle 3s simulado",
            "E duas abas",
            "F dois usuários A/B",
            "G API 500 simulado",
            "Cards por linha, campo card, filtro rápido, operador (manual pendente)",
          ],
        },
        null,
        2
      )
    );

    expect(depthErrors).toEqual([]);
  });
});
