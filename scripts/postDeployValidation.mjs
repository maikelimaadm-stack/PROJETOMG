/**
 * Validação pós-deploy — benchmark real, stress test, auditoria.
 * Uso: node scripts/postDeployValidation.mjs
 */
import { performance } from "node:perf_hooks";
import { readFileSync, writeFileSync } from "node:fs";
import os from "node:os";

const API_BASE = process.env.AUDIT_API_BASE || "https://projetomg-production.up.railway.app";
const SAMPLES = Math.max(20, Number(process.env.BENCHMARK_SAMPLES || 30));
const LOGIN = {
  cliente: process.env.AUDIT_CLIENTE || "maike",
  usuario: process.env.AUDIT_USUARIO || "maike",
  senha: process.env.AUDIT_SENHA || "123",
};

const BEFORE = {
  empresas: { p50: 2545.34, p95: 2584, p99: 3730 },
  session: { p50: 3358.86, p95: 3369, p99: 4000 },
  contadores: { p50: 2390.5, p95: 2401, p99: 2500 },
  cadcps: { p50: 3996.08, p95: 4000, p99: 4100 },
};

const BUDGETS = { empresas: 300, session: 300, contadores: 200, cadcps: 500 };

const percentile = (values, p) => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const i = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return Number(sorted[Math.max(0, i)].toFixed(2));
};

const pctDiff = (before, after) => Number((((after - before) / before) * 100).toFixed(1));

async function measureTTFB(url, token, headers = {}) {
  const h = token ? { Authorization: `Bearer ${token}`, ...headers } : {};
  const start = performance.now();
  const res = await fetch(url, { headers: h });
  const ttfb = performance.now() - start;
  const bodyStart = performance.now();
  const text = await res.text();
  const download = performance.now() - bodyStart;
  return {
    status: res.status,
    ttfbMs: Number(ttfb.toFixed(2)),
    downloadMs: Number(download.toFixed(2)),
    bytes: Buffer.byteLength(text, "utf8"),
    body: text,
  };
}

async function benchEndpoint(name, url, token, n = SAMPLES) {
  const values = [];
  let lastBody = "";
  for (let i = 0; i < n; i += 1) {
    const sample = await measureTTFB(url, token);
    if (sample.status >= 400) {
      throw new Error(`${name} HTTP ${sample.status}: ${sample.body.slice(0, 200)}`);
    }
    values.push(sample.ttfbMs);
    lastBody = sample.body;
  }
  return {
    name,
    samples: n,
    p50: percentile(values, 50),
    p95: percentile(values, 95),
    p99: percentile(values, 99),
    min: Math.min(...values),
    max: Math.max(...values),
    lastBodyPreview: lastBody.slice(0, 120),
  };
}

async function stressConcurrent(concurrency, token, rounds = 3) {
  const paths = [
    "/api/empresas?page=1&pageSize=50",
    "/api/metrics/contadores",
    "/api/auth/session",
    "/api/cadcps/campos?page=1&pageSize=50",
  ];
  const memBefore = process.memoryUsage().heapUsed;
  const roundResults = [];

  for (let round = 0; round < rounds; round += 1) {
    const start = performance.now();
    const tasks = Array.from({ length: concurrency }, (_, i) =>
      measureTTFB(`${API_BASE}${paths[i % paths.length]}`, token, { "X-Empresa-Id": "all" })
    );
    const results = await Promise.allSettled(tasks);
    const elapsed = performance.now() - start;
    const fulfilled = results.filter((r) => r.status === "fulfilled").map((r) => r.value);
    const errors = results.filter((r) => r.status === "rejected").length;
    const httpErrors = fulfilled.filter((r) => r.status >= 400).length;
    const latencies = fulfilled.filter((r) => r.status < 400).map((r) => r.ttfbMs);
    roundResults.push({
      round: round + 1,
      concurrency,
      elapsedMs: Number(elapsed.toFixed(2)),
      throughputRps: Number(((concurrency / elapsed) * 1000).toFixed(2)),
      successCount: latencies.length,
      errorCount: errors + httpErrors,
      errorRatePct: Number((((errors + httpErrors) / concurrency) * 100).toFixed(2)),
      latencyP50: percentile(latencies, 50),
      latencyP95: percentile(latencies, 95),
      latencyP99: percentile(latencies, 99),
      latencyMax: latencies.length ? Math.max(...latencies) : null,
    });
  }

  return {
    concurrency,
    rounds: roundResults,
    memoryHeapMbBefore: Number((memBefore / 1024 / 1024).toFixed(2)),
    memoryHeapMbAfter: Number((process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)),
    hostCpus: os.cpus().length,
  };
}

function decodeJwt(token) {
  try {
    return JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString());
  } catch {
    return null;
  }
}

