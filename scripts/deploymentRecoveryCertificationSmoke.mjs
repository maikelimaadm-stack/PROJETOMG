/**
 * Program 2.3.X.3 — Deployment Recovery Certification smoke suite.
 * Usage: node scripts/deploymentRecoveryCertificationSmoke.mjs
 * Output: docs/auditoria/evidence/deployment-recovery-certification.json
 */
import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const API_BASE = process.env.SMOKE_BASE_URL || "https://projetomg-production.up.railway.app";
const FRONTEND_BASE = process.env.FRONTEND_BASE_URL || "https://projetomg.vercel.app";
const LOGIN = {
  cliente: process.env.AUDIT_CLIENTE || "maike",
  usuario: process.env.AUDIT_USUARIO || "maike",
  senha: process.env.AUDIT_SENHA || "123",
};

const report = {
  mission: "Program 2.3.X.3 — Deployment Recovery Certification",
  timestamp: new Date().toISOString(),
  apiBase: API_BASE,
  frontendBase: FRONTEND_BASE,
  checks: [],
  localGates: [],
  summary: {},
};

const record = (group, name, ok, detail = null) => {
  report.checks.push({ group, name, ok: Boolean(ok), detail });
  console.log(`${ok ? "✓" : "✗"} [${group}] ${name}${detail ? ` — ${detail}` : ""}`);
};

