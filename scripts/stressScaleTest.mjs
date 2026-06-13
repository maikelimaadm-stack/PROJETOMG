/**
 * Stress test de escala — simula carga e valida latência sob concorrência.
 * Uso: node scripts/stressScaleTest.mjs
 */
import { performance } from "node:perf_hooks";
import { writeFileSync } from "node:fs";
import os from "node:os";

const API_BASE = process.env.AUDIT_API_BASE || process.env.SMOKE_BASE_URL || "https://projetomg-production.up.railway.app";
const CONCURRENCY = Math.max(5, Number(process.env.STRESS_CONCURRENCY || 20));
const ROUNDS = Math.max(3, Number(process.env.STRESS_ROUNDS || 5));
const LOGIN = {
  cliente: process.env.AUDIT_CLIENTE || "maike",
  usuario: process.env.AUDIT_USUARIO || "maike",
  senha: process.env.AUDIT_SENHA || "123",
};

const memMb = () => Number((process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2));

async function login() {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(LOGIN),
  });
  const payload = await res.json();
  if (!payload.token) throw new Error("Login falhou");
  return payload.token;
}

async function hit(path, token) {
  const start = performance.now();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}`, "X-Empresa-Id": "all" },
  });
  await res.text();
  return { ok: res.ok, ms: Number((performance.now() - start).toFixed(2)) };
}

async function main() {
  const token = await login();
  const paths = [
    "/api/empresas?page=1&pageSize=50",
    "/api/metrics/contadores",
    "/api/cadcps/campos?page=1&pageSize=50",
  ];

  const results = {
    timestamp: new Date().toISOString(),
    apiBase: API_BASE,
    host: { cpus: os.cpus().length, memoryGb: Number((os.totalmem() / 1024 ** 3).toFixed(2)) },
    concurrency: CONCURRENCY,
    rounds: ROUNDS,
    scaleTargets: [100_000, 500_000, 1_000_000],
    note:
      "Teste de carga contra API real; escala de registros depende do volume no banco de produção (~26k hoje).",
    roundsData: [],
  };

  console.log("=== Stress Scale Test ===\n");
  for (let round = 0; round < ROUNDS; round += 1) {
    const memBefore = memMb();
    const start = performance.now();
    const batch = [];
    for (let i = 0; i < CONCURRENCY; i += 1) {
      const path = paths[i % paths.length];
      batch.push(hit(path, token));
    }
    const samples = await Promise.all(batch);
    const elapsed = Number((performance.now() - start).toFixed(2));
    const ok = samples.filter((s) => s.ok).length;
    const latencies = samples.map((s) => s.ms);
    const roundResult = {
      round: round + 1,
      elapsedMs: elapsed,
      throughputRps: Number(((CONCURRENCY / elapsed) * 1000).toFixed(2)),
      successRate: Number(((ok / CONCURRENCY) * 100).toFixed(1)),
      latencyAvgMs: Number((latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(2)),
      latencyMaxMs: Math.max(...latencies),
      memoryHeapMb: memMb(),
      memoryDeltaMb: Number((memMb() - memBefore).toFixed(2)),
    };
    results.roundsData.push(roundResult);
    console.log(
      `Round ${round + 1}: ${roundResult.throughputRps} req/s, avg=${roundResult.latencyAvgMs}ms, ok=${roundResult.successRate}%`
    );
  }

  writeFileSync("/workspace/scripts/stressScaleTest.results.json", JSON.stringify(results, null, 2));
  console.log("\nResultados: scripts/stressScaleTest.results.json");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
