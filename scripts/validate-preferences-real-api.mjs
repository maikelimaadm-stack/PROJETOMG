/**
 * Validação real de preferências contra API remota (staging/produção).
 * Uso: VALIDATE_API_BASE=https://... node scripts/validate-preferences-real-api.mjs
 */
import { writeFileSync } from "node:fs";
import { performance } from "node:perf_hooks";

const API_BASE = (process.env.VALIDATE_API_BASE || "https://projetomg-production.up.railway.app").replace(/\/$/, "");
const LOGIN = {
  cliente: process.env.VALIDATE_CLIENTE || "maike",
  usuario: process.env.VALIDATE_USUARIO || "maike",
  senha: process.env.VALIDATE_SENHA || "123",
};

const metrics = {
  requests: [],
  bootstrapGets: 0,
  scopeGets: 0,
  listagemPuts: 0,
};

const log = (msg) => console.log(`[validate-real] ${msg}`);

const track = (method, path, status) => {
  metrics.requests.push({ method, path, status, at: Date.now() });
};

async function api(method, path, { token, body, label } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  track(method, path, res.status);
  let payload = null;
  try {
    payload = await res.json();
  } catch {
    payload = null;
  }
  if (!res.ok) {
    throw new Error(`${label || method + " " + path} HTTP ${res.status}: ${JSON.stringify(payload)?.slice(0, 300)}`);
  }
  return payload;
}

const results = {
  apiBase: API_BASE,
  startedAt: new Date().toISOString(),
  checks: [],
  metrics: {},
  failures: [],
};

const pass = (name, detail = {}) => {
  results.checks.push({ name, status: "PASS", ...detail });
  log(`PASS: ${name}`);
};

const fail = (name, error) => {
  results.checks.push({ name, status: "FAIL", error: String(error) });
  results.failures.push({ name, error: String(error) });
  log(`FAIL: ${name} — ${error}`);
};

async function main() {
  log(`API base: ${API_BASE}`);

  try {
    const health = await api("GET", "/api/health", { label: "healthcheck" });
    pass("healthcheck", { health });
  } catch (e) {
    fail("healthcheck", e.message);
    throw e;
  }

  let token;
  try {
    const login = await api("POST", "/api/auth/login", {
      body: LOGIN,
      label: "login",
    });
    token = login.token;
    pass("login", { userId: login.user?.id, clienteId: login.cliente?.id });
  } catch (e) {
    fail("login", e.message);
    throw e;
  }

  try {
    const empresas = await api("GET", "/api/empresas?page=1&pageSize=5", { token, label: "empresas" });
    pass("api_empresas", { total: empresas.total, items: empresas.items?.length ?? 0 });
  } catch (e) {
    fail("api_empresas", e.message);
  }

  let bootstrapBefore;
  try {
    bootstrapBefore = await api("GET", "/api/user/preferences/bootstrap", { token, label: "bootstrap" });
    metrics.bootstrapGets += 1;
    pass("bootstrap_get", {
      count: bootstrapBefore.preferences?.length ?? 0,
      scopes: (bootstrapBefore.preferences || []).map((p) => `${p.modulo}.${p.tela}`),
    });
  } catch (e) {
    fail("bootstrap_get", e.message);
  }

  let listagemBefore;
  try {
    listagemBefore = await api("GET", "/api/user/preferences/empresas/listagem", {
      token,
      label: "listagem_get_before",
    });
    metrics.scopeGets += 1;
    pass("listagem_get_before", {
      hasPreferencias: Boolean(listagemBefore?.preferencias),
      updatedAt: listagemBefore?.updatedAt,
    });
  } catch (e) {
    fail("listagem_get_before", e.message);
  }

  const originalPref = listagemBefore?.preferencias || {};
  const testMarker = `validate-real-${Date.now()}`;
  const testPref = {
    ...originalPref,
    version: Number(originalPref.version) || 1,
    table: {
      ...(originalPref.table || {}),
      visibleColumns: ["codempresa", "razao_social"],
      _validateMarker: testMarker,
    },
  };

  try {
    const saved = await api("PUT", "/api/user/preferences/empresas/listagem", {
      token,
      body: {
        preferencias: testPref,
        versao_schema: testPref.version,
        expectedUpdatedAt: listagemBefore?.updatedAt || undefined,
      },
      label: "listagem_put",
    });
    metrics.listagemPuts += 1;
    pass("listagem_put", {
      updatedAt: saved?.updatedAt,
      visibleColumns: saved?.preferencias?.table?.visibleColumns,
    });
  } catch (e) {
    fail("listagem_put", e.message);
  }

  try {
    const after = await api("GET", "/api/user/preferences/empresas/listagem", {
      token,
      label: "listagem_get_after_put",
    });
    metrics.scopeGets += 1;
    const cols = after?.preferencias?.table?.visibleColumns || [];
    if (cols.includes("codempresa") && cols.includes("razao_social")) {
      pass("listagem_persist_after_put", { visibleColumns: cols });
    } else {
      fail("listagem_persist_after_put", `colunas inesperadas: ${JSON.stringify(cols)}`);
    }
  } catch (e) {
    fail("listagem_persist_after_put", e.message);
  }

  try {
    const restored = await api("PUT", "/api/user/preferences/empresas/listagem", {
      token,
      body: {
        preferencias: originalPref,
        versao_schema: Number(originalPref.version) || 1,
      },
      label: "listagem_put_restore",
    });
    metrics.listagemPuts += 1;
    pass("listagem_put_restore", { updatedAt: restored?.updatedAt });
  } catch (e) {
    fail("listagem_put_restore", e.message);
  }

  try {
    const bootstrap2 = await api("GET", "/api/user/preferences/bootstrap", { token, label: "bootstrap_2" });
    metrics.bootstrapGets += 1;
    pass("bootstrap_idempotent", { count: bootstrap2.preferences?.length ?? 0 });
  } catch (e) {
    fail("bootstrap_idempotent", e.message);
  }

  results.metrics = {
    bootstrapGets: metrics.bootstrapGets,
    scopeGets: metrics.scopeGets,
    listagemPuts: metrics.listagemPuts,
    totalRequests: metrics.requests.length,
  };

  results.finishedAt = new Date().toISOString();
  results.durationMs = Number((performance.now()).toFixed(0));
  results.approved = results.failures.length === 0;

  const outPath = "scripts/validate-preferences-real-api.results.json";
  writeFileSync(outPath, JSON.stringify(results, null, 2));
  log(`Resultados gravados em ${outPath}`);
  log(`Aprovado: ${results.approved} (${results.checks.length} checks, ${results.failures.length} falhas)`);

  if (!results.approved) process.exit(1);
}

main().catch((error) => {
  console.error("[validate-real] FATAL:", error.message);
  process.exit(1);
});
