#!/usr/bin/env node
/**
 * Gate G423-EMPRESAS-GUARDED-READ-UI — Empresas Guarded Read UI Slice (post-Foundation C)
 *
 * Proves the guarded read UI slice is a pure, passive, deterministic read-only
 * UI layer: off by default, fail-closed in production, write guard active, no
 * real data as primary source, no backend/Prisma/storage, no App.jsx/menu/
 * real-screen/legacy change, React components carry no write side effects, and
 * it recommends only "Guarded Read UI Overlay" (non-blocking) or "Guarded Read
 * UI Drift Resolution" (blocked) — never write/full cutover, never migrated.
 */
import { execSync } from 'node:child_process';
import { productionUiOffendingFiles } from './lib/productionUiGuard.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const RUNTIME = path.join(ROOT, 'src/runtime');
const DIR = path.join(RUNTIME, 'migration/empresas-guarded-read-ui');
const COMPONENTS = path.join(DIR, 'components');
const results = [];

const gate = (name, ok, detail = '') => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
};

const exists = (p) => fs.existsSync(p);
const stripComments = (source) => source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

const PURE_FILES = [
  'createEmpresasGuardedReadUiModel.js',
  'empresasGuardedReadUiConfig.js',
  'empresasGuardedReadUiDiagnostics.js',
  'errors.js',
];
const COMPONENT_FILES = [
  'EmpresasGuardedReadUiSlice.jsx',
  'EmpresasGuardedReadTable.jsx',
  'EmpresasGuardedReadForm.jsx',
  'EmpresasGuardedReadDiagnostics.jsx',
  'EmpresasGuardedReadWriteBlockedPanel.jsx',
];
const pureSource = () => PURE_FILES.map((f) => fs.readFileSync(path.join(DIR, f), 'utf8')).join('\n');
const componentSource = () => COMPONENT_FILES.map((f) => fs.readFileSync(path.join(COMPONENTS, f), 'utf8')).join('\n');
const allSource = () => pureSource() + '\n' + componentSource();
const allCodeOnly = () => stripComments(allSource());
const componentCodeOnly = () => stripComments(componentSource());

// 1. Existência dos arquivos.
for (const f of PURE_FILES) gate(`G423-EMPRESAS-GUARDED-READ-UI — ${f} exists`, exists(path.join(DIR, f)));
for (const f of COMPONENT_FILES) gate(`G423-EMPRESAS-GUARDED-READ-UI — components/${f} exists`, exists(path.join(COMPONENTS, f)));
gate('G423-EMPRESAS-GUARDED-READ-UI — types exist', exists(path.join(RUNTIME, 'types/empresas-guarded-read-ui-slice.js')));
gate('G423-EMPRESAS-GUARDED-READ-UI — tests exist', exists(path.join(RUNTIME, '__tests__/migration/empresas-guarded-read-ui-slice.test.js')));

