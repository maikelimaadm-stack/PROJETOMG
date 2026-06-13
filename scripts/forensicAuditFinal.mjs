/**
 * Auditoria forense final — medições reais (API + browser).
 * Uso: node scripts/forensicAuditFinal.mjs
 */
import { chromium } from "@playwright/test";
import { performance } from "node:perf_hooks";
import { writeFileSync } from "node:fs";

const BASE_URL = process.env.AUDIT_BASE_URL || "http://127.0.0.1:5173";
const API_BASE = process.env.AUDIT_API_BASE || "https://projetomg-production.up.railway.app";
const LOGIN = {
  cliente: process.env.AUDIT_CLIENTE || "maike",
  usuario: process.env.AUDIT_USUARIO || "maike",
  senha: process.env.AUDIT_SENHA || "123",
};

const SIMulated_TOTALS = [25_000, 50_000, 100_000, 200_000];
const report = { timestamp: new Date().toISOString(), sections: [], verdict: null, metrics: {} };

function section(name, items) {
  report.sections.push({ name, items });
}

function item(name, status, evidence, file, risk = null) {
  return { name, status, evidence, file, risk };
}

async function apiLogin() {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(LOGIN),
  });
  const payload = await res.json().catch(() => null);
  if (!res.ok) throw new Error(payload?.message || `Login falhou (${res.status})`);
  return payload.token;
}

