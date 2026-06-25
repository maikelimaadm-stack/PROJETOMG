/**
 * Auditoria forense UI — Empresas preferências (produção via proxy local).
 * Captura timing, network e localStorage.
 */
import { test, expect } from "@playwright/test";
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const evidence = {
  meta: { startedAt: new Date().toISOString(), baseUrl: "http://127.0.0.1:5173" },
  scenarios: [],
  delays: [],
  networkSummary: [],
};

const pushNetwork = (requests) => {
  const bootstrap = requests.filter((r) => r.url.includes("/bootstrap"));
  const puts = requests.filter((r) => r.method === "PUT" && r.url.includes("/listagem"));
  evidence.networkSummary.push({
    bootstrapCount: bootstrap.length,
    putCount: puts.length,
    putTimings: puts.map((p) => p.timing),
  });
};

test.describe("Auditoria forense Empresas — produção", () => {
  test.setTimeout(180_000);

  test("Cenários 1-6 + delays", async ({ page }) => {
    const networkLog = [];
    page.on("requestfinished", async (req) => {
      const url = req.url();
      if (!url.includes("/api/user/preferences")) return;
      const timing = req.timing();
      networkLog.push({
        method: req.method(),
        url,
        status: req.response()?.then((r) => r?.status()),
        timing: {
          start: timing.startTime,
          responseEnd: timing.responseEnd,
          duration: timing.responseEnd - timing.startTime,
        },
      });
    });

    // Login explícito (conta produção via proxy)
    await page.goto("/login");
    await page.getByRole("textbox", { name: "Cliente" }).fill("maike");
    await page.getByRole("textbox", { name: "Usuário" }).fill("maike");
    await page.getByRole("textbox", { name: "Senha" }).fill("123");
    const loginStart = Date.now();
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.waitForFunction(() => !window.location.pathname.includes("login"), { timeout: 45_000 });
    evidence.delays.push({ event: "Login → sessão", ms: Date.now() - loginStart });

    const empLoadStart = Date.now();
    await page.goto("/CadastroEmpresas");
    await page.waitForSelector(".mg-empresas-scope, .cadastro-emp-scope", { timeout: 90_000 });
    // Wait for skeleton to disappear (preferencesReady)
    await page.waitForFunction(
      () => !document.querySelector(".mg-empresas-scope .animate-pulse"),
      { timeout: 60_000 }
    );
    evidence.delays.push({ event: "Empresas load (bootstrap gate)", ms: Date.now() - empLoadStart });

    const bootstrapBefore = networkLog.filter((r) => r.url.includes("bootstrap")).length;

    // Scenario 1: hide column via config if available
    const configBtn = page.getByRole("button", { name: /colunas|configurar colunas/i }).first();
    if (await configBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      const t0 = Date.now();
      await configBtn.click();
      const telefoneToggle = page.getByText(/telefone/i).first();
      if (await telefoneToggle.isVisible({ timeout: 3000 }).catch(() => false)) {
        await telefoneToggle.click();
        evidence.delays.push({ event: "Ocultar coluna (UI click)", ms: Date.now() - t0 });
      }
      await page.keyboard.press("Escape");
    }

    // Wait for debounced PUT (800ms + network)
    await page.waitForTimeout(2500);
    const putsAfterCol = networkLog.filter(
      (r) => r.method === "PUT" && r.url.includes("listagem")
    ).length;

    // Reload
    const reloadStart = Date.now();
    await page.reload();
    await page.waitForFunction(
      () => !document.querySelector(".mg-empresas-scope .animate-pulse"),
      { timeout: 60_000 }
    );
    evidence.delays.push({ event: "Reload + re-hidratação", ms: Date.now() - reloadStart });

    // Read localStorage scoped keys
    const storageSnapshot = await page.evaluate(() => {
      const keys = Object.keys(localStorage).filter(
        (k) => k.startsWith("mg_pref_v2:") || k.startsWith("emp_") || k.startsWith("erp_")
      );
      return keys.reduce((acc, k) => {
        acc[k] = localStorage.getItem(k)?.slice(0, 200);
        return acc;
      }, {});
    });

    evidence.scenarios.push({
      name: "Cenário 1 — Colunas + reload",
      bootstrapRequestsOnLoad: bootstrapBefore,
      putCountAfterColumnChange: putsAfterCol,
      storageKeyCount: Object.keys(storageSnapshot).length,
      sampleKeys: Object.keys(storageSnapshot).slice(0, 8),
    });

    // Scenario 2: switch to cards view
    const cardsBtn = page.getByRole("button", { name: /cards|lançamentos/i }).first();
    if (await cardsBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      const t0 = Date.now();
      await cardsBtn.click();
      await page.waitForTimeout(500);
      evidence.delays.push({ event: "Troca tabela → cards", ms: Date.now() - t0 });
    }

    // Scenario 6: rapid view toggles
    const viewToggle = page.getByRole("button", { name: /tabela|table/i }).first();
    for (let i = 0; i < 5; i += 1) {
      if (await cardsBtn.isVisible().catch(() => false)) await cardsBtn.click();
      await page.waitForTimeout(100);
      if (await viewToggle.isVisible().catch(() => false)) await viewToggle.click();
      await page.waitForTimeout(100);
    }
    await page.waitForTimeout(3000);
    const totalPuts = networkLog.filter(
      (r) => r.method === "PUT" && r.url.includes("listagem")
    ).length;
    evidence.scenarios.push({
      name: "Cenário 6 — toggles rápidos",
      totalPutListagem: totalPuts,
    });

    pushNetwork(networkLog);
    evidence.meta.finishedAt = new Date().toISOString();

    const outDir = join(__dirname, "../../docs/auditoria/evidence");
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, "forensic-ui-results.json"), JSON.stringify(evidence, null, 2));
  });
});
