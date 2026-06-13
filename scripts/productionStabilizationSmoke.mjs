/**
 * Smoke test de estabilização — produção.
 * Uso: node scripts/productionStabilizationSmoke.mjs
 */
const API_BASE = process.env.AUDIT_API_BASE || "https://projetomg-production.up.railway.app";
const LOGIN = {
  cliente: process.env.AUDIT_CLIENTE || "maike",
  usuario: process.env.AUDIT_USUARIO || "maike",
  senha: process.env.AUDIT_SENHA || "123",
};

const checks = [];

const assert = (name, condition, detail = "") => {
  checks.push({ name, ok: Boolean(condition), detail });
  console.log(`${condition ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

async function request(path, { method = "GET", token, body } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { "Content-Type": "application/json" } : {}),
      "X-Empresa-Id": "all",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let payload = null;
  try {
    payload = JSON.parse(text);
  } catch {
    payload = { raw: text.slice(0, 200) };
  }
  return { status: res.status, ok: res.ok, payload };
}

async function main() {
  console.log("=== SMOKE ESTABILIZAÇÃO PRODUÇÃO ===\n");

  const health = await request("/api/health");
  assert("health 200", health.status === 200);
  assert("db connected", health.payload?.db?.connected === true);
  assert(
    "performance indexes",
    health.payload?.performanceIndexes?.applied === true,
    health.payload?.performanceIndexes
      ? `${health.payload.performanceIndexes.found}/${health.payload.performanceIndexes.expected}`
      : "campo ausente"
  );

  const login = await request("/api/auth/login", { method: "POST", body: LOGIN });
  assert("login 200", login.status === 200, login.payload?.message || "");
  assert("login token", Boolean(login.payload?.token));

  if (!login.payload?.token) {
    console.log("\n❌ REPROVADO — login bloqueado");
    process.exit(1);
  }

  const token = login.payload.token;

  const session = await request("/api/auth/session", { token });
  assert("session 200", session.status === 200);
  assert("session user", Boolean(session.payload?.user?.id));

  const empresas = await request("/api/empresas?page=1&pageSize=50", { token });
  assert("empresas 200", empresas.status === 200);
  assert("empresas items", Array.isArray(empresas.payload?.items));

  const contadores = await request("/api/metrics/contadores", { token });
  assert("contadores 200", contadores.status === 200);
  assert(
    "contadores empresas",
    Number.isFinite(Number(contadores.payload?.empresas)),
    String(contadores.payload?.empresas)
  );

  const cadcps = await request("/api/cadcps/campos?page=1&pageSize=50", { token });
  assert("cadcps 200", cadcps.status === 200);
  assert("cadcps items", Array.isArray(cadcps.payload?.items));

  const telas = await request("/api/cadcps/telas", { token });
  assert("cadastros telas", telas.status === 200);

  const failed = checks.filter((c) => !c.ok);
  console.log(`\n=== ${failed.length ? "❌ REPROVADO" : "✅ APROVADO"} (${checks.length - failed.length}/${checks.length}) ===`);
  process.exit(failed.length ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