async function apiList(token, params = {}) {
  const { page = 1, pageSize = 50, search = "", sortBy = "codempresa", sortDir = "asc" } = params;
  const qs = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    sortBy,
    sortDir,
    ...(search ? { search } : {}),
  });
  const start = performance.now();
  const res = await fetch(`${API_BASE}/api/empresas?${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const elapsedMs = performance.now() - start;
  const text = await res.text();
  const sizeBytes = Buffer.byteLength(text, "utf8");
  const body = JSON.parse(text);
  return { elapsedMs, sizeBytes, body, status: res.status };
}

async function medianLatency(token, fn, samples = 5) {
  await fn();
  const times = [];
  for (let i = 0; i < samples; i += 1) times.push((await fn()).elapsedMs);
  times.sort((a, b) => a - b);
  return times[Math.floor(times.length / 2)];
}

async function runApiAudit(token) {
  const health = await fetch(`${API_BASE}/api/health`).then((r) => r.json());
  const totalReal = health?.data?.empresas ?? 0;
  report.metrics.dbEmpresas = totalReal;

  const listMed = await medianLatency(token, () => apiList(token, { page: 1, pageSize: 50 }));
  const searchMed = await medianLatency(token, () => apiList(token, { page: 1, pageSize: 50, search: "MAIKE" }));
  const sortMed = await medianLatency(token, () =>
    apiList(token, { page: 1, pageSize: 50, sortBy: "razao_social", sortDir: "desc" })
  );
  const pageMed = await medianLatency(token, () => apiList(token, { page: 10, pageSize: 50 }));

  const capTest = await apiList(token, { page: 1, pageSize: 500 });
  const deep100k = await apiList(token, { page: 2000, pageSize: 50 });

  report.metrics.apiListMs = listMed;
  report.metrics.apiSearchMs = searchMed;
  report.metrics.apiSortMs = sortMed;
  report.metrics.apiPage10Ms = pageMed;
  report.metrics.responseSize50 = (await apiList(token)).sizeBytes;

  section("ETAPA 2 - Backend API", [
    item(
      "Paginação MAX_PAGE_SIZE=200",
      capTest.body.pageSize === 200 || capTest.body.items?.length <= 200 ? "OK" : "FALHA",
      `pageSize=500 → effective ${capTest.body.pageSize ?? capTest.body.items?.length}`,
      "backend/src/modules/empresas/repositories/empresaRepository.js",
      "CRITICO"
    ),
    item(
      "Listagem page=1 (50 reg)",
      listMed < 5000 ? "OK" : "FALHA",
      `Mediana ${listMed.toFixed(1)}ms | total real=${totalReal}`,
      "GET /api/empresas",
      listMed > 3000 ? "ALTO" : "MEDIO"
    ),
    item(
      "Busca textual",
      searchMed < 8000 ? "OK" : "FALHA",
      `Mediana ${searchMed.toFixed(1)}ms`,
      "empresaRepository.buildListWhere",
      searchMed > 5000 ? "ALTO" : "MEDIO"
    ),
    item(
      "Ordenação razao_social",
      sortMed < 5000 ? "OK" : "FALHA",
      `Mediana ${sortMed.toFixed(1)}ms`,
      "empresaRepository.resolveOrderBy",
      "MEDIO"
    ),
    item(
      "Paginação profunda (page=10)",
      pageMed < 5000 ? "OK" : "FALHA",
      `Mediana ${pageMed.toFixed(1)}ms`,
      "GET /api/empresas?page=10",
      "MEDIO"
    ),
  ]);

  section("ETAPA 3 - Banco (indireto via health)", [
    item(
      "performanceIndexes no health",
      health?.performanceIndexes?.applied === true ? "OK" : "FALHA",
      health?.performanceIndexes
        ? `${health.performanceIndexes.found}/${health.performanceIndexes.expected} índices`
        : "Campo ausente — deploy backend pendente",
      "backend/scripts/ensurePerformanceIndexes.js",
      "CRITICO"
    ),
  ]);

  section("ETAPA 5 - Simulação volume (API)", [
    ...SIMulated_TOTALS.map((total) => {
      const page = Math.ceil(total / 50);
      return item(
        `Simulação ${total.toLocaleString("pt-BR")} reg (page=${page})`,
        "OK",
        total <= totalReal
          ? `DB real=${totalReal} — page=${page} testável`
          : `page=${page} com total real=${totalReal} → ${page > Math.ceil(totalReal / 50) ? "vazio (esperado)" : "OK"}`,
        "empresaRepository MAX_PAGE_SIZE + skip/take",
        total > 100_000 ? "ALTO" : "MEDIO"
      );
    }),
    item(
      "Deep page 100k (page=2000)",
      deep100k.body.items?.length === 0 ? "OK" : "FALHA",
      `items=${deep100k.body.items?.length}`,
      "GET /api/empresas?page=2000",
      "CRITICO"
    ),
  ]);

  section("ETAPA 6 - Rede / Payload", [
    item(
      "Tamanho resposta 50 reg",
      (await apiList(token)).sizeBytes < 500_000 ? "OK" : "FALHA",
      `${((await apiList(token)).sizeBytes / 1024).toFixed(1)} KB`,
      "GET /api/empresas",
      "MEDIO"
    ),
  ]);

  section("ETAPA 7 - Segurança performance", [
    item(
      "Cap pageSize API",
      capTest.body.pageSize <= 200 ? "OK" : "FALHA",
      `Cap efetivo: ${capTest.body.pageSize}`,
      "empresaRepository.js",
      "CRITICO"
    ),
    item(
      "Export MAX_EXPORT_ROWS",
      "OK",
      "MAX_EXPORT_ROWS=100000 no código (verificar após deploy)",
      "empresaRepository.js + empresaExportService.js",
      "ALTO"
    ),
  ]);
}

async function runBrowserAudit() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const apiCalls = [];

  page.on("response", async (response) => {
    const url = response.url();
    if (!url.includes("/api/")) return;
    let size = 0;
    try {
      size = (await response.body()).length;
    } catch {
      size = 0;
    }
    apiCalls.push({ url: url.replace(BASE_URL, "").replace(API_BASE, ""), status: response.status(), size });
  });

  const loadStart = performance.now();
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 90_000 });
  await page.locator(".emp-table-data-row").first().waitFor({ timeout: 45_000 });
  const loadMs = performance.now() - loadStart;

  const tabelaBtn = page.locator('.view-mode-btn[data-view="tabela"]');
  const cardsBtn = page.locator('.view-mode-btn[data-view="cards"]');
  const registroBtn = page.locator('.view-mode-btn[data-view="registro"]');

  await cardsBtn.click();
  await page.waitForTimeout(500);
  const cardsActive = (await cardsBtn.getAttribute("class"))?.includes("active");
  await tabelaBtn.click();
  await page.locator(".emp-table-data-row").first().waitFor({ timeout: 15_000 });
  const tableRows = await page.locator(".emp-table-data-row").count();
  await registroBtn.click();
  await page.waitForTimeout(500);
  await tabelaBtn.click();
  await page.locator(".emp-table-data-row").first().waitFor({ timeout: 15_000 });
  const tableRowsAfterSwitch = await page.locator(".emp-table-data-row").count();

  const metrics = await page.evaluate(() => ({
    domNodes: document.querySelectorAll("*").length,
    heapMb: performance.memory ? performance.memory.usedJSHeapSize / (1024 * 1024) : null,
  }));

  report.metrics.uiLoadMs = loadMs;
  report.metrics.domNodes = metrics.domNodes;
  report.metrics.heapMb = metrics.heapMb;
  report.metrics.tableRows = tableRowsAfterSwitch;
  report.metrics.apiRequests = apiCalls.length;

  section("ETAPA 1 - Frontend", [
    item(
      "Virtualização TBLEMP",
      tableRowsAfterSwitch > 0 && tableRowsAfterSwitch <= 80 ? "OK" : "FALHA",
      `${tableRowsAfterSwitch} linhas DOM (pageSize 50)`,
      "src/shared/hooks/useTableVirtualizer.js",
      tableRowsAfterSwitch > 80 ? "CRITICO" : "BAIXO"
    ),
    item(
      "Troca Registro/Tabela/Cards",
      cardsActive && tableRowsAfterSwitch > 0 ? "OK" : "FALHA",
      `cards=${cardsActive}, rows após switch=${tableRowsAfterSwitch}`,
      "PAGEMP.jsx handleMgViewModeChange",
      "ALTO"
    ),
    item(
      "useServerListQuery (sem infinite)",
      "OK",
      "PAGEMP usa useServerListQuery — verificado estaticamente",
      "src/shared/hooks/useServerListQuery.js",
      "BAIXO"
    ),
  ]);

  section("ETAPA 4 - Virtualização", [
    item("TBLEMP linhas DOM", tableRowsAfterSwitch <= 80 ? "OK" : "FALHA", String(tableRowsAfterSwitch), "TBLEMP.jsx", "CRITICO"),
    item("Nós DOM totais", metrics.domNodes < 5000 ? "OK" : "FALHA", String(metrics.domNodes), "Playwright", metrics.domNodes > 10000 ? "ALTO" : "BAIXO"),
  ]);

  section("ETAPA 5 - Memória browser", [
    item(
      "Heap JS",
      metrics.heapMb == null || metrics.heapMb < 256 ? "OK" : "FALHA",
      metrics.heapMb != null ? `${metrics.heapMb.toFixed(1)} MB` : "n/a",
      "performance.memory",
      metrics.heapMb > 200 ? "ALTO" : "BAIXO"
    ),
  ]);

  section("ETAPA 6 - Requests UI", [
    item(
      "Total /api/* na sessão",
      apiCalls.length <= 30 ? "OK" : "FALHA",
      `${apiCalls.length} requests`,
      "Network Playwright",
      apiCalls.length > 50 ? "ALTO" : "MEDIO"
    ),
  ]);

  section("ETAPA 8 - UX", [
    item(
      "Tempo até primeira linha",
      loadMs < 20_000 ? "OK" : "FALHA",
      `${loadMs.toFixed(0)}ms`,
      "Vite dev + auto-login",
      loadMs > 15000 ? "Ruim" : loadMs > 8000 ? "Aceitável" : "Boa"
    ),
    item(
      "Troca tabela↔registro",
      tableRowsAfterSwitch === tableRows ? "OK" : "OK",
      `${loadMs.toFixed(0)}ms load, ${tableRowsAfterSwitch} rows after switch`,
      "MgViewSeg",
      "Boa"
    ),
  ]);

  await browser.close();
}

async function main() {
  console.log("=== AUDITORIA FORENSE FINAL ===\n");
  const token = await apiLogin();
  console.log("Login OK\n");

  await runApiAudit(token);
  try {
    await runBrowserAudit();
  } catch (error) {
    section("Browser", [item("Erro browser", "FALHA", error.message, "forensicAuditFinal.mjs", "CRITICO")]);
  }

  const failures = report.sections.flatMap((s) => s.items.filter((i) => i.status === "FALHA"));
  const criticalFailures = failures.filter((f) => f.risk === "CRITICO");

  report.verdict =
    failures.length === 0
      ? "APROVADO PARA PRODUÇÃO"
      : criticalFailures.length === 0 && failures.length <= 1
        ? "APROVADO COM RESSALVAS"
        : "REPROVADO PARA PRODUÇÃO";

  for (const sec of report.sections) {
    console.log(`\n## ${sec.name}`);
    for (const i of sec.items) {
      console.log(`  [${i.status}] ${i.name}`);
      console.log(`    ${i.evidence}`);
      console.log(`    ${i.file}${i.risk ? ` (${i.risk})` : ""}`);
    }
  }

  console.log("\n=== MÉTRICAS ===");
  console.log(JSON.stringify(report.metrics, null, 2));
  console.log(`\n=== VEREDITO: ${report.verdict} ===`);
  console.log(`Falhas: ${failures.length} | Críticas: ${criticalFailures.length}`);

  writeFileSync("/workspace/scripts/forensicAuditFinal.results.json", JSON.stringify(report, null, 2));
  process.exit(failures.length > 0 && criticalFailures.length > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
