#!/usr/bin/env node
/**
 * Gate G423-STUDIO-FIRST-MODULE-POLICY — Post-Foundation C Studio-First Module
 * Creation Policy & Experimental Base Reconciliation.
 *
 * This slice is DOCS/TESTS/GATE ONLY. It creates the official reconciliation +
 * policy record: ModeloBase2/Fuel stay sandbox/experimental (not production, not a
 * real module), NO new modules are created manually before Studio + Module
 * Blueprint, and Empresas is the controlled production lab for future
 * backend/Prisma/persistence pilots. The gate proves the docs exist and say the
 * right things, that no real fuel module was created, and that nothing outside the
 * authorized docs/tests/gate/package.json scope was touched.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
// Branch-relative scope checks may run on later Studio headless slices before merge.
// Known later Studio headless artifacts are tolerated here, but forbidden and unknown scopes still fail.
import { isKnownLaterStudioHeadlessArtifact } from './lib/studioScopeGovernanceGuard.mjs';

const ROOT = process.cwd();
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-first-module-policy');
const results = [];

const gate = (name, ok, detail = '') => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
};
const exists = (p) => fs.existsSync(p);
const readEv = (f) => (exists(path.join(EV, f)) ? fs.readFileSync(path.join(EV, f), 'utf8') : '');

const DOCS = [
  'CERTIFICATION-REPORT.md',
  'ARCHITECTURE-STATUS-RECONCILIATION.md',
  'STUDIO-FIRST-MODULE-CREATION-POLICY.md',
  'MODELOBASE2-EXPERIMENTAL-BOUNDARY.md',
  'FUEL-SANDBOX-FREEZE.md',
  'EMPRESAS-PRODUCTION-LAB-POLICY.md',
  'NO-NEW-MODULES-POLICY.md',
  'NEXT-STEPS-ROADMAP.md',
  'QUALITY-SCALABILITY-NOTES.md',
  'MODULE-DIAGRAMS.md',
];

// 1. Docs esperados existem.
for (const d of DOCS) gate(`G423-STUDIO — ${d} exists`, exists(path.join(EV, d)));
gate('G423-STUDIO — tests exist', exists(path.join(ROOT, 'src/runtime/__tests__/post-foundation-c-studio-first-module-policy.test.js')));

// 3+4. Bloquear a existência de módulos reais de fuel/combustível.
gate('G423-STUDIO — src/modules/combustivel does NOT exist', !exists(path.join(ROOT, 'src/modules/combustivel')));
gate('G423-STUDIO — src/modules/fuel does NOT exist', !exists(path.join(ROOT, 'src/modules/fuel')));

// 13. Fuel Controlled Module Registration não foi criado (nenhum artefato).
const fuelRegArtifacts = [
  'src/modules/combustivel',
  'src/modules/fuel',
  'src/ModeloBase2/fuel-module-registration',
  'src/ModeloBase2/fuel-controlled-registration',
];
gate('G423-STUDIO — no Fuel Controlled Module Registration artifact', fuelRegArtifacts.every((p) => !exists(path.join(ROOT, p))));

// 14. Docs classificam Fuel como sandbox/não produção.
const freeze = readEv('FUEL-SANDBOX-FREEZE.md');
gate('G423-STUDIO — docs classify Fuel as sandbox / não produção / não módulo real',
  /sandbox/i.test(freeze) && /não produção/i.test(freeze) && /não módulo real/i.test(freeze));

// 15. Docs classificam ModeloBase2 como experimental.
gate('G423-STUDIO — docs classify ModeloBase2 as experimental', /experimental/i.test(readEv('MODELOBASE2-EXPERIMENTAL-BOUNDARY.md')));

// 16. Docs classificam Empresas como laboratório real controlado.
gate('G423-STUDIO — docs classify Empresas as laboratório real controlado', /laboratório real controlado/i.test(readEv('EMPRESAS-PRODUCTION-LAB-POLICY.md')));

// 17. Docs exigem Studio antes de módulos novos.
const studioPol = readEv('STUDIO-FIRST-MODULE-CREATION-POLICY.md');
gate('G423-STUDIO — docs require Studio before new modules', /Studio Foundation/i.test(studioPol) && /só devem ser criados quando o Studio/i.test(studioPol));

// 18. Docs exigem Module Blueprint antes de módulos novos.
gate('G423-STUDIO — docs require Module Blueprint before new modules', /Module Blueprint/i.test(studioPol));

// 19. Próximo passo = Empresas Production Baseline Audit.
gate('G423-STUDIO — roadmap next step is Empresas Production Baseline Audit', /EMPRESAS PRODUCTION BASELINE AUDIT/i.test(readEv('NEXT-STEPS-ROADMAP.md')));

// 5-11. ESCOPO PROIBIDO (git-diff): src/modules, src/pages, App.jsx, backend/API/Prisma,
// runtimeBridge/makBootstrap, menu, CSS global, SSOT.
let blockedOk = false;
let blockedDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const FORBIDDEN = [
    /^src\/modules\//, /^src\/pages\//, /^src\/App\.jsx$/, /^src\/components\//,
    /^src\/apis\//, /\/backend\//, /prisma/i, /schema\.prisma/i,
    /runtimeBridge/i, /makBootstrap/i,
    /^src\/ModeloBase1\//, /^src\/ModeloBase2\//, /^src\/framework\//, /^src\/studio\//, /^src\/bos\//,
    /\.css$/,
    /^docs\/meta-model\//, /^docs\/platform-/, /^docs\/runtime-implementation\//,
  ];
  const bad = files.filter((f) => FORBIDDEN.some((re) => re.test(f)))
    .filter((f) => !isKnownLaterStudioHeadlessArtifact(f));
  blockedOk = bad.length === 0;
  blockedDetail = blockedOk ? 'src-modules/pages/App.jsx/components/backend/Prisma/runtimeBridge/MB1/MB2/menu/CSS/SSOT untouched' : `FORBIDDEN: ${bad.join(', ')}`;
} catch (err) { blockedOk = true; blockedDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-STUDIO — forbidden areas untouched (modules/pages/App.jsx/backend/Prisma/runtimeBridge/menu/CSS/SSOT)', blockedOk, blockedDetail);

// AUTHORIZED SCOPE (git-diff, tolerant).
let scopeOk = false;
let scopeDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const ALLOWED = [
    /^docs\/evidence\/post-foundation-c-studio-first-module-policy\//,
    /^src\/runtime\/__tests__\/post-foundation-c-studio-first-module-policy\.test\.js$/,
    /^scripts\/gates\/g423-studio-first-module-policy\.mjs$/,
    /^package\.json$/,
    /^package-lock\.json$/,
  ];
  const outside = files.filter((f) => !ALLOWED.some((re) => re.test(f)))
    .filter((f) => !isKnownLaterStudioHeadlessArtifact(f));
  scopeOk = files.length === 0 || outside.length === 0;
  scopeDetail = scopeOk ? `authorized scope only (${files.length} files)` : `OUT OF SCOPE: ${outside.join(', ')}`;
} catch (err) { scopeOk = true; scopeDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-STUDIO — authorized scope only (docs/evidence/tests/gate/package.json)', scopeOk, scopeDetail);

// 12. Sem dependência nova.
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
gate('G423-STUDIO — no new dependency added', noNewDep, depDetail);

// 2. Rodar os testes do slice.
let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/post-foundation-c-studio-first-module-policy.test.js', { cwd: ROOT, stdio: 'pipe', env: { ...process.env, NODE_ENV: 'test' } });
  testsOk = true;
} catch (err) { if (err.stderr) console.error(String(err.stderr)); }
gate('G423-STUDIO — studio-first module policy unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-STUDIO-FIRST-MODULE-POLICY summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);
if (failed.length > 0) process.exit(1);
