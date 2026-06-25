/**
 * Validação API — isolamento Usuário A/B/C (Etapa 2 — PR #223).
 *
 * Uso:
 *   VALIDATE_BASE_URL=https://staging.up.railway.app \
 *   VALIDATE_USER_A_CLIENTE=tenant1 VALIDATE_USER_A_USUARIO=usera VALIDATE_USER_A_SENHA=123 \
 *   VALIDATE_USER_B_CLIENTE=tenant1 VALIDATE_USER_B_USUARIO=userb VALIDATE_USER_B_SENHA=123 \
 *   VALIDATE_USER_C_CLIENTE=tenant2 VALIDATE_USER_C_USUARIO=userc VALIDATE_USER_C_SENHA=123 \
 *   node backend/scripts/validatePreferencesUserIsolationApi.js
 */
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const BASE_URL = String(
  process.env.VALIDATE_BASE_URL || process.env.SMOKE_BASE_URL || "https://projetomg-production.up.railway.app"
).replace(/\/$/, "");

const USERS = {
  A: {
    label: "Usuário A (Tenant 1)",
    login: {
      cliente: process.env.VALIDATE_USER_A_CLIENTE || process.env.VALIDATE_CLIENTE || "maike",
      usuario: process.env.VALIDATE_USER_A_USUARIO || process.env.VALIDATE_USUARIO || "maike",
      senha: process.env.VALIDATE_USER_A_SENHA || process.env.VALIDATE_SENHA || "123",
    },
    marker: "pr223-isolation-user-a",
    prefs: {
      version: 1,
      table: { visibleColumns: ["codempresa", "telefone"], _marker: "pr223-isolation-user-a" },
      viewMode: "search",
      cards: { layoutConfig: { cardsPerRow: 2 } },
    },
  },
  B: {
    label: "Usuário B (Tenant 1)",
    login: {
      cliente: process.env.VALIDATE_USER_B_CLIENTE || "maike",
      usuario: process.env.VALIDATE_USER_B_USUARIO || "userb",
      senha: process.env.VALIDATE_USER_B_SENHA || "123",
    },
    marker: "pr223-isolation-user-b",
    prefs: {
      version: 1,
      table: { visibleColumns: ["codempresa", "email"], _marker: "pr223-isolation-user-b" },
      viewMode: "table",
      cards: { layoutConfig: { cardsPerRow: 4 } },
    },
  },
  C: {
    label: "Usuário C (Tenant 2)",
    login: {
      cliente: process.env.VALIDATE_USER_C_CLIENTE || "tenant2",
      usuario: process.env.VALIDATE_USER_C_USUARIO || "userc",
      senha: process.env.VALIDATE_USER_C_SENHA || "123",
    },
    marker: "pr223-isolation-user-c",
    prefs: {
      version: 1,
      table: { visibleColumns: ["codempresa", "status"], _marker: "pr223-isolation-user-c" },
      viewMode: "table",
    },
  },
};

