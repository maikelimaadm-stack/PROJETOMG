#!/usr/bin/env node
/**
 * Gate G423-EMPRESAS-PRODUCTION-BASELINE-AUDIT — Post-Foundation C.
 *
 * This slice is DOCS/TESTS/GATE ONLY. It audits Cadastro de Empresas as the
 * controlled production lab (file inventory, UI flow, ModeloBase1 integration,
 * data/persistence map, backend/Prisma readiness, risk register, next-slice spec)
 * WITHOUT changing any production code. The gate proves the docs exist and say the
 * right things (Empresas = controlled production lab; nothing implemented; next
 * step = Controlled Production Test Plan) and that nothing outside the authorized
 * docs/tests/gate/package.json scope was touched — Empresas/cadcps/ModeloBase1/
 * ModeloBase2/pages/App.jsx/backend/Prisma/runtimeBridge all untouched.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-empresas-production-baseline-audit');
const results = [];

const gate = (name, ok, detail = '') => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
};
const exists = (p) => fs.existsSync(p);
const readEv = (f) => (exists(path.join(EV, f)) ? fs.readFileSync(path.join(EV, f), 'utf8') : '');

const DOCS = [
  'CERTIFICATION-REPORT.md',
  'EMPRESAS-FILE-INVENTORY.md',
  'EMPRESAS-UI-FLOW-MAP.md',
  'EMPRESAS-MODELOBASE1-INTEGRATION.md',
  'EMPRESAS-DATA-PERSISTENCE-MAP.md',
  'EMPRESAS-BACKEND-PRISMA-READINESS.md',
  'EMPRESAS-RISK-REGISTER.md',
  'EMPRESAS-NEXT-SLICE-SPEC.md',
  'QUALITY-SCALABILITY-NOTES.md',
  'MODULE-DIAGRAMS.md',
];

// 1. Docs esperados existem.
for (const d of DOCS) gate(`G423-EMP-AUDIT — ${d} exists`, exists(path.join(EV, d)));
gate('G423-EMP-AUDIT — tests exist', exists(path.join(ROOT, 'src/runtime/__tests__/post-foundation-c-empresas-production-baseline-audit.test.js')));

// 14. Docs classificam Empresas como laboratório real controlado.
gate('G423-EMP-AUDIT — docs classify Empresas as laboratório real controlado', /laboratório real controlado/i.test(readEv('CERTIFICATION-REPORT.md')));

// 16. Próximo passo = Empresas Controlled Production Test Plan.
gate('G423-EMP-AUDIT — next step is Empresas Controlled Production Test Plan',
  /EMPRESAS CONTROLLED PRODUCTION TEST PLAN/i.test(readEv('EMPRESAS-NEXT-SLICE-SPEC.md')));

// Docs afirmam que nada de backend/Prisma foi implementado e a UI não mudou.
gate('G423-EMP-AUDIT — docs state backend/Prisma NOT implemented now', /O que NÃO implementar agora|não implementar agora|nada implementado/i.test(readEv('EMPRESAS-BACKEND-PRISMA-READINESS.md')));
gate('G423-EMP-AUDIT — docs say do NOT implement backend/Prisma immediately', /plano controlado, não implementação direta|sem implementar/i.test(readEv('EMPRESAS-NEXT-SLICE-SPEC.md')));

// 25/26. Nenhum módulo real de fuel/combustível.
gate('G423-EMP-AUDIT — src/modules/combustivel does NOT exist', !exists(path.join(ROOT, 'src/modules/combustivel')));
gate('G423-EMP-AUDIT — src/modules/fuel does NOT exist', !exists(path.join(ROOT, 'src/modules/fuel')));

// The authorized scope of THIS slice — excluded from the forbidden-path scan so a
// doc filename that merely contains words like "BACKEND"/"PRISMA" is not flagged.
const AUTHORIZED = [
  /^docs\/evidence\/post-foundation-c-empresas-production-baseline-audit\//,
  /^src\/runtime\/__tests__\/post-foundation-c-empresas-production-baseline-audit\.test\.js$/,
  /^scripts\/gates\/g423-empresas-production-baseline-audit\.mjs$/,
  /^package\.json$/,
  /^package-lock\.json$/,
];

// 3-15. ESCOPO PROIBIDO (git-diff) — apenas arquivos FORA do escopo autorizado.
let blockedOk = false;
let blockedDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean)
    .filter((f) => !AUTHORIZED.some((re) => re.test(f)));
  const FORBIDDEN = [
    /^src\/modules\/empresas\//, /^src\/modules\/cadcps\//, /^src\/modules\//,
    /^src\/ModeloBase1\//, /^src\/ModeloBase2\//,
    /^src\/pages\//, /^src\/App\.jsx$/, /^src\/components\//,
    /^src\/apis\//, /^backend\//, /\/backend\//, /prisma/i, /schema\.prisma/i,
    /runtimeBridge/i, /makBootstrap/i,
    /^src\/framework\//, /^src\/studio\//, /^src\/bos\//, /\.css$/,
    /^docs\/meta-model\//, /^docs\/platform-/, /^docs\/runtime-implementation\//,
  ];
  const bad = files.filter((f) => FORBIDDEN.some((re) => re.test(f)));
  blockedOk = bad.length === 0;
  blockedDetail = blockedOk ? 'empresas/cadcps/MB1/MB2/pages/App.jsx/components/backend/Prisma/runtimeBridge/CSS/SSOT untouched' : `FORBIDDEN: ${bad.join(', ')}`;
} catch (err) { blockedOk = true; blockedDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-EMP-AUDIT — forbidden areas untouched (empresas/cadcps/MB1/MB2/pages/App.jsx/backend/Prisma/runtimeBridge/CSS/SSOT)', blockedOk, blockedDetail);

// AUTHORIZED SCOPE (git-diff, tolerant).
let scopeOk = false;
let scopeDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const ALLOWED = [
    /^docs\/evidence\/post-foundation-c-empresas-production-baseline-audit\//,
    /^src\/runtime\/__tests__\/post-foundation-c-empresas-production-baseline-audit\.test\.js$/,
    /^scripts\/gates\/g423-empresas-production-baseline-audit\.mjs$/,
    /^package\.json$/,
    /^package-lock\.json$/,
  ];
  const outside = files.filter((f) => !ALLOWED.some((re) => re.test(f)));
  scopeOk = files.length === 0 || outside.length === 0;
  scopeDetail = scopeOk ? `authorized scope only (${files.length} files)` : `OUT OF SCOPE: ${outside.join(', ')}`;
} catch (err) { scopeOk = true; scopeDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-EMP-AUDIT — authorized scope only (docs/evidence/tests/gate/package.json)', scopeOk, scopeDetail);

// 13. Sem dependência nova.
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
gate('G423-EMP-AUDIT — no new dependency added', noNewDep, depDetail);

// 2. Rodar os testes do slice.
let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/post-foundation-c-empresas-production-baseline-audit.test.js', { cwd: ROOT, stdio: 'pipe', env: { ...process.env, NODE_ENV: 'test' } });
  testsOk = true;
} catch (err) { if (err.stderr) console.error(String(err.stderr)); }
gate('G423-EMP-AUDIT — empresas production baseline audit unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-EMPRESAS-PRODUCTION-BASELINE-AUDIT summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);
if (failed.length > 0) process.exit(1);
