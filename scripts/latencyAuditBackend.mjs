/**
 * Auditoria profunda de latência backend/banco — medições reais contra produção.
 * Uso: node scripts/latencyAuditBackend.mjs
 */
import { performance } from "node:perf_hooks";
import { writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import dns from "node:dns/promises";

const API_BASE = process.env.AUDIT_API_BASE || "https://projetomg-production.up.railway.app";
const SUPABASE_HOST = process.env.AUDIT_SUPABASE_HOST || "aws-1-sa-east-1.pooler.supabase.com";
const LOGIN = {
  cliente: process.env.AUDIT_CLIENTE || "maike",
  usuario: process.env.AUDIT_USUARIO || "maike",
  senha: process.env.AUDIT_SENHA || "123",
};

const results = {
  timestamp: new Date().toISOString(),
  apiBase: API_BASE,
  infra: {},
  endpoints: {},
  differentials: {},
  decomposition: {},
};

async function fetchTTFB(url, token, opts = {}) {
  const headers = token ? { Authorization: `Bearer ${token}`, ...(opts.headers || {}) } : {};
  const start = performance.now();
  const res = await fetch(url, { headers, ...opts });
  const ttfbMs = performance.now() - start;
  const bodyStart = performance.now();
  const text = await res.text();
  const downloadMs = performance.now() - bodyStart;
  return {
    status: res.status,
    ttfbMs: Number(ttfbMs.toFixed(2)),
    downloadMs: Number(downloadMs.toFixed(2)),
    totalMs: Number((ttfbMs + downloadMs).toFixed(2)),
    bytes: Buffer.byteLength(text, "utf8"),
  };
}

async function median(fn, n = 7) {
  const values = [];
  for (let i = 0; i < n; i += 1) values.push(await fn());
  values.sort((a, b) => a.ttfbMs - b.ttfbMs);
  return values[Math.floor(values.length / 2)];
}

function curlTiming(url, headers = []) {
  const headerArgs = headers.flatMap((h) => ["-H", h]);
  const fmt = [
    "time_namelookup:%{time_namelookup}",
    "time_connect:%{time_connect}",
    "time_appconnect:%{time_appconnect}",
    "time_starttransfer:%{time_starttransfer}",
    "time_total:%{time_total}",
    "size_download:%{size_download}",
    "http_code:%{http_code}",
  ].join(",");
  const out = execSync(
    `curl -sS -o /dev/null -w "${fmt}" ${headerArgs.map((a) => `'${a.replace(/'/g, "'\\''")}'`).join(" ")} '${url}'`,
    { encoding: "utf8", timeout: 120000 }
  );
  const parsed = {};
  out.trim().split(",").forEach((part) => {
    const [k, v] = part.split(":");
    parsed[k] = Number(v);
  });
  return parsed;
}

async function geoIp(ip) {
  try {
    const res = await fetch(`https://ipinfo.io/${ip}/json`);
    return res.json();
  } catch {
    return null;
  }
}

