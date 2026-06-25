#!/usr/bin/env node
/**
 * Auditoria forense read-only + testes controlados contra API de produção.
 * Restaura preferências originais ao final quando possível.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_URL =
  process.env.AUDIT_BASE_URL ||
  process.env.VITE_API_PROXY_TARGET ||
  "https://projetomg-production.up.railway.app";
const CLIENTE = process.env.AUDIT_CLIENTE || "maike";
const USUARIO = process.env.AUDIT_USUARIO || "maike";
const SENHA = process.env.AUDIT_SENHA || "123";

const results = {
  meta: {
    baseUrl: BASE_URL,
    cliente: CLIENTE,
    usuario: USUARIO,
    startedAt: new Date().toISOString(),
  },
  scenarios: [],
  delays: [],
  network: [],
  errors: [],
};

const now = () => performance.now();

async function request(path, { method = "GET", body, token } = {}) {
  const started = now();
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const elapsed = now() - started;
  let data = null;
  const text = await response.text();
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  const entry = {
    method,
    path,
    status: response.status,
    elapsedMs: Math.round(elapsed),
    bodySize: text?.length || 0,
  };
  results.network.push(entry);
  if (!response.ok) {
    const err = new Error(data?.message || `HTTP ${response.status}`);
    err.status = response.status;
    err.data = data;
    err.elapsedMs = elapsed;
    throw err;
  }
  return { data, elapsedMs: elapsed };
}

async function login() {
  const { data } = await request("/api/auth/login", {
    method: "POST",
    body: { cliente: CLIENTE, usuario: USUARIO, senha: SENHA },
  });
  return data?.token;
}

async function getListagem(token) {
  const { data } = await request("/api/user/preferences/empresas/listagem", { token });
  return data;
}

async function putListagem(token, preferencias, expectedUpdatedAt) {
  const { data, elapsedMs } = await request("/api/user/preferences/empresas/listagem", {
    method: "PUT",
    token,
    body: {
      versao_schema: 1,
      preferencias,
      expectedUpdatedAt,
    },
  });
  return { data, elapsedMs };
}

async function bootstrap(token) {
  const { data, elapsedMs } = await request("/api/user/preferences/bootstrap", { token });
  return { data, elapsedMs };
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function hideColumn(preferences, columnId) {
  const next = deepClone(preferences);
  const visible = next.table?.visibleColumns || [];
  next.table = next.table || {};
  next.table.visibleColumns = visible.filter((id) => id !== columnId);
  return next;
}

function setCardsPerRow(preferences, n) {
  const next = deepClone(preferences);
  next.cards = next.cards || {};
  next.cards.cardsPerRow = n;
  next.cards.layoutConfig = { cardsPerRow: n };
  return next;
}

function setFilterMaxVisible(preferences, max) {
  const next = deepClone(preferences);
  next.filters = next.filters || {};
  next.filters.maxVisibleFields = max;
  next.filters.filterFieldsLayout = next.filters.filterFieldsLayout || {};
  next.filters.filterFieldsLayout.maxVisible = max;
  return next;
}

function setDefaultTextOperator(preferences, operator) {
  const next = deepClone(preferences);
  next.filters = next.filters || {};
  next.filters.operatorsByField = next.filters.operatorsByField || {};
  next.filters.operatorsByField.razao_social = operator;
  return next;
}

function addTempFilter(preferences, field, value, operator = "contains") {
  const next = deepClone(preferences);
  next.table = next.table || {};
  next.table.columnFilters = next.table.columnFilters || {};
  next.table.columnFilters[field] = { operator, value, type: "text" };
  next.filters = next.filters || {};
  next.filters.columnFilters = next.table.columnFilters;
  return next;
}

async function runScenario(name, fn) {
  const started = now();
  const scenario = { name, status: "pass", evidence: {}, durationMs: 0 };
  try {
    scenario.evidence = await fn();
  } catch (error) {
    scenario.status = "fail";
    scenario.error = {
      message: error.message,
      status: error.status,
      data: error.data,
    };
    results.errors.push({ scenario: name, ...scenario.error });
  }
  scenario.durationMs = Math.round(now() - started);
  results.scenarios.push(scenario);
  console.log(`[${scenario.status.toUpperCase()}] ${name} (${scenario.durationMs}ms)`);
}

async function main() {
  console.log(`Auditoria forense API → ${BASE_URL}`);
  let token;
  try {
    token = await login();
  } catch (error) {
    console.error("Falha no login:", error.message);
    process.exit(1);
  }

  let baseline;
  try {
    baseline = await getListagem(token);
  } catch (error) {
    if (error.status === 404) {
      baseline = null;
    } else {
      throw error;
    }
  }

  const originalPrefs = baseline?.preferencias
    ? deepClone(baseline.preferencias)
    : null;
  const originalUpdatedAt = baseline?.updatedAt || null;

  // Bootstrap timing
  const bootstrapRuns = [];
  for (let i = 0; i < 3; i += 1) {
    const { elapsedMs } = await bootstrap(token);
    bootstrapRuns.push(elapsedMs);
  }
  results.delays.push({
    event: "GET bootstrap (3x)",
    samplesMs: bootstrapRuns.map((v) => Math.round(v)),
    avgMs: Math.round(bootstrapRuns.reduce((a, b) => a + b, 0) / bootstrapRuns.length),
  });

  // Scenario 1: Hide telefone column
  await runScenario("Cenário 1 — Ocultar coluna telefone + reload backend", async () => {
    if (!originalPrefs) return { skipped: true, reason: "sem preferências baseline" };
    const hidden = hideColumn(originalPrefs, "telefone");
    const t0 = now();
    const { data: putResp, elapsedMs: putMs } = await putListagem(
      token,
      hidden,
      originalUpdatedAt
    );
    const afterPut = await getListagem(token);
    const t1 = now();
    const visibleAfter = afterPut?.preferencias?.table?.visibleColumns || [];
    return {
      putMs: Math.round(putMs),
      totalMs: Math.round(t1 - t0),
      telefoneHidden: !visibleAfter.includes("telefone"),
      visibleCountBefore: (originalPrefs.table?.visibleColumns || []).length,
      visibleCountAfter: visibleAfter.length,
      updatedAt: putResp?.updatedAt,
    };
  });

  // Scenario 2: Cards per row
  await runScenario("Cenário 2 — Cards por linha", async () => {
    if (!originalPrefs) return { skipped: true };
    const current = (await getListagem(token))?.preferencias || originalPrefs;
    const updatedAt = (await getListagem(token))?.updatedAt;
    const changed = setCardsPerRow(current, 2);
    const t0 = now();
    const { elapsedMs: putMs } = await putListagem(token, changed, updatedAt);
    const after = await getListagem(token);
    return {
      putMs: Math.round(putMs),
      cardsPerRow: after?.preferencias?.cards?.cardsPerRow,
      layoutConfig: after?.preferencias?.cards?.layoutConfig,
      persisted: after?.preferencias?.cards?.cardsPerRow === 2,
    };
  });

  // Scenario 3: Filter max visible
  await runScenario("Cenário 3 — Filtros rápidos maxVisible", async () => {
    const currentRecord = await getListagem(token);
    const current = currentRecord?.preferencias || originalPrefs;
    if (!current) return { skipped: true };
    const changed = setFilterMaxVisible(current, 7);
    const { elapsedMs: putMs } = await putListagem(token, changed, currentRecord?.updatedAt);
    const after = await getListagem(token);
    return {
      putMs: Math.round(putMs),
      maxVisible: after?.preferencias?.filters?.maxVisibleFields,
      layoutMax: after?.preferencias?.filters?.filterFieldsLayout?.maxVisible,
      persisted: after?.preferencias?.filters?.maxVisibleFields === 7,
    };
  });

  // Scenario 4: Default operator vs temp filter
  await runScenario("Cenário 4 — Operador padrão vs filtro temporário", async () => {
    const currentRecord = await getListagem(token);
    const current = currentRecord?.preferencias || originalPrefs;
    if (!current) return { skipped: true };
    const withOperator = setDefaultTextOperator(current, "startsWith");
    const withFilter = addTempFilter(withOperator, "razao_social", "TESTE_AUDIT", "contains");
    const { elapsedMs: putMs } = await putListagem(token, withFilter, currentRecord?.updatedAt);
    const after = await getListagem(token);
    const opDefault = after?.preferencias?.filters?.operatorsByField?.razao_social;
    const tempFilter = after?.preferencias?.table?.columnFilters?.razao_social;
    return {
      putMs: Math.round(putMs),
      defaultOperator: opDefault,
      tempFilter,
      operatorsSeparated: opDefault === "startsWith" && tempFilter?.value === "TESTE_AUDIT",
    };
  });

  // Scenario 6: Rapid sequential PUTs (different categories)
  await runScenario("Cenário 6 — PUTs rápidos coluna + cards (race)", async () => {
    const currentRecord = await getListagem(token);
    const current = deepClone(currentRecord?.preferencias || originalPrefs || {});
    const updatedAt = currentRecord?.updatedAt;

    const hideEmail = hideColumn(current, "email");
    const cards2 = setCardsPerRow(hideEmail, 1);

    const put1Start = now();
    const put1Promise = putListagem(token, hideEmail, updatedAt).catch((e) => ({
      error: e.message,
      status: e.status,
    }));

    // Small delay simulating debounce overlap
    await new Promise((r) => setTimeout(r, 50));
    const put2Promise = putListagem(token, cards2, updatedAt).catch((e) => ({
      error: e.message,
      status: e.status,
    }));

    const [put1, put2] = await Promise.all([put1Promise, put2Promise]);
    const after = await getListagem(token);
    const emailHidden = !(after?.preferencias?.table?.visibleColumns || []).includes("email");
    const cardsPerRow = after?.preferencias?.cards?.cardsPerRow;

    return {
      put1: put1.error ? put1 : { status: "ok", elapsedMs: Math.round(put1.elapsedMs) },
      put2: put2.error ? put2 : { status: "ok", elapsedMs: Math.round(put2.elapsedMs) },
      emailHidden,
      cardsPerRow,
      bothPersisted: emailHidden && cardsPerRow === 1,
      finalVisibleColumns: after?.preferencias?.table?.visibleColumns?.slice(0, 5),
    };
  });

  // Partial PUT test - does backend replace entire JSON?
  await runScenario("Backend — PUT parcial substitui JSON inteiro?", async () => {
    const currentRecord = await getListagem(token);
    const full = currentRecord?.preferencias;
    if (!full) return { skipped: true };
    const partialOnly = {
      version: 1,
      cards: { cardsPerRow: 3, layoutConfig: { cardsPerRow: 3 } },
    };
    const { elapsedMs: putMs } = await putListagem(token, partialOnly, currentRecord?.updatedAt);
    const after = await getListagem(token);
    const lostTable = !after?.preferencias?.table?.visibleColumns?.length;
    return {
      putMs: Math.round(putMs),
      partialPayloadKeys: Object.keys(partialOnly),
      afterKeys: Object.keys(after?.preferencias || {}),
      tableLost: lostTable,
      tableVisibleCount: after?.preferencias?.table?.visibleColumns?.length ?? 0,
      critical: lostTable,
    };
  });

  // Restore original
  if (originalPrefs) {
    try {
      const currentRecord = await getListagem(token);
      await putListagem(token, originalPrefs, currentRecord?.updatedAt);
      console.log("Preferências restauradas ao baseline.");
    } catch (error) {
      console.warn("Falha ao restaurar baseline:", error.message);
      results.errors.push({ scenario: "restore", message: error.message });
    }
  }

  results.meta.finishedAt = new Date().toISOString();
  const outDir = join(__dirname, "../../docs/auditoria/evidence");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "forensic-api-results.json");
  writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`Evidências salvas em ${outPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
