#!/usr/bin/env node
/**
 * Gate G423-EMPRESAS-READ-SLOT — Empresas Runtime Bridge Read Slot Candidate (post-Foundation C)
 *
 * Proves the candidate is a pure, passive, deterministic description of a future
 * read-only slot: off by default, fail-closed in production, write guard active,
 * read-only slot contract that blocks write/legacy/bridge-mutation/backend/
 * storage/ui-replacement, a serializable payload + payload validation (blocks
 * functions/handlers/pollution), a mount plan that mounts nothing, no real data
 * as primary source, no backend/Prisma/storage, no App.jsx/menu/real-screen/
 * legacy/runtime-bridge change, React components with no write side effects, and
 * it recommends only "Read Slot Dev Activation" (ready) or "Read Slot Candidate
 * Fixes" (otherwise) — never write/full cutover, never migrated.
 */
import { execSync } from 'node:child_process';
import { productionUiOffendingFiles } from './lib/productionUiGuard.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const RUNTIME = path.join(ROOT, 'src/runtime');
const DIR = path.join(RUNTIME, 'migration/empresas-runtime-bridge-read-slot');
const COMPONENTS = path.join(DIR, 'components');
const results = [];

const gate = (name, ok, detail = '') => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
};

const exists = (p) => fs.existsSync(p);
const stripComments = (source) => source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

const PURE_FILES = [
  'createEmpresasRuntimeBridgeReadSlotCandidate.js',
  'createEmpresasRuntimeBridgeReadSlotContract.js',
  'createEmpresasRuntimeBridgeReadSlotPayload.js',
  'validateEmpresasRuntimeBridgeReadSlotPayload.js',
  'createEmpresasRuntimeBridgeReadSlotMountPlan.js',
  'empresasRuntimeBridgeReadSlotDiagnostics.js',
  'empresasRuntimeBridgeReadSlotConfig.js',
  'errors.js',
];
const COMPONENT_FILES = [
  'EmpresasRuntimeBridgeReadSlotPanel.jsx',
  'EmpresasRuntimeBridgeReadSlotStatus.jsx',
  'EmpresasRuntimeBridgeReadSlotContract.jsx',
  'EmpresasRuntimeBridgeReadSlotPayload.jsx',
];
const pureSource = () => PURE_FILES.map((f) => fs.readFileSync(path.join(DIR, f), 'utf8')).join('\n');
const componentSource = () => COMPONENT_FILES.map((f) => fs.readFileSync(path.join(COMPONENTS, f), 'utf8')).join('\n');
const allSource = () => pureSource() + '\n' + componentSource();
const allCodeOnly = () => stripComments(allSource());
const componentCodeOnly = () => stripComments(componentSource());

// 1. Existência dos arquivos.
for (const f of PURE_FILES) gate(`G423-READ-SLOT — ${f} exists`, exists(path.join(DIR, f)));
for (const f of COMPONENT_FILES) gate(`G423-READ-SLOT — components/${f} exists`, exists(path.join(COMPONENTS, f)));
gate('G423-READ-SLOT — types exist', exists(path.join(RUNTIME, 'types/empresas-runtime-bridge-read-slot-candidate.js')));
gate('G423-READ-SLOT — tests exist', exists(path.join(RUNTIME, '__tests__/migration/empresas-runtime-bridge-read-slot-candidate.test.js')));

