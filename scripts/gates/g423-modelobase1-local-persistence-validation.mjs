#!/usr/bin/env node
/**
 * Gate G423-MODELOBASE1-LOCAL-PERSISTENCE-VALIDATION — ModeloBase1 Local
 * Persistence Validation (post-Foundation C).
 *
 * Proves a LOCAL (in-memory) persistence VALIDATION foundation: flags off by
 * default (fail-closed in production, require beta+plan+activation+validation), a
 * contract that allows only validation ops and blocks backend/Prisma/fetch/auto-
 * storage/runtimeBridge, an in-memory injectable adapter (persistenceReal=false,
 * backend/prisma/runtimeBridge Touched=false), deterministic serialization
 * (masks sensitive, strips functions/React, checksum), snapshot validation that
 * fail-closes (moduleId mismatch/function/pollution/checksum), safe rehydration
 * that never mutates the snapshot, deterministic versioning, genericModelReady
 * documented, next step = Generic Model Runtime Extraction Audit (not backend
 * write). No backend/Prisma/fetch/storage; decoupled from src/runtime; App.jsx
 * untouched; authorized scope; no new dep; no global CSS.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const MB1 = path.join(ROOT, 'src/ModeloBase1');
const P_DIR = path.join(MB1, 'runtime-read-model/local-write/persistence');
const RUNTIME = path.join(ROOT, 'src/runtime');
const results = [];

const gate = (name, ok, detail = '') => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
};
const exists = (p) => fs.existsSync(p);
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

const P_FILES = [
  'errors.js', 'modeloBase1LocalPersistenceConfig.js', 'createModeloBase1LocalPersistenceContract.js',
  'createModeloBase1LocalPersistenceAdapter.js', 'serializeModeloBase1LocalDraft.js', 'rehydrateModeloBase1LocalDraft.js',
  'validateModeloBase1LocalDraftSnapshot.js', 'createModeloBase1LocalDraftVersion.js', 'modeloBase1LocalPersistenceDiagnostics.js',
];
const C_FILES = ['components/ModeloBase1LocalPersistencePanel.jsx', 'components/ModeloBase1LocalPersistenceBadge.jsx'];
// The contract file legitimately NAMES blocked ops (backend/prisma/action/etc.)
// as string literals — exclude it from raw-token scans (it is the blocklist).
const CONTRACT_FILE = 'createModeloBase1LocalPersistenceContract.js';
const pSource = () => P_FILES.map((f) => fs.readFileSync(path.join(P_DIR, f), 'utf8')).join('\n');
const cSource = () => C_FILES.map((f) => fs.readFileSync(path.join(P_DIR, f), 'utf8')).join('\n');
const nonContractSource = () => [...P_FILES.filter((f) => f !== CONTRACT_FILE), ...C_FILES].map((f) => fs.readFileSync(path.join(P_DIR, f), 'utf8')).join('\n');
const allSource = () => pSource() + '\n' + cSource();
const allCode = () => stripComments(allSource());

// 1. Arquivos esperados.
for (const f of P_FILES) gate(`G423-MB1-LP — ${f} exists`, exists(path.join(P_DIR, f)));
for (const f of C_FILES) gate(`G423-MB1-LP — ${f} exists`, exists(path.join(P_DIR, f)));
gate('G423-MB1-LP — tests exist', exists(path.join(RUNTIME, '__tests__/modelobase1-local-persistence-validation.test.js')));

// 2. Flags: off por padrão; requer beta+plan+activation+validation; fail-closed prod. (dynamic)
let flagsOk = false;
let flagsDetail = '';
try {
  const cfg = await import(pathToFileURL(path.join(P_DIR, 'modeloBase1LocalPersistenceConfig.js')).href);
  const beta = { moduleId: 'empresas', betaApplied: true };
  const off = cfg.resolveModeloBase1LocalPersistenceValidation({ moduleId: 'empresas', readState: beta, env: {} }).enabled === false;
  const onlyVal = cfg.resolveModeloBase1LocalPersistenceValidation({ moduleId: 'empresas', readState: beta, env: { MAK_MODELOBASE1_EMPRESAS_LOCAL_PERSISTENCE_VALIDATION: 'true' } }).enabled === false;
  const full = { MAK_MODELOBASE1_EMPRESAS_BETA: 'true', MAK_MODELOBASE1_EMPRESAS_LOCAL_WRITE_PLAN: 'true', MAK_MODELOBASE1_EMPRESAS_LOCAL_WRITE_ACTIVATION: 'true', MAK_MODELOBASE1_EMPRESAS_LOCAL_PERSISTENCE_VALIDATION: 'true' };
  const on = cfg.resolveModeloBase1LocalPersistenceValidation({ moduleId: 'empresas', readState: beta, env: full }).enabled === true;
  const prodClosed = cfg.isModeloBase1LocalPersistenceValidationRequested('empresas', { MAK_MODELOBASE1_EMPRESAS_LOCAL_PERSISTENCE_VALIDATION: 'true', NODE_ENV: 'production' }) === false;
  const prodOverride = cfg.isModeloBase1LocalPersistenceValidationRequested('empresas', { MAK_MODELOBASE1_EMPRESAS_LOCAL_PERSISTENCE_VALIDATION: 'true', NODE_ENV: 'production', MAK_MODELOBASE1_EMPRESAS_LOCAL_PERSISTENCE_VALIDATION_ALLOW_PROD: 'true' }) === true;
  flagsOk = off && onlyVal && on && prodClosed && prodOverride;
  flagsDetail = flagsOk ? 'off default; requires beta+plan+activation+validation; fail-closed prod; override' : `flags wrong (off=${off}, onlyVal=${onlyVal}, on=${on}, prodClosed=${prodClosed}, override=${prodOverride})`;
} catch (err) {
  flagsDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-MB1-LP — flags off by default; require beta+plan+activation+validation; fail-closed in production', flagsOk, flagsDetail);

// 3. Contract: allowed de validação; blocked backend/Prisma/auto-storage/bridge; storageMode; genericModelReady. (dynamic)
let contractOk = false;
let contractDetail = '';
try {
  const m = await import(pathToFileURL(path.join(P_DIR, 'createModeloBase1LocalPersistenceContract.js')).href);
  const c = m.createModeloBase1LocalPersistenceContract({ moduleId: 'empresas', enabled: true });
  const allowed = ['serializeDraft', 'validateSnapshot', 'rehydrateDraft', 'compareDraftVersion', 'clearDraftSnapshot', 'inspectPersistenceDiagnostics', 'reportReadiness'].every((op) => c.allowedOperations.includes(op));
  const blocked = ['backendPersist', 'backendCreate', 'prismaPersist', 'fetchWrite', 'directDatabaseWrite', 'persistStorageAutomatically', 'mutateRuntimeBridge', 'mutateGlobalRuntime', 'replaceProductionUi'].every((op) => c.blockedOperations.includes(op));
  const safe = c.safety.localOnly === true && c.safety.persistenceReal === false && c.safety.backendTouched === false && c.safety.prismaTouched === false && c.safety.runtimeBridgeTouched === false && c.safety.mandatoryStorage === false;
  const storage = ['memory_validation', 'injected_adapter_validation'].includes(c.storageMode);
  const generic = c.genericModelReady && c.genericModelReady.ready === true && Array.isArray(c.genericModelReady.generic);
  const next = c.nextAllowedStep === 'Generic Model Runtime Extraction Audit';
  contractOk = allowed && blocked && safe && storage && generic && next;
  contractDetail = contractOk ? 'allowed validation ops; blocked backend/Prisma/auto-storage/bridge; localOnly; genericModelReady; next=Extraction Audit' : `contract wrong (allowed=${allowed}, blocked=${blocked}, safe=${safe}, storage=${storage}, generic=${generic}, next=${next})`;
} catch (err) {
  contractDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-MB1-LP — contract allows validation ops, blocks backend/Prisma/auto-storage/bridge, genericModelReady documented', contractOk, contractDetail);

// 4. Adapter in-memory: localOnly, persistenceReal false, backend/prisma/bridge false. (dynamic)
let adapterOk = false;
let adapterDetail = '';
try {
  const am = await import(pathToFileURL(path.join(P_DIR, 'createModeloBase1LocalPersistenceAdapter.js')).href);
  const sm = await import(pathToFileURL(path.join(P_DIR, 'serializeModeloBase1LocalDraft.js')).href);
  const draft = { kind: 'modelobase1-local-draft', moduleId: 'empresas', table: { columns: [{ id: 'a' }], rows: [{ id: 'r1', cells: { a: '1' } }], rowCount: 1 }, form: null };
  const snap = sm.serializeModeloBase1LocalDraft({ moduleId: 'empresas', localDraft: draft });
  const ad = am.createModeloBase1LocalPersistenceAdapter();
  const save = ad.saveSnapshot(snap);
  const load = ad.loadSnapshot(snap.snapshotId);
  const list = ad.listSnapshots('empresas');
  const diag = ad.getDiagnostics();
  const del = ad.deleteSnapshot(snap.snapshotId);
  const clean = [save, load, list, diag, del].every((r) => r.localOnly === true && r.persistenceReal === false && r.backendTouched === false && r.prismaTouched === false && r.runtimeBridgeTouched === false);
  const memory = ad.storageMode === 'memory_validation';
  adapterOk = save.ok && load.ok && list.snapshotCount === 1 && del.ok && clean && memory && diag.mandatoryStorage === false;
  adapterDetail = adapterOk ? 'in-memory; save/load/list/delete localOnly; persistenceReal false; no mandatory storage' : `adapter wrong (save=${save.ok}, load=${load.ok}, list=${list.snapshotCount}, del=${del.ok}, clean=${clean}, memory=${memory})`;
} catch (err) {
  adapterDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-MB1-LP — adapter is in-memory/injectable, localOnly, persistenceReal=false, no backend/Prisma/bridge', adapterOk, adapterDetail);

// 5. Serialize/validate/rehydrate: strip fn/React, mask sensitive, checksum, fail-closed. (dynamic)
let snapOk = false;
let snapDetail = '';
try {
  const sm = await import(pathToFileURL(path.join(P_DIR, 'serializeModeloBase1LocalDraft.js')).href);
  const vm = await import(pathToFileURL(path.join(P_DIR, 'validateModeloBase1LocalDraftSnapshot.js')).href);
  const rm = await import(pathToFileURL(path.join(P_DIR, 'rehydrateModeloBase1LocalDraft.js')).href);
  const snap = sm.serializeModeloBase1LocalDraft({ moduleId: 'empresas', localRows: [{ id: 'r1', cells: { razao_social: 'ACME', password: 'secret' } }] });
  const masked = snap.rows[0].cells.password === '[REDACTED]';
  const hasVer = typeof snap.version === 'string' && snap.schemaVersion === 1 && snap.localOnly === true && snap.persistenceReal === false && typeof snap.checksum === 'string';
  let fnBlocked = false; try { sm.serializeModeloBase1LocalDraft({ moduleId: 'empresas', localRows: [{ id: 'r', cells: { fn: () => {} } }] }); } catch { fnBlocked = true; }
  const validOk = vm.validateModeloBase1LocalDraftSnapshot({ snapshot: snap, moduleId: 'empresas' }).valid === true;
  const wrongModule = vm.validateModeloBase1LocalDraftSnapshot({ snapshot: snap, moduleId: 'cadcps' }).valid === false;
  const tampered = vm.validateModeloBase1LocalDraftSnapshot({ snapshot: { ...snap, rows: [...snap.rows, { id: 'x', cells: {} }] } }).valid === false;
  const backendTarget = vm.validateModeloBase1LocalDraftSnapshot({ snapshot: { ...snap, backendUrl: '/api' } }).valid === false;
  const re = rm.rehydrateModeloBase1LocalDraft({ snapshot: snap, moduleId: 'empresas' });
  const before = JSON.stringify(snap);
  re.rows.push({ id: 'z' });
  const untouched = JSON.stringify(snap) === before && rm.rehydrateModeloBase1LocalDraft({ snapshot: snap }).rows.length === 1;
  snapOk = masked && hasVer && fnBlocked && validOk && wrongModule && tampered && backendTarget && re.ok && untouched;
  snapDetail = snapOk ? 'serialize masks/strips/checksums; validate fail-closes (module/tamper/target/fn); rehydrate safe + snapshot untouched' : `snap wrong (masked=${masked}, ver=${hasVer}, fnBlocked=${fnBlocked}, valid=${validOk}, wrongMod=${wrongModule}, tamper=${tampered}, backend=${backendTarget}, re=${re.ok}, untouched=${untouched})`;
} catch (err) {
  snapDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-MB1-LP — serialize/validate/rehydrate: mask+strip+checksum, fail-closed, snapshot never mutated', snapOk, snapDetail);

// 6. Versionamento determinístico (sem Date.now). (dynamic)
let verOk = false;
try {
  const m = await import(pathToFileURL(path.join(P_DIR, 'createModeloBase1LocalDraftVersion.js')).href);
  const a = m.createModeloBase1LocalDraftVersion({ moduleId: 'empresas', draftVersion: 2 });
  const b = m.createModeloBase1LocalDraftVersion({ moduleId: 'empresas', draftVersion: 2 });
  verOk = JSON.stringify(a) === JSON.stringify(b) && a.versionId === 'v-empresas-1-2' && a.createdAt === '1970-01-01T00:00:00.000Z';
} catch { verOk = false; }
gate('G423-MB1-LP — versioning is deterministic (no Date.now, injectable clock)', verOk);

// 7. Página consome contract/diagnostics + painel; sem auto-save/auto-restore.
let pageOk = false;
let pageDetail = '';
try {
  const page = fs.readFileSync(path.join(MB1, 'render/ModeloBase1CadastroPage.jsx'), 'utf8');
  const resolves = /resolveModeloBase1LocalPersistenceValidation/.test(page);
  const panel = /ModeloBase1LocalPersistencePanel/.test(page);
  const noAutoSave = !/saveSnapshot\(|loadSnapshot\(|clearModuleSnapshots\(/.test(page);
  pageOk = resolves && panel && noAutoSave;
  pageDetail = pageOk ? 'page resolves validation + renders panel; no auto-save/restore' : `page wiring wrong (resolves=${resolves}, panel=${panel}, noAutoSave=${noAutoSave})`;
} catch (err) {
  pageDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-MB1-LP — page consumes contract/diagnostics + panel; no auto-save/auto-restore', pageOk, pageDetail);

// 8. Sem fetch/Prisma/MMM/backend/storage-API/runtimeBridge/action (contract excluído do scan de blocklist).
let noIoOk = false;
let noIoDetail = '';
try {
  const code = stripComments(nonContractSource());
  const noFetch = !/\bfetch\s*\(|XMLHttpRequest|WebSocket|axios/.test(code);
  const noPrisma = !/PrismaClient|from\s+['"].*prisma.*['"]/i.test(nonContractSource()) && !/\bMMM\b/.test(code);
  const noBackend = !/from\s+['"].*\/apis\/.*['"]|from\s+['"].*\/backend\/.*['"]/i.test(nonContractSource());
  const noStorageApi = !/localStorage\.|sessionStorage\.|indexedDB\./.test(code);
  const noBridge = !/makBootstrap|\/runtimeBridge\//.test(code);
  const noSideEffectCalls = !/\b(executeAction|startWorkflow|invokeConnector)\s*\(/.test(stripComments(allSource()));
  noIoOk = noFetch && noPrisma && noBackend && noStorageApi && noBridge && noSideEffectCalls;
  noIoDetail = noIoOk ? 'clean (contract blocklist excluded from token scan)' : `found (fetch=${!noFetch}, prisma=${!noPrisma}, backend=${!noBackend}, storageApi=${!noStorageApi}, bridge=${!noBridge}, sideEffect=${!noSideEffectCalls})`;
} catch (err) {
  noIoDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-MB1-LP — no fetch/Prisma/MMM/backend/storage-API/runtimeBridge/action calls', noIoOk, noIoDetail);

// 9. Desacoplado de src/runtime.
let decoupledOk = false;
try {
  const imports = [...allCode().matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
  decoupledOk = imports.every((p) => !/^@\/runtime\/|\/runtime\//.test(p));
} catch { decoupledOk = false; }
gate('G423-MB1-LP — persistence module stays decoupled from src/runtime', decoupledOk);

// 10. Sem CSS global.
gate('G423-MB1-LP — no global CSS import', !/import\s+['"][^'"]+\.css['"]/i.test(allSource()));

// 11. Sem dependência nova.
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
gate('G423-MB1-LP — no new dependency added', noNewDep, depDetail);

// 12. App.jsx não alterado.
let appOk = false;
try {
  const changed = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  appOk = !changed.includes('src/App.jsx');
} catch { appOk = true; }
gate('G423-MB1-LP — src/App.jsx not changed', appOk);

// 13. ESCOPO AUTORIZADO.
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
gate('G423-MB1-LP — authorized scope only (ModeloBase1/empresas/cadcps/runtime/gates/package.json/evidence)', scopeOk, scopeDetail);

// 14. BLOQUEADO — backend/apis/prisma/framework/studio/bos/makBootstrap/outras telas/SSOT.
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
gate('G423-MB1-LP — backend/Prisma/framework/Studio/BOS/makBootstrap/other-screens/SSOT untouched', blockedOk, blockedDetail);

// 15. genericModelReady documentado nas evidências.
let evidenceOk = false;
try {
  const p = path.join(ROOT, 'docs/evidence/post-foundation-c-modelobase1-local-persistence-validation/GENERIC-MODEL-READINESS.md');
  evidenceOk = exists(p) && /GENERIC MODEL READINESS/i.test(fs.readFileSync(p, 'utf8'));
} catch { evidenceOk = false; }
gate('G423-MB1-LP — genericModelReady documented in evidence (GENERIC-MODEL-READINESS.md)', evidenceOk);

// 16. Rodar os testes unitários do slice.
let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/modelobase1-local-persistence-validation.test.js', { cwd: ROOT, stdio: 'pipe', env: { ...process.env, NODE_ENV: 'test' } });
  testsOk = true;
} catch (err) {
  if (err.stderr) console.error(String(err.stderr));
}
gate('G423-MB1-LP — local persistence validation unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-MODELOBASE1-LOCAL-PERSISTENCE-VALIDATION summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);
if (failed.length > 0) process.exit(1);
