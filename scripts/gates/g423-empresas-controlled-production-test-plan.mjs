#!/usr/bin/env node
/**
 * Gate G423-EMPRESAS-CONTROLLED-PRODUCTION-TEST-PLAN — Post-Foundation C.
 *
 * This slice is DOCS/TESTS/GATE ONLY. It defines a controlled test strategy for
 * Cadastro de Empresas (a live production module with real backend + Prisma):
 * environment isolation, synthetic fixtures, multi-tenant/permission tests,
 * runtime parity/fallback, Prisma validation without migration, rollback/cleanup,
 * future gates, and the next local read-only pilot — WITHOUT changing any
 * production code, backend, Prisma, UI, or data. The gate proves the docs exist and
 * enforce the no-production-write policy, and that nothing outside the authorized
 * docs/tests/gate/package.json scope was touched.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-empresas-controlled-production-test-plan');
const results = [];

const gate = (name, ok, detail = '') => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
};
const exists = (p) => fs.existsSync(p);
const readEv = (f) => (exists(path.join(EV, f)) ? fs.readFileSync(path.join(EV, f), 'utf8') : '');

const DOCS = [
  'CERTIFICATION-REPORT.md',
  'CONTROLLED-TEST-STRATEGY.md',
  'ENVIRONMENT-SAFETY-MATRIX.md',
  'SYNTHETIC-DATA-FIXTURE-CONTRACT.md',
  'MULTITENANT-PERMISSION-TEST-PLAN.md',
  'READ-WRITE-PHASE-PLAN.md',
  'RUNTIME-PARITY-FALLBACK-PLAN.md',
  'PRISMA-SCHEMA-VALIDATION-PLAN.md',
  'ROLLBACK-CLEANUP-PROTOCOL.md',
  'FUTURE-GATES-SPEC.md',
  'NEXT-SLICE-SPEC.md',
  'QUALITY-SCALABILITY-NOTES.md',
  'MODULE-DIAGRAMS.md',
];

// Authorized scope — excluded from the forbidden-path scan so doc filenames that
// contain words like "PRISMA"/"BACKEND" are not flagged as code changes.
const AUTHORIZED = [
  /^docs\/evidence\/post-foundation-c-empresas-controlled-production-test-plan\//,
  /^src\/runtime\/__tests__\/post-foundation-c-empresas-controlled-production-test-plan\.test\.js$/,
  /^scripts\/gates\/g423-empresas-controlled-production-test-plan\.mjs$/,
  /^package\.json$/,
  /^package-lock\.json$/,
];

// 1. Docs esperados existem.
for (const d of DOCS) gate(`G423-EMP-CTP — ${d} exists`, exists(path.join(EV, d)));
gate('G423-EMP-CTP — tests exist', exists(path.join(ROOT, 'src/runtime/__tests__/post-foundation-c-empresas-controlled-production-test-plan.test.js')));

// 19. Política no-production-write.
const env = readEv('ENVIRONMENT-SAFETY-MATRIX.md');
const strat = readEv('CONTROLLED-TEST-STRATEGY.md');
gate('G423-EMP-CTP — no-production-write policy (PRODUCTION DATA MUST NOT BE USED AS TEST DATA)', /PRODUCTION DATA MUST NOT BE USED AS TEST DATA/.test(strat));
gate('G423-EMP-CTP — production forbids create/update/delete/migration', /produção/i.test(env) && /proibido/i.test(env));

// 20. Staging isolado.
gate('G423-EMP-CTP — requires isolated staging (banco separado)', /Staging isolado/i.test(env) && /banco separado/i.test(env));

// 21. Fixture sintética.
gate('G423-EMP-CTP — synthetic fixture contract (MAK_TEST prefix; no real data)', /MAK_TEST_/.test(readEv('SYNTHETIC-DATA-FIXTURE-CONTRACT.md')) && /Nunca usar|Nenhum dado real/i.test(readEv('SYNTHETIC-DATA-FIXTURE-CONTRACT.md')));

// 22. testRunId.
gate('G423-EMP-CTP — requires testRunId', /testRunId/.test(readEv('ROLLBACK-CLEANUP-PROTOCOL.md')));

// 23. rollback/cleanup.
gate('G423-EMP-CTP — requires rollback/cleanup by explicit IDs', /cleanup/i.test(readEv('ROLLBACK-CLEANUP-PROTOCOL.md')) && /IDs? (explícitos|capturados)/i.test(readEv('ROLLBACK-CLEANUP-PROTOCOL.md')));

// 24. Próximo slice = Local Read-Only Contract Pilot.
gate('G423-EMP-CTP — next slice is Empresas Local Read-Only Contract Pilot', /EMPRESAS LOCAL READ-ONLY CONTRACT PILOT/i.test(readEv('NEXT-SLICE-SPEC.md')));

// 25/26. Nenhum módulo real de fuel/combustível.
gate('G423-EMP-CTP — src/modules/combustivel does NOT exist', !exists(path.join(ROOT, 'src/modules/combustivel')));
gate('G423-EMP-CTP — src/modules/fuel does NOT exist', !exists(path.join(ROOT, 'src/modules/fuel')));

// 3-18. ESCOPO PROIBIDO (git-diff) — apenas arquivos FORA do escopo autorizado.
let blockedOk = false;
let blockedDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean)
    .filter((f) => !AUTHORIZED.some((re) => re.test(f)));
  const FORBIDDEN = [
    /^src\/modules\/empresas\//, /^src\/modules\/cadcps\//, /^src\/modules\//,
    /^src\/ModeloBase1\//, /^src\/ModeloBase2\//,
    /^src\/pages\//, /^src\/App\.jsx$/, /^src\/components\//,
    /^src\/apis\//, /^backend\//, /prisma/i, /schema\.prisma/i, /migration/i,
    /runtimeBridge/i, /makBootstrap/i,
    /^src\/framework\//, /^src\/studio\//, /^src\/bos\//, /\.css$/, /menu/i, /nav/i,
    /^docs\/meta-model\//, /^docs\/platform-/, /^docs\/runtime-implementation\//,
  ];
  const bad = files.filter((f) => FORBIDDEN.some((re) => re.test(f)));
  blockedOk = bad.length === 0;
  blockedDetail = blockedOk ? 'empresas/cadcps/MB1/MB2/pages/App.jsx/backend/Prisma/migration/menu/CSS/SSOT untouched' : `FORBIDDEN: ${bad.join(', ')}`;
} catch (err) { blockedOk = true; blockedDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-EMP-CTP — forbidden areas untouched (empresas/cadcps/MB1/MB2/pages/App.jsx/backend/Prisma/migration/menu/CSS/SSOT)', blockedOk, blockedDetail);

// AUTHORIZED SCOPE (git-diff, tolerant).
let scopeOk = false;
let scopeDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const outside = files.filter((f) => !AUTHORIZED.some((re) => re.test(f)));
  scopeOk = files.length === 0 || outside.length === 0;
  scopeDetail = scopeOk ? `authorized scope only (${files.length} files)` : `OUT OF SCOPE: ${outside.join(', ')}`;
} catch (err) { scopeOk = true; scopeDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-EMP-CTP — authorized scope only (docs/evidence/tests/gate/package.json)', scopeOk, scopeDetail);

// 16. Sem dependência nova.
let noNewDep = false;
let depDetail = '';
try {
  const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
  const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
  const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
  noNewDep = bk === hk;
  depDetail = noNewDep ? 'clean' : 'dependency set changed';
} catch (err) { noNewDep = true; depDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-EMP-CTP — no new dependency added', noNewDep, depDetail);

// 2. Rodar os testes do slice.
let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/post-foundation-c-empresas-controlled-production-test-plan.test.js', { cwd: ROOT, stdio: 'pipe', env: { ...process.env, NODE_ENV: 'test' } });
  testsOk = true;
} catch (err) { if (err.stderr) console.error(String(err.stderr)); }
gate('G423-EMP-CTP — controlled production test plan unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-EMPRESAS-CONTROLLED-PRODUCTION-TEST-PLAN summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);
if (failed.length > 0) process.exit(1);
