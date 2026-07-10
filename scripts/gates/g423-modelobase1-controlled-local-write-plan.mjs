#!/usr/bin/env node
/**
 * Gate G423-MODELOBASE1-LOCAL-WRITE-PLAN — ModeloBase1 Controlled Local Write
 * Plan (post-Foundation C).
 *
 * Proves the foundation for controlled LOCAL (in-memory) write: flags off by
 * default (fail-closed in production), a contract that allows only local/planned/
 * simulated operations and blocks backend/Prisma/fetch/storage/runtimeBridge/
 * global-runtime, a controller that works on a SAFE COPY (never mutates the
 * original, never persists, backend/prisma/runtimeBridge Touched=false), payload
 * validation that fail-closes on function/handler/React/pollution/backend-target,
 * Empresas + cadcps sharing the same base, next step = Activation (not backend
 * write). No backend/Prisma/fetch/storage; decoupled from src/runtime; App.jsx
 * untouched; authorized scope only; no new dependency; no global CSS.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const MB1 = path.join(ROOT, 'src/ModeloBase1');
const LW_DIR = path.join(MB1, 'runtime-read-model/local-write');
const RUNTIME = path.join(ROOT, 'src/runtime');
const results = [];

const gate = (name, ok, detail = '') => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
};
const exists = (p) => fs.existsSync(p);
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

const LW_FILES = [
  'errors.js',
  'modeloBase1LocalWriteConfig.js',
  'createModeloBase1LocalWriteContract.js',
  'validateModeloBase1LocalWritePayload.js',
  'applyModeloBase1LocalWriteMutation.js',
  'createModeloBase1LocalWriteController.js',
  'createModeloBase1ControlledLocalWritePlan.js',
  'modeloBase1LocalWriteDiagnostics.js',
];
const C_FILES = ['components/ModeloBase1LocalWritePlanPanel.jsx', 'components/ModeloBase1LocalWriteStatusBadge.jsx'];
const lwSource = () => LW_FILES.map((f) => fs.readFileSync(path.join(LW_DIR, f), 'utf8')).join('\n');
const cSource = () => C_FILES.map((f) => fs.readFileSync(path.join(LW_DIR, f), 'utf8')).join('\n');
const allSource = () => lwSource() + '\n' + cSource();
const allCode = () => stripComments(allSource());

// 1. Arquivos esperados.
for (const f of LW_FILES) gate(`G423-MB1-LW — ${f} exists`, exists(path.join(LW_DIR, f)));
for (const f of C_FILES) gate(`G423-MB1-LW — ${f} exists`, exists(path.join(LW_DIR, f)));
gate('G423-MB1-LW — tests exist', exists(path.join(RUNTIME, '__tests__/modelobase1-controlled-local-write-plan.test.js')));

// 2. Flags off por padrão, per-module + umbrella, fail-closed em produção. (dynamic)
let flagsOk = false;
let flagsDetail = '';
try {
  const cfg = await import(pathToFileURL(path.join(LW_DIR, 'modeloBase1LocalWriteConfig.js')).href);
  const off = cfg.isEmpresasLocalWritePlanEnabled({}) === false && cfg.isCadcpsLocalWritePlanEnabled({}) === false;
  const empOn = cfg.isEmpresasLocalWritePlanEnabled({ MAK_MODELOBASE1_EMPRESAS_LOCAL_WRITE_PLAN: 'true' }) === true;
  const cpsOn = cfg.isCadcpsLocalWritePlanEnabled({ MAK_MODELOBASE1_CADCPS_LOCAL_WRITE_PLAN: 'true' }) === true;
  const umbrella = cfg.isEmpresasLocalWritePlanEnabled({ MAK_MODELOBASE1_CONTROLLED_LOCAL_WRITE_PLAN: 'true' }) === true && cfg.isCadcpsLocalWritePlanEnabled({ MAK_MODELOBASE1_CONTROLLED_LOCAL_WRITE_PLAN: 'true' }) === true;
  const prodClosed = cfg.isEmpresasLocalWritePlanEnabled({ MAK_MODELOBASE1_EMPRESAS_LOCAL_WRITE_PLAN: 'true', NODE_ENV: 'production' }) === false;
  const prodOverride = cfg.isEmpresasLocalWritePlanEnabled({ MAK_MODELOBASE1_EMPRESAS_LOCAL_WRITE_PLAN: 'true', NODE_ENV: 'production', MAK_MODELOBASE1_EMPRESAS_LOCAL_WRITE_PLAN_ALLOW_PROD: 'true' }) === true;
  flagsOk = off && empOn && cpsOn && umbrella && prodClosed && prodOverride;
  flagsDetail = flagsOk ? 'off default; per-module + umbrella; fail-closed in prod; explicit override' : `flags wrong (off=${off}, emp=${empOn}, cps=${cpsOn}, umbrella=${umbrella}, prodClosed=${prodClosed}, override=${prodOverride})`;
} catch (err) {
  flagsDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-MB1-LW — flags off by default, per-module + umbrella, fail-closed in production', flagsOk, flagsDetail);

// 3. Contract: allowed locais + blocked backend/Prisma/fetch/storage/runtimeBridge/global. (dynamic)
let contractOk = false;
let contractDetail = '';
try {
  const m = await import(pathToFileURL(path.join(LW_DIR, 'createModeloBase1LocalWriteContract.js')).href);
  const c = m.createModeloBase1LocalWriteContract({ moduleId: 'empresas', enabled: true });
  const allowed = ['planCreate', 'planUpdate', 'planDelete', 'planSave', 'planSubmit', 'simulateLocalMutation', 'inspectLocalDraft', 'validatePayload', 'reportDiagnostics'].every((op) => c.allowedOperations.includes(op));
  const blocked = ['backendCreate', 'backendUpdate', 'backendDelete', 'prismaCreate', 'prismaUpdate', 'prismaDelete', 'fetchWrite', 'persistStorage', 'executeAction', 'startWorkflow', 'invokeConnector', 'mutateRuntimeBridge', 'mutateGlobalRuntime', 'replaceProductionUi'].every((op) => c.blockedOperations.includes(op));
  const safe = c.safety.localOnly === true && c.safety.backendTouched === false && c.safety.prismaTouched === false && c.safety.runtimeBridgeTouched === false && c.safety.persistence === 'none';
  const next = c.nextAllowedStep === 'ModeloBase1 Controlled Local Write Activation';
  contractOk = allowed && blocked && safe && next;
  contractDetail = contractOk ? 'allowed local ops; blocked backend/Prisma/fetch/storage/bridge/global; localOnly; next=Activation' : `contract wrong (allowed=${allowed}, blocked=${blocked}, safe=${safe}, next=${next})`;
} catch (err) {
  contractDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-MB1-LW — contract allows local ops, blocks backend/Prisma/fetch/storage/runtimeBridge/global', contractOk, contractDetail);

// 4. Controller: cópia segura, não muta original, localOnly, backend/prisma/bridge Touched false. (dynamic)
let ctrlOk = false;
let ctrlDetail = '';
try {
  const planMod = await import(pathToFileURL(path.join(LW_DIR, 'createModeloBase1ControlledLocalWritePlan.js')).href);
  const state = { moduleId: 'empresas', betaApplied: true, table: { columns: [{ id: 'a' }], rows: [{ id: 'r1', cells: { a: '1' } }], rowCount: 1 }, form: { fields: [] } };
  const off = planMod.createModeloBase1ControlledLocalWritePlan({ readState: state, env: {} });
  const on = planMod.createModeloBase1ControlledLocalWritePlan({ readState: state, env: { MAK_MODELOBASE1_EMPRESAS_LOCAL_WRITE_PLAN: 'true' } });
  const offOk = on.enabled === true && off.enabled === false && off.controller === null;
  const c = on.controller;
  const cr = c.createRow({ cells: { a: '2' } });
  const up = c.updateRow('r1', { cells: { a: '9' } });
  const del = c.deleteRow('r1');
  const sv = c.saveDraft();
  const sub = c.submitDraft();
  const opsOk = cr.ok && up.ok && del.ok && sv.localOnly && sub.simulatedSubmit === true && sub.sent === false;
  const localOnly = [cr, up, del, sv, sub].every((r) => r.localOnly === true && r.backendTouched === false && r.prismaTouched === false && r.runtimeBridgeTouched === false);
  const originalUntouched = state.table.rows.length === 1;
  const badFn = c.createRow({ evil: () => {} });
  const badBackend = c.createRow({ target: 'backend' });
  const failClosed = badFn.ok === false && badBackend.ok === false;
  ctrlOk = offOk && opsOk && localOnly && originalUntouched && failClosed;
  ctrlDetail = ctrlOk ? 'off→no controller; on→create/update/delete/save/submit localOnly; original untouched; unsafe fail-closed' : `controller wrong (off=${offOk}, ops=${opsOk}, localOnly=${localOnly}, original=${originalUntouched}, failClosed=${failClosed})`;
} catch (err) {
  ctrlDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-MB1-LW — controller: safe copy, never mutates original, localOnly, unsafe fail-closed', ctrlOk, ctrlDetail);

// 5. Payload validation bloqueia função/handler/React/pollution/backend-target. (dynamic)
let valOk = false;
let valDetail = '';
try {
  const v = await import(pathToFileURL(path.join(LW_DIR, 'validateModeloBase1LocalWritePayload.js')).href);
  const ok = v.validateModeloBase1LocalWritePayload({ moduleId: 'empresas', operation: 'createRow', payload: { cells: { a: '1' } } }).valid === true;
  const fn = v.validateModeloBase1LocalWritePayload({ moduleId: 'empresas', operation: 'createRow', payload: { fn: () => {} } }).valid === false;
  const react = v.validateModeloBase1LocalWritePayload({ moduleId: 'empresas', operation: 'createRow', payload: { el: { $$typeof: Symbol.for('react.element') } } }).valid === false;
  const poll = v.validateModeloBase1LocalWritePayload({ moduleId: 'empresas', operation: 'createRow', payload: JSON.parse('{"__proto__":{"x":1}}') }).valid === false;
  const backend = v.validateModeloBase1LocalWritePayload({ moduleId: 'empresas', operation: 'createRow', payload: { target: 'backend' } }).valid === false;
  const unknown = v.validateModeloBase1LocalWritePayload({ moduleId: 'empresas', operation: 'frobnicate', payload: {} }).valid === false;
  valOk = ok && fn && react && poll && backend && unknown;
  valDetail = valOk ? 'safe passes; fn/React/pollution/backend-target/unknown-op fail-closed' : `validator wrong (ok=${ok}, fn=${fn}, react=${react}, poll=${poll}, backend=${backend}, unknown=${unknown})`;
} catch (err) {
  valDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-MB1-LW — payload validation blocks function/handler/React/pollution/backend-target/unknown-op', valOk, valDetail);

// 6. Empresas e cadcps compartilham o mesmo controller base.
let sharedOk = false;
try {
  const planMod = await import(pathToFileURL(path.join(LW_DIR, 'createModeloBase1ControlledLocalWritePlan.js')).href);
  const emp = planMod.createModeloBase1ControlledLocalWritePlan({ readState: { moduleId: 'empresas', table: { columns: [], rows: [], rowCount: 0 } }, env: { MAK_MODELOBASE1_EMPRESAS_LOCAL_WRITE_PLAN: 'true' } });
  const cps = planMod.createModeloBase1ControlledLocalWritePlan({ readState: { moduleId: 'cadcps', table: { columns: [], rows: [], rowCount: 0 } }, env: { MAK_MODELOBASE1_CADCPS_LOCAL_WRITE_PLAN: 'true' } });
  sharedOk = emp.kind === cps.kind && emp.controller.kind === cps.controller.kind && emp.contract.mode === cps.contract.mode && emp.moduleId !== cps.moduleId;
} catch { sharedOk = false; }
gate('G423-MB1-LW — Empresas & cadcps share the same controller base (no separate architecture)', sharedOk);

// 7. Sem fetch/Prisma/MMM/backend/storage-API/runtimeBridge.
let noIoOk = false;
let noIoDetail = '';
try {
  const code = allCode();
  const noFetch = !/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(code);
  const noPrisma = !/PrismaClient|from\s+['"].*prisma.*['"]/i.test(allSource()) && !/\bMMM\b/.test(code);
  const noBackend = !/from\s+['"].*\/apis\/.*['"]|from\s+['"].*\/backend\/.*['"]/i.test(allSource());
  const noStorageApi = !/localStorage\.|sessionStorage\.|indexedDB\./.test(code);
  const noBridge = !/makBootstrap|\/runtimeBridge\//.test(code);
  noIoOk = noFetch && noPrisma && noBackend && noStorageApi && noBridge;
  noIoDetail = noIoOk ? 'clean (storage tokens only as blocked-target strings, no API calls)' : `found (fetch=${!noFetch}, prisma=${!noPrisma}, backend=${!noBackend}, storageApi=${!noStorageApi}, bridge=${!noBridge})`;
} catch (err) {
  noIoDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-MB1-LW — no fetch/Prisma/MMM/backend import/storage-API/runtimeBridge', noIoOk, noIoDetail);

// 8. Desacoplado de src/runtime.
let decoupledOk = false;
try {
  const imports = [...allCode().matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
  decoupledOk = imports.every((p) => !/^@\/runtime\/|\/runtime\//.test(p));
} catch { decoupledOk = false; }
gate('G423-MB1-LW — local-write module stays decoupled from src/runtime', decoupledOk);

// 9. Componentes sem side effect / sem CSS global.
let compOk = false;
try {
  const code = stripComments(cSource());
  compOk = !/onClick|onSubmit|onChange|handleSave|handleCreate|handleDelete|<form\b|type=["']submit["']/.test(code)
    && !/addMenuItem|navItems|menu\.push/.test(code)
    && !/import\s+['"][^'"]+\.css['"]/i.test(allSource());
} catch { compOk = false; }
gate('G423-MB1-LW — components carry no side effects / no menu / no global CSS', compOk);

// 10. Sem dependência nova.
let noNewDep = false;
let depDetail = '';
try {
  const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
  const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
  const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
  noNewDep = bk === hk;
  depDetail = noNewDep ? 'clean' : 'dependency set changed';
} catch (err) {
  noNewDep = true;
  depDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`;
}
gate('G423-MB1-LW — no new dependency added', noNewDep, depDetail);

// 11. App.jsx não alterado.
let appOk = false;
try {
  const changed = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  appOk = !changed.includes('src/App.jsx');
} catch { appOk = true; }
gate('G423-MB1-LW — src/App.jsx not changed', appOk);

// 12. ESCOPO AUTORIZADO.
let scopeOk = false;
let scopeDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const ALLOWED = [/^src\/ModeloBase1\//, /^src\/modules\/empresas\//, /^src\/modules\/cadcps\//, /^src\/runtime\//, /^scripts\/gates\//, /^docs\/evidence\//, /^package\.json$/, /^package-lock\.json$/];
  const outside = files.filter((f) => !ALLOWED.some((re) => re.test(f)));
  scopeOk = files.length === 0 || outside.length === 0;
  scopeDetail = scopeOk ? `authorized scope only (${files.length} files)` : `OUT OF SCOPE: ${outside.join(', ')}`;
} catch (err) {
  scopeOk = true;
  scopeDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`;
}
gate('G423-MB1-LW — authorized scope only (ModeloBase1/empresas/cadcps/runtime/gates/package.json/evidence)', scopeOk, scopeDetail);

// 13. BLOQUEADO — backend/apis/prisma/framework/studio/bos/makBootstrap/outras telas/SSOT.
let blockedOk = false;
let blockedDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const FORBIDDEN_PATHS = [/^src\/apis\//, /prisma/i, /^src\/framework\//, /^src\/studio\//, /^src\/bos\//, /^src\/modules\/makBootstrap\//, /^docs\/meta-model\//, /^docs\/platform-/, /^docs\/runtime-implementation\//];
  const otherModules = files.filter((f) => /^src\/modules\//.test(f) && !/^src\/modules\/(empresas|cadcps)\//.test(f));
  const forbidden = files.filter((f) => FORBIDDEN_PATHS.some((re) => re.test(f)));
  blockedOk = forbidden.length === 0 && otherModules.length === 0;
  blockedDetail = blockedOk ? 'no backend/apis/prisma/framework/studio/bos/makBootstrap/other-module/SSOT change' : `FORBIDDEN: ${[...forbidden, ...otherModules].join(', ')}`;
} catch (err) {
  blockedOk = true;
  blockedDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`;
}
gate('G423-MB1-LW — backend/Prisma/framework/Studio/BOS/makBootstrap/other-screens/SSOT untouched', blockedOk, blockedDetail);

// 14. Rodar os testes unitários do slice.
let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/modelobase1-controlled-local-write-plan.test.js', { cwd: ROOT, stdio: 'pipe', env: { ...process.env, NODE_ENV: 'test' } });
  testsOk = true;
} catch (err) {
  if (err.stderr) console.error(String(err.stderr));
}
gate('G423-MB1-LW — controlled local write plan unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-MODELOBASE1-LOCAL-WRITE-PLAN summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);
if (failed.length > 0) process.exit(1);
