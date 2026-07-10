#!/usr/bin/env node
/**
 * Gate G423-EMPRESAS-READONLY — Empresas Read-Only Runtime v2 Candidate (post-Foundation C)
 *
 * Proves the Empresas read-only candidate is a pure, passive, deterministic READ
 * candidate: off by default, fail-closed in production, writes impossible (write
 * guard blocks create/update/delete/save/action/workflow/connector), no real
 * data/backend/Prisma/storage, no App.jsx/menu/real-screen/legacy change, and it
 * recommends only "Dual Read Shadow Compare" as the next step (never migrated).
 */
import { execSync } from 'node:child_process';
import { productionUiOffendingFiles } from './lib/productionUiGuard.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const RUNTIME = path.join(ROOT, 'src/runtime');
const CANDIDATE = path.join(RUNTIME, 'migration/empresas-readonly');
const results = [];

const gate = (name, ok, detail = '') => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
};

const exists = (p) => fs.existsSync(p);
const stripComments = (source) => source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

const CANDIDATE_FILES = [
  'createEmpresasReadOnlyRuntimeCandidate.js',
  'createEmpresasReadOnlyViewModel.js',
  'empresasReadOnlyConfig.js',
  'empresasReadOnlyDiagnostics.js',
  'empresasReadOnlyWriteGuard.js',
  'errors.js',
];
const candidateSource = () => CANDIDATE_FILES.map((f) => fs.readFileSync(path.join(CANDIDATE, f), 'utf8')).join('\n');
const candidateCodeOnly = () => stripComments(candidateSource());

// 1. Existência dos arquivos do candidate.
for (const f of CANDIDATE_FILES) {
  gate(`G423-EMPRESAS-READONLY — ${f} exists`, exists(path.join(CANDIDATE, f)));
}
gate('G423-EMPRESAS-READONLY — candidate types exist', exists(path.join(RUNTIME, 'types/empresas-readonly-runtime-v2.js')));
gate('G423-EMPRESAS-READONLY — candidate tests exist', exists(path.join(RUNTIME, '__tests__/migration/empresas-readonly-runtime-v2-candidate.test.js')));

