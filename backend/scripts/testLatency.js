/**
 * Benchmark de latência — milhares de medições.
 * Valida rapidez de criação, métricas e contadores embutidos na resposta.
 *
 * Uso: cd backend && npm run test:latency
 * Env: SMOKE_BASE_URL, LATENCY_SAMPLES (default 1000), LATENCY_P95_MS (default 800)
 */
import dotenv from "dotenv";
import { smokeLoginBody } from "./smokeCredentials.js";

dotenv.config();

const BASE_URL = process.env.SMOKE_BASE_URL || "http://127.0.0.1:3001";
const SAMPLES = Math.max(100, Number(process.env.LATENCY_SAMPLES || 1000));
const P95_BUDGET_MS = Number(process.env.LATENCY_P95_MS || 800);
const CONCURRENT_BATCH = Math.min(50, Math.max(5, Number(process.env.LATENCY_CONCURRENT || 20)));

let passed = 0;
let failed = 0;
const failures = [];
const latencies = {
  metrics: [],
  createEmpresa: [],
  createCampo: [],
  deleteEmpresa: [],
  concurrentCreate: [],
};

const assert = (condition, message) => {
  if (condition) {
    passed += 1;
    return;
  }
  failed += 1;
  failures.push(message);
};

const percentile = (values, p) => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[Math.max(0, index)];
};

const timed = async (label, fn) => {
  const start = performance.now();
  const result = await fn();
  const elapsed = performance.now() - start;
  if (latencies[label]) latencies[label].push(elapsed);
  return { result, elapsed };
};

const requestJson = async (path, { method = "GET", token, body } = {}) => {
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    "X-Empresa-Id": "all",
    ...(body ? { "Content-Type": "application/json" } : {}),
  };
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => null);
  return { ok: response.ok, status: response.status, payload };
};

const login = async () => {
  const { ok, payload } = await requestJson("/api/auth/login", {
    method: "POST",
    body: smokeLoginBody(),
  });
  assert(ok && payload?.token, `Login falhou: ${payload?.message || "sem token"}`);
  return payload;
};

const assertContadores = (contadores, label) => {
  assert(contadores != null, `${label}: resposta sem contadores`);
  assert(Number.isFinite(Number(contadores.empresas)), `${label}: empresas inválido`);
  assert(Number.isFinite(Number(contadores.registrosGlobais)), `${label}: registrosGlobais inválido`);
  assert(Number(contadores.empresas) >= 0, `${label}: empresas negativo`);
  assert(Number(contadores.registrosGlobais) >= 0, `${label}: registrosGlobais negativo`);
};