async function main() {
  console.log("=== AUDITORIA BACKEND/BANCO (medições reais) ===\n");

  const railwayHost = new URL(API_BASE).hostname;
  const dnsStart = performance.now();
  const [railwayIps, supabaseIps] = await Promise.all([
    dns.resolve4(railwayHost).catch(() => []),
    dns.resolve4(SUPABASE_HOST).catch(() => []),
  ]);
  results.infra.dnsResolveMs = Number((performance.now() - dnsStart).toFixed(2));
  results.infra.railway = { host: railwayHost, ips: railwayIps };
  results.infra.supabase = { host: SUPABASE_HOST, ips: supabaseIps };

  if (railwayIps[0]) results.infra.railway.geo = await geoIp(railwayIps[0]);
  if (supabaseIps[0]) results.infra.supabase.geo = await geoIp(supabaseIps[0]);

  for (const [label, host] of [
    ["railwayPing", railwayHost],
    ["supabasePing", SUPABASE_HOST],
  ]) {
    try {
      const ping = execSync(`ping -c 5 -W 2 ${host} 2>/dev/null | tail -1`, { encoding: "utf8" });
      results.infra[label] = ping.trim();
    } catch {
      results.infra[label] = "unavailable";
    }
  }

  const loginStart = performance.now();
  const loginRes = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(LOGIN),
  });
  const loginPayload = await loginRes.json();
  results.endpoints.login = {
    status: loginRes.status,
    ttfbMs: Number((performance.now() - loginStart).toFixed(2)),
    bytes: Buffer.byteLength(JSON.stringify(loginPayload), "utf8"),
  };

  const token = loginPayload.token;
  if (!token) throw new Error("Login falhou");

  const authHeader = [`Authorization: Bearer ${token}`];
  const probes = [
    ["health", `${API_BASE}/api/health`, null, 3],
    ["empresas_list_50", `${API_BASE}/api/empresas?page=1&pageSize=50`, token, 7],
    ["empresas_export_ttfb", `${API_BASE}/api/empresas/export?limit=50`, token, 3],
    ["empresas_search", `${API_BASE}/api/empresas?page=1&pageSize=50&search=MAIKE`, token, 5],
    ["metrics_contadores", `${API_BASE}/api/metrics/contadores`, token, 7],
    ["auth_session", `${API_BASE}/api/auth/session`, token, 5],
    ["cadcps_campos", `${API_BASE}/api/cadcps/campos?page=1&pageSize=50`, token, 5],
  ];

  for (const [name, url, tok, samples] of probes) {
    console.log(`Medindo ${name} (n=${samples})...`);
    const med = await median(() => fetchTTFB(url, tok), samples);
    results.endpoints[name] = med;
    console.log(`  TTFB=${med.ttfbMs}ms total=${med.totalMs}ms bytes=${med.bytes}`);
  }

  results.endpoints.health_curl = curlTiming(`${API_BASE}/api/health`);
  results.endpoints.empresas_curl = curlTiming(
    `${API_BASE}/api/empresas?page=1&pageSize=50`,
    authHeader
  );
  results.endpoints.cadcps_curl = curlTiming(
    `${API_BASE}/api/cadcps/campos?page=1&pageSize=50`,
    authHeader
  );

  const emp = results.endpoints.empresas_list_50;
  const ctr = results.endpoints.metrics_contadores;
  const ses = results.endpoints.auth_session;
  const curl = results.endpoints.empresas_curl;

  results.differentials = {
    empresas_minus_contadores_ms: Number((emp.ttfbMs - ctr.ttfbMs).toFixed(2)),
    session_minus_contadores_ms: Number((ses.ttfbMs - ctr.ttfbMs).toFixed(2)),
    empresas_search_minus_list_ms: Number(
      (results.endpoints.empresas_search.ttfbMs - emp.ttfbMs).toFixed(2)
    ),
    health_minus_contadores_ms: Number(
      (results.endpoints.health.ttfbMs - ctr.ttfbMs).toFixed(2)
    ),
  };

  const dnsMs = (curl.time_namelookup || 0) * 1000;
  const tcpTlsMs = ((curl.time_appconnect || curl.time_connect || 0) - (curl.time_namelookup || 0)) * 1000;
  const serverWaitMs = ((curl.time_starttransfer || 0) - (curl.time_appconnect || curl.time_connect || 0)) * 1000;
  const downloadMs = ((curl.time_total || 0) - (curl.time_starttransfer || 0)) * 1000;
  const totalMs = (curl.time_total || 0) * 1000;

  results.decomposition.empresas_curl = {
    dnsMs: Number(dnsMs.toFixed(2)),
    tcpTlsMs: Number(tcpTlsMs.toFixed(2)),
    serverWaitMs: Number(serverWaitMs.toFixed(2)),
    downloadMs: Number(downloadMs.toFixed(2)),
    totalMs: Number(totalMs.toFixed(2)),
    networkPct: Number((((dnsMs + tcpTlsMs) / totalMs) * 100).toFixed(1)),
    serverWaitPct: Number(((serverWaitMs / totalMs) * 100).toFixed(1)),
    downloadPct: Number(((downloadMs / totalMs) * 100).toFixed(1)),
  };

  results.decomposition.empresas_server_side = {
    measured_total_ttfb_ms: emp.ttfbMs,
    shared_authenticated_db_baseline_ms: ctr.ttfbMs,
    list_specific_delta_ms: results.differentials.empresas_minus_contadores_ms,
    shared_baseline_pct: Number(((ctr.ttfbMs / emp.ttfbMs) * 100).toFixed(1)),
    list_specific_pct: Number(
      ((results.differentials.empresas_minus_contadores_ms / emp.ttfbMs) * 100).toFixed(1)
    ),
    note:
      "Baseline = /api/metrics/contadores (JWT + loadAccessScope + 2 queries Prisma). Delta = findMany(50) vs findUnique.",
  };

  writeFileSync(
    "/workspace/scripts/latencyAuditBackend.results.json",
    JSON.stringify(results, null, 2)
  );
  console.log("\nResultados: scripts/latencyAuditBackend.results.json");
  console.log("\n--- Decomposição curl /api/empresas ---");
  console.log(results.decomposition.empresas_curl);
  console.log("\n--- Diferenciais (ms) ---");
  console.log(results.differentials);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
