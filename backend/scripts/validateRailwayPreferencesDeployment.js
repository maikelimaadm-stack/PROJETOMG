/**
 * Validação pós-deploy Railway/staging — preferências Empresas (PR #222).
 *
 * Uso:
 *   VALIDATE_BASE_URL=https://seu-staging.up.railway.app \
 *   VALIDATE_CLIENTE=maike VALIDATE_USUARIO=maike VALIDATE_SENHA=123 \
 *   node backend/scripts/validateRailwayPreferencesDeployment.js
 *
 * Não incluir RAILWAY_TOKEN — apenas HTTP contra URL pública do staging.
 */
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { smokeLoginBody } from "./smokeCredentials.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const BASE_URL = String(process.env.VALIDATE_BASE_URL || process.env.SMOKE_BASE_URL || "").replace(/\/$/, "");
const LOGIN = smokeLoginBody({
  cliente: process.env.VALIDATE_CLIENTE,
  usuario: process.env.VALIDATE_USUARIO,
  senha: process.env.VALIDATE_SENHA,
});

const TEST_MARKER = `pr222-railway-validate-${Date.now()}`;

const report = {
  baseUrl: BASE_URL,
  startedAt: new Date().toISOString(),
  steps: [],
  approved: false,
};

const fail = (step, message, extra = {}) => {
  report.steps.push({ step, status: "FAIL", message, ...extra });
  throw new Error(`[${step}] ${message}`);
};

const pass = (step, extra = {}) => {
  report.steps.push({ step, status: "PASS", ...extra });
  console.log(`PASS: ${step}`);
};

const api = async (method, routePath, { token, body } = {}) => {
  if (!BASE_URL) throw new Error("VALIDATE_BASE_URL ou SMOKE_BASE_URL é obrigatório.");
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${BASE_URL}${routePath}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }
  return { status: response.status, payload, ok: response.ok };
};

const run = async () => {
  console.log(`[validate-railway] base=${BASE_URL || "(vazio)"}`);

  const health = await api("GET", "/api/health");
  if (!health.ok || !health.payload?.ok) {
    fail("healthcheck", `HTTP ${health.status}`, { body: health.payload });
  }
  if (!health.payload?.db?.connected) {
    fail("healthcheck_db", "Banco não conectado", { db: health.payload?.db });
  }
  pass("healthcheck", { db: health.payload?.db });

  const login = await api("POST", "/api/auth/login", { body: LOGIN });
  if (!login.ok || !login.payload?.token) {
    fail("login", `HTTP ${login.status}`, { body: login.payload });
  }
  const token = login.payload.token;
  pass("login", { userId: login.payload?.user?.id });

  const bootstrap = await api("GET", "/api/user/preferences/bootstrap", { token });
  if (!bootstrap.ok) fail("bootstrap", `HTTP ${bootstrap.status}`, { body: bootstrap.payload });
  const prefs = bootstrap.payload?.preferences || [];
  pass("bootstrap", { count: prefs.length, scopes: prefs.map((p) => `${p.modulo}.${p.tela}`) });

  const hasListagem = prefs.some((p) => p.modulo === "empresas" && p.tela === "listagem");
  const hasForm = prefs.some((p) => p.modulo === "empresas" && p.tela === "form_layout");
  if (!hasListagem) pass("bootstrap_listagem_scope", { note: "ausente — OK para tenant novo" });
  else pass("bootstrap_listagem_scope", { present: true });
  if (!hasForm) pass("bootstrap_form_scope", { note: "ausente — OK para tenant novo" });
  else pass("bootstrap_form_scope", { present: true });

  const listagemGet = await api("GET", "/api/user/preferences/empresas/listagem", { token });
  if (!listagemGet.ok && listagemGet.status !== 404) {
    fail("listagem_get", `HTTP ${listagemGet.status}`, { body: listagemGet.payload });
  }
  pass("listagem_get", {
    hasPreferencias: Boolean(listagemGet.payload?.preferencias),
    updatedAt: listagemGet.payload?.updatedAt,
  });

  const originalPref = listagemGet.payload?.preferencias || { version: 1, table: {} };
  const testPref = {
    ...originalPref,
    version: Number(originalPref.version) || 1,
    table: {
      ...(originalPref.table || {}),
      visibleColumns: ["codempresa", "razao_social"],
      _validateMarker: TEST_MARKER,
    },
  };

  const put = await api("PUT", "/api/user/preferences/empresas/listagem", {
    token,
    body: {
      preferencias: testPref,
      versao_schema: testPref.version,
      expectedUpdatedAt: listagemGet.payload?.updatedAt,
    },
  });
  if (!put.ok) fail("listagem_put", `HTTP ${put.status}`, { body: put.payload });
  pass("listagem_put", { updatedAt: put.payload?.updatedAt });

  const listagemAfter = await api("GET", "/api/user/preferences/empresas/listagem", { token });
  const marker = listagemAfter.payload?.preferencias?.table?._validateMarker;
  if (marker !== TEST_MARKER) {
    fail("listagem_persist", "Marker de teste não persistiu", { marker });
  }
  pass("listagem_persist", { marker });

  const restored = {
    ...originalPref,
    version: Number(originalPref.version) || 1,
  };
  if (restored.table && typeof restored.table === "object") {
    delete restored.table._validateMarker;
  }
  const cleanup = await api("PUT", "/api/user/preferences/empresas/listagem", {
    token,
    body: {
      preferencias: restored,
      versao_schema: restored.version,
    },
  });
  if (!cleanup.ok) fail("listagem_cleanup", `HTTP ${cleanup.status}`, { body: cleanup.payload });
  pass("listagem_cleanup");

  try {
    const { verifyUserPreferencesSchemaReady } = await import("./runBlockingDatabaseBoot.js");
    if (typeof verifyUserPreferencesSchemaReady === "function") {
      const schema = await verifyUserPreferencesSchemaReady();
      if (!schema?.ready) fail("schema_verify", schema?.reason || "schema incompleto", schema);
      pass("schema_verify", schema);
    } else {
      pass("schema_verify", { skipped: "verifyUserPreferencesSchemaReady não exportado — validado via API" });
    }
  } catch (error) {
    if (!process.env.DATABASE_URL) {
      pass("schema_verify", {
        skipped: "DATABASE_URL ausente neste runner — schema validado indiretamente via bootstrap/PUT",
      });
    } else {
      fail("schema_verify", error.message);
    }
  }

  report.approved = report.steps.every((step) => step.status === "PASS");
  report.finishedAt = new Date().toISOString();
  const outFile = path.join(__dirname, "..", "..", "scripts", "validate-railway-preferences.results.json");
  writeFileSync(outFile, JSON.stringify(report, null, 2));
  console.log(`[validate-railway] Resultado gravado em ${outFile}`);
  console.log(`[validate-railway] Aprovado: ${report.approved}`);
  if (!report.approved) process.exit(1);
};

run().catch((error) => {
  report.approved = false;
  report.fatal = error.message;
  report.finishedAt = new Date().toISOString();
  try {
    const outFile = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "scripts", "validate-railway-preferences.results.json");
    writeFileSync(outFile, JSON.stringify(report, null, 2));
  } catch {
    // ignore
  }
  console.error("[validate-railway] FATAL:", error.message);
  process.exit(1);
});
