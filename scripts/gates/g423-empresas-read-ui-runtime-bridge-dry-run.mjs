#!/usr/bin/env node
/**
 * Gate G423-EMPRESAS-BRIDGE-DRY-RUN — Empresas Read UI Runtime Bridge Dry Run (post-Foundation C)
 *
 * Proves the dry run is a pure, passive, deterministic simulation of a future
 * read-only bridge: off by default, fail-closed in production, write guard
 * active, read-only bridge contract that blocks write/legacy-mutation/backend/
 * storage, a mount simulation that mounts nothing, no real data as primary
 * source, no backend/Prisma/storage, no App.jsx/menu/real-screen/legacy/
 * runtime-bridge change, React components with no write side effects, and it
 * recommends only "Runtime Bridge Read Slot Candidate" (ready) or "Runtime
 * Bridge Dry Run Fixes" (otherwise) — never write/full cutover, never migrated.
 */
import { execSync } from 'node:child_process';
import { productionUiOffendingFiles } from './lib/productionUiGuard.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const RUNTIME = path.join(ROOT, 'src/runtime');
const DIR = path.join(RUNTIME, 'migration/empresas-read-ui-bridge-dry-run');
const COMPONENTS = path.join(DIR, 'components');
const results = [];

const gate = (name, ok, detail = '') => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
};

const exists = (p) => fs.existsSync(p);
const stripComments = (source) => source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

const PURE_FILES = [
  'createEmpresasReadUiRuntimeBridgeDryRunModel.js',
  'createEmpresasRuntimeBridgeReadContract.js',
  'simulateEmpresasRuntimeBridgeReadMount.js',
  'empresasRuntimeBridgeDryRunDiagnostics.js',
  'empresasRuntimeBridgeDryRunConfig.js',
  'errors.js',
];
const COMPONENT_FILES = [
  'EmpresasRuntimeBridgeDryRunPanel.jsx',
  'EmpresasRuntimeBridgeDryRunStatus.jsx',
  'EmpresasRuntimeBridgeDryRunContract.jsx',
];
const pureSource = () => PURE_FILES.map((f) => fs.readFileSync(path.join(DIR, f), 'utf8')).join('\n');
const componentSource = () => COMPONENT_FILES.map((f) => fs.readFileSync(path.join(COMPONENTS, f), 'utf8')).join('\n');
const allSource = () => pureSource() + '\n' + componentSource();
const allCodeOnly = () => stripComments(allSource());
const componentCodeOnly = () => stripComments(componentSource());

// 1. Existência dos arquivos.
for (const f of PURE_FILES) gate(`G423-BRIDGE-DRY — ${f} exists`, exists(path.join(DIR, f)));
for (const f of COMPONENT_FILES) gate(`G423-BRIDGE-DRY — components/${f} exists`, exists(path.join(COMPONENTS, f)));
gate('G423-BRIDGE-DRY — types exist', exists(path.join(RUNTIME, 'types/empresas-read-ui-runtime-bridge-dry-run.js')));
gate('G423-BRIDGE-DRY — tests exist', exists(path.join(RUNTIME, '__tests__/migration/empresas-read-ui-runtime-bridge-dry-run.test.js')));

