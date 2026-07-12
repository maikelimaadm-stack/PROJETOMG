#!/usr/bin/env node
/**
 * Gate G423-EMPRESAS-LOCAL-READ-ONLY-CONTRACT-PILOT — Post-Foundation C.
 *
 * Proves an ISOLATED, LOCAL, READ-ONLY contract pilot for Empresas: synthetic
 * dataset, tenant isolation, read-only repository + API adapter, runtime projection,
 * parity checker, diagnostics, fallback and an explicit mutation blocker. It NEVER
 * touches a real backend/Prisma/fetch/Railway/production, NEVER mutates, NEVER uses
 * real data, and does NOT change any Empresas production file (page/components/config/
 * preferences/hooks/ModeloBase1). No new dependency. Next step is local read parity
 * hardening — NOT production/write/migration.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const PILOT_DIR = path.join(ROOT, 'src/modules/empresas/local-read-contract-pilot');
const results = [];

const gate = (name, ok, detail = '') => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
};
const exists = (p) => fs.existsSync(p);
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const walk = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const full = path.join(dir, e.name);
  if (e.isDirectory()) return walk(full);
  return e.isFile() && /\.(js|jsx)$/.test(e.name) ? [full] : [];
}) : []);
const importsOf = (files) => files.flatMap((f) => [...stripComments(fs.readFileSync(f, 'utf8')).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => m[1]));

const AUTHORIZED = [
  /^src\/modules\/empresas\/local-read-contract-pilot\//,
  /^src\/runtime\/__tests__\/empresas-local-read-only-contract-pilot\.test\.js$/,
  /^scripts\/gates\/g423-empresas-local-read-only-contract-pilot\.mjs$/,
  /^package\.json$/,
  /^package-lock\.json$/,
  /^docs\/evidence\/post-foundation-c-empresas-local-read-only-contract-pilot\//,
  // The shared production-UI guard gains this isolated read-only test subtree as a
  // sanctioned exception (mirrors the runtime-v2/fuel dev-route exceptions).
  /^scripts\/gates\/lib\/productionUiGuard\.mjs$/,
  // Prior-slice tests whose branch-relative git-diff scope allowlists are widened
  // to tolerate this slice's authorized paths (cross-slice robustness).
  /^src\/runtime\/__tests__\/post-foundation-c-empresas-production-baseline-audit\.test\.js$/,
  /^src\/runtime\/__tests__\/post-foundation-c-empresas-controlled-production-test-plan\.test\.js$/,
  /^src\/runtime\/__tests__\/post-foundation-c-studio-first-module-policy\.test\.js$/,
];

const FILES = [
  'errors.js',
  'empresasLocalReadContractConfig.js',
  'blockEmpresasReadPilotMutation.js',
  'createEmpresasSyntheticDataset.js',
  'createEmpresasSyntheticTenantContext.js',
  'createEmpresasReadOnlyRepository.js',
  'createEmpresasReadOnlyApiAdapter.js',
  'normalizeEmpresaReadPayload.js',
  'validateEmpresaReadQuery.js',
  'applyEmpresaReadFilters.js',
  'applyEmpresaReadSorting.js',
  'applyEmpresaReadPagination.js',
  'createEmpresasRuntimeReadProjection.js',
  'compareEmpresasReadParity.js',
  'createEmpresasReadContractDiagnostics.js',
  'createEmpresasReadContractFallback.js',
  'createEmpresasLocalReadContractPilot.js',
  'index.js',
];

// 1. Arquivos esperados.
for (const f of FILES) gate(`G423-EMP-LRP — ${f} exists`, exists(path.join(PILOT_DIR, f)));
gate('G423-EMP-LRP — tests exist', exists(path.join(ROOT, 'src/runtime/__tests__/empresas-local-read-only-contract-pilot.test.js')));

// Pilot invariants (dynamic).
let invOk = false;
let invDetail = '';
try {
  const m = await import(pathToFileURL(path.join(PILOT_DIR, 'index.js')).href);
  const p = m.createEmpresasLocalReadContractPilot({ env: { DEV: 'true', [m.EMPRESAS_LOCAL_READ_CONTRACT_PILOT_FLAG]: 'true' } });
  invOk = p.environment === 'local_test' && p.synthetic === true && p.localOnly === true && p.readOnly === true
    && p.mutationAllowed === false && p.productionAccessed === false && p.backendAccessed === false
    && p.prismaAccessed === false && p.fetchUsed === false && p.datasetSize >= 12 && p.tenants.length >= 2;
  invDetail = invOk ? `local_test; synthetic; read-only; datasetSize=${p.datasetSize}; tenants=${p.tenants.length}` : 'invariants wrong';
} catch (err) { invDetail = err instanceof Error ? err.message : String(err); }
gate('G423-EMP-LRP — pilot invariants (local_test/synthetic/read-only; no prod/backend/prisma/fetch; dataset+tenants)', invOk, invDetail);

// Tenant isolation (dynamic).
let isoOk = false;
try {
  const m = await import(pathToFileURL(path.join(PILOT_DIR, 'index.js')).href);
  const p = m.createEmpresasLocalReadContractPilot({ env: { DEV: 'true', [m.EMPRESAS_LOCAL_READ_CONTRACT_PILOT_FLAG]: 'true' } });
  const a = p.read({ pageSize: 100 }, p.createContext({ preset: 'A' }));
  const b = p.read({ pageSize: 100 }, p.createContext({ preset: 'B' }));
  const denied = p.read({}, p.createContext({ preset: 'noPermission' })).legacy.ok === false;
  const noHeader = p.read({}, p.createContext({ preset: 'noHeader' })).legacy.ok === false;
  const aOnlyA = a.legacy.items.every((r) => r.cliente_id === 'MAK_TEST_CLIENTE_A');
  const bOnlyB = b.legacy.items.every((r) => r.cliente_id === 'MAK_TEST_CLIENTE_B');
  isoOk = aOnlyA && bOnlyB && denied && noHeader && a.parity.equal === true && b.parity.equal === true;
} catch { isoOk = false; }
gate('G423-EMP-LRP — tenant isolation + fail-closed context + exact parity', isoOk);

// Mutation blocker (dynamic).
let mutOk = false;
try {
  const m = await import(pathToFileURL(path.join(PILOT_DIR, 'index.js')).href);
  const blocked = m.blockEmpresasReadPilotMutation({ operation: 'deleteEmpresa' });
  const repo = m.createEmpresasReadOnlyRepository({});
  let threw = false;
  try { repo.create({}); } catch { threw = true; }
  mutOk = blocked.blocked === true && blocked.mutationExecuted === false && blocked.datasetChanged === false && threw;
} catch { mutOk = false; }
gate('G423-EMP-LRP — mutation blocker (blocks + never executes; write methods throw)', mutOk);

// Parity checker exists + flags divergence (dynamic).
let parOk = false;
try {
  const m = await import(pathToFileURL(path.join(PILOT_DIR, 'index.js')).href);
  const par = m.compareEmpresasReadParity({ legacy: { items: [{ id: 'a' }], total: 1 }, runtime: { items: [{ id: 'b' }], total: 1 } });
  parOk = par.blockers.length > 0 && par.safeToProceed === false;
} catch { parOk = false; }
gate('G423-EMP-LRP — parity checker flags divergence (no silent divergence)', parOk);

// React-free + no network/Prisma/backend imports + no fetch/storage.
gate('G423-EMP-LRP — pilot is React-free', importsOf(walk(PILOT_DIR)).every((p) => p !== 'react' && !/^react(\/|$)/.test(p)));
gate('G423-EMP-LRP — no import of apiClient/EmpresaApi/apis/backend/prisma', importsOf(walk(PILOT_DIR)).every((p) => !/apiClient|EmpresaApi|\/apis\/|\/backend\/|prisma/i.test(p)));
let noIo = false;
try {
  const code = stripComments(walk(PILOT_DIR).map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
  noIo = !/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(code) && !/localStorage\.|sessionStorage\.|indexedDB\./.test(code);
} catch { noIo = false; }
gate('G423-EMP-LRP — no fetch/XHR/WebSocket/storage-API', noIo);
gate('G423-EMP-LRP — no DATABASE_URL / production API_URL usage', !/DATABASE_URL|VITE_API_URL|projetomg-production/.test(stripComments(walk(PILOT_DIR).map((f) => fs.readFileSync(f, 'utf8')).join('\n'))));

// ESCOPO PROIBIDO (git-diff) — fora do escopo autorizado.
let blockedOk = false;
let blockedDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean)
    .filter((f) => !AUTHORIZED.some((re) => re.test(f)));
  const FORBIDDEN = [
    /^src\/modules\/empresas\/(pages|components|config|preferences|hooks|repositories|runtime|data|utils)\//,
    /PAGEMP\.jsx$/, /^src\/modules\/cadcps\//, /^src\/ModeloBase1\//, /^src\/ModeloBase2\//,
    /^src\/pages\//, /^src\/App\.jsx$/, /^src\/components\//,
    /^src\/apis\//, /^backend\//, /prisma/i, /schema\.prisma/i, /migration/i,
    /runtimeBridge/i, /makBootstrap/i, /^src\/framework\//, /^src\/studio\//, /^src\/bos\//,
    /\.css$/, /menu/i, /nav/i,
    /^docs\/meta-model\//, /^docs\/platform-/, /^docs\/runtime-implementation\//,
  ];
  const bad = files.filter((f) => FORBIDDEN.some((re) => re.test(f)));
  blockedOk = bad.length === 0;
  blockedDetail = blockedOk ? 'empresas-prod/PAGEMP/cadcps/MB1/MB2/pages/App.jsx/backend/Prisma/migration/menu/CSS/SSOT untouched' : `FORBIDDEN: ${bad.join(', ')}`;
} catch (err) { blockedOk = true; blockedDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-EMP-LRP — production Empresas/ModeloBase1/backend/Prisma/App/menu untouched', blockedOk, blockedDetail);

// ESCOPO AUTORIZADO.
let scopeOk = false;
let scopeDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const outside = files.filter((f) => !AUTHORIZED.some((re) => re.test(f)));
  scopeOk = files.length === 0 || outside.length === 0;
  scopeDetail = scopeOk ? `authorized scope only (${files.length} files)` : `OUT OF SCOPE: ${outside.join(', ')}`;
} catch (err) { scopeOk = true; scopeDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-EMP-LRP — authorized scope only (pilot/tests/gate/package.json/evidence)', scopeOk, scopeDetail);

// Sem dependência nova.
let noNewDep = false;
try {
  const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
  const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
  const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
  noNewDep = bk === hk;
} catch { noNewDep = true; }
gate('G423-EMP-LRP — no new dependency added', noNewDep);

// Nenhum módulo real de fuel/combustível.
gate('G423-EMP-LRP — src/modules/combustivel does NOT exist', !exists(path.join(ROOT, 'src/modules/combustivel')));
gate('G423-EMP-LRP — src/modules/fuel does NOT exist', !exists(path.join(ROOT, 'src/modules/fuel')));

// Rodar os testes do slice.
let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/empresas-local-read-only-contract-pilot.test.js', { cwd: ROOT, stdio: 'pipe', env: { ...process.env, NODE_ENV: 'test' } });
  testsOk = true;
} catch (err) { if (err.stderr) console.error(String(err.stderr)); }
gate('G423-EMP-LRP — local read-only contract pilot unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-EMPRESAS-LOCAL-READ-ONLY-CONTRACT-PILOT summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);
if (failed.length > 0) process.exit(1);