async function main() {
  const report = {
    timestamp: new Date().toISOString(),
    apiBase: API_BASE,
    samples: SAMPLES,
    before: BEFORE,
    after: {},
    comparison: {},
    validations: {},
    stress: {},
    verdict: null,
  };

  console.log("=== VALIDAÇÃO PÓS-DEPLOY ===\n");

  const healthRes = await fetch(`${API_BASE}/api/health`);
  const health = await healthRes.json();
  report.validations.health = {
    performanceIndexes: health.performanceIndexes ?? null,
    verboseCounts: health.data?.verboseCounts ?? null,
  };
  console.log("Health performanceIndexes:", JSON.stringify(health.performanceIndexes ?? "ausente"));

  const loginRes = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(LOGIN),
  });
  const loginPayload = await loginRes.json();
  if (!loginPayload.token) {
    report.verdict = "REPROVADO";
    report.blocker = loginPayload.message || "Login falhou";
    writeFileSync("/workspace/scripts/postDeployValidation.results.json", JSON.stringify(report, null, 2));
    console.error("BLOQUEIO: Login falhou —", report.blocker);
    process.exit(1);
  }

  const token = loginPayload.token;
  const jwt = decodeJwt(token);
  report.validations.jwt = {
    hasClienteId: Boolean(jwt?.cliente_id),
    hasAcessoGlobal: jwt?.acesso_global != null,
    hasAllowedEmpresaIds: Array.isArray(jwt?.allowed_empresa_ids),
    hasEmpresasTotal: jwt?.empresas_total != null,
    hasAtivo: jwt?.ativo != null,
    claims: {
      cliente_id: jwt?.cliente_id,
      acesso_global: jwt?.acesso_global,
      allowed_empresa_ids_count: jwt?.allowed_empresa_ids?.length ?? 0,
      empresas_total: jwt?.empresas_total,
    },
  };
  console.log("JWT:", JSON.stringify(report.validations.jwt.claims));

  const endpoints = [
    ["empresas", `${API_BASE}/api/empresas?page=1&pageSize=50`],
    ["session", `${API_BASE}/api/auth/session`],
    ["contadores", `${API_BASE}/api/metrics/contadores`],
    ["cadcps", `${API_BASE}/api/cadcps/campos?page=1&pageSize=50`],
  ];

  console.log(`\n--- Benchmark (n=${SAMPLES}) ---`);
  for (const [key, url] of endpoints) {
    const result = await benchEndpoint(key, url, token);
    report.after[key] = result;
    report.comparison[key] = {
      before: BEFORE[key],
      after: { p50: result.p50, p95: result.p95, p99: result.p99 },
      diffPct: {
        p50: pctDiff(BEFORE[key].p50, result.p50),
        p95: pctDiff(BEFORE[key].p95, result.p95),
        p99: pctDiff(BEFORE[key].p99, result.p99),
      },
      budgetMs: BUDGETS[key],
      passP50: result.p50 <= BUDGETS[key],
    };
    console.log(
      `${key}: p50=${result.p50}ms p95=${result.p95}ms p99=${result.p99}ms | budget=${BUDGETS[key]}ms pass=${result.p50 <= BUDGETS[key]}`
    );
  }

  console.log("\n--- Stress test ---");
  for (const c of [100, 500, 1000]) {
    console.log(`Concorrência ${c}...`);
    report.stress[`users_${c}`] = await stressConcurrent(c, token, 2);
    const last = report.stress[`users_${c}`].rounds.at(-1);
    console.log(`  p50=${last.latencyP50}ms throughput=${last.throughputRps} rps errors=${last.errorRatePct}%`);
  }

  report.validations.indexesApplied = health.performanceIndexes?.applied === true;
  report.validations.jwtSmart = report.validations.jwt.hasAllowedEmpresaIds && report.validations.jwt.hasClienteId;
  report.validations.contadoresFast = report.after.contadores?.p50 <= BUDGETS.contadores;
  report.validations.listagemFast = report.after.empresas?.p50 <= BUDGETS.empresas;
  report.validations.sessionFast = report.after.session?.p50 <= BUDGETS.session;
  report.validations.cadcpsFast = report.after.cadcps?.p50 <= BUDGETS.cadcps;

  const allPass = Object.values(report.comparison).every((c) => c.passP50)
    && report.validations.indexesApplied
    && report.validations.jwtSmart
    && Object.values(report.stress).every((s) => s.rounds.every((r) => r.errorRatePct === 0));

  report.verdict = allPass ? "APROVADO" : "REPROVADO";
  writeFileSync("/workspace/scripts/postDeployValidation.results.json", JSON.stringify(report, null, 2));
  console.log("\n=== VEREDITO:", report.verdict, "===");
  console.log("Resultados: scripts/postDeployValidation.results.json");
  process.exit(allPass ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