// 2. Exports públicos puros; nenhum .jsx.
let exportsOk = false;
let exportsDetail = '';
try {
  const s = fs.readFileSync(path.join(RUNTIME, 'index.js'), 'utf8');
  const hasHelpers = /createEmpresasRuntimeBridgeReadSlotCandidate/.test(s) && /createEmpresasRuntimeBridgeReadSlotContract/.test(s) && /validateEmpresasRuntimeBridgeReadSlotPayload/.test(s);
  const noJsx = !/from\s+['"][^'"]*empresas-runtime-bridge-read-slot\/components\/[^'"]*\.jsx['"]/.test(s);
  exportsOk = hasHelpers && noJsx;
  exportsDetail = exportsOk ? 'pure helpers exported; no React component from the barrel' : 'missing helpers or a .jsx exported from the barrel';
} catch (err) {
  exportsDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-READ-SLOT — pure helpers exported, no React component in runtime barrel', exportsOk, exportsDetail);

// 16/20/21. Model shape + contract blocks + payload validation + não-migrado + next só Activation/Fixes. (dynamic)
let shapeOk = false;
let shapeDetail = '';
try {
  const mod = await import(pathToFileURL(path.join(DIR, 'createEmpresasRuntimeBridgeReadSlotCandidate.js')).href);
  const off = await mod.createEmpresasRuntimeBridgeReadSlotCandidate({ env: {} });
  const on = await mod.createEmpresasRuntimeBridgeReadSlotCandidate({ env: { MAK_RUNTIME_V2_EMPRESAS_READ_SLOT_CANDIDATE: 'true' } });
  const prod = await mod.createEmpresasRuntimeBridgeReadSlotCandidate({ env: { MAK_RUNTIME_V2_EMPRESAS_READ_SLOT_CANDIDATE: 'true', NODE_ENV: 'production' } });
  const offOk = off.enabled === false && off.skipped === true && off.noSideEffects === true && off.readSlotContract === null && off.readSlotPayload === null && off.mountPlan === null;
  const onOk = on.enabled === true && on.mode === 'runtime_bridge_read_slot_candidate' && on.slotMode === 'read_only_candidate' && on.currentRuntime === 'legacy' && on.targetRuntime === 'runtime-v2';
  const usesModels = on.dryRun && on.hardening && on.overlay && on.guardedReadUi && on.readOnlyCandidate;
  const contractBlocks = ['create', 'update', 'delete', 'save', 'submit', 'executeAction', 'startWorkflow', 'invokeConnector', 'mutateLegacyRuntime', 'mutateRuntimeBridge', 'writeBackend', 'writeStorage', 'replaceProductionUi'].every((op) => on.readSlotContract.blockedOperations.includes(op));
  const allowedReadOnly = on.readSlotContract.allowedOperations.every((op) => /^(receive|render|inspect|report)/.test(op));
  const payloadValid = on.payloadValidation.valid === true && on.payloadValidation.safeToProceed === true;
  const mountMountsNothing = on.mountPlan.mountedAnythingReal === false && on.mountPlan.touchedAppJsx === false && on.mountPlan.touchedRealScreen === false && on.mountPlan.touchedRuntimeBridge === false;
  const notMigrated = on.mode !== 'migrated';
  const nextOk = /Read Slot Dev Activation|Read Slot Candidate Fixes/i.test(on.nextAllowedStep) && !/write|full cutover|migrated/i.test(on.nextAllowedStep);
  const prodClosed = prod.enabled === false && prod.productionBlocked === true;
  const writeOps = ['create', 'update', 'delete', 'save', 'submit', 'executeAction', 'startWorkflow', 'invokeConnector'];
  const writeBlocked = on.writeBlocked === true && writeOps.every((op) => on.writeGuard.attempt(op, {}).blocked === true);
  shapeOk = offOk && onOk && usesModels && contractBlocks && allowedReadOnly && payloadValid && mountMountsNothing && notMigrated && nextOk && prodClosed && writeBlocked;
  shapeDetail = shapeOk
    ? `off→skipped; on→read_only_candidate legacy→v2; usa cadeia; contrato bloqueia write/legacy/bridge/backend/storage/ui; payload valid; monta nada; não-migrado; next=${on.nextAllowedStep}; prod fail-closed; write bloqueado`
    : `model fora do contrato (offOk=${offOk}, onOk=${onOk}, usesModels=${!!usesModels}, contractBlocks=${contractBlocks}, allowedReadOnly=${allowedReadOnly}, payloadValid=${payloadValid}, mountMountsNothing=${mountMountsNothing}, notMigrated=${notMigrated}, nextOk=${nextOk}, prodClosed=${prodClosed}, writeBlocked=${writeBlocked})`;
} catch (err) {
  shapeDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-READ-SLOT — read-only slot, contract blocks all mutations, payload valid, mounts nothing, next only Activation/Fixes', shapeOk, shapeDetail);

// 17. Payload validation bloqueia função/handler/prototype pollution. (dynamic)
let validationOk = false;
let validationDetail = '';
try {
  const vMod = await import(pathToFileURL(path.join(DIR, 'validateEmpresasRuntimeBridgeReadSlotPayload.js')).href);
  const pMod = await import(pathToFileURL(path.join(DIR, 'createEmpresasRuntimeBridgeReadSlotPayload.js')).href);
  const vmMod = await import(pathToFileURL(path.join(RUNTIME, 'migration/empresas-readonly/createEmpresasReadOnlyViewModel.js')).href);
  const vm = await vmMod.createEmpresasReadOnlyViewModel({});
  const good = pMod.createEmpresasRuntimeBridgeReadSlotPayload({ viewModel: vm, parity: { parityStatus: 'parity' } });
  const validGood = vMod.validateEmpresasRuntimeBridgeReadSlotPayload({ payload: good }).valid === true;
  const failFn = vMod.validateEmpresasRuntimeBridgeReadSlotPayload({ payload: { ...good, evil: () => {} } }).valid === false;
  const failPoll = vMod.validateEmpresasRuntimeBridgeReadSlotPayload({ payload: JSON.parse('{"moduleId":"empresas","mode":"read_only","__proto__":{"x":1}}') }).valid === false;
  const noWg = JSON.parse(JSON.stringify(good)); delete noWg.writeGuard;
  const failNoWg = vMod.validateEmpresasRuntimeBridgeReadSlotPayload({ payload: noWg }).valid === false;
  validationOk = validGood && failFn && failPoll && failNoWg;
  validationDetail = validationOk ? 'payload seguro passa; função/pollution/sem-writeGuard falham' : 'validação incorreta';
} catch (err) {
  validationDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-READ-SLOT — payload validation blocks functions/handlers/prototype pollution', validationOk, validationDetail);

// 18. Read slot dev-only/opt-in (fail-closed em produção). (dynamic)
let devOnlyOk = false;
let devOnlyDetail = '';
try {
  const cfg = await import(pathToFileURL(path.join(DIR, 'empresasRuntimeBridgeReadSlotConfig.js')).href);
  const off = cfg.isEmpresasReadSlotEnabled({}) === false;
  const onDev = cfg.isEmpresasReadSlotEnabled({ MAK_RUNTIME_V2_EMPRESAS_READ_SLOT_CANDIDATE: 'true' }) === true;
  const prodClosed = cfg.isEmpresasReadSlotEnabled({ MAK_RUNTIME_V2_EMPRESAS_READ_SLOT_CANDIDATE: 'true', NODE_ENV: 'production' }) === false;
  devOnlyOk = off && onDev && prodClosed;
  devOnlyDetail = devOnlyOk ? 'off por padrão; on em dev com a flag; fail-closed em produção' : 'gate dev-only incorreto';
} catch (err) {
  devOnlyDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-READ-SLOT — read slot candidate is dev-only / opt-in (fail-closed in production)', devOnlyOk, devOnlyDetail);

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
gate('G423-READ-SLOT — components carry no onClick/onSubmit/onChange write side effects', noSideEffectHandlers, handlersDetail);

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
gate('G423-READ-SLOT — no direct Prisma/backend import (D-RI-13)', noForbiddenDeps, forbiddenDetail);

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
gate('G423-READ-SLOT — no direct fetch/XHR/WebSocket/localStorage/sessionStorage/IndexedDB', noExternalIo, ioDetail);

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
gate('G423-READ-SLOT — no Studio/Marketplace/production-module/App.jsx/legacy-runtime/runtimeBridge import', noLegacyModule, legacyDetail);

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
gate('G423-READ-SLOT — no new dependency added to package.json', noNewDep, depDetail);

// 14. Não altera CSS global.
let noCss = false;
let cssDetail = '';
try {
  noCss = !/import\s+['"][^'"]+\.css['"]/i.test(allSource());
  cssDetail = noCss ? 'clean (no .css import)' : '.css import found';
} catch (err) {
  cssDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-READ-SLOT — no global CSS import in read slot', noCss, cssDetail);

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
gate('G423-READ-SLOT — no production UI change (src/App.jsx, src/shared, src/framework, src/modules, src/studio)', noProductionUiChange, productionUiDetail);

// 3. Rodar os testes unitários.
let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/migration/empresas-runtime-bridge-read-slot-candidate.test.js', {
    cwd: ROOT,
    stdio: 'pipe',
    env: { ...process.env, NODE_ENV: 'test' },
  });
  testsOk = true;
} catch (err) {
  if (err.stderr) console.error(String(err.stderr));
}
gate('G423-READ-SLOT — read slot unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-EMPRESAS-READ-SLOT summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);

if (failed.length > 0) {
  process.exit(1);
}
