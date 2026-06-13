/**
 * Auditoria de latência rede + decomposição client-side (TTFB vs download).
 * Uso: node scripts/latencyAuditNetwork.mjs
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

const results = { timestamp: new Date().toISOString(), infra: {}, endpoints: {}, samples: [] };

function curlTiming(url, headers = []) {
  const headerArgs = headers.flatMap((h) => ["-H", h]);
  const fmt = [
    "time_namelookup:%{time_namelookup}",
    "time_connect:%{time_connect}",
    "time_appconnect:%{time_appconnect}",
    "time_starttransfer:%{time_starttransfer}",
    "time_total:%{time_total}",
    "size_download:%{size_download}",
    "speed_download:%{speed_download}",
    "http_code:%{http_code}",
  ].join(",");
  try {
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
  } catch (error) {
    return { error: error.message };
  }
}

async function fetchDetailed(url, token) {
  const start = performance.now();
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const ttfb = performance.now() - start;
  const bodyStart = performance.now();
  const text = await res.text();
  const download = performance.now() - bodyStart;
  const total = performance.now() - start;
  return {
    status: res.status,
    ttfbMs: ttfb,
    downloadMs: download,
    totalMs: total,
    sizeBytes: Buffer.byteLength(text, "utf8"),
  };
}

async function medianSamples(fn, n = 7) {
  const values = [];
  for (let i = 0; i < n; i += 1) values.push(await fn());
  values.sort((a, b) => a.totalMs - b.totalMs);
  return values[Math.floor(values.length / 2)];
}

async function main() {
  console.log("=== AUDITORIA DE LATÊNCIA (rede + client-side) ===\n");

  // DNS
  const railwayHost = new URL(API_BASE).hostname;
  const dnsStart = performance.now();
  const [railwayIps, supabaseIps] = await Promise.all([
    dns.resolve4(railwayHost).catch(() => []),
    dns.resolve4(SUPABASE_HOST).catch(() => []),
  ]);
  results.infra.dnsMs = performance.now() - dnsStart;
  results.infra.railwayHost = railwayHost;
  results.infra.railwayIps = railwayIps;
  results.infra.supabaseHost = SUPABASE_HOST;
  results.infra.supabaseIps = supabaseIps;
  console.log(`DNS Railway (${railwayHost}): ${railwayIps.join(", ") || "n/a"}`);
  console.log(`DNS Supabase (${SUPABASE_HOST}): ${supabaseIps.join(", ") || "n/a"}`);

  // ICMP ping if available
  for (const [label, host] of [
    ["Railway", railwayHost],
    ["Supabase pooler", SUPABASE_HOST],
  ]) {
    try {
      const ping = execSync(`ping -c 5 -W 2 ${host} 2>/dev/null | tail -1`, { encoding: "utf8" });
      results.infra[`ping_${label}`] = ping.trim();
      console.log(`Ping ${label}: ${ping.trim()}`);
    } catch {
      console.log(`Ping ${label}: indisponível neste ambiente`);
    }
  }

  // curl breakdown (cold)
  const healthCurl = curlTiming(`${API_BASE}/api/health`);
  results.endpoints.health_curl = healthCurl;
  console.log("\n--- curl /api/health (segundos) ---");
  console.log(healthCurl);

  const loginRes = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(LOGIN),
  });
  const loginPayload = await loginRes.json();
  const token = loginPayload.token;
  if (!token) throw new Error("Login falhou");

  const authHeader = [`Authorization: Bearer ${token}`];
  const empCurl = curlTiming(`${API_BASE}/api/empresas?page=1&pageSize=50`, authHeader);
  const cadcpsCurl = curlTiming(`${API_BASE}/api/cadcps/campos?page=1&pageSize=50`, authHeader);
  results.endpoints.empresas_curl = empCurl;
  results.endpoints.cadcps_curl = cadcpsCurl;

  console.log("\n--- curl /api/empresas ---");
  console.log(empCurl);
  console.log("\n--- curl /api/cadcps/campos ---");
  console.log(cadcpsCurl);

  // fetch medians (warm)
  const healthMed = await medianSamples(() => fetchDetailed(`${API_BASE}/api/health`), 5);
  const empMed = await medianSamples(
    () => fetchDetailed(`${API_BASE}/api/empresas?page=1&pageSize=50`, token),
    7
  );
  const empSearchMed = await medianSamples(
    () => fetchDetailed(`${API_BASE}/api/empresas?page=1&pageSize=50&search=MAIKE`, token),
    5
  );
  const cadcpsMed = await medianSamples(
    () => fetchDetailed(`${API_BASE}/api/cadcps/campos?page=1&pageSize=50`, token),
    5
  );

  results.endpoints.health_fetch = healthMed;
  results.endpoints.empresas_fetch = empMed;
  results.endpoints.empresas_search_fetch = empSearchMed;
  results.endpoints.cadcps_fetch = cadcpsMed;

  console.log("\n--- fetch mediano (ms) ---");
  console.log("health:", healthMed);
  console.log("empresas:", empMed);
  console.log("empresas search:", empSearchMed);
  console.log("cadcps:", cadcpsMed);

  // Decomposition for empresas (using curl as ground truth for network phases)
  const t = empCurl;
  if (!t.error) {
    const dnsMs = (t.time_namelookup || 0) * 1000;
    const tcpTlsMs = ((t.time_appconnect || t.time_connect || 0) - (t.time_namelookup || 0)) * 1000;
    const serverWaitMs = ((t.time_starttransfer || 0) - (t.time_appconnect || t.time_connect || 0)) * 1000;
    const downloadMs = ((t.time_total || 0) - (t.time_starttransfer || 0)) * 1000;
    const totalMs = (t.time_total || 0) * 1000;
    results.decomposition = {
      dnsMs,
      tcpTlsMs,
      serverWaitMs,
      downloadMs,
      totalMs,
      serverWaitPct: ((serverWaitMs / totalMs) * 100).toFixed(1),
      downloadPct: ((downloadMs / totalMs) * 100).toFixed(1),
      networkPct: (((dnsMs + tcpTlsMs) / totalMs) * 100).toFixed(1),
    };
    console.log("\n--- Decomposição curl /api/empresas ---");
    console.log(results.decomposition);
  }

  writeFileSync("/workspace/scripts/latencyAuditNetwork.results.json", JSON.stringify(results, null, 2));
  console.log("\nResultados: scripts/latencyAuditNetwork.results.json");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