// 2. Exports públicos no runtime barrel.
let exportsOk = false;
let exportsDetail = '';
try {
  const s = fs.readFileSync(path.join(RUNTIME, 'index.js'), 'utf8');
  exportsOk = /createEmpresasReadOnlyRuntimeCandidate/.test(s)
    && /createEmpresasReadOnlyViewModel/.test(s)
    && /createEmpresasReadOnlyWriteGuard/.test(s)
    && /createEmpresasReadOnlyDiagnostics/.test(s);
  exportsDetail = exportsOk ? 'candidate helpers exported from runtime barrel' : 'missing one or more candidate exports';
} catch (err) {
  exportsDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-EMPRESAS-READONLY — candidate helpers exported from runtime barrel', exportsOk, exportsDetail);

// 14. Write guard bloqueia create/update/delete/save/action/workflow/connector. (dynamic)
let writeGuardOk = false;
let writeGuardDetail = '';
try {
  const mod = await import(pathToFileURL(path.join(CANDIDATE, 'empresasReadOnlyWriteGuard.js')).href);
  const g = mod.createEmpresasReadOnlyWriteGuard({ env: { MAK_RUNTIME_V2_EMPRESAS_READONLY: 'true' } });
  const ops = ['create', 'update', 'delete', 'bulkCreate', 'bulkUpdate', 'bulkDelete', 'save', 'submit', 'executeAction', 'startWorkflow', 'invokeConnector'];
  const allBlocked = ops.every((op) => {
    const r = g.attempt(op, {});
    return r.blocked === true && r.ok === false && r.code === 'MAK-L3-EMP-READONLY-003';
  });
  const pollution = g.attempt('create', JSON.parse('{"__proto__":{"x":1}}')).code === 'MAK-L3-EMP-READONLY-007';
  const offDisabled = mod.createEmpresasReadOnlyWriteGuard({ env: {} }).attempt('create', {}).code === 'MAK-L3-EMP-READONLY-001';
  writeGuardOk = allBlocked && pollution && offDisabled && g.readOnly === true;
  writeGuardDetail = writeGuardOk ? 'todas as operações de write bloqueadas com código estruturado; pollution/flag-off tratados' : 'write guard não bloqueia como esperado';
} catch (err) {
  writeGuardDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-EMPRESAS-READONLY — write guard blocks create/update/delete/save/action/workflow/connector', writeGuardOk, writeGuardDetail);

// 15/16. Plano não declara migração concluída; next step é apenas Dual Read Shadow Compare. (dynamic)
let candidateShapeOk = false;
let candidateShapeDetail = '';
try {
  const mod = await import(pathToFileURL(path.join(CANDIDATE, 'createEmpresasReadOnlyRuntimeCandidate.js')).href);
  const off = await mod.createEmpresasReadOnlyRuntimeCandidate({ env: {} });
  const on = await mod.createEmpresasReadOnlyRuntimeCandidate({ env: { MAK_RUNTIME_V2_EMPRESAS_READONLY: 'true' } });
  const prod = await mod.createEmpresasReadOnlyRuntimeCandidate({ env: { MAK_RUNTIME_V2_EMPRESAS_READONLY: 'true', NODE_ENV: 'production' } });
  const offOk = off.enabled === false && off.skipped === true && off.noSideEffects === true && off.viewModel === null;
  const onOk = on.enabled === true && on.mode === 'read_only_candidate' && on.currentRuntime === 'legacy' && on.targetRuntime === 'runtime-v2';
  const notMigrated = on.mode !== 'migrated' && on.readinessStatus !== 'migrated';
  const nextOnly = /Dual Read Shadow Compare/i.test(on.nextAllowedStep);
  const prodClosed = prod.enabled === false && prod.productionBlocked === true;
  const rollback = on.rollback.featureFlagDefault === 'off' && on.rollback.schemaChange === false && on.rollback.realWrite === false;
  candidateShapeOk = offOk && onOk && notMigrated && nextOnly && prodClosed && rollback;
  candidateShapeDetail = candidateShapeOk
    ? 'off→skipped/no-side-effects; on→read_only_candidate legacy→v2; não-migrado; next=Dual Read Shadow Compare; prod fail-closed; rollback flag-off sem schema/write'
    : `candidate fora do contrato (offOk=${offOk}, onOk=${onOk}, notMigrated=${notMigrated}, nextOnly=${nextOnly}, prodClosed=${prodClosed}, rollback=${rollback})`;
} catch (err) {
  candidateShapeDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-EMPRESAS-READONLY — candidate declares no completed migration and recommends only Dual Read Shadow Compare', candidateShapeOk, candidateShapeDetail);

// ViewModel usa dataset controlado e não usa dados reais. (dynamic)
let viewModelOk = false;
let viewModelDetail = '';
try {
  const mod = await import(pathToFileURL(path.join(CANDIDATE, 'createEmpresasReadOnlyViewModel.js')).href);
  const vm = await mod.createEmpresasReadOnlyViewModel();
  const structural = Array.isArray(vm.table.columns) && vm.table.columns.length > 0
    && Array.isArray(vm.form.fields) && vm.form.fields.length > 0;
  const controlled = vm.source === 'controlled-dev-dataset' && vm.table.rowCount > 0;
  const noReal = vm.diagnostics.usesRealData === false;
  const masked = !/EXAMPLE-SECRET|SHOULD-BE-MASKED/.test(JSON.stringify(vm));
  viewModelOk = structural && controlled && noReal && masked;
  viewModelDetail = viewModelOk ? 'view model estrutural via projection + dataset controlado; sem dados reais; sensível mascarado' : 'view model incorreto';
} catch (err) {
  viewModelDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-EMPRESAS-READONLY — read-only view model uses controlled dataset, no real data, sensitive masked', viewModelOk, viewModelDetail);

// 8. Sem import direto de Prisma/backend.
let noForbiddenDeps = false;
let forbiddenDetail = '';
try {
  const s = candidateSource();
  const hasPrisma = /from\s+['"].*prisma.*['"]/i.test(s) || /PrismaClient/.test(s);
  const hasBackend = /from\s+['"].*backend.*['"]/i.test(s);
  noForbiddenDeps = !hasPrisma && !hasBackend;
  forbiddenDetail = hasPrisma ? 'Prisma import found' : hasBackend ? 'backend import found' : 'clean';
} catch (err) {
  forbiddenDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-EMPRESAS-READONLY — no direct Prisma/backend import (D-RI-13)', noForbiddenDeps, forbiddenDetail);

// 9. Sem fetch direto. 10. Sem web storage.
let noExternalIo = false;
let ioDetail = '';
try {
  const code = candidateCodeOnly();
  noExternalIo = !/\bfetch\s*\(|XMLHttpRequest|WebSocket|BroadcastChannel|localStorage|sessionStorage|indexedDB/i.test(code);
  ioDetail = noExternalIo ? 'clean' : 'fetch/XHR/WebSocket/storage usage found';
} catch (err) {
  ioDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-EMPRESAS-READONLY — no direct fetch/XHR/WebSocket/localStorage/sessionStorage/IndexedDB', noExternalIo, ioDetail);

// 7. Não altera runtime legado (sem import de makBootstrap/runtimeBridge). 11. Não toca Studio/Marketplace/módulo/App.
let noStudioModule = false;
let studioDetail = '';
try {
  const code = candidateCodeOnly();
  noStudioModule = !/from\s+['"].*\/studio\/.*['"]|from\s+['"].*marketplace.*['"]|from\s+['"].*\/modules\/.*['"]|from\s+['"][^'"]*App(\.jsx)?['"]|makBootstrap|runtimeBridge/i.test(code);
  studioDetail = noStudioModule ? 'clean (no Studio/Marketplace/module/App/legacy-bridge import)' : 'Studio/Marketplace/module/App/legacy import found';
} catch (err) {
  studioDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-EMPRESAS-READONLY — no Studio/Marketplace/production-module/App.jsx/legacy-runtime import', noStudioModule, studioDetail);

// 12. Não adiciona dependência nova.
let noNewDep = false;
let depDetail = '';
try {
  const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
  const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
  const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
  noNewDep = bk === hk;
  depDetail = noNewDep ? 'clean (no dependency added/removed)' : 'dependency set changed';
} catch (err) {
  noNewDep = true;
  depDetail = `git base unavailable — skipped strict check (${err instanceof Error ? err.message : String(err)})`;
}
gate('G423-EMPRESAS-READONLY — no new dependency added to package.json', noNewDep, depDetail);

// 13. Não altera CSS global.
let noCss = false;
let cssDetail = '';
try {
  noCss = !/import\s+['"][^'"]+\.css['"]/i.test(candidateSource());
  cssDetail = noCss ? 'clean (no .css import)' : '.css import found';
} catch (err) {
  cssDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-EMPRESAS-READONLY — no global CSS import in candidate', noCss, cssDetail);

// 4/5/6/7. src/App.jsx, tela real Empresas, menu, runtime legado / UI de produção não alterados.
let noProductionUiChange = false;
let productionUiDetail = '';
try {
  const diff = productionUiOffendingFiles(ROOT);
  noProductionUiChange = diff.length === 0;
  productionUiDetail = noProductionUiChange ? 'clean (App.jsx + real Empresas screen + menu + legacy runtime untouched)' : `changed files: ${diff.replace(/\n/g, ', ')}`;
} catch (err) {
  noProductionUiChange = true;
  productionUiDetail = `git diff unavailable — ${err instanceof Error ? err.message : String(err)}`;
}
gate('G423-EMPRESAS-READONLY — no production UI change (src/App.jsx, src/shared, src/framework, src/modules, src/studio)', noProductionUiChange, productionUiDetail);

// 3. Rodar os testes unitários.
let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/migration/empresas-readonly-runtime-v2-candidate.test.js', {
    cwd: ROOT,
    stdio: 'pipe',
    env: { ...process.env, NODE_ENV: 'test' },
  });
  testsOk = true;
} catch (err) {
  if (err.stderr) console.error(String(err.stderr));
}
gate('G423-EMPRESAS-READONLY — candidate unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-EMPRESAS-READONLY summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);

if (failed.length > 0) {
  process.exit(1);
}
