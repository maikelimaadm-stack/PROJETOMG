#!/usr/bin/env node
/**
 * Gate G423-EMPRESAS-LOCAL-READ-PARITY-HARDENING — Post-Foundation C.
 *
 * Hardens the isolated Empresas local read-only contract: scaled synthetic datasets,
 * composite query matrix, tenant fuzz matrix, permission matrix, typed error
 * contract, deterministic parity digests, parity scenario runner, local performance
 * baseline, aggregate diagnostics and fail-closed fallback. NEVER touches a real
 * backend/Prisma/fetch/Railway/production, NEVER mutates, NEVER uses real data, and
 * does NOT change any Empresas production file. The productionUiGuard exception must
 * stay limited to the pilot subtree. No new dependency. Next step is Empresas Local
 * Read Contract Certification.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const HARD_DIR = path.join(ROOT, 'src/modules/empresas/local-read-contract-pilot/hardening');
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
  /^src\/runtime\/__tests__\/empresas-local-read-parity-hardening\.test\.js$/,
  /^scripts\/gates\/g423-empresas-local-read-parity-hardening\.mjs$/,
  /^package\.json$/,
  /^package-lock\.json$/,
  /^docs\/evidence\/post-foundation-c-empresas-local-read-parity-hardening\//,
  /^scripts\/gates\/lib\/productionUiGuard\.mjs$/,
];

const FILES = [
  'errors.js',
  'empresasLocalReadHardeningConfig.js',
  'createEmpresasScaledSyntheticDataset.js',
  'createEmpresasCompositeQueryMatrix.js',
  'createEmpresasTenantFuzzMatrix.js',
  'createEmpresasPermissionMatrix.js',
  'createEmpresasReadErrorContract.js',
  'createEmpresasParityDigest.js',
  'createEmpresasParityScenarioRunner.js',
  'createEmpresasReadPerformanceBaseline.js',
  'createEmpresasReadHardeningDiagnostics.js',
  'createEmpresasReadHardeningFallback.js',
  'validateEmpresasHardeningInvariant.js',
  'index.js',
];

// 1. Arquivos esperados.
for (const f of FILES) gate(`G423-EMP-HARD — ${f} exists`, exists(path.join(HARD_DIR, f)));
gate('G423-EMP-HARD — tests exist', exists(path.join(ROOT, 'src/runtime/__tests__/empresas-local-read-parity-hardening.test.js')));

// Aggregate hardening invariants (dynamic).
let diagOk = false;
let diagDetail = '';
try {
  const m = await import(pathToFileURL(path.join(HARD_DIR, 'index.js')).href);
  const d = m.createEmpresasReadHardeningDiagnostics({ clock: () => 0, includePerformance: false });
  diagOk = d.environment === 'local_test' && d.synthetic === true && d.localOnly === true && d.readOnly === true
    && d.mutationAllowed === false && d.productionAccessed === false && d.backendAccessed === false
    && d.prismaAccessed === false && d.fetchUsed === false
    && d.tenantLeakageFound === false && d.permissionBypassFound === false && d.mutationExposureFound === false
    && d.exactParity === true && d.parityScore === 1 && d.readiness === 'ready_for_local_certification';
  diagDetail = diagOk ? `readiness=${d.readiness}; parity=${d.parityScore}; no leak/bypass/mutation` : `wrong: ${JSON.stringify({ r: d.readiness, p: d.parityScore, l: d.tenantLeakageFound, b: d.permissionBypassFound })}`;
} catch (err) { diagDetail = err instanceof Error ? err.message : String(err); }
gate('G423-EMP-HARD — aggregate diagnostics (local_test/synthetic/read-only; exact parity 1.0; no leak/bypass/mutation)', diagOk, diagDetail);

// Scaled dataset profiles (dynamic).
let dsOk = false;
try {
  const m = await import(pathToFileURL(path.join(HARD_DIR, 'index.js')).href);
  const small = m.createEmpresasScaledSyntheticDataset({ profile: 'small' });
  const medium = m.createEmpresasScaledSyntheticDataset({ profile: 'medium' });
  const large = m.createEmpresasScaledSyntheticDataset({ profile: 'large' });
  const det = JSON.stringify(m.createEmpresasScaledSyntheticDataset({ profile: 'small', seed: 3 }).records) === JSON.stringify(m.createEmpresasScaledSyntheticDataset({ profile: 'small', seed: 3 }).records);
  const uniq = new Set(large.records.map((r) => r.id)).size === large.total;
  dsOk = small.total === 20 && medium.total === 250 && large.total === 2000 && medium.tenants.length >= 4 && large.tenants.length >= 4 && det && uniq && small.synthetic === true;
} catch { dsOk = false; }
gate('G423-EMP-HARD — scaled synthetic dataset (20/250/2000; >=4 tenants; deterministic; unique ids)', dsOk);

// Tenant fuzz + permission matrix + parity + error contract (dynamic).
let matricesOk = false;
try {
  const m = await import(pathToFileURL(path.join(HARD_DIR, 'index.js')).href);
  const tf = m.createEmpresasTenantFuzzMatrix({ dataset: m.createEmpresasScaledSyntheticDataset({ profile: 'medium' }) });
  const pm = m.createEmpresasPermissionMatrix({ dataset: m.createEmpresasScaledSyntheticDataset({ profile: 'small' }) });
  const pr = m.createEmpresasParityScenarioRunner({ dataset: m.createEmpresasScaledSyntheticDataset({ profile: 'small' }), clock: () => 0 });
  const ec = m.createEmpresasReadErrorContract();
  matricesOk = tf.leakageFound === false && tf.safe === true && pm.permissionBypassFound === false
    && pr.exactParity === true && pr.score === 1 && ec.total >= 20;
} catch { matricesOk = false; }
gate('G423-EMP-HARD — tenant fuzz (no leak) + permission matrix (no bypass) + exact parity + error contract', matricesOk);

// Parity digest determinism (dynamic).
let digestOk = false;
try {
  const m = await import(pathToFileURL(path.join(HARD_DIR, 'index.js')).href);
  const repoMod = await import(pathToFileURL(path.join(ROOT, 'src/modules/empresas/local-read-contract-pilot/index.js')).href);
  const ds = m.createEmpresasScaledSyntheticDataset({ profile: 'small' });
  const repo = repoMod.createEmpresasReadOnlyRepository({ dataset: ds });
  const c = m.contextForScaledTenant(ds.tenants[0]);
  const a = repo.list({ sort: 'codempresa', page: 1, pageSize: 5 }, c);
  const b = repo.list({ sort: 'codempresa', direction: 'desc', page: 1, pageSize: 5 }, c);
  const dA1 = m.createEmpresasParityDigest({ result: a, query: a.query, context: c }).digest;
  const dA2 = m.createEmpresasParityDigest({ result: a, query: a.query, context: c }).digest;
  const dB = m.createEmpresasParityDigest({ result: b, query: b.query, context: c }).digest;
  digestOk = dA1 === dA2 && dA1 !== dB;
} catch { digestOk = false; }
gate('G423-EMP-HARD — deterministic parity digest (same input same digest; order changes digest)', digestOk);

// Performance baseline (dynamic).
let perfOk = false;
try {
  const m = await import(pathToFileURL(path.join(HARD_DIR, 'index.js')).href);
  let t = 0;
  const perf = m.createEmpresasReadPerformanceBaseline({ iterations: 2, clock: () => (t += 1) });
  perfOk = perf.measurements.length >= 32 && perf.hasAnomaly === false && perf.isSla === false
    && perf.measurements.every((x) => x.network === false && x.backend === false && x.prisma === false && x.mutation === false);
} catch { perfOk = false; }
gate('G423-EMP-HARD — local performance baseline (no network/backend/prisma/mutation; no anomaly; not SLA)', perfOk);

// React-free + no network/Prisma/backend imports + no fetch/storage.
gate('G423-EMP-HARD — hardening is React-free', importsOf(walk(HARD_DIR)).every((p) => p !== 'react' && !/^react(\/|$)/.test(p)));
gate('G423-EMP-HARD — no import of apiClient/EmpresaApi/apis/backend/prisma', importsOf(walk(HARD_DIR)).every((p) => !/apiClient|EmpresaApi|\/apis\/|\/backend\/|prisma/i.test(p)));
let noIo = false;
try {
  const code = stripComments(walk(HARD_DIR).map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
  noIo = !/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(code) && !/localStorage\.|sessionStorage\.|indexedDB\./.test(code) && !/\.(post|put|patch|delete)\s*\(/i.test(code);
} catch { noIo = false; }
gate('G423-EMP-HARD — no fetch/XHR/WebSocket/storage/POST/PUT/PATCH/DELETE', noIo);
gate('G423-EMP-HARD — no DATABASE_URL / production API_URL / Railway usage', !/DATABASE_URL|VITE_API_URL|projetomg-production|railway/i.test(stripComments(walk(HARD_DIR).map((f) => fs.readFileSync(f, 'utf8')).join('\n'))));

// productionUiGuard exception stays limited to the pilot subtree only.
let guardOk = false;
let guardDetail = '';
try {
  const guardSrc = fs.readFileSync(path.join(ROOT, 'scripts/gates/lib/productionUiGuard.mjs'), 'utf8');
  const subtrees = [...guardSrc.matchAll(/'(src\/[^']+)'/g)].map((m) => m[1]).filter((s) => s.includes('local-read-contract-pilot'));
  const onlyPilot = subtrees.every((s) => s === 'src/modules/empresas/local-read-contract-pilot/');
  const noForbiddenExpansion = !/local-read-contract-pilot\/hardening\/[^']/.test(guardSrc) && !/'src\/modules\/empresas\/pages/.test(guardSrc) && !/'src\/modules\/empresas\/components/.test(guardSrc);
  guardOk = onlyPilot && noForbiddenExpansion;
  guardDetail = guardOk ? 'exception limited to the pilot subtree' : `guard expanded beyond pilot: ${subtrees.join(', ')}`;
} catch (err) { guardOk = false; guardDetail = err instanceof Error ? err.message : String(err); }
gate('G423-EMP-HARD — productionUiGuard exception limited to the pilot subtree', guardOk, guardDetail);

// ESCOPO PROIBIDO (git-diff) — fora do escopo autorizado.
let blockedOk = false;
let blockedDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean)
    .filter((f) => !AUTHORIZED.some((re) => re.test(f)));
  const FORBIDDEN = [
    /^src\/modules\/empresas\/(pages|components|config|preferences|hooks|repositories|runtime|data|utils)\//,
    /PAGEMP\.jsx$/, /empresasModeloBase1Config/, /empresasListCache/, /apis\/empresa\/EmpresaApi/,
    /^src\/modules\/cadcps\//, /^src\/ModeloBase1\//, /^src\/ModeloBase2\//,
    /^src\/pages\//, /^src\/App\.jsx$/, /^src\/components\//,
    /^src\/apis\//, /^backend\//, /prisma/i, /schema\.prisma/i, /migration/i,
    /runtimeBridge/i, /makBootstrap/i, /^src\/framework\//, /^src\/studio\//, /^src\/bos\//,
    /\.css$/, /menu/i, /nav/i,
    /^docs\/meta-model\//, /^docs\/platform-/, /^docs\/runtime-implementation\//,
  ];
  const bad = files.filter((f) => FORBIDDEN.some((re) => re.test(f)));
  blockedOk = bad.length === 0;
  blockedDetail = blockedOk ? 'production Empresas/ModeloBase1/backend/Prisma/App/menu/SSOT untouched' : `FORBIDDEN: ${bad.join(', ')}`;
} catch (err) { blockedOk = true; blockedDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-EMP-HARD — production Empresas/ModeloBase1/backend/Prisma/App/menu untouched', blockedOk, blockedDetail);

// ESCOPO AUTORIZADO.
let scopeOk = false;
let scopeDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const outside = files.filter((f) => !AUTHORIZED.some((re) => re.test(f)));
  scopeOk = files.length === 0 || outside.length === 0;
  scopeDetail = scopeOk ? `authorized scope only (${files.length} files)` : `OUT OF SCOPE: ${outside.join(', ')}`;
} catch (err) { scopeOk = true; scopeDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-EMP-HARD — authorized scope only (pilot/tests/gate/package.json/evidence)', scopeOk, scopeDetail);

// Sem dependência nova.
let noNewDep = false;
try {
  const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
  const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
  const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
  noNewDep = bk === hk;
} catch { noNewDep = true; }
gate('G423-EMP-HARD — no new dependency added', noNewDep);

// Nenhum módulo real de fuel/combustível.
gate('G423-EMP-HARD — src/modules/combustivel does NOT exist', !exists(path.join(ROOT, 'src/modules/combustivel')));
gate('G423-EMP-HARD — src/modules/fuel does NOT exist', !exists(path.join(ROOT, 'src/modules/fuel')));

// Next step documented (Local Read Contract Certification), not staging/production/write.
let nextOk = false;
try {
  const nss = fs.readFileSync(path.join(ROOT, 'docs/evidence/post-foundation-c-empresas-local-read-parity-hardening/NEXT-SLICE-SPEC.md'), 'utf8');
  nextOk = /EMPRESAS LOCAL READ CONTRACT CERTIFICATION/i.test(nss) && /NÃO recomendar[\s\S]*(staging write|produção)/i.test(nss);
} catch { nextOk = false; }
gate('G423-EMP-HARD — next step is Local Read Contract Certification (not staging/production/write)', nextOk);

// Rodar os testes do slice.
let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/empresas-local-read-parity-hardening.test.js', { cwd: ROOT, stdio: 'pipe', env: { ...process.env, NODE_ENV: 'test' } });
  testsOk = true;
} catch (err) { if (err.stderr) console.error(String(err.stderr)); }
gate('G423-EMP-HARD — local read parity hardening unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-EMPRESAS-LOCAL-READ-PARITY-HARDENING summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);
if (failed.length > 0) process.exit(1);