const report = {
  baseUrl: BASE_URL,
  startedAt: new Date().toISOString(),
  users: {},
  isolationMatrix: [],
  identityRejection: null,
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

const loginUser = async (key) => {
  const config = USERS[key];
  const login = await api("POST", "/api/auth/login", { body: config.login });
  if (!login.ok || !login.payload?.token) {
    throw new Error(`${config.label}: login falhou (${login.status}) — ${login.payload?.message || "sem token"}`);
  }
  return {
    token: login.payload.token,
    userId: login.payload.user?.id,
    clienteId: login.payload.cliente?.id,
    login: config.login,
  };
};

const getListagem = async (token) => {
  const res = await api("GET", "/api/user/preferences/empresas/listagem", { token });
  return res;
};

const putListagem = async (token, preferencias, expectedUpdatedAt) => {
  const res = await api("PUT", "/api/user/preferences/empresas/listagem", {
    token,
    body: {
      versao_schema: Number(preferencias?.version) || 1,
      preferencias,
      expectedUpdatedAt,
    },
  });
  return res;
};

const run = async () => {
  console.log(`[isolation-api] base=${BASE_URL}`);

  const health = await api("GET", "/api/health");
  report.health = { ok: health.ok, db: health.payload?.db };
  if (!health.ok) throw new Error(`Healthcheck falhou: HTTP ${health.status}`);

  const sessions = {};
  for (const key of ["A", "B", "C"]) {
    try {
      sessions[key] = await loginUser(key);
      report.users[key] = {
        label: USERS[key].label,
        userId: sessions[key].userId,
        clienteId: sessions[key].clienteId,
        login: sessions[key].login,
        status: "logged_in",
      };
      console.log(`OK login ${key}: user=${sessions[key].userId} cliente=${sessions[key].clienteId}`);
    } catch (error) {
      report.users[key] = { label: USERS[key].label, status: "login_failed", error: error.message };
      console.warn(`SKIP login ${key}: ${error.message}`);
    }
  }

  const identityTest = await api("PUT", "/api/user/preferences/empresas/listagem", {
    token: sessions.A?.token,
    body: { usuario_id: "injected", preferencias: { version: 1 } },
  });
  report.identityRejection = {
    status: identityTest.status,
    rejected: identityTest.status === 400,
    message: identityTest.payload?.message,
  };

  const snapshots = {};
  for (const key of ["A", "B", "C"]) {
    if (!sessions[key]) continue;
    const current = await getListagem(sessions[key].token);
    snapshots[key] = {
      before: current.payload?.preferencias || null,
      updatedAt: current.payload?.updatedAt || null,
    };
  }

  if (sessions.A) {
    const putA = await putListagem(sessions.A.token, USERS.A.prefs, snapshots.A?.updatedAt);
    report.users.A.putStatus = putA.status;
    const afterA = await getListagem(sessions.A.token);
    snapshots.A.after = afterA.payload?.preferencias;
    snapshots.A.record = afterA.payload;
  }

  if (sessions.B) {
    const readBBefore = await getListagem(sessions.B.token);
    const markerBBefore = readBBefore.payload?.preferencias?.table?._marker;
    report.isolationMatrix.push({
      check: "B não lê marker de A antes de salvar",
      pass: markerBBefore !== USERS.A.marker,
      markerBBefore,
    });

    const putB = await putListagem(sessions.B.token, USERS.B.prefs, snapshots.B?.updatedAt);
    report.users.B.putStatus = putB.status;
    const afterB = await getListagem(sessions.B.token);
    snapshots.B.after = afterB.payload?.preferencias;
  }

  if (sessions.A) {
    const reReadA = await getListagem(sessions.A.token);
    report.isolationMatrix.push({
      check: "A mantém marker após B salvar",
      pass: reReadA.payload?.preferencias?.table?._marker === USERS.A.marker,
      markerA: reReadA.payload?.preferencias?.table?._marker,
    });
  }

  if (sessions.C) {
    const putC = await putListagem(sessions.C.token, USERS.C.prefs, snapshots.C?.updatedAt);
    report.users.C.putStatus = putC.status;
    const afterC = await getListagem(sessions.C.token);
    report.isolationMatrix.push({
      check: "C isolado de A",
      pass: afterC.payload?.preferencias?.table?._marker !== USERS.A.marker,
      markerC: afterC.payload?.preferencias?.table?._marker,
    });
  }

  report.snapshots = snapshots;
  report.approved =
    report.health.ok &&
    report.identityRejection.rejected &&
    report.isolationMatrix.every((row) => row.pass) &&
    Object.values(report.users).filter((u) => u.status === "logged_in").length >= 2;

  report.finishedAt = new Date().toISOString();
  const outFile = path.join(__dirname, "..", "..", "scripts", "validate-preferences-isolation-api.results.json");
  writeFileSync(outFile, JSON.stringify(report, null, 2));
  console.log(`[isolation-api] Resultado: ${outFile}`);
  console.log(`[isolation-api] Aprovado: ${report.approved}`);
  if (!report.approved) process.exit(1);
};

run().catch((error) => {
  report.approved = false;
  report.fatal = error.message;
  report.finishedAt = new Date().toISOString();
  try {
    const outFile = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "scripts", "validate-preferences-isolation-api.results.json");
    writeFileSync(outFile, JSON.stringify(report, null, 2));
  } catch {
    // ignore
  }
  console.error("[isolation-api] FATAL:", error.message);
  process.exit(1);
});
