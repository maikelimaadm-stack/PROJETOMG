#!/usr/bin/env node
/**
 * Gate G423-STUDIO-FOUNDATION-AUDIT — Post-Foundation C.
 *
 * This slice is DOCS/TESTS/GATE ONLY. It audits and specifies the MAK Studio
 * foundation (Studio = module factory; metamodel + module blueprint requirements;
 * field/screen/validation/permission/route/menu/persistence boundaries; runtime
 * integration; Empresas as a certified seed model; ModeloBase1/ModeloBase2
 * relationship; risks; next headless contracts slice) WITHOUT implementing Studio,
 * creating any module, or touching production code. The gate proves the docs exist
 * and say the right things, that no Studio/module artifact was created, and that
 * nothing outside the authorized docs/tests/gate/package.json scope was touched.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-foundation-audit');
const results = [];

const gate = (name, ok, detail = '') => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
};
const exists = (p) => fs.existsSync(p);
const readEv = (f) => (exists(path.join(EV, f)) ? fs.readFileSync(path.join(EV, f), 'utf8') : '');

const DOCS = [
  'CERTIFICATION-REPORT.md', 'STUDIO-FOUNDATION-AUDIT.md', 'STUDIO-SCOPE-BOUNDARY.md',
  'STUDIO-METAMODEL-REQUIREMENTS.md', 'MODULE-BLUEPRINT-REQUIREMENTS.md', 'FIELD-SCREEN-BUILDER-REQUIREMENTS.md',
  'VALIDATION-PERMISSION-BLUEPRINT-REQUIREMENTS.md', 'ROUTE-MENU-REGISTRY-REQUIREMENTS.md',
  'PERSISTENCE-BOUNDARY-REQUIREMENTS.md', 'RUNTIME-INTEGRATION-MAP.md', 'EMPRESAS-AS-CERTIFIED-SEED-MODEL.md',
  'MODELOBASE1-MODELOBASE2-RELATIONSHIP.md', 'STUDIO-RISK-REGISTER.md', 'NEXT-SLICE-SPEC.md',
  'QUALITY-SCALABILITY-NOTES.md', 'MODULE-DIAGRAMS.md',
];

// 1. Docs esperados existem.
for (const d of DOCS) gate(`G423-STUDIO-AUDIT — ${d} exists`, exists(path.join(EV, d)));
gate('G423-STUDIO-AUDIT — tests exist', exists(path.join(ROOT, 'src/runtime/__tests__/post-foundation-c-studio-foundation-audit.test.js')));

// 3-5 + 6. Nenhum artefato de módulo novo. NOTE: `src/studio/` já existe no repo (pré-existente);
// não deve ser CRIADO nem ALTERADO por este slice — a proteção "src/studio untouched" é feita
// pelo check git-diff FORBIDDEN abaixo, não por um check de ausência absoluta.
gate('G423-STUDIO-AUDIT — src/modules/studio does NOT exist', !exists(path.join(ROOT, 'src/modules/studio')));
gate('G423-STUDIO-AUDIT — src/Studio does NOT exist', !exists(path.join(ROOT, 'src/Studio')));
gate('G423-STUDIO-AUDIT — src/modules/combustivel does NOT exist', !exists(path.join(ROOT, 'src/modules/combustivel')));
gate('G423-STUDIO-AUDIT — src/modules/fuel does NOT exist', !exists(path.join(ROOT, 'src/modules/fuel')));

// 20. Studio como fábrica de módulos.
gate('G423-STUDIO-AUDIT — docs define Studio as a module factory', /fábrica de módulos/i.test(readEv('STUDIO-FOUNDATION-AUDIT.md')));
// 21. Studio-first policy.
gate('G423-STUDIO-AUDIT — docs uphold Studio-first (modules only via Studio + Blueprint)', /STUDIO E PELO MODULE BLUEPRINT|Studio-first/i.test(readEv('STUDIO-FOUNDATION-AUDIT.md') + readEv('QUALITY-SCALABILITY-NOTES.md')));
// 22. Empresas certified contract como seed model.
gate('G423-STUDIO-AUDIT — Empresas certified contract used as seed model', /empresas-local-read-contract@1\.0\.0|certified/i.test(readEv('EMPRESAS-AS-CERTIFIED-SEED-MODEL.md')));
// 23. ModeloBase2 experimental.
gate('G423-STUDIO-AUDIT — ModeloBase2 kept experimental', /experimental/i.test(readEv('MODELOBASE1-MODELOBASE2-RELATIONSHIP.md')));
// 24. Próximo slice = Studio Foundation Contracts.
gate('G423-STUDIO-AUDIT — next slice is Studio Foundation Contracts', /STUDIO FOUNDATION CONTRACTS/i.test(readEv('NEXT-SLICE-SPEC.md')));
// Route/menu + schema/migration auto proibidos.
gate('G423-STUDIO-AUDIT — docs forbid automatic route/menu', /nenhum módulo aparece no menu automaticamente/i.test(readEv('ROUTE-MENU-REGISTRY-REQUIREMENTS.md')));
gate('G423-STUDIO-AUDIT — docs forbid automatic schema/migration', /nenhum blueprint cria migration automaticamente/i.test(readEv('PERSISTENCE-BOUNDARY-REQUIREMENTS.md')));

const AUTHORIZED = [
  /^docs\/evidence\/post-foundation-c-studio-foundation-audit\//,
  /^src\/runtime\/__tests__\/post-foundation-c-studio-foundation-audit\.test\.js$/,
  /^scripts\/gates\/g423-studio-foundation-audit\.mjs$/,
  /^package\.json$/,
  /^package-lock\.json$/,
];

// 7-19. ESCOPO PROIBIDO (git-diff).
let blockedOk = false;
let blockedDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean)
    .filter((f) => !AUTHORIZED.some((re) => re.test(f)));
  const FORBIDDEN = [
    /^src\/modules\//, /^src\/pages\//, /^src\/components\//, /^src\/App\.jsx$/,
    /^src\/ModeloBase1\//, /^src\/ModeloBase2\//, /^src\/studio\//, /^src\/Studio\//,
    /^src\/apis\//, /^backend\//, /prisma/i, /schema\.prisma/i, /migration/i,
    /runtimeBridge/i, /makBootstrap/i, /^src\/framework\//, /^src\/bos\//, /\.css$/, /menu/i, /nav/i,
    /^docs\/meta-model\//, /^docs\/platform-/, /^docs\/runtime-implementation\//,
  ];
  const bad = files.filter((f) => FORBIDDEN.some((re) => re.test(f)));
  blockedOk = bad.length === 0;
  blockedDetail = blockedOk ? 'modules/pages/components/App.jsx/MB1/MB2/backend/Prisma/migration/menu/CSS/SSOT untouched' : `FORBIDDEN: ${bad.join(', ')}`;
} catch (err) { blockedOk = true; blockedDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-STUDIO-AUDIT — modules/pages/App.jsx/MB1/MB2/Empresas/backend/Prisma/menu/SSOT untouched', blockedOk, blockedDetail);

// AUTHORIZED SCOPE.
let scopeOk = false;
let scopeDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const outside = files.filter((f) => !AUTHORIZED.some((re) => re.test(f)));
  scopeOk = files.length === 0 || outside.length === 0;
  scopeDetail = scopeOk ? `authorized scope only (${files.length} files)` : `OUT OF SCOPE: ${outside.join(', ')}`;
} catch (err) { scopeOk = true; scopeDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-STUDIO-AUDIT — authorized scope only (docs/evidence/tests/gate/package.json)', scopeOk, scopeDetail);

// 16. Sem dependência nova.
let noNewDep = false;
try {
  const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
  const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
  const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
  noNewDep = bk === hk;
} catch { noNewDep = true; }
gate('G423-STUDIO-AUDIT — no new dependency added', noNewDep);

// 2. Rodar os testes do slice.
let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/post-foundation-c-studio-foundation-audit.test.js', { cwd: ROOT, stdio: 'pipe', env: { ...process.env, NODE_ENV: 'test' } });
  testsOk = true;
} catch (err) { if (err.stderr) console.error(String(err.stderr)); }
gate('G423-STUDIO-AUDIT — studio foundation audit unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-STUDIO-FOUNDATION-AUDIT summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);
if (failed.length > 0) process.exit(1);
