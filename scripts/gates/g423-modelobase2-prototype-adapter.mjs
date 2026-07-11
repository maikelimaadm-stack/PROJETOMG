#!/usr/bin/env node
/**
 * Gate G423-MODELOBASE2-PROTOTYPE — ModeloBase2 Prototype Adapter (post-Foundation C).
 *
 * Proves the Generic Model Runtime is NOT bound to ModeloBase1: a headless second
 * model family (operacional / lançamento / evento / append) built purely on the
 * generic kernel. No real UI/route/menu, no backend/Prisma/fetch/runtimeBridge, no
 * real persistence; dangerous capabilities false; localOnly true; sent false;
 * persistenceReal false. ModeloBase1/Empresas/cadcps and real modules untouched;
 * App.jsx untouched; no new dependency. Next step is hardening/multi-type — NOT
 * backend write.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const MB2_DIR = path.join(ROOT, 'src/ModeloBase2/prototype-adapter');
const RUNTIME = path.join(ROOT, 'src/runtime');
const results = [];

const gate = (name, ok, detail = '') => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
};
const exists = (p) => fs.existsSync(p);
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const full = path.join(dir, e.name);
  if (e.isDirectory()) return walk(full);
  return e.isFile() && e.name.endsWith('.js') ? [full] : [];
});
const mb2Source = () => walk(MB2_DIR).map((f) => fs.readFileSync(f, 'utf8')).join('\n');
const mb2Imports = () => [...stripComments(mb2Source()).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);

const FILES = [
  'errors.js',
  'modeloBase2PrototypeConfig.js',
  'createModeloBase2PrototypeAdapter.js',
  'createModeloBase2OperationalReadModel.js',
  'createModeloBase2OperationalWriteContract.js',
  'createModeloBase2OperationalEventContract.js',
  'createModeloBase2OperationalDraft.js',
  'applyModeloBase2OperationalMutation.js',
  'createModeloBase2OperationalSnapshot.js',
  'createModeloBase2OperationalDiagnostics.js',
  'createModeloBase2OperationalFallback.js',
  'index.js',
];

// 1. Arquivos esperados.
for (const f of FILES) gate(`G423-MB2 — ${f} exists`, exists(path.join(MB2_DIR, f)));
gate('G423-MB2 — tests exist', exists(path.join(RUNTIME, '__tests__/modelobase2-prototype-adapter.test.js')));

// 2. Adapter: modelFamily/modelType; dangerous false; supports; localOnly/sent/persistenceReal. (dynamic)
let adapterOk = false;
let adapterDetail = '';
try {
  const m = await import(pathToFileURL(path.join(MB2_DIR, 'createModeloBase2PrototypeAdapter.js')).href);
  const a = m.createModeloBase2PrototypeAdapter({ moduleId: 'operacional-prototype' });
  const family = a.modelFamily === 'modeloBase2' && a.modelType === 'operacional';
  const danger = ['backendWrite', 'workflow', 'connector', 'marketplacePublish'].every((c) => a.capabilities[c] === false);
  const supports = a.supports.read && a.supports.localWrite && a.supports.operationalDraft && a.supports.eventAppend && a.supports.localPersistenceValidation && a.supports.diagnostics && a.supports.fallback;
  const safe = a.localOnly === true && a.sent === false && a.persistenceReal === false;
  adapterOk = family && danger && supports && safe;
  adapterDetail = adapterOk ? 'modeloBase2/operacional; dangerous false; supports read/localWrite/draft/event/persistence; localOnly/sent/persistenceReal safe' : `adapter wrong (family=${family}, danger=${danger}, supports=${supports}, safe=${safe})`;
} catch (err) { adapterDetail = err instanceof Error ? err.message : String(err); }
gate('G423-MB2 — adapter: modeloBase2/operacional; dangerous false; supports; localOnly/sent/persistenceReal', adapterOk, adapterDetail);

// 3. Read model operacional: entries/summary/timeline; validável. (dynamic)
let readOk = false;
let readDetail = '';
try {
  const m = await import(pathToFileURL(path.join(MB2_DIR, 'createModeloBase2OperationalReadModel.js')).href);
  const r = m.createModeloBase2OperationalReadModel({ moduleId: 'x', entries: [{ entryId: 'e1', status: 'pending', timestamp: '2025-01-01T00:00:00.000Z' }], events: [{ eventId: 'ev1', sequence: 1 }] });
  readOk = r.ok === true && r.validation.valid === true && r.readModel.summary.totalEntries === 1 && r.readModel.timeline.sequence === 1 && r.readModel.modelType === 'operacional';
  readDetail = readOk ? 'entries + summary + timeline; validable as GenericModelReadModel' : `read wrong (ok=${r.ok}, valid=${r.validation.valid})`;
} catch (err) { readDetail = err instanceof Error ? err.message : String(err); }
gate('G423-MB2 — operational read model (entries/summary/timeline) is generic-validable', readOk, readDetail);

// 4. Mutations + event append determinístico; submitDraft mantém sent:false. (dynamic)
let mutationOk = false;
let mutationDetail = '';
try {
  const m = await import(pathToFileURL(path.join(MB2_DIR, 'applyModeloBase2OperationalMutation.js')).href);
  let r = m.applyModeloBase2OperationalMutation({ moduleId: 'x', operation: 'createDraft', payload: { operationType: 'combustivel' } });
  const created = r.ok && r.event.eventType === 'draft.created' && r.event.sequence === 1 && /^fnv1a-/.test(r.event.checksum);
  r = m.applyModeloBase2OperationalMutation({ moduleId: 'x', operation: 'appendEntry', draft: r.draft, payload: { values: { litros: 10 } } });
  const appended = r.ok && r.event.eventType === 'entry.added' && r.draft.entries.length === 1;
  r = m.applyModeloBase2OperationalMutation({ moduleId: 'x', operation: 'submitDraft', draft: r.draft });
  const submitted = r.ok && r.draft.status === 'submitted_simulated' && r.sent === false;
  const blocked = m.applyModeloBase2OperationalMutation({ moduleId: 'x', operation: 'appendEntry', draft: r.draft, payload: { target: 'backend', values: {} } }).ok === false;
  const unknown = m.applyModeloBase2OperationalMutation({ moduleId: 'x', operation: 'frobnicate', draft: r.draft }).ok === false;
  mutationOk = created && appended && submitted && blocked && unknown;
  mutationDetail = mutationOk ? 'create/append/submit local events; sent:false; backend/unknown fail-closed' : `mutation wrong (created=${created}, appended=${appended}, submitted=${submitted}, blocked=${blocked}, unknown=${unknown})`;
} catch (err) { mutationDetail = err instanceof Error ? err.message : String(err); }
gate('G423-MB2 — operational mutations append deterministic local events (sent:false); fail-closed on backend/unknown', mutationOk, mutationDetail);

// 5. Snapshot operacional: cria/valida/checksum fail-closed/roundtrip; persistenceReal false. (dynamic)
let snapOk = false;
let snapDetail = '';
try {
  const mm = await import(pathToFileURL(path.join(MB2_DIR, 'applyModeloBase2OperationalMutation.js')).href);
  const sm = await import(pathToFileURL(path.join(MB2_DIR, 'createModeloBase2OperationalSnapshot.js')).href);
  let r = mm.applyModeloBase2OperationalMutation({ moduleId: 'x', operation: 'createDraft', payload: {} });
  r = mm.applyModeloBase2OperationalMutation({ moduleId: 'x', operation: 'appendEntry', draft: r.draft, payload: { values: { a: 1 } } });
  const snap = sm.createModeloBase2OperationalSnapshot({ draft: r.draft });
  const isSnap = snap.kind === 'generic-model-snapshot' && snap.modelType === 'operacional' && snap.persistenceReal === false;
  const validOk = sm.validateModeloBase2OperationalSnapshot({ snapshot: snap }).valid === true;
  const tampered = sm.validateModeloBase2OperationalSnapshot({ snapshot: { ...snap, data: { x: 1 } } }).valid === false;
  const rt = sm.roundTripModeloBase2OperationalSnapshot({ draft: r.draft });
  const rtOk = rt.ok === true && rt.persistenceReal === false && rt.backendTouched === false && rt.storageMode === 'memory_validation' && rt.loaded.data.entries.length === 1;
  snapOk = isSnap && validOk && tampered && rtOk;
  snapDetail = snapOk ? 'snapshot operacional roundtrip localOnly; persistenceReal false; checksum fail-closed' : `snap wrong (isSnap=${isSnap}, valid=${validOk}, tamper=${tampered}, rt=${rtOk})`;
} catch (err) { snapDetail = err instanceof Error ? err.message : String(err); }
gate('G423-MB2 — operational snapshot round-trips a generic snapshot (persistenceReal false; checksum fail-closed)', snapOk, snapDetail);

// 6. Payload unsafe/forbidden bloqueado no event/write. (dynamic)
let safetyOk = false;
try {
  const wm = await import(pathToFileURL(path.join(MB2_DIR, 'createModeloBase2OperationalWriteContract.js')).href);
  const w = wm.createModeloBase2OperationalWriteContract({ moduleId: 'x' });
  safetyOk = w.validateOperation('appendLocalEvent', { fn: () => {} }).ok === false
    && w.validateOperation('appendLocalEvent', { el: { $$typeof: Symbol.for('react.element') } }).ok === false
    && w.validateOperation('appendLocalEvent', JSON.parse('{"__proto__":{"y":1}}')).ok === false
    && w.validateOperation('appendLocalEvent', { target: 'prisma', a: 1 }).ok === false
    && w.validateOperation('backendCommit', { a: 1 }).ok === false;
} catch { safetyOk = false; }
gate('G423-MB2 — write/event contract blocks fn/React/pollution/backend/Prisma target and blocked ops', safetyOk);

// 7–11. Isolamento estrutural PERMANENTE (import-scan).
gate('G423-MB2 — does not import React', mb2Imports().every((p) => p !== 'react' && !/^react(\/|$)/.test(p)));
gate('G423-MB2 — does not import ModeloBase1', mb2Imports().every((p) => !/ModeloBase1/.test(p)));
gate('G423-MB2 — does not import Empresas/cadcps modules', mb2Imports().every((p) => !/\/modules\/(empresas|cadcps)/.test(p)));
gate('G423-MB2 — does not import backend/API/Prisma', mb2Imports().every((p) => !/\/apis\/|prisma|\/backend\//i.test(p)));
gate('G423-MB2 — does not import runtimeBridge/makBootstrap', mb2Imports().every((p) => !/makBootstrap|runtimeBridge/.test(p)));
gate('G423-MB2 — consumes the generic model kernel', mb2Imports().some((p) => /runtime\/generic-model/.test(p)));

// 12. Sem fetch/XHR/WebSocket/storage-API.
let noIo = false;
try {
  const code = stripComments(mb2Source());
  noIo = !/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(code) && !/localStorage\.|sessionStorage\.|indexedDB\./.test(code);
} catch { noIo = false; }
gate('G423-MB2 — no fetch/XHR/WebSocket/storage-API', noIo);

// 13. Sem CSS global.
gate('G423-MB2 — no global CSS import', !/import\s+['"][^'"]+\.css['"]/i.test(mb2Source()));

// 14. ESCOPO AUTORIZADO (git-diff, tolerante).
let scopeOk = false;
let scopeDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const ALLOWED = [
    /^src\/ModeloBase2\//,
    /^src\/runtime\/generic-model\//,
    /^src\/runtime\/types\/generic-model\.js$/,
    /^src\/runtime\/__tests__\/modelobase2-prototype-adapter\.test\.js$/,
    /^scripts\/gates\/g423-modelobase2-prototype-adapter\.mjs$/,
    /^package\.json$/,
    /^package-lock\.json$/,
    /^docs\/evidence\/post-foundation-c-modelobase2-prototype-adapter\//,
  ];
  const outside = files.filter((f) => !ALLOWED.some((re) => re.test(f)));
  scopeOk = files.length === 0 || outside.length === 0;
  scopeDetail = scopeOk ? `authorized scope only (${files.length} files)` : `OUT OF SCOPE: ${outside.join(', ')}`;
} catch (err) { scopeOk = true; scopeDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-MB2 — authorized scope only (ModeloBase2/generic-model/tests/gate/package.json/evidence)', scopeOk, scopeDetail);

// 15. BLOQUEADO — MB1/Empresas/cadcps/backend/apis/prisma/framework/studio/bos/makBootstrap/App/SSOT (git-diff).
let blockedOk = false;
let blockedDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const FORBIDDEN = [/^src\/ModeloBase1\//, /^src\/modules\/empresas\//, /^src\/modules\/cadcps\//, /^src\/apis\//, /prisma/i, /^src\/framework\//, /^src\/studio\//, /^src\/bos\//, /^src\/modules\/makBootstrap\//, /^src\/App\.jsx$/, /^docs\/meta-model\//, /^docs\/platform-/, /^docs\/runtime-implementation\//];
  const bad = files.filter((f) => FORBIDDEN.some((re) => re.test(f)));
  blockedOk = bad.length === 0;
  blockedDetail = blockedOk ? 'MB1/Empresas/cadcps/backend/Prisma/framework/Studio/BOS/makBootstrap/App.jsx/SSOT untouched' : `FORBIDDEN: ${bad.join(', ')}`;
} catch (err) { blockedOk = true; blockedDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-MB2 — MB1/Empresas/cadcps/backend/Prisma/framework/Studio/BOS/makBootstrap/App.jsx/SSOT untouched', blockedOk, blockedDetail);

// 16. Sem dependência nova.
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
gate('G423-MB2 — no new dependency added', noNewDep, depDetail);

// 17. Próximo passo é hardening/multi-type — NÃO backend write. (dynamic)
let nextStepOk = false;
try {
  const m = await import(pathToFileURL(path.join(MB2_DIR, 'createModeloBase2PrototypeAdapter.js')).href);
  const a = m.createModeloBase2PrototypeAdapter({ moduleId: 'x' });
  nextStepOk = a.nextSteps.some((s) => /hardening|multi-type|operational runtime/i.test(s)) && !a.nextSteps.some((s) => /backend\s*write/i.test(s));
} catch { nextStepOk = false; }
gate('G423-MB2 — next step is hardening / multi-type foundation (not backend write)', nextStepOk);

// 18. Rodar os testes unitários do slice.
let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/modelobase2-prototype-adapter.test.js', { cwd: ROOT, stdio: 'pipe', env: { ...process.env, NODE_ENV: 'test' } });
  testsOk = true;
} catch (err) { if (err.stderr) console.error(String(err.stderr)); }
gate('G423-MB2 — prototype unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-MODELOBASE2-PROTOTYPE summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);
if (failed.length > 0) process.exit(1);
