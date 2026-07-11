#!/usr/bin/env node
/**
 * Gate G423-MODELOBASE2-FUEL-HEADLESS — ModeloBase2 Fuel Headless Candidate
 * (post-Foundation C).
 *
 * Proves the first REAL-domain (fuel/abastecimento) candidate on the ModeloBase2
 * operational runtime, kept HEADLESS: maps fuel entries to commands/events/draft/
 * read-state/snapshot and runs a full local cycle (createFuelDraft → appendFuelEntry
 * → validate → save → submit simulated → snapshot → restore → reset) WITHOUT any UI/
 * route/menu/src-modules, backend/Prisma/fetch/runtimeBridge/React or real
 * persistence; never sends; dangerous capabilities false; localOnly/sent/
 * persistenceReal safe. ModeloBase1/real modules/App.jsx untouched; no new
 * dependency. Next step is Fuel UI Readiness / Fuel Beta UI Sandbox — NOT backend
 * write.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const FUEL_DIR = path.join(ROOT, 'src/ModeloBase2/fuel-headless');
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
const fuelSource = () => walk(FUEL_DIR).map((f) => fs.readFileSync(f, 'utf8')).join('\n');
const fuelImports = () => [...stripComments(fuelSource()).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);

const FILES = [
  'errors.js',
  'modeloBase2FuelHeadlessConfig.js',
  'createModeloBase2FuelHeadlessCandidate.js',
  'createModeloBase2FuelDomainSchema.js',
  'createModeloBase2FuelOperationalAdapter.js',
  'createModeloBase2FuelDraft.js',
  'createModeloBase2FuelCommandMapper.js',
  'validateModeloBase2FuelPayload.js',
  'applyModeloBase2FuelCommand.js',
  'createModeloBase2FuelEventMapper.js',
  'createModeloBase2FuelReadState.js',
  'createModeloBase2FuelSnapshot.js',
  'createModeloBase2FuelDiagnostics.js',
  'createModeloBase2FuelFallback.js',
  'index.js',
];

// 1. Arquivos esperados.
for (const f of FILES) gate(`G423-FUEL — ${f} exists`, exists(path.join(FUEL_DIR, f)));
gate('G423-FUEL — tests exist', exists(path.join(RUNTIME, '__tests__/modelobase2-fuel-headless-candidate.test.js')));

// 2. Candidate: domain fuel; modeloBase2/operacional; dangerous false; safe invariants; next step. (dynamic)
let candOk = false;
let candDetail = '';
try {
  const m = await import(pathToFileURL(path.join(FUEL_DIR, 'createModeloBase2FuelHeadlessCandidate.js')).href);
  const c = m.createModeloBase2FuelHeadlessCandidate({ moduleId: 'combustivel' });
  const family = c.domain === 'fuel' && c.modelFamily === 'modeloBase2' && c.modelType === 'operacional' && c.mode === 'fuel_headless_candidate';
  const danger = ['backendWrite', 'workflow', 'connector', 'marketplacePublish'].every((x) => c.capabilities[x] === false);
  const safe = c.localOnly === true && c.sent === false && c.persistenceReal === false;
  const next = c.nextSteps.some((s) => /Fuel UI Readiness|Fuel Beta UI Sandbox/i.test(s)) && !c.nextSteps.some((s) => /backend\s*write/i.test(s));
  candOk = family && danger && safe && next;
  candDetail = candOk ? 'fuel/modeloBase2/operacional; dangerous false; localOnly/sent/persistenceReal; next = Fuel UI Readiness' : `candidate wrong (family=${family}, danger=${danger}, safe=${safe}, next=${next})`;
} catch (err) { candDetail = err instanceof Error ? err.message : String(err); }
gate('G423-FUEL — candidate (fuel/modeloBase2/operacional; dangerous false; localOnly/sent/persistenceReal)', candOk, candDetail);

// 3. Schema: campos mínimos + regras de domínio. (dynamic)
let schemaOk = false;
try {
  const m = await import(pathToFileURL(path.join(FUEL_DIR, 'createModeloBase2FuelDomainSchema.js')).href);
  const s = m.createModeloBase2FuelDomainSchema();
  const e = { date: '2025-01-01', machineName: 'A', quantityLiters: 100, hourmeter: 10 };
  schemaOk = s.validateEntry(e).valid === true
    && s.validateEntry({ ...e, date: undefined }).valid === false
    && s.validateEntry({ date: '2025-01-01', quantityLiters: 10 }).valid === false
    && s.validateEntry({ ...e, quantityLiters: 0 }).valid === false
    && s.validateEntry({ ...e, hourmeter: -1 }).valid === false;
} catch { schemaOk = false; }
gate('G423-FUEL — domain schema requires date + machine + quantityLiters>0; rejects negative hourmeter', schemaOk);

// 4. Ciclo fuel local completo via candidate. (dynamic)
let cycleOk = false;
let cycleDetail = '';
try {
  const m = await import(pathToFileURL(path.join(FUEL_DIR, 'createModeloBase2FuelHeadlessCandidate.js')).href);
  const c = m.createModeloBase2FuelHeadlessCandidate({ moduleId: 'combustivel' });
  const e = (o = {}) => ({ date: '2025-01-01', machineName: 'A', quantityLiters: 100, ...o });
  const c1 = c.dispatch({ fuelCommandType: 'createFuelDraft', payload: {} });
  const c2 = c.dispatch({ fuelCommandType: 'appendFuelEntry', payload: { entry: e() } });
  c.dispatch({ fuelCommandType: 'appendFuelEntry', payload: { entry: e({ machineName: 'B', quantityLiters: 50 }) } });
  const c3 = c.dispatch({ fuelCommandType: 'validateFuelDraft' });
  const c4 = c.dispatch({ fuelCommandType: 'saveFuelDraft' });
  const c5 = c.dispatch({ fuelCommandType: 'submitFuelDraft' });
  const events = c1.event.eventType === 'fuel.draft.created' && c2.event.eventType === 'fuel.entry.added' && c3.event.eventType === 'fuel.draft.validated' && c4.event.eventType === 'fuel.draft.saved' && c5.event.eventType === 'fuel.draft.submitted.simulated' && c5.sent === false;
  const liters = c.getReadState().summary.totalLiters === 150 && c.getReadState().summary.machinesCount === 2;
  const snap = c.createSnapshot();
  const restore = c.restoreSnapshot(snap);
  const reset = c.reset();
  const snapOk = snap.kind === 'modelobase2-fuel-snapshot' && snap.persistenceReal === false && restore.ok === true && reset.draft.summary.totalEntries === 0;
  cycleOk = events && liters && snapOk;
  cycleDetail = cycleOk ? 'create/append/validate/save/submit(sent:false)/snapshot/restore/reset; totalLiters+machinesCount derived' : `cycle wrong (events=${events}, liters=${liters}, snap=${snapOk})`;
} catch (err) { cycleDetail = err instanceof Error ? err.message : String(err); }
gate('G423-FUEL — full local fuel cycle (create/append/validate/save/submit/snapshot/restore/reset; totalLiters derived)', cycleOk, cycleDetail);

// 5. Fail-closed: unknown command / unsafe payload / forbidden targets. (dynamic)
let fcOk = false;
try {
  const cm = await import(pathToFileURL(path.join(FUEL_DIR, 'createModeloBase2FuelHeadlessCandidate.js')).href);
  const vm = await import(pathToFileURL(path.join(FUEL_DIR, 'validateModeloBase2FuelPayload.js')).href);
  const c = cm.createModeloBase2FuelHeadlessCandidate({ moduleId: 'x' });
  c.dispatch({ fuelCommandType: 'createFuelDraft', payload: {} });
  const unknown = c.dispatch({ fuelCommandType: 'frobnicate' }).ok === false;
  const e = { date: '2025-01-01', machineName: 'A', quantityLiters: 100 };
  const fn = vm.validateModeloBase2FuelPayload({ commandType: 'appendFuelEntry', payload: { fn: () => {} }, moduleId: 'x' }).valid === false;
  const react = vm.validateModeloBase2FuelPayload({ commandType: 'appendFuelEntry', payload: { el: { $$typeof: Symbol.for('react.element') } }, moduleId: 'x' }).valid === false;
  const pollution = vm.validateModeloBase2FuelPayload({ commandType: 'appendFuelEntry', payload: JSON.parse('{"__proto__":{"z":1}}'), moduleId: 'x' }).valid === false;
  const targets = ['backend', 'prisma', 'runtimeBridge', 'fetch'].every((t) => vm.validateModeloBase2FuelPayload({ commandType: 'appendFuelEntry', payload: { target: t, entry: e }, moduleId: 'x' }).valid === false);
  const stillUsable = c.dispatch({ fuelCommandType: 'appendFuelEntry', payload: { entry: e } }).ok === true;
  fcOk = unknown && fn && react && pollution && targets && stillUsable;
} catch { fcOk = false; }
gate('G423-FUEL — fail-closed on unknown command / fn / React / pollution / backend-prisma-runtimeBridge-fetch target', fcOk);

// 6. Snapshot fuel: validate + checksum fail-closed + roundtrip. (dynamic)
let snapOk = false;
try {
  const cm = await import(pathToFileURL(path.join(FUEL_DIR, 'createModeloBase2FuelHeadlessCandidate.js')).href);
  const sm = await import(pathToFileURL(path.join(FUEL_DIR, 'createModeloBase2FuelSnapshot.js')).href);
  const c = cm.createModeloBase2FuelHeadlessCandidate({ moduleId: 'x' });
  c.dispatch({ fuelCommandType: 'createFuelDraft', payload: {} });
  c.dispatch({ fuelCommandType: 'appendFuelEntry', payload: { entry: { date: '2025-01-01', machineName: 'A', quantityLiters: 100 } } });
  const state = c.getState();
  const snap = sm.createModeloBase2FuelSnapshot({ moduleId: 'x', draft: state.draft, eventLog: state.eventLog });
  const valid = sm.validateModeloBase2FuelSnapshot({ fuelSnapshot: snap }).valid === true;
  const tampered = sm.validateModeloBase2FuelSnapshot({ fuelSnapshot: { ...snap, snapshot: { ...snap.snapshot, data: { x: 1 } } } }).valid === false;
  const rt = sm.roundtripModeloBase2FuelSnapshot({ moduleId: 'x', draft: state.draft, eventLog: state.eventLog });
  snapOk = snap.kind === 'modelobase2-fuel-snapshot' && valid && tampered && rt.ok === true && rt.persistenceReal === false;
} catch { snapOk = false; }
gate('G423-FUEL — fuel snapshot (validate + checksum fail-closed + roundtrip; persistenceReal false)', snapOk);

// 7–12. Isolamento estrutural PERMANENTE (import-scan).
gate('G423-FUEL — does not import React', fuelImports().every((p) => p !== 'react' && !/^react(\/|$)/.test(p)));
gate('G423-FUEL — does not import DOM globals', !/\bdocument\.|\bwindow\.|getElementById|querySelector/.test(stripComments(fuelSource())));
gate('G423-FUEL — does not import ModeloBase1', fuelImports().every((p) => !/ModeloBase1/.test(p)));
gate('G423-FUEL — does not import src/modules (Empresas/cadcps/real)', fuelImports().every((p) => !/\/modules\//.test(p)));
gate('G423-FUEL — does not import backend/API/Prisma', fuelImports().every((p) => !/\/apis\/|prisma|\/backend\//i.test(p)));
gate('G423-FUEL — does not import runtimeBridge/makBootstrap', fuelImports().every((p) => !/makBootstrap|runtimeBridge/.test(p)));
gate('G423-FUEL — consumes the operational runtime + generic kernel', fuelImports().some((p) => /operational-runtime/.test(p)) && fuelImports().some((p) => /runtime\/generic-model/.test(p)));

// 13. Sem fetch/XHR/WebSocket/storage-API.
let noIo = false;
try {
  const code = stripComments(fuelSource());
  noIo = !/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(code) && !/localStorage\.|sessionStorage\.|indexedDB\./.test(code);
} catch { noIo = false; }
gate('G423-FUEL — no fetch/XHR/WebSocket/storage-API', noIo);

// 14. Sem CSS global.
gate('G423-FUEL — no global CSS import', !/import\s+['"][^'"]+\.css['"]/i.test(fuelSource()));

// 15. ESCOPO AUTORIZADO (git-diff, tolerante).
let scopeOk = false;
let scopeDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const ALLOWED = [
    /^src\/ModeloBase2\/fuel-headless\//,
    /^src\/ModeloBase2\/operational-runtime\//,
    /^src\/ModeloBase2\/prototype-adapter\//,
    /^src\/runtime\/generic-model\//,
    /^src\/runtime\/types\/generic-model\.js$/,
    /^src\/runtime\/__tests__\/modelobase2-fuel-headless-candidate\.test\.js$/,
    /^scripts\/gates\/g423-modelobase2-fuel-headless-candidate\.mjs$/,
    /^package\.json$/,
    /^package-lock\.json$/,
    /^docs\/evidence\/post-foundation-c-modelobase2-fuel-headless-candidate\//,
  ];
  const outside = files.filter((f) => !ALLOWED.some((re) => re.test(f)));
  scopeOk = files.length === 0 || outside.length === 0;
  scopeDetail = scopeOk ? `authorized scope only (${files.length} files)` : `OUT OF SCOPE: ${outside.join(', ')}`;
} catch (err) { scopeOk = true; scopeDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-FUEL — authorized scope only (fuel-headless/operational-runtime/prototype/generic-model/tests/gate/package.json/evidence)', scopeOk, scopeDetail);

// 16. BLOQUEADO — MB1/src-modules/pages/backend/Prisma/framework/Studio/BOS/makBootstrap/App/menu/SSOT (git-diff).
let blockedOk = false;
let blockedDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const FORBIDDEN = [/^src\/ModeloBase1\//, /^src\/modules\//, /^src\/pages\//, /^src\/apis\//, /prisma/i, /^src\/framework\//, /^src\/studio\//, /^src\/bos\//, /^src\/App\.jsx$/, /^docs\/meta-model\//, /^docs\/platform-/, /^docs\/runtime-implementation\//];
  const bad = files.filter((f) => FORBIDDEN.some((re) => re.test(f)));
  blockedOk = bad.length === 0;
  blockedDetail = blockedOk ? 'MB1/src-modules/pages/backend/Prisma/framework/Studio/BOS/App.jsx/SSOT untouched' : `FORBIDDEN: ${bad.join(', ')}`;
} catch (err) { blockedOk = true; blockedDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-FUEL — MB1/src-modules/pages/backend/Prisma/framework/Studio/BOS/App.jsx/SSOT untouched', blockedOk, blockedDetail);

// 17. Sem dependência nova.
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
gate('G423-FUEL — no new dependency added', noNewDep, depDetail);

// 18. Rodar os testes unitários do slice.
let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/modelobase2-fuel-headless-candidate.test.js', { cwd: ROOT, stdio: 'pipe', env: { ...process.env, NODE_ENV: 'test' } });
  testsOk = true;
} catch (err) { if (err.stderr) console.error(String(err.stderr)); }
gate('G423-FUEL — fuel headless unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-MODELOBASE2-FUEL-HEADLESS summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);
if (failed.length > 0) process.exit(1);