const run = async () => {
  console.log(`═══ Benchmark de latência (${SAMPLES} amostras alvo) ═══\n`);

  const health = await fetch(`${BASE_URL}/api/health`).then((r) => r.json());
  assert(health.ok === true, "Healthcheck falhou");

  const session = await login();
  const token = session.token;

  const telas = await requestJson("/api/cadcps/telas", { token });
  const telaEmpresas = telas.payload?.items?.find((t) => t.codigo === "EMPRESAS");
  assert(telaEmpresas?.id, "Tela EMPRESAS ausente");

  const cleanupEmpresas = [];
  const cleanupCampos = [];
  const tag = Date.now();

  try {
    // ── 1. Métricas: centenas de leituras O(1) ──
    const metricsSamples = Math.min(SAMPLES, 500);
    for (let i = 0; i < metricsSamples; i += 1) {
      const { result, elapsed } = await timed("metrics", () =>
        requestJson("/api/metrics/contadores", { token })
      );
      assert(result.ok, `metrics[${i}] falhou`);
      assertContadores(result.payload, `metrics[${i}]`);
      assert(elapsed < 2000, `metrics[${i}] lento demais: ${elapsed.toFixed(1)}ms`);
    }

    // ── 2. Criação empresa com contadores embutidos ──
    const createEmpresaSamples = Math.min(SAMPLES, 200);
    let lastEmpresas = 0;
    let lastRegistros = 0;

    for (let i = 0; i < createEmpresaSamples; i += 1) {
      const { result, elapsed } = await timed("createEmpresa", () =>
        requestJson("/api/empresas", {
          method: "POST",
          token,
          body: {
            razao_social: `Latency Emp ${tag} ${i}`,
            status: "Ativa",
            campos_personalizados: {},
          },
        })
      );
      assert(result.ok && result.payload?.item?.id, `createEmpresa[${i}] falhou`);
      assertContadores(result.payload?.contadores, `createEmpresa[${i}]`);
      assert(Number(result.payload.item.codempresa) > 0, `createEmpresa[${i}] sem codempresa`);
      assert(Number(result.payload.item.id_global) > 0, `createEmpresa[${i}] sem id_global`);

      const emp = Number(result.payload.contadores.empresas);
      const reg = Number(result.payload.contadores.registrosGlobais);
      if (i > 0) {
        assert(emp >= lastEmpresas, `contadores.empresas regrediu: ${lastEmpresas} → ${emp}`);
        assert(reg >= lastRegistros, `contadores.registrosGlobais regrediu: ${lastRegistros} → ${reg}`);
      }
      lastEmpresas = emp;
      lastRegistros = reg;

      cleanupEmpresas.push(result.payload.item.id);
      assert(elapsed < 5000, `createEmpresa[${i}] lento: ${elapsed.toFixed(1)}ms`);
    }

    // ── 3. Criação campo CADCPS com contadores ──
    const createCampoSamples = Math.min(SAMPLES, 200);
    for (let i = 0; i < createCampoSamples; i += 1) {
      const { result, elapsed } = await timed("createCampo", () =>
        requestJson("/api/cadcps/campos", {
          method: "POST",
          token,
          body: {
            nome: `Latency Campo ${tag} ${i}`,
            field_name: `lat_campo_${tag}_${i}`,
            tipo: "texto",
            tela_id: telaEmpresas.id,
            aplicacao_modo: "todas",
            visivel_form: true,
            visivel_tabela: true,
          },
        })
      );
      assert(result.ok && result.payload?.item?.id, `createCampo[${i}] falhou`);
      assertContadores(result.payload?.contadores, `createCampo[${i}]`);
      assert(Number(result.payload.item.codigo) > 0, `createCampo[${i}] sem codigo`);
      cleanupCampos.push(result.payload.item.id);
      assert(elapsed < 5000, `createCampo[${i}] lento: ${elapsed.toFixed(1)}ms`);
    }

    // ── 4. Concorrência: lotes paralelos ──
    const concurrentBatches = Math.ceil(Math.min(SAMPLES, 300) / CONCURRENT_BATCH);
    for (let batch = 0; batch < concurrentBatches; batch += 1) {
      const batchTag = `${tag}_b${batch}`;
      const start = performance.now();
      const results = await Promise.all(
        Array.from({ length: CONCURRENT_BATCH }, (_, i) =>
          requestJson("/api/empresas", {
            method: "POST",
            token,
            body: {
              razao_social: `Concurrent ${batchTag} ${i}`,
              status: "Ativa",
              campos_personalizados: {},
            },
          })
        )
      );
      const elapsed = performance.now() - start;
      latencies.concurrentCreate.push(elapsed);

      const valid = results.filter((r) => r.ok && r.payload?.item?.id);
      assert(valid.length === CONCURRENT_BATCH, `concurrent[${batch}]: ${valid.length}/${CONCURRENT_BATCH}`);
      valid.forEach((r, i) => {
        assertContadores(r.payload?.contadores, `concurrent[${batch}][${i}]`);
        cleanupEmpresas.push(r.payload.item.id);
      });

      const codigos = valid.map((r) => Number(r.payload.item.codempresa));
      assert(new Set(codigos).size === codigos.length, `concurrent[${batch}] codempresa duplicado`);
    }

    // ── 5. Delete com contadores (amostra) ──
    const deleteSamples = Math.min(50, cleanupEmpresas.length);
    for (let i = 0; i < deleteSamples; i += 1) {
      const id = cleanupEmpresas.pop();
      if (!id) break;
      const { result, elapsed } = await timed("deleteEmpresa", () =>
        requestJson(`/api/empresas/${id}`, { method: "DELETE", token })
      );
      assert(result.ok, `deleteEmpresa[${i}] falhou`);
      assertContadores(result.payload?.contadores, `deleteEmpresa[${i}]`);
      assert(elapsed < 5000, `deleteEmpresa[${i}] lento: ${elapsed.toFixed(1)}ms`);
    }

    // ── Resumo estatístico ──
    const totalMeasurements =
      latencies.metrics.length +
      latencies.createEmpresa.length +
      latencies.createCampo.length +
      latencies.concurrentCreate.length +
      latencies.deleteEmpresa.length;

    assert(totalMeasurements >= 500, `Poucas medições: ${totalMeasurements} (mínimo 500)`);

    const report = (label, values) => {
      if (!values.length) return;
      console.log(
        `  ${label.padEnd(18)} n=${String(values.length).padStart(4)}  ` +
          `p50=${percentile(values, 50).toFixed(1)}ms  ` +
          `p95=${percentile(values, 95).toFixed(1)}ms  ` +
          `p99=${percentile(values, 99).toFixed(1)}ms  ` +
          `max=${Math.max(...values).toFixed(1)}ms`
      );
    };

    console.log("\n── Latências ──");
    report("metrics", latencies.metrics);
    report("createEmpresa", latencies.createEmpresa);
    report("createCampo", latencies.createCampo);
    report("concurrentBatch", latencies.concurrentCreate);
    report("deleteEmpresa", latencies.deleteEmpresa);
    console.log(`\n  Total medições: ${totalMeasurements}`);

    const p95Create = percentile(
      [...latencies.createEmpresa, ...latencies.createCampo],
      95
    );
    assert(
      p95Create <= P95_BUDGET_MS,
      `p95 criação ${p95Create.toFixed(1)}ms excede budget ${P95_BUDGET_MS}ms`
    );

    const p95Metrics = percentile(latencies.metrics, 95);
    assert(p95Metrics <= 500, `p95 metrics ${p95Metrics.toFixed(1)}ms > 500ms`);
  } finally {
    for (const id of cleanupCampos) {
      await requestJson(`/api/cadcps/campos/${id}`, { method: "DELETE", token });
    }
    for (const id of cleanupEmpresas) {
      await requestJson(`/api/empresas/${id}`, { method: "DELETE", token });
    }
  }

  console.log(`\n═══ Resultado: ${passed} OK, ${failed} FALHAS ═══`);
  if (failures.length) {
    console.log("\nFalhas:");
    failures.slice(0, 25).forEach((f) => console.log(`  ✗ ${f}`));
    if (failures.length > 25) console.log(`  ... e mais ${failures.length - 25}`);
    process.exit(1);
  }
  console.log("Benchmark de latência concluído com sucesso.");
};

run().catch((error) => {
  console.error("Benchmark abortado:", error.message);
  process.exit(1);
});
