/**
 * Validação Parte 5 — PUT malicioso rejeitado (PR #223 staging).
 *
 * Uso:
 *   VALIDATE_BASE_URL=https://staging-pr223.up.railway.app \
 *   VALIDATE_USER_A_CLIENTE=tenant1 VALIDATE_USER_A_USUARIO=usera \
 *   PREF_ISOLATION_SEED_PASSWORD='...' \
 *   node backend/scripts/validatePreferencesPutSecurity.js
 */
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { FORBIDDEN_IDENTITY_FIELDS } from "../src/modules/preferences/rejectClientControlledIdentityFields.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const BASE_URL = String(process.env.VALIDATE_BASE_URL || "").replace(/\/$/, "");

const LOGIN = {
  cliente: process.env.VALIDATE_USER_A_CLIENTE || "tenant1",
  usuario: process.env.VALIDATE_USER_A_USUARIO || "usera",
  senha:
    process.env.VALIDATE_USER_A_SENHA ||
    process.env.PREF_ISOLATION_SEED_PASSWORD ||
    "",
};

const MALICIOUS_CASES = [
  {
    label: "usuario_id injetado",
    body: {
      preferencias: { version: 1 },
      usuario_id: "userb",
    },
  },
  {
    label: "cliente_id injetado",
    body: {
      preferencias: { version: 1 },
      cliente_id: "tenant2",
    },
  },
  {
    label: "tenant_id injetado",
    body: {
      preferencias: { version: 1 },
      tenant_id: "tenant2",
    },
  },
  {
    label: "empresa_id injetado",
    body: {
      preferencias: { version: 1 },
      empresa_id: "emp-fake",
    },
  },
  {
    label: "payload legado com modulo/tela/preferences + usuario_id",
    body: {
      modulo: "empresas",
      tela: "listagem",
      preferences: {},
      usuario_id: "userb",
    },
  },
];

const report = {
  baseUrl: BASE_URL,
  startedAt: new Date().toISOString(),
  forbiddenFields: FORBIDDEN_IDENTITY_FIELDS,
  cases: [],
  approved: false,
};

const api = async (method, routePath, { token, body } = {}) => {
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
  if (!BASE_URL) {
    throw new Error("VALIDATE_BASE_URL é obrigatório (backend staging da PR #223).");
  }
  if (!LOGIN.senha) {
    throw new Error("Defina VALIDATE_USER_A_SENHA ou PREF_ISOLATION_SEED_PASSWORD.");
  }

  console.log(`[put-security] base=${BASE_URL}`);

  const login = await api("POST", "/api/auth/login", { body: LOGIN });
  if (!login.ok || !login.payload?.token) {
    throw new Error(`Login falhou: HTTP ${login.status} — ${login.payload?.message || "sem token"}`);
  }
  const token = login.payload.token;
  report.login = {
    cliente: LOGIN.cliente,
    usuario: LOGIN.usuario,
    userIdMasked: login.payload?.user?.id
      ? `${String(login.payload.user.id).slice(0, 4)}…`
      : null,
  };

  for (const testCase of MALICIOUS_CASES) {
    const response = await api("PUT", "/api/user/preferences/empresas/listagem", {
      token,
      body: testCase.body,
    });
    const passed = response.status === 400;
    report.cases.push({
      label: testCase.label,
      status: response.status,
      pass: passed,
      message: response.payload?.message || null,
    });
    console.log(`${passed ? "PASS" : "FAIL"}: ${testCase.label} → HTTP ${response.status}`);
  }

  report.approved = report.cases.every((item) => item.pass);
  report.finishedAt = new Date().toISOString();

  const outFile = path.join(__dirname, "..", "..", "scripts", "validate-preferences-put-security.results.json");
  writeFileSync(outFile, JSON.stringify(report, null, 2));
  console.log(`[put-security] Resultado: ${outFile}`);
  console.log(`[put-security] Aprovado: ${report.approved}`);

  if (!report.approved) process.exit(1);
};

run().catch((error) => {
  report.approved = false;
  report.fatal = error.message;
  report.finishedAt = new Date().toISOString();
  try {
    const outFile = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "scripts", "validate-preferences-put-security.results.json");
    writeFileSync(outFile, JSON.stringify(report, null, 2));
  } catch {
    // ignore
  }
  console.error("[put-security] FATAL:", error.message);
  process.exit(1);
});