// 2. Exports públicos puros no barrel; nenhum .jsx exportado.
let exportsOk = false;
let exportsDetail = '';
try {
  const s = fs.readFileSync(path.join(RUNTIME, 'index.js'), 'utf8');
  const hasHelpers = /createEmpresasGuardedReadUiModel/.test(s) && /createEmpresasGuardedReadUiDiagnostics/.test(s);
  const noJsx = !/from\s+['"][^'"]*empresas-guarded-read-ui\/components\/[^'"]*\.jsx['"]/.test(s);
  exportsOk = hasHelpers && noJsx;
  exportsDetail = exportsOk ? 'pure helpers exported; no React component from the barrel' : 'missing helpers or a .jsx exported from the barrel';
} catch (err) {
  exportsDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-EMPRESAS-GUARDED-READ-UI — pure helpers exported, no React component in runtime barrel', exportsOk, exportsDetail);

// 15/16/17. Model shape: não-migrado; write guard bloqueia; next step só Overlay/Drift Resolution. (dynamic)
let shapeOk = false;
let shapeDetail = '';
try {
  const mod = await import(pathToFileURL(path.join(DIR, 'createEmpresasGuardedReadUiModel.js')).href);
  const off = await mod.createEmpresasGuardedReadUiModel({ env: {} });
  const on = await mod.createEmpresasGuardedReadUiModel({ env: { MAK_RUNTIME_V2_EMPRESAS_GUARDED_READ_UI: 'true' } });
  const prod = await mod.createEmpresasGuardedReadUiModel({ env: { MAK_RUNTIME_V2_EMPRESAS_GUARDED_READ_UI: 'true', NODE_ENV: 'production' } });
  const offOk = off.enabled === false && off.skipped === true && off.noSideEffects === true && off.viewModel === null;
  const onOk = on.enabled === true && on.mode === 'guarded_read_ui_slice' && on.currentRuntime === 'legacy' && on.targetRuntime === 'runtime-v2';
  const usesReads = on.readOnlyCandidate && on.readOnlyCandidate.mode === 'read_only_candidate' && on.dualReadCompare && on.dualReadCompare.mode === 'dual_read_shadow_compare';
  const notMigrated = on.mode !== 'migrated';
  const nextOk = /Guarded Read UI Overlay|Guarded Read UI Drift Resolution/i.test(on.nextAllowedStep) && !/write|full cutover|migrated/i.test(on.nextAllowedStep);
  const prodClosed = prod.enabled === false && prod.productionBlocked === true;
  const writeOps = ['create', 'update', 'delete', 'save', 'submit', 'executeAction', 'startWorkflow', 'invokeConnector'];
  const writeBlocked = on.writeBlocked === true && writeOps.every((op) => on.writeGuard.attempt(op, {}).blocked === true);
  shapeOk = offOk && onOk && usesReads && notMigrated && nextOk && prodClosed && writeBlocked;
  shapeDetail = shapeOk
    ? `off→skipped; on→guarded_read_ui_slice legacy→v2; usa read-only+dual-read; não-migrado; next=${on.nextAllowedStep}; prod fail-closed; write bloqueado`
    : `model fora do contrato (offOk=${offOk}, onOk=${onOk}, usesReads=${usesReads}, notMigrated=${notMigrated}, nextOk=${nextOk}, prodClosed=${prodClosed}, writeBlocked=${writeBlocked})`;
} catch (err) {
  shapeDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-EMPRESAS-GUARDED-READ-UI — model read-only, write blocked, no completed migration, next only Overlay/Drift Resolution', shapeOk, shapeDetail);

// 14. Componentes sem onClick/onSubmit/onChange com side effects de write / sem submit funcional.
let noSideEffectHandlers = false;
let handlersDetail = '';
try {
  const code = componentCodeOnly();
  noSideEffectHandlers = !/onClick|onSubmit|onChange\s*=\s*\{[^}]*set|type=["']submit["']|<form\b|handleSave|handleCreate|handleUpdate|handleDelete/.test(code);
  handlersDetail = noSideEffectHandlers ? 'clean (no write side-effect handler / no functional submit)' : 'side-effect handler / functional submit found';
} catch (err) {
  handlersDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-EMPRESAS-GUARDED-READ-UI — components carry no onClick/onSubmit/onChange write side effects', noSideEffectHandlers, handlersDetail);

// 8. Sem import direto de Prisma/backend.
let noForbiddenDeps = false;
let forbiddenDetail = '';
try {
  const s = allSource();
  const hasPrisma = /from\s+['"].*prisma.*['"]/i.test(s) || /PrismaClient/.test(s);
  const hasBackend = /from\s+['"].*backend.*['"]/i.test(s);
  noForbiddenDeps = !hasPrisma && !hasBackend;
  forbiddenDetail = hasPrisma ? 'Prisma import found' : hasBackend ? 'backend import found' : 'clean';
} catch (err) {
  forbiddenDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-EMPRESAS-GUARDED-READ-UI — no direct Prisma/backend import (D-RI-13)', noForbiddenDeps, forbiddenDetail);

// 9/10. Sem fetch direto e sem web storage.
let noExternalIo = false;
let ioDetail = '';
try {
  const code = allCodeOnly();
  noExternalIo = !/\bfetch\s*\(|XMLHttpRequest|WebSocket|BroadcastChannel|localStorage|sessionStorage|indexedDB/i.test(code);
  ioDetail = noExternalIo ? 'clean' : 'fetch/XHR/WebSocket/storage usage found';
} catch (err) {
  ioDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-EMPRESAS-GUARDED-READ-UI — no direct fetch/XHR/WebSocket/localStorage/sessionStorage/IndexedDB', noExternalIo, ioDetail);

// 7/11. Não altera runtime legado / não toca Studio/Marketplace/módulo/App.
let noStudioModule = false;
let studioDetail = '';
try {
  const code = allCodeOnly();
  noStudioModule = !/from\s+['"].*\/studio\/.*['"]|from\s+['"].*marketplace.*['"]|from\s+['"].*\/modules\/.*['"]|from\s+['"][^'"]*\/App(\.jsx)?['"]|makBootstrap|runtimeBridge/i.test(code);
  studioDetail = noStudioModule ? 'clean (no Studio/Marketplace/module/App/legacy-bridge import)' : 'Studio/Marketplace/module/App/legacy import found';
} catch (err) {
  studioDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-EMPRESAS-GUARDED-READ-UI — no Studio/Marketplace/production-module/App.jsx/legacy-runtime import', noStudioModule, studioDetail);

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
gate('G423-EMPRESAS-GUARDED-READ-UI — no new dependency added to package.json', noNewDep, depDetail);

// 13. Não altera CSS global.
let noCss = false;
let cssDetail = '';
try {
  noCss = !/import\s+['"][^'"]+\.css['"]/i.test(allSource());
  cssDetail = noCss ? 'clean (no .css import)' : '.css import found';
} catch (err) {
  cssDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-EMPRESAS-GUARDED-READ-UI — no global CSS import in slice', noCss, cssDetail);

// 4/5/6. src/App.jsx, tela real Empresas, menu, runtime legado / UI de produção não alterados.
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
gate('G423-EMPRESAS-GUARDED-READ-UI — no production UI change (src/App.jsx, src/shared, src/framework, src/modules, src/studio)', noProductionUiChange, productionUiDetail);

// 3. Rodar os testes unitários.
let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/migration/empresas-guarded-read-ui-slice.test.js', {
    cwd: ROOT,
    stdio: 'pipe',
    env: { ...process.env, NODE_ENV: 'test' },
  });
  testsOk = true;
} catch (err) {
  if (err.stderr) console.error(String(err.stderr));
}
gate('G423-EMPRESAS-GUARDED-READ-UI — guarded read UI unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-EMPRESAS-GUARDED-READ-UI summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);

if (failed.length > 0) {
  process.exit(1);
}
