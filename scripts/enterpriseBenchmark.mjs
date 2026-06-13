/**
 * Benchmark enterprise — P50/P95/P99 para endpoints críticos.
 * Uso: node scripts/enterpriseBenchmark.mjs
 */
import { performance } from "node:perf_hooks";
import { readFileSync, writeFileSync } from "node:fs";

const API_BASE = process.env.AUDIT_API_BASE || process.env.SMOKE_BASE_URL || "https://projetomg-production.up.railway.app";
const SAMPLES = Math.max(10, Number(process.env.BENCHMARK_SAMPLES || 30));
const LOGIN = {
  cliente: process.env.AUDIT_CLIENTE || "maike",
  usuario: process.env.AUDIT_USUARIO || "maike",
  senha: process.env.AUDIT_SENHA || "123",
};

const percentile = (values, p) => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return Number(sorted[Math.max(0, index)].toFixed(2));
};

async function measureTTFB(url, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const start = performance.now();
  const res = await fetch(url, { headers });
  const ttfb = performance.now() - start;
  await res.text();
  return { status: res.status, ttfbMs: Number(ttfb.toFixed(2)) };
}

async function benchEndpoint(name, url, token, n = SAMPLES) {
  const values = [];
  for (let i = 0; i < n; i += 1) {
    const sample = await measureTTFB(url, token);
    if (sample.status >= 400) throw new Error(`${name} HTTP ${sample.status}`);
    values.push(sample.ttfbMs);
  }
  return {
    name,
    url,
    samples: n,
    p50: percentile(values, 50),
    p95: percentile(values, 95),
    p99: percentile(values, 99),
    min: Math.min(...values),
    max: Math.max(...values),
  };
}

async function main() {
  const before = (() => {
    try {
      return JSON.parse(readFileSync("/workspace/scripts/latencyAuditBackend.results.json", "utf8"));
    } catch {
      return null;
    }
  })();

  const loginRes = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(LOGIN),
  });
  const { token } = await loginRes.json();
  if (!token) throw new Error("Login falhou");

  const endpoints = [
    ["empresas_list", `${API_BASE}/api/empresas?page=1&pageSize=50`],
    ["empresas_search", `${API_BASE}/api/empresas?page=1&pageSize=50&search=MAIKE`],
    ["empresas_sort", `${API_BASE}/api/empresas?page=1&pageSize=50&sortBy=razao_social&sortDir=asc`],
    ["auth_session", `${API_BASE}/api/auth/session`],
    ["metrics_contadores", `${API_BASE}/api/metrics/contadores`],
    ["cadcps_campos", `${API_BASE}/api/cadcps/campos?page=1&pageSize=50`],
  ];

  const results = {
    timestamp: new Date().toISOString(),
    apiBase: API_BASE,
    samples: SAMPLES,
    beforeReference: before
      ? {
          empresas_list_p50: before.endpoints?.empresas_list_50?.ttfbMs,
          metrics_contadores_p50: before.endpoints?.metrics_contadores?.ttfbMs,
          auth_session_p50: before.endpoints?.auth_session?.ttfbMs,
          cadcps_p50: before.endpoints?.cadcps_campos?.ttfbMs,
        }
      : null,
    endpoints: {},
    budgets: {
      listagem_ms: 300,
      busca_ms: 500,
      ordenacao_ms: 300,
      contadores_ms: 200,
    },
  };

  console.log(`=== Enterprise Benchmark (${SAMPLES} amostras) ===\n`);
  for (const [name, url] of endpoints) {
    console.log(`Medindo ${name}...`);
    results.endpoints[name] = await benchEndpoint(name, url, token);
    const r = results.endpoints[name];
    console.log(`  p50=${r.p50}ms p95=${r.p95}ms p99=${r.p99}ms`);
  }

  results.pass = {
    listagem: results.endpoints.empresas_list.p50 <= 300,
    busca: results.endpoints.empresas_search.p50 <= 500,
    ordenacao: results.endpoints.empresas_sort.p50 <= 300,
    contadores: results.endpoints.metrics_contadores.p50 <= 200,
  };

  writeFileSync("/workspace/scripts/enterpriseBenchmark.results.json", JSON.stringify(results, null, 2));
  console.log("\nResultados: scripts/enterpriseBenchmark.results.json");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
