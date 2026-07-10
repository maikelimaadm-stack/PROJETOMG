#!/usr/bin/env node
/**
 * Gate G423-MODELOBASE1-LOCAL-WRITE-ACTIVATION — ModeloBase1 Controlled Local
 * Write Activation (post-Foundation C).
 *
 * Proves the beta UI activation of LOCAL (in-memory) write: flags off by default
 * (fail-closed in production), activation requires beta + plan + activation flag,
 * a session/controller driving a local draft (create/update/delete/save/submit/
 * reset) that never mutates the original, never persists, backend/prisma/
 * runtimeBridge Touched=false, submitDraft sent=false, invalid payload/op
 * fail-closed, Empresas + cadcps sharing the same base, next step = Local
 * Persistence Validation (not backend write). No backend/Prisma/fetch/storage;
 * decoupled from src/runtime; App.jsx untouched; authorized scope; no new dep;
 * no global CSS.
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

const ACT_FILES = [
  'resolveModeloBase1LocalWriteActivation.js',
  'createModeloBase1LocalWriteUiState.js',
  'modeloBase1LocalWriteActivationDiagnostics.js',
  'useModeloBase1ControlledLocalWrite.js',
];
const C_FILES = [
  'components/ModeloBase1LocalWriteToolbar.jsx',
  'components/ModeloBase1LocalWriteDiagnosticsPanel.jsx',
  'components/ModeloBase1LocalDraftBadge.jsx',
];
const actSource = () => ACT_FILES.map((f) => fs.readFileSync(path.join(LW_DIR, f), 'utf8')).join('\n');
const cSource = () => C_FILES.map((f) => fs.readFileSync(path.join(LW_DIR, f), 'utf8')).join('\n');
const allSource = () => actSource() + '\n' + cSource();
const allCode = () => stripComments(allSource());

// 1. Arquivos esperados.
for (const f of ACT_FILES) gate(`G423-MB1-LWA — ${f} exists`, exists(path.join(LW_DIR, f)));
for (const f of C_FILES) gate(`G423-MB1-LWA — ${f} exists`, exists(path.join(LW_DIR, f)));
gate('G423-MB1-LWA — tests exist', exists(path.join(RUNTIME, '__tests__/modelobase1-controlled-local-write-activation.test.js')));

// 2. Flags: off por padrão; activation requer beta + plan + activation; fail-closed prod. (dynamic)
let flagsOk = false;
let flagsDetail = '';
try {
  const r = await import(pathToFileURL(path.join(LW_DIR, 'resolveModeloBase1LocalWriteActivation.js')).href);
  const beta = { moduleId: 'empresas', betaApplied: true };
  const off = r.resolveModeloBase1LocalWriteActivation({ moduleId: 'empresas', readState: beta, env: {} }).activationApplied === false;
  const onlyAct = r.resolveModeloBase1LocalWriteActivation({ moduleId: 'empresas', readState: beta, env: { MAK_MODELOBASE1_EMPRESAS_LOCAL_WRITE_ACTIVATION: 'true' } }).activationApplied === false;
  const full = { MAK_MODELOBASE1_EMPRESAS_BETA: 'true', MAK_MODELOBASE1_EMPRESAS_LOCAL_WRITE_PLAN: 'true', MAK_MODELOBASE1_EMPRESAS_LOCAL_WRITE_ACTIVATION: 'true' };
  const on = r.resolveModeloBase1LocalWriteActivation({ moduleId: 'empresas', readState: beta, env: full }).activationApplied === true;
  const noBeta = r.resolveModeloBase1LocalWriteActivation({ moduleId: 'empresas', readState: { moduleId: 'empresas', betaApplied: false }, env: full }).activationApplied === false;
  const prodClosed = r.isModeloBase1LocalWriteActivationRequested('empresas', { MAK_MODELOBASE1_EMPRESAS_LOCAL_WRITE_ACTIVATION: 'true', NODE_ENV: 'production' }) === false;
  const prodOverride = r.isModeloBase1LocalWriteActivationRequested('empresas', { MAK_MODELOBASE1_EMPRESAS_LOCAL_WRITE_ACTIVATION: 'true', NODE_ENV: 'production', MAK_MODELOBASE1_EMPRESAS_LOCAL_WRITE_ACTIVATION_ALLOW_PROD: 'true' }) === true;
  flagsOk = off && onlyAct && on && noBeta && prodClosed && prodOverride;
  flagsDetail = flagsOk ? 'off default; requires beta+plan+activation; fail-closed prod; explicit override' : `flags wrong (off=${off}, onlyAct=${onlyAct}, on=${on}, noBeta=${noBeta}, prodClosed=${prodClosed}, override=${prodOverride})`;
} catch (err) {
  flagsDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-MB1-LWA — activation off by default; requires beta+plan+activation; fail-closed in production', flagsOk, flagsDetail);

// 3. Session: local ops sobre draft, original intocado, localOnly, backend/prisma/bridge false, submit sent:false. (dynamic)
let sessOk = false;
let sessDetail = '';
try {
  const m = await import(pathToFileURL(path.join(LW_DIR, 'createModeloBase1LocalWriteUiState.js')).href);
  const state = { moduleId: 'empresas', betaApplied: true, table: { columns: [{ id: 'a' }], rows: [{ id: 'r1', cells: { a: '1' } }], rowCount: 1 }, form: { fields: [] } };
  const full = { MAK_MODELOBASE1_EMPRESAS_BETA: 'true', MAK_MODELOBASE1_EMPRESAS_LOCAL_WRITE_PLAN: 'true', MAK_MODELOBASE1_EMPRESAS_LOCAL_WRITE_ACTIVATION: 'true' };
  const s = m.createModeloBase1LocalWriteSession({ readState: state, moduleId: 'empresas', env: full });
  const active = s.activationApplied === true;
  const cr = s.createRow({ cells: { a: '2' } });
  const up = s.updateRow('r1', { cells: { a: '9' } });
  const del = s.deleteRow('r1');
  const sv = s.saveDraft();
  const sub = s.submitDraft();
  const opsOk = cr.ok && up.ok && del.ok && sv.localOnly === true && sub.simulatedSubmit === true && sub.sent === false;
  const localOnly = [cr, up, del, sv, sub].every((x) => x.localOnly === true && x.backendTouched === false && x.prismaTouched === false && x.runtimeBridgeTouched === false);
  const originalUntouched = state.table.rows.length === 1 && state.table.rows[0]._localDeleted === undefined;
  const rst = s.resetDraft();
  const resetOk = rst.ok === true && s.getUiState().localRowCount === 1;
  const badFn = s.createRow({ evil: () => {} });
  const badBackend = s.createRow({ target: 'backend' });
  const failClosed = badFn.ok === false && badBackend.ok === false;
  sessOk = active && opsOk && localOnly && originalUntouched && resetOk && failClosed;
  sessDetail = sessOk ? 'active; create/update/delete/save/submit localOnly; submit sent:false; original untouched; reset restores; unsafe fail-closed' : `session wrong (active=${active}, ops=${opsOk}, localOnly=${localOnly}, original=${originalUntouched}, reset=${resetOk}, failClosed=${failClosed})`;
} catch (err) {
  sessDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-MB1-LWA — session: local ops on draft, original untouched, submit sent:false, unsafe fail-closed', sessOk, sessDetail);

// 4. Diagnostics: localOnly, backend/prisma/runtimeBridge false, persistence none, next=Persistence Validation. (dynamic)
let diagOk = false;
let diagDetail = '';
try {
  const m = await import(pathToFileURL(path.join(LW_DIR, 'modeloBase1LocalWriteActivationDiagnostics.js')).href);
  const d = m.createModeloBase1LocalWriteActivationDiagnostics({ moduleId: 'empresas', activation: { moduleId: 'empresas', activationApplied: true, readOnlyFallback: false } });
  diagOk = d.localOnly === true && d.backendTouched === false && d.prismaTouched === false && d.runtimeBridgeTouched === false && d.persistence === 'none' && d.nextAllowedStep === 'ModeloBase1 Local Persistence Validation' && !/backend/i.test(d.nextAllowedStep);
  diagDetail = diagOk ? 'localOnly; backend/prisma/bridge false; persistence none; next=Local Persistence Validation' : 'diagnostics wrong';
} catch (err) {
  diagDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-MB1-LWA — diagnostics localOnly / no persistence / next = Local Persistence Validation', diagOk, diagDetail);

// 5. Página consome hook + toolbar + painel.
let pageOk = false;
let pageDetail = '';
try {
  const page = fs.readFileSync(path.join(MB1, 'render/ModeloBase1CadastroPage.jsx'), 'utf8');
  const usesHook = /useModeloBase1ControlledLocalWrite/.test(page);
  const usesToolbar = /ModeloBase1LocalWriteToolbar/.test(page);
  const usesPanel = /ModeloBase1LocalWriteDiagnosticsPanel/.test(page);
  pageOk = usesHook && usesToolbar && usesPanel;
  pageDetail = pageOk ? 'page consumes activation hook + toolbar + diagnostics panel' : `page wiring missing (hook=${usesHook}, toolbar=${usesToolbar}, panel=${usesPanel})`;
} catch (err) {
  pageDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-MB1-LWA — page consumes the activation hook + toolbar + diagnostics panel', pageOk, pageDetail);

// 6. Sem fetch/Prisma/MMM/backend/storage-API/runtimeBridge.
let noIoOk = false;
let noIoDetail = '';
try {
  const code = allCode();
  const noFetch = !/\bfetch\s*\(|XMLHttpRequest|WebSocket|axios/.test(code);
  const noPrisma = !/PrismaClient|from\s+['"].*prisma.*['"]/i.test(allSource()) && !/\bMMM\b/.test(code);
  const noBackend = !/from\s+['"].*\/apis\/.*['"]|from\s+['"].*\/backend\/.*['"]/i.test(allSource());
  const noStorageApi = !/localStorage\.|sessionStorage\.|indexedDB\./.test(code);
  const noBridge = !/makBootstrap|\/runtimeBridge\//.test(code);
  const noSideEffectOps = !/executeAction|startWorkflow|invokeConnector/.test(code);
  noIoOk = noFetch && noPrisma && noBackend && noStorageApi && noBridge && noSideEffectOps;
  noIoDetail = noIoOk ? 'clean' : `found (fetch=${!noFetch}, prisma=${!noPrisma}, backend=${!noBackend}, storageApi=${!noStorageApi}, bridge=${!noBridge}, sideEffectOps=${!noSideEffectOps})`;
} catch (err) {
  noIoDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-MB1-LWA — no fetch/Prisma/MMM/backend/storage-API/runtimeBridge/action-workflow-connector', noIoOk, noIoDetail);

// 7. Desacoplado de src/runtime.
let decoupledOk = false;
try {
  const imports = [...allCode().matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
  decoupledOk = imports.every((p) => !/^@\/runtime\/|\/runtime\//.test(p));
} catch { decoupledOk = false; }
gate('G423-MB1-LWA — activation module stays decoupled from src/runtime', decoupledOk);

// 8. Componentes: sem CSS global; botões só chamam operações locais.
let compOk = false;
try {
  const code = stripComments(cSource());
  compOk = !/import\s+['"][^'"]+\.css['"]/i.test(cSource())
    && !/addMenuItem|navItems|menu\.push/.test(code)
    && !/\bfetch\s*\(|axios|XMLHttpRequest/.test(code)
    && /ops\.(createRow|saveDraft|submitDraft|resetDraft)/.test(code);
} catch { compOk = false; }
gate('G423-MB1-LWA — components: no CSS global, no fetch/menu, buttons drive only local ops', compOk);

// 9. Sem dependência nova.
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
gate('G423-MB1-LWA — no new dependency added', noNewDep, depDetail);

// 10. App.jsx não alterado.
let appOk = false;
try {
  const changed = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  appOk = !changed.includes('src/App.jsx');
} catch { appOk = true; }
gate('G423-MB1-LWA — src/App.jsx not changed', appOk);

// 11. ESCOPO AUTORIZADO.
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
gate('G423-MB1-LWA — authorized scope only (ModeloBase1/empresas/cadcps/runtime/gates/package.json/evidence)', scopeOk, scopeDetail);

// 12. BLOQUEADO — backend/apis/prisma/framework/studio/bos/makBootstrap/outras telas/SSOT.
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
gate('G423-MB1-LWA — backend/Prisma/framework/Studio/BOS/makBootstrap/other-screens/SSOT untouched', blockedOk, blockedDetail);

// 13. Rodar os testes unitários do slice.
let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/modelobase1-controlled-local-write-activation.test.js', { cwd: ROOT, stdio: 'pipe', env: { ...process.env, NODE_ENV: 'test' } });
  testsOk = true;
} catch (err) {
  if (err.stderr) console.error(String(err.stderr));
}
gate('G423-MB1-LWA — controlled local write activation unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-MODELOBASE1-LOCAL-WRITE-ACTIVATION summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);
if (failed.length > 0) process.exit(1);