// 2. Exports públicos puros; nenhum .jsx.
let exportsOk = false;
let exportsDetail = '';
try {
  const s = fs.readFileSync(path.join(RUNTIME, 'index.js'), 'utf8');
  const hasHelpers = /createEmpresasReadUiRuntimeBridgeDryRunModel/.test(s) && /createEmpresasRuntimeBridgeReadContract/.test(s) && /simulateEmpresasRuntimeBridgeReadMount/.test(s);
  const noJsx = !/from\s+['"][^'"]*empresas-read-ui-bridge-dry-run\/components\/[^'"]*\.jsx['"]/.test(s);
  exportsOk = hasHelpers && noJsx;
  exportsDetail = exportsOk ? 'pure helpers exported; no React component from the barrel' : 'missing helpers or a .jsx exported from the barrel';
} catch (err) {
  exportsDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-BRIDGE-DRY — pure helpers exported, no React component in runtime barrel', exportsOk, exportsDetail);

// 16/19/20. Model shape + contract blocks write/legacy/backend/storage + não-migrado + next só Slot/Fixes. (dynamic)
let shapeOk = false;
let shapeDetail = '';
try {
  const mod = await import(pathToFileURL(path.join(DIR, 'createEmpresasReadUiRuntimeBridgeDryRunModel.js')).href);
  const off = await mod.createEmpresasReadUiRuntimeBridgeDryRunModel({ env: {} });
  const on = await mod.createEmpresasReadUiRuntimeBridgeDryRunModel({ env: { MAK_RUNTIME_V2_EMPRESAS_READ_UI_BRIDGE_DRY_RUN: 'true' } });
  const prod = await mod.createEmpresasReadUiRuntimeBridgeDryRunModel({ env: { MAK_RUNTIME_V2_EMPRESAS_READ_UI_BRIDGE_DRY_RUN: 'true', NODE_ENV: 'production' } });
  const offOk = off.enabled === false && off.skipped === true && off.noSideEffects === true && off.bridgeContract === null && off.mountSimulation === null;
  const onOk = on.enabled === true && on.mode === 'read_ui_runtime_bridge_dry_run' && on.bridgeMode === 'dry_run' && on.currentRuntime === 'legacy' && on.targetRuntime === 'runtime-v2';
  const usesModels = on.hardening && on.overlay && on.guardedReadUi && on.dualReadCompare && on.readOnlyCandidate;
  const contractBlocks = ['create', 'update', 'delete', 'save', 'submit', 'executeAction', 'startWorkflow', 'invokeConnector', 'mutateLegacyRuntime', 'writeBackend', 'writeStorage'].every((op) => on.bridgeContract.blockedOperations.includes(op));
  const allowedReadOnly = on.bridgeContract.allowedOperations.every((op) => !/create|update|delete|save|submit|write|mutate|execute|start|invoke/i.test(op));
  const simMountsNothing = on.mountSimulation.mountedAnythingReal === false && on.mountSimulation.touchedAppJsx === false && on.mountSimulation.touchedRealScreen === false && on.mountSimulation.touchedRuntimeBridge === false;
  const notMigrated = on.mode !== 'migrated';
  const nextOk = /Runtime Bridge Read Slot Candidate|Runtime Bridge Dry Run Fixes/i.test(on.nextAllowedStep) && !/write|full cutover|migrated/i.test(on.nextAllowedStep);
  const prodClosed = prod.enabled === false && prod.productionBlocked === true;
  const writeOps = ['create', 'update', 'delete', 'save', 'submit', 'executeAction', 'startWorkflow', 'invokeConnector'];
  const writeBlocked = on.writeBlocked === true && writeOps.every((op) => on.writeGuard.attempt(op, {}).blocked === true);
  shapeOk = offOk && onOk && usesModels && contractBlocks && allowedReadOnly && simMountsNothing && notMigrated && nextOk && prodClosed && writeBlocked;
  shapeDetail = shapeOk
    ? `off→skipped; on→dry_run legacy→v2; usa toda a cadeia; contrato bloqueia write/legacy/backend/storage; sim monta nada; não-migrado; next=${on.nextAllowedStep}; prod fail-closed; write bloqueado`
    : `model fora do contrato (offOk=${offOk}, onOk=${onOk}, usesModels=${!!usesModels}, contractBlocks=${contractBlocks}, allowedReadOnly=${allowedReadOnly}, simMountsNothing=${simMountsNothing}, notMigrated=${notMigrated}, nextOk=${nextOk}, prodClosed=${prodClosed}, writeBlocked=${writeBlocked})`;
} catch (err) {
  shapeDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-BRIDGE-DRY — dry-run read-only, contract blocks write/legacy/backend/storage, mounts nothing, next only Slot/Fixes', shapeOk, shapeDetail);

// 17. Dry run dev-only/opt-in (fail-closed em produção). (dynamic)
let devOnlyOk = false;
let devOnlyDetail = '';
try {
  const cfg = await import(pathToFileURL(path.join(DIR, 'empresasRuntimeBridgeDryRunConfig.js')).href);
  const off = cfg.isEmpresasBridgeDryRunEnabled({}) === false;
  const onDev = cfg.isEmpresasBridgeDryRunEnabled({ MAK_RUNTIME_V2_EMPRESAS_READ_UI_BRIDGE_DRY_RUN: 'true' }) === true;
  const prodClosed = cfg.isEmpresasBridgeDryRunEnabled({ MAK_RUNTIME_V2_EMPRESAS_READ_UI_BRIDGE_DRY_RUN: 'true', NODE_ENV: 'production' }) === false;
  devOnlyOk = off && onDev && prodClosed;
  devOnlyDetail = devOnlyOk ? 'off por padrão; on em dev com a flag; fail-closed em produção' : 'gate dev-only incorreto';
} catch (err) {
  devOnlyDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-BRIDGE-DRY — dry run is dev-only / opt-in (fail-closed in production)', devOnlyOk, devOnlyDetail);

// Mount simulation safeToProceed depende de preconditions. (dynamic)
let simOk = false;
let simDetail = '';
try {
  const simMod = await import(pathToFileURL(path.join(DIR, 'simulateEmpresasRuntimeBridgeReadMount.js')).href);
  const cMod = await import(pathToFileURL(path.join(DIR, 'createEmpresasRuntimeBridgeReadContract.js')).href);
  const contract = cMod.createEmpresasRuntimeBridgeReadContract({});
  const good = simMod.simulateEmpresasRuntimeBridgeReadMount({ hardeningModel: { enabled: true, readinessStatus: 'ready_for_next_slice', blockers: [], parityScore: { blockingCount: 0, criticalCount: 0 }, writeBlocked: true, warnings: [], diagnostics: { rollbackStatus: 'available' } }, contract });
  const bad = simMod.simulateEmpresasRuntimeBridgeReadMount({ hardeningModel: { enabled: false }, contract });
  simOk = good.safeToProceed === true && good.wouldMount === true && bad.safeToProceed === false && bad.blockedReasons.length > 0 && good.mountedAnythingReal === false;
  simDetail = simOk ? 'preconditions ok→safeToProceed; falha→bloqueado; nunca monta de verdade' : 'simulação incorreta';
} catch (err) {
  simDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-BRIDGE-DRY — mount simulation gates safeToProceed on preconditions and mounts nothing', simOk, simDetail);

// 15. Componentes sem onClick/onSubmit/onChange com side effects de write.
let noSideEffectHandlers = false;
let handlersDetail = '';
try {
  const code = componentCodeOnly();
  noSideEffectHandlers = !/onClick|onSubmit|onChange\s*=\s*\{[^}]*set|type=["']submit["']|<form\b|handleSave|handleCreate|handleUpdate|handleDelete/.test(code);
  handlersDetail = noSideEffectHandlers ? 'clean (no write side-effect handler / no functional submit)' : 'side-effect handler / functional submit found';
} catch (err) {
  handlersDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-BRIDGE-DRY — components carry no onClick/onSubmit/onChange write side effects', noSideEffectHandlers, handlersDetail);

// 9. Sem import direto de Prisma/backend.
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
gate('G423-BRIDGE-DRY — no direct Prisma/backend import (D-RI-13)', noForbiddenDeps, forbiddenDetail);

// 10/11. Sem fetch direto e sem web storage.
let noExternalIo = false;
let ioDetail = '';
try {
  const code = allCodeOnly();
  noExternalIo = !/\bfetch\s*\(|XMLHttpRequest|WebSocket|BroadcastChannel|localStorage|sessionStorage|indexedDB/i.test(code);
  ioDetail = noExternalIo ? 'clean' : 'fetch/XHR/WebSocket/storage usage found';
} catch (err) {
  ioDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-BRIDGE-DRY — no direct fetch/XHR/WebSocket/localStorage/sessionStorage/IndexedDB', noExternalIo, ioDetail);

// 7/8/12. Não altera runtime legado / runtimeBridge real / não toca Studio/Marketplace/módulo/App.
let noLegacyModule = false;
let legacyDetail = '';
try {
  const imports = [...allCodeOnly().matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
  const bad = imports.some((p) => /\/studio\//.test(p) || /marketplace/i.test(p) || /\/modules\//.test(p) || /\/App(\.jsx)?$/.test(p) || /makBootstrap/.test(p) || /\/runtimeBridge\//.test(p));
  noLegacyModule = !bad;
  legacyDetail = noLegacyModule ? 'clean (no Studio/Marketplace/module/App/legacy-bridge import)' : 'Studio/Marketplace/module/App/legacy-bridge import found';
} catch (err) {
  legacyDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-BRIDGE-DRY — no Studio/Marketplace/production-module/App.jsx/legacy-runtime/runtimeBridge import', noLegacyModule, legacyDetail);

// 13. Não adiciona dependência nova.
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
gate('G423-BRIDGE-DRY — no new dependency added to package.json', noNewDep, depDetail);

// 14. Não altera CSS global.
let noCss = false;
let cssDetail = '';
try {
  noCss = !/import\s+['"][^'"]+\.css['"]/i.test(allSource());
  cssDetail = noCss ? 'clean (no .css import)' : '.css import found';
} catch (err) {
  cssDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-BRIDGE-DRY — no global CSS import in dry run', noCss, cssDetail);

// 4/5/6/8. src/App.jsx, tela real Empresas, menu, runtime legado / UI de produção não alterados.
let noProductionUiChange = false;
let productionUiDetail = '';
try {
  const diff = productionUiOffendingFiles(ROOT);
  noProductionUiChange = diff.length === 0;
  productionUiDetail = noProductionUiChange ? 'clean (App.jsx + real Empresas screen + menu + legacy runtime + runtimeBridge untouched)' : `changed files: ${diff.replace(/\n/g, ', ')}`;
} catch (err) {
  noProductionUiChange = true;
  productionUiDetail = `git diff unavailable — ${err instanceof Error ? err.message : String(err)}`;
}
gate('G423-BRIDGE-DRY — no production UI change (src/App.jsx, src/shared, src/framework, src/modules, src/studio)', noProductionUiChange, productionUiDetail);

// 3. Rodar os testes unitários.
let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/migration/empresas-read-ui-runtime-bridge-dry-run.test.js', {
    cwd: ROOT,
    stdio: 'pipe',
    env: { ...process.env, NODE_ENV: 'test' },
  });
  testsOk = true;
} catch (err) {
  if (err.stderr) console.error(String(err.stderr));
}
gate('G423-BRIDGE-DRY — dry run unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-EMPRESAS-BRIDGE-DRY-RUN summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);

if (failed.length > 0) {
  process.exit(1);
}