async function request(pathname, { method = "GET", token, body, empresaId = "all" } = {}) {
  const res = await fetch(`${API_BASE}${pathname}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { "Content-Type": "application/json" } : {}),
      "X-Empresa-Id": empresaId,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let payload = null;
  try {
    payload = JSON.parse(text);
  } catch {
    payload = { raw: text.slice(0, 300) };
  }
  return { status: res.status, ok: res.ok, payload };
}

async function probeFrontend(route) {
  const res = await fetch(`${FRONTEND_BASE}${route}`, { redirect: "follow" });
  return { route, status: res.status, ok: res.ok };
}

function runLocalGate(name, command) {
  try {
    execSync(command, { cwd: ROOT, stdio: "pipe" });
    report.localGates.push({ name, ok: true });
    console.log(`✓ [local] ${name}`);
    return true;
  } catch (error) {
    const detail = error.stderr?.toString()?.trim()?.split("\n").pop() || error.message;
    report.localGates.push({ name, ok: false, detail });
    console.log(`✗ [local] ${name} — ${detail}`);
    return false;
  }
}

async function main() {
  console.log("=== DEPLOYMENT RECOVERY CERTIFICATION SMOKE ===\n");

  const health = await request("/api/health");
  record("health", "/api/health 200", health.status === 200, `status=${health.status}`);
  record("health", "db connected", health.payload?.db?.connected === true);
  record(
    "health",
    "supabase configured",
    health.payload?.supabase?.authConfigured === true &&
      health.payload?.supabase?.storageConfigured === true
  );

  const login = await request("/api/auth/login", { method: "POST", body: LOGIN });
  record("auth", "login 200", login.status === 200, login.payload?.message || "");
  record("auth", "login token", Boolean(login.payload?.token));

  if (!login.payload?.token) {
    finalize("BLOCKED — login failed");
    return;
  }

  const token = login.payload.token;

  const session = await request("/api/auth/session", { token });
  record("auth", "session 200", session.status === 200);
  record("auth", "session ADMIN", session.payload?.user?.perfil === "ADMIN");

  const empresas = await request("/api/empresas?page=1&pageSize=50", { token });
  record("empresas", "list 200", empresas.status === 200);
  record("empresas", "list items", Array.isArray(empresas.payload?.items));

  const empresaId = empresas.payload?.items?.[0]?.id;
  if (empresaId) {
    const detail = await request(`/api/empresas/${empresaId}`, { token, empresaId });
    record("empresas", "detail 200", detail.status === 200, `id=${empresaId}`);
  }

  const contadores = await request("/api/metrics/contadores", { token });
  record("empresas", "contadores 200", contadores.status === 200);

  const cadcpsTelas = await request("/api/cadcps/telas", { token });
  record("cadcps", "telas 200", cadcpsTelas.status === 200);

  const cadcpsCampos = await request("/api/cadcps/campos?page=1&pageSize=50", { token });
  record("cadcps", "campos 200", cadcpsCampos.status === 200, `status=${cadcpsCampos.status}`);
  record(
    "cadcps",
    "campos items",
    cadcpsCampos.status === 200 && Array.isArray(cadcpsCampos.payload?.items),
    cadcpsCampos.payload?.message || ""
  );

  const cadcpsAplicaveis = await request(
    "/api/cadcps/campos/aplicaveis?entity=EmpresaCadastro",
    { token, empresaId: empresaId || "2437" }
  );
  record(
    "cadcps",
    "aplicaveis 200",
    cadcpsAplicaveis.status === 200,
    `status=${cadcpsAplicaveis.status}`
  );

  for (const path of [
    "/api/mdp/fields?page=1&pageSize=10",
    "/api/mdp/entities?page=1&pageSize=10",
    "/api/mdp/registry?page=1&pageSize=10",
    "/api/mdp/introspect",
  ]) {
    const r = await request(path, { token });
    record("mdp", `${path.split("?")[0]} 200`, r.status === 200, `status=${r.status}`);
  }

  const mdpCompile = await request("/api/mdp/compile/empresas", { method: "POST", token });
  record("mdp", "compile empresas 200", mdpCompile.status === 200, `status=${mdpCompile.status}`);

  runLocalGate("runtime-bridge", "node scripts/smoke-runtime-bridge.mjs");
  runLocalGate("studio-governance", "node scripts/smoke-studio-governance.mjs");
  runLocalGate("studio-contributions", "node scripts/smoke-studio-contributions.mjs");
  runLocalGate("studio-events", "node scripts/smoke-studio-events.mjs");
  runLocalGate("layout-studio-gate", "node scripts/gate-studio-layout-engine.mjs");
  runLocalGate("field-studio-gate", "node scripts/gate-studio-field-engine.mjs");
  runLocalGate("studio-production-gate", "node scripts/gate-studio-shell-production.mjs");
  runLocalGate("deploy-pipeline-g303-g304", "npm run gate:deploy-pipeline");

  for (const route of ["/", "/studio", "/studio/layout", "/studio/field"]) {
    const probe = await probeFrontend(route);
    record("frontend", `${route} 200`, probe.status === 200, `status=${probe.status}`);
  }

  finalize();
}

function finalize(blocker = null) {
  const apiChecks = report.checks;
  const failed = apiChecks.filter((c) => !c.ok);
  const localFailed = report.localGates.filter((g) => !g.ok);

  report.summary = {
    blocker,
    apiPassed: apiChecks.length - failed.length,
    apiTotal: apiChecks.length,
    localPassed: report.localGates.length - localFailed.length,
    localTotal: report.localGates.length,
    criticalFailures: failed.filter((c) =>
      ["mdp", "cadcps"].includes(c.group) && c.name.includes("200")
    ),
    verdict:
      blocker ||
      (failed.length === 0 && localFailed.length === 0
        ? "CERTIFIED"
        : failed.some((c) => ["mdp", "cadcps"].includes(c.group))
          ? "CONDITIONAL — MDP/CADCPS production errors (see P0)"
          : "CONDITIONAL"),
  };

  const outPath = path.join(ROOT, "docs/auditoria/evidence/deployment-recovery-certification.json");
  writeFileSync(outPath, JSON.stringify(report, null, 2));

  console.log(`\n=== VERDICT: ${report.summary.verdict} ===`);
  console.log(`API: ${report.summary.apiPassed}/${report.summary.apiTotal}`);
  console.log(`Local gates: ${report.summary.localPassed}/${report.summary.localTotal}`);
  console.log(`Evidence: ${outPath}`);

  process.exit(blocker || failed.some((c) => ["mdp", "cadcps"].includes(c.group)) ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  finalize(error.message);
});
