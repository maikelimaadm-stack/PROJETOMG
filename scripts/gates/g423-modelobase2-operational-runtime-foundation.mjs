#!/usr/bin/env node
/**
 * Gate G423-MODELOBASE2-OPERATIONAL-RUNTIME — ModeloBase2 Operational Runtime
 * Foundation (post-Foundation C).
 *
 * Proves a headless operational runtime foundation (session + state machine +
 * command resolver + payload validation + append-only event log + derived read
 * state + snapshot bridge + diagnostics + fallback) that runs a full LOCAL cycle
 * (createDraft → appendEntry → validate → save → submit simulated → snapshot →
 * restore → reset) WITHOUT a backend. No real UI/route/menu/module; no backend/
 * Prisma/fetch/runtimeBridge; no real persistence; never sends; dangerous
 * capabilities false; localOnly true; sent false; persistenceReal false.
 * ModeloBase1/Empresas/cadcps/real modules and App.jsx untouched; no new
 * dependency. Next step is First Real Module Candidate Audit / Fuel-Pesagem
 * Headless Candidate — NOT backend write.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const OR_DIR = path.join(ROOT, 'src/ModeloBase2/operational-runtime');
const RUNTIME = path.join(ROOT, 'src/runtime');
const results = [];

const gate = (name, ok, detail = '') => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
};
const exists = (p) => fs.existsSync(p);
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const walk = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const full = path.join(dir, e.name);
  if (e.isDirectory()) return walk(full);
  return e.isFile() && e.name.endsWith('.js') ? [full] : [];
}) : []);
const orSource = () => walk(OR_DIR).map((f) => fs.readFileSync(f, 'utf8')).join('\n');
const orImports = () => [...stripComments(orSource()).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);

const FILES = [
  'errors.js',
  'modeloBase2OperationalRuntimeConfig.js',
  'createModeloBase2OperationalRuntime.js',
  'createModeloBase2OperationalSession.js',
  'createModeloBase2OperationalStateMachine.js',
  'resolveModeloBase2OperationalCommand.js',
  'applyModeloBase2OperationalCommand.js',
  'validateModeloBase2OperationalCommandPayload.js',
  'createModeloBase2OperationalEventLog.js',
  'createModeloBase2OperationalReadState.js',
  'createModeloBase2OperationalSnapshotBridge.js',
  'createModeloBase2OperationalRuntimeDiagnostics.js',
  'createModeloBase2OperationalRuntimeFallback.js',
  'index.js',
];

// 1. Arquivos esperados.
for (const f of FILES) gate(`G423-MB2-OR — ${f} exists`, exists(path.join(OR_DIR, f)));
gate('G423-MB2-OR — tests exist', exists(path.join(RUNTIME, '__tests__/modelobase2-operational-runtime-foundation.test.js')));

// 2. Runtime: modeloBase2/operacional; dangerous false; conformance; safe invariants. (dynamic)
let rtOk = false;
let rtDetail = '';
try {
  const m = await import(pathToFileURL(path.join(OR_DIR, 'createModeloBase2OperationalRuntime.js')).href);
  const r = m.createModeloBase2OperationalRuntime({ moduleId: 'combustivel' });
  const family = r.modelFamily === 'modeloBase2' && r.modelType === 'operacional' && r.mode === 'operational_runtime_foundation';
  const danger = ['backendWrite', 'workflow', 'connector', 'marketplacePublish'].every((c) => r.capabilities[c] === false);
  const conf = r.conformance.valid === true;
  const safe = r.localOnly === true && r.sent === false && r.persistenceReal === false;
  const next = r.nextSteps.some((s) => /Candidate Audit|Fuel\/Pesagem/i.test(s)) && !r.nextSteps.some((s) => /backend\s*write/i.test(s));
  rtOk = family && danger && conf && safe && next;
  rtDetail = rtOk ? 'modeloBase2/operacional; dangerous false; conformance valid; localOnly/sent/persistenceReal safe; next = candidate audit' : `runtime wrong (family=${family}, danger=${danger}, conf=${conf}, safe=${safe}, next=${next})`;
} catch (err) { rtDetail = err instanceof Error ? err.message : String(err); }
gate('G423-MB2-OR — runtime (modeloBase2/operacional; dangerous false; conformance; localOnly/sent/persistenceReal)', rtOk, rtDetail);

// 3. Ciclo operacional local completo via session. (dynamic)
let cycleOk = false;
let cycleDetail = '';
try {
  const m = await import(pathToFileURL(path.join(OR_DIR, 'createModeloBase2OperationalSession.js')).href);
  const s = m.createModeloBase2OperationalSession({ moduleId: 'combustivel' });
  const c1 = s.dispatch({ commandType: 'createDraft', payload: { operationType: 'combustivel' } });
  const c2 = s.dispatch({ commandType: 'appendEntry', payload: { values: { litros: 10 } } });
  const c3 = s.dispatch({ commandType: 'validateDraft' });
  const c4 = s.dispatch({ commandType: 'saveDraft' });
  const c5 = s.dispatch({ commandType: 'submitDraft' });
  const cycle = c1.nextState === 'draft' && c2.nextState === 'dirty' && c3.nextState === 'valid' && c4.nextState === 'saved_local' && c5.nextState === 'submitted_simulated' && c5.sent === false;
  const snap = s.createSnapshot();
  const restore = s.restoreSnapshot(snap);
  const reset = s.reset();
  const snapOk = snap.kind === 'generic-model-snapshot' && snap.persistenceReal === false && restore.ok === true && reset.nextState === 'reset';
  cycleOk = cycle && snapOk;
  cycleDetail = cycleOk ? 'createDraft→appendEntry→validate→save→submit(sent:false)→snapshot→restore→reset' : `cycle wrong (cycle=${cycle}, snap=${snapOk})`;
} catch (err) { cycleDetail = err instanceof Error ? err.message : String(err); }
gate('G423-MB2-OR — full local operational cycle (create/append/validate/save/submit/snapshot/restore/reset)', cycleOk, cycleDetail);

// 4. Fail-closed: unknown command / unsafe payload / forbidden targets. (dynamic)
let fcOk = false;
try {
  const sm = await import(pathToFileURL(path.join(OR_DIR, 'createModeloBase2OperationalSession.js')).href);
  const vp = await import(pathToFileURL(path.join(OR_DIR, 'validateModeloBase2OperationalCommandPayload.js')).href);
  const s = sm.createModeloBase2OperationalSession({ moduleId: 'x' });
  s.dispatch({ commandType: 'createDraft', payload: {} });
  const unknown = s.dispatch({ commandType: 'frobnicate' }).ok === false;
  const fn = vp.validateModeloBase2OperationalCommandPayload({ commandType: 'appendEntry', payload: { fn: () => {} }, moduleId: 'x' }).valid === false;
  const react = vp.validateModeloBase2OperationalCommandPayload({ commandType: 'appendEntry', payload: { el: { $$typeof: Symbol.for('react.element') } }, moduleId: 'x' }).valid === false;
  const pollution = vp.validateModeloBase2OperationalCommandPayload({ commandType: 'appendEntry', payload: JSON.parse('{"__proto__":{"z":1}}'), moduleId: 'x' }).valid === false;
  const targets = ['backend', 'prisma', 'runtimeBridge', 'fetch'].every((t) => vp.validateModeloBase2OperationalCommandPayload({ commandType: 'appendEntry', payload: { target: t, values: {} }, moduleId: 'x' }).valid === false);
  const stillUsable = s.dispatch({ commandType: 'appendEntry', payload: { values: { ok: 1 } } }).ok === true;
  fcOk = unknown && fn && react && pollution && targets && stillUsable;
} catch { fcOk = false; }
gate('G423-MB2-OR — fail-closed on unknown command / fn / React / pollution / backend-prisma-runtimeBridge-fetch target', fcOk);

// 5. Event log determinístico + append-only + cópias seguras. (dynamic)
let logOk = false;
try {
  const m = await import(pathToFileURL(path.join(OR_DIR, 'createModeloBase2OperationalEventLog.js')).href);
  const log = m.createModeloBase2OperationalEventLog({ moduleId: 'x' });
  const e1 = log.append({ eventType: 'draft.created', payload: { a: 1 } });
  const e2 = log.append({ eventType: 'entry.added', payload: { b: 2 } });
  e1.payload = { hacked: true };
  const seqOk = e1.sequence === 1 && e2.sequence === 2 && /^fnv1a-/.test(e1.checksum);
  const safeCopy = JSON.stringify(log.getById(e1.eventId).payload) !== JSON.stringify({ hacked: true });
  logOk = seqOk && safeCopy && log.appendOnly === true && log.sent === false;
} catch { logOk = false; }
gate('G423-MB2-OR — event log append-only, deterministic sequence + checksum, safe copies', logOk);

// 6. Snapshot bridge roundtrip localOnly. (dynamic)
let bridgeOk = false;
try {
  const sm = await import(pathToFileURL(path.join(OR_DIR, 'createModeloBase2OperationalSession.js')).href);
  const bm = await import(pathToFileURL(path.join(OR_DIR, 'createModeloBase2OperationalSnapshotBridge.js')).href);
  const s = sm.createModeloBase2OperationalSession({ moduleId: 'x' });
  s.dispatch({ commandType: 'createDraft', payload: {} });
  s.dispatch({ commandType: 'appendEntry', payload: { values: { a: 1 } } });
  const bridge = bm.createModeloBase2OperationalSnapshotBridge({ moduleId: 'x' });
  const snap = bridge.createSnapshotFromSession({ draft: s.getState().draft, eventLog: s.getEventLog() });
  const valid = bridge.validateSnapshot(snap).valid === true;
  const tampered = bridge.validateSnapshot({ ...snap, data: { x: 1 } }).valid === false;
  const rt = bridge.roundtripSnapshot({ draft: s.getState().draft, eventLog: s.getEventLog() });
  bridgeOk = valid && tampered && rt.ok === true && rt.persistenceReal === false && rt.storageMode === 'memory_validation';
} catch { bridgeOk = false; }
gate('G423-MB2-OR — snapshot bridge (validate + checksum fail-closed + roundtrip; persistenceReal false)', bridgeOk);

// 7–11. Isolamento estrutural PERMANENTE (import-scan).
gate('G423-MB2-OR — does not import React', orImports().every((p) => p !== 'react' && !/^react(\/|$)/.test(p)));
gate('G423-MB2-OR — does not import ModeloBase1', orImports().every((p) => !/ModeloBase1/.test(p)));
gate('G423-MB2-OR — does not import Empresas/cadcps modules', orImports().every((p) => !/\/modules\/(empresas|cadcps)/.test(p)));
gate('G423-MB2-OR — does not import backend/API/Prisma', orImports().every((p) => !/\/apis\/|prisma|\/backend\//i.test(p)));
gate('G423-MB2-OR — does not import runtimeBridge/makBootstrap', orImports().every((p) => !/makBootstrap|runtimeBridge/.test(p)));
gate('G423-MB2-OR — consumes the generic model kernel + prototype adapter', orImports().some((p) => /runtime\/generic-model/.test(p)) && orImports().some((p) => /prototype-adapter/.test(p)));

// 12. Sem fetch/XHR/WebSocket/storage-API.
let noIo = false;
try {
  const code = stripComments(orSource());
  noIo = !/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(code) && !/localStorage\.|sessionStorage\.|indexedDB\./.test(code);
} catch { noIo = false; }
gate('G423-MB2-OR — no fetch/XHR/WebSocket/storage-API', noIo);

// 13. Sem CSS global.
gate('G423-MB2-OR — no global CSS import', !/import\s+['"][^'"]+\.css['"]/i.test(orSource()));

// 14. ESCOPO AUTORIZADO (git-diff, tolerante).
let scopeOk = false;
let scopeDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const ALLOWED = [
    /^src\/ModeloBase2\/operational-runtime\//,
    /^src\/ModeloBase2\/prototype-adapter\//,
    /^src\/runtime\/generic-model\//,
    /^src\/runtime\/types\/generic-model\.js$/,
    /^src\/runtime\/__tests__\/modelobase2-operational-runtime-foundation\.test\.js$/,
    /^scripts\/gates\/g423-modelobase2-operational-runtime-foundation\.mjs$/,
    /^package\.json$/,
    /^package-lock\.json$/,
    /^docs\/evidence\/post-foundation-c-modelobase2-operational-runtime-foundation\//,
  ];
  const outside = files.filter((f) => !ALLOWED.some((re) => re.test(f)));
  scopeOk = files.length === 0 || outside.length === 0;
  scopeDetail = scopeOk ? `authorized scope only (${files.length} files)` : `OUT OF SCOPE: ${outside.join(', ')}`;
} catch (err) { scopeOk = true; scopeDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-MB2-OR — authorized scope only (operational-runtime/prototype/generic-model/tests/gate/package.json/evidence)', scopeOk, scopeDetail);

// 15. BLOQUEADO — MB1/módulos reais/backend/Prisma/framework/Studio/BOS/makBootstrap/App/SSOT (git-diff).
let blockedOk = false;
let blockedDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const FORBIDDEN = [/^src\/ModeloBase1\//, /^src\/modules\//, /^src\/apis\//, /prisma/i, /^src\/framework\//, /^src\/studio\//, /^src\/bos\//, /^src\/modules\/makBootstrap\//, /^src\/App\.jsx$/, /^docs\/meta-model\//, /^docs\/platform-/, /^docs\/runtime-implementation\//];
  const bad = files.filter((f) => FORBIDDEN.some((re) => re.test(f)));
  blockedOk = bad.length === 0;
  blockedDetail = blockedOk ? 'MB1/real modules/backend/Prisma/framework/Studio/BOS/makBootstrap/App.jsx/SSOT untouched' : `FORBIDDEN: ${bad.join(', ')}`;
} catch (err) { blockedOk = true; blockedDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-MB2-OR — MB1/real modules/backend/Prisma/framework/Studio/BOS/makBootstrap/App.jsx/SSOT untouched', blockedOk, blockedDetail);

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
gate('G423-MB2-OR — no new dependency added', noNewDep, depDetail);

// 17. Rodar os testes unitários do slice.
let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/modelobase2-operational-runtime-foundation.test.js', { cwd: ROOT, stdio: 'pipe', env: { ...process.env, NODE_ENV: 'test' } });
  testsOk = true;
} catch (err) { if (err.stderr) console.error(String(err.stderr)); }
gate('G423-MB2-OR — operational runtime unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-MODELOBASE2-OPERATIONAL-RUNTIME summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);
if (failed.length > 0) process.exit(1);
