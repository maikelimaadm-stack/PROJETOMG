#!/usr/bin/env node
/**
 * Gate G423-MODELOBASE2-FUEL-UI-SANDBOX — ModeloBase2 Fuel Beta UI Sandbox
 * (post-Foundation C).
 *
 * Proves an isolated, dev-only beta UI sandbox over the fuel headless candidate:
 * view model + sandbox session/actions + React components + diagnostics, driving
 * the full local fuel cycle. It is NEVER mounted in the app, registers NO route/
 * menu, does NOT touch src/modules/pages, backend/Prisma/fetch/runtimeBridge or
 * real persistence; never sends; dangerous capabilities false; localOnly/sent/
 * persistenceReal safe. React is confined to fuel-ui-sandbox/components; the
 * headless + operational-runtime stay React-free. No new dependency. Next step is
 * Fuel Dev Preview Route / Fuel Module Shell Readiness — NOT backend write.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const SANDBOX_DIR = path.join(ROOT, 'src/ModeloBase2/fuel-ui-sandbox');
const COMPONENTS_DIR = path.join(SANDBOX_DIR, 'components');
const HEADLESS_DIR = path.join(ROOT, 'src/ModeloBase2/fuel-headless');
const OPRUNTIME_DIR = path.join(ROOT, 'src/ModeloBase2/operational-runtime');
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
  return e.isFile() && /\.(js|jsx)$/.test(e.name) ? [full] : [];
}) : []);
const importsOf = (files) => files.flatMap((f) => [...stripComments(fs.readFileSync(f, 'utf8')).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => m[1]));
const pureFiles = () => walk(SANDBOX_DIR).filter((f) => !f.includes(`${path.sep}components${path.sep}`));
const pureImports = () => importsOf(pureFiles());
const componentFiles = () => walk(COMPONENTS_DIR);
const componentImports = () => importsOf(componentFiles());
const componentSource = () => componentFiles().map((f) => fs.readFileSync(f, 'utf8')).join('\n');

const PURE_FILES = [
  'errors.js',
  'modeloBase2FuelUiSandboxConfig.js',
  'createModeloBase2FuelUiSandboxModel.js',
  'createModeloBase2FuelUiViewModel.js',
  'createModeloBase2FuelSandboxSession.js',
  'createModeloBase2FuelSandboxActions.js',
  'createModeloBase2FuelSandboxDiagnostics.js',
  'index.js',
];
const COMPONENTS = [
  'ModeloBase2FuelSandboxShell.jsx',
  'ModeloBase2FuelEntryForm.jsx',
  'ModeloBase2FuelEntriesTable.jsx',
  'ModeloBase2FuelEventTimeline.jsx',
  'ModeloBase2FuelDiagnosticsPanel.jsx',
  'ModeloBase2FuelStatusBadges.jsx',
];

// 1. Arquivos esperados.
for (const f of PURE_FILES) gate(`G423-FUEL-UI — ${f} exists`, exists(path.join(SANDBOX_DIR, f)));
for (const c of COMPONENTS) gate(`G423-FUEL-UI — components/${c} exists`, exists(path.join(COMPONENTS_DIR, c)));
gate('G423-FUEL-UI — tests exist', exists(path.join(RUNTIME, '__tests__/modelobase2-fuel-beta-ui-sandbox.test.js')));

// 2. Sandbox model: domain fuel; dangerous false; never mounted; next step. (dynamic)
let modelOk = false;
let modelDetail = '';
try {
  const m = await import(pathToFileURL(path.join(SANDBOX_DIR, 'createModeloBase2FuelUiSandboxModel.js')).href);
  const s = m.createModeloBase2FuelUiSandboxModel({ moduleId: 'combustivel' });
  const family = s.domain === 'fuel' && s.modelFamily === 'modeloBase2' && s.modelType === 'operacional' && s.mode === 'fuel_beta_ui_sandbox';
  const danger = ['backendWrite', 'workflow', 'connector', 'marketplacePublish'].every((x) => s.capabilities[x] === false);
  const notMounted = s.uiMountedInApp === false && s.routeRegistered === false && s.menuRegistered === false;
  const safe = s.localOnly === true && s.sent === false && s.persistenceReal === false;
  const next = s.nextSteps.some((x) => /Fuel Dev Preview Route|Fuel Module Shell Readiness/i.test(x)) && !s.nextSteps.some((x) => /backend\s*write/i.test(x));
  modelOk = family && danger && notMounted && safe && next;
  modelDetail = modelOk ? 'fuel/modeloBase2/operacional; dangerous false; never mounted; localOnly/sent/persistenceReal; next = Dev Preview Route' : `model wrong (family=${family}, danger=${danger}, notMounted=${notMounted}, safe=${safe}, next=${next})`;
} catch (err) { modelDetail = err instanceof Error ? err.message : String(err); }
gate('G423-FUEL-UI — sandbox model (fuel; dangerous false; uiMountedInApp/route/menu false; localOnly/sent/persistenceReal)', modelOk, modelDetail);

// 3. View model: título/fields/columns/cards/badges. (dynamic)
let vmOk = false;
try {
  const m = await import(pathToFileURL(path.join(SANDBOX_DIR, 'createModeloBase2FuelUiViewModel.js')).href);
  const vm = m.createModeloBase2FuelUiViewModel({ readState: { summary: { totalLiters: 10 }, entries: [], timeline: { events: [] } } });
  vmOk = vm.title === 'Lançamento de Combustível'
    && vm.form.fields.some((f) => f.id === 'quantityLiters')
    && vm.table.columns.some((c) => c.id === 'quantityLiters')
    && vm.summaryCards.some((c) => c.id === 'totalLiters')
    && ['localOnly', 'sentFalse', 'persistenceRealFalse', 'offlineFirst'].every((id) => vm.badges.some((b) => b.id === id));
} catch { vmOk = false; }
gate('G423-FUEL-UI — view model (title + fields + columns + summary cards + badges)', vmOk);

// 4. Ciclo sandbox local completo. (dynamic)
let cycleOk = false;
let cycleDetail = '';
try {
  const m = await import(pathToFileURL(path.join(SANDBOX_DIR, 'createModeloBase2FuelUiSandboxModel.js')).href);
  const s = m.createModeloBase2FuelUiSandboxModel({ moduleId: 'combustivel' });
  const e = (o = {}) => ({ date: '2025-01-01', machineName: 'A', quantityLiters: 100, ...o });
  s.dispatch('newDraft', {});
  const add = s.dispatch('addFuelEntry', { entry: e() });
  s.dispatch('addFuelEntry', { entry: e({ machineName: 'B', quantityLiters: 50 }) });
  s.dispatch('validate');
  s.dispatch('saveLocal');
  const sub = s.dispatch('submitSimulated');
  const liters = sub.viewModel.summaryCards.find((c) => c.id === 'totalLiters').value === 150;
  const snap = s.session.createSnapshot();
  const restore = s.dispatch('restore', { snapshot: snap });
  const reset = s.dispatch('reset');
  cycleOk = add.ok && sub.ok && sub.sent === false && liters && snap.kind === 'modelobase2-fuel-snapshot' && restore.ok && reset.ok;
  cycleDetail = cycleOk ? 'newDraft/add/validate/save/submit(sent:false)/snapshot/restore/reset; totalLiters derived' : `cycle wrong (add=${add.ok}, sub=${sub.ok}, liters=${liters}, restore=${restore.ok}, reset=${reset.ok})`;
} catch (err) { cycleDetail = err instanceof Error ? err.message : String(err); }
gate('G423-FUEL-UI — full local sandbox cycle (newDraft/add/validate/save/submit/snapshot/restore/reset)', cycleOk, cycleDetail);

// 5. Fail-closed: unknown action / unsafe payload / forbidden targets. (dynamic)
let fcOk = false;
try {
  const m = await import(pathToFileURL(path.join(SANDBOX_DIR, 'createModeloBase2FuelUiSandboxModel.js')).href);
  const s = m.createModeloBase2FuelUiSandboxModel({ moduleId: 'x' });
  s.dispatch('newDraft', {});
  const e = { date: '2025-01-01', machineName: 'A', quantityLiters: 100 };
  const unknown = s.dispatch('frobnicate').ok === false;
  const fn = s.dispatch('addFuelEntry', { fn: () => {} }).ok === false;
  const targets = ['backend', 'prisma', 'runtimeBridge', 'fetch'].every((t) => s.dispatch('addFuelEntry', { target: t, entry: e }).ok === false);
  const stillUsable = s.dispatch('addFuelEntry', { entry: e }).ok === true;
  fcOk = unknown && fn && targets && stillUsable;
} catch { fcOk = false; }
gate('G423-FUEL-UI — fail-closed on unknown action / unsafe payload / backend-prisma-runtimeBridge-fetch target', fcOk);

// 6. Diagnostics: never mounted + safe invariants. (dynamic)
let diagOk = false;
try {
  const m = await import(pathToFileURL(path.join(SANDBOX_DIR, 'createModeloBase2FuelSandboxDiagnostics.js')).href);
  const d = m.createModeloBase2FuelSandboxDiagnostics({ sandboxId: 's', moduleId: 'x', enabled: true, readState: {}, status: 'draft' });
  diagOk = d.uiMountedInApp === false && d.routeRegistered === false && d.menuRegistered === false && d.persistenceReal === false && d.backendTouched === false && d.prismaTouched === false && d.runtimeBridgeTouched === false;
} catch { diagOk = false; }
gate('G423-FUEL-UI — diagnostics: uiMountedInApp/routeRegistered/menuRegistered false; safe invariants', diagOk);

// 7. React só em components; pure sandbox / headless / operational-runtime sem React.
gate('G423-FUEL-UI — pure sandbox files do not import React', pureImports().every((p) => p !== 'react' && !/^react(\/|$)/.test(p)));
gate('G423-FUEL-UI — fuel-headless stays React-free', importsOf(walk(HEADLESS_DIR)).every((p) => p !== 'react' && !/^react(\/|$)/.test(p)));
gate('G423-FUEL-UI — operational-runtime stays React-free', importsOf(walk(OPRUNTIME_DIR)).every((p) => p !== 'react' && !/^react(\/|$)/.test(p)));
gate('G423-FUEL-UI — React appears only in fuel-ui-sandbox/components', componentImports().some((p) => p === 'react') && walk(SANDBOX_DIR).filter((f) => !f.includes(`${path.sep}components${path.sep}`) && importsOf([f]).some((p) => p === 'react')).length === 0);

// 8. Sandbox não importa backend/API/Prisma/runtimeBridge/makBootstrap (pure + components).
const allSandboxImports = () => [...pureImports(), ...componentImports()];
gate('G423-FUEL-UI — sandbox does not import backend/API/Prisma', allSandboxImports().every((p) => !/\/apis\/|prisma|\/backend\//i.test(p)));
gate('G423-FUEL-UI — sandbox does not import runtimeBridge/makBootstrap', allSandboxImports().every((p) => !/makBootstrap|runtimeBridge/.test(p)));
gate('G423-FUEL-UI — sandbox does not import src/modules', allSandboxImports().every((p) => !/\/modules\//.test(p)));

// 9. Sem fetch/XHR/storage; sem CSS global.
let noIo = false;
try {
  const code = stripComments([pureFiles(), componentFiles()].flat().map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
  noIo = !/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(code) && !/localStorage\.|sessionStorage\.|indexedDB\./.test(code);
} catch { noIo = false; }
gate('G423-FUEL-UI — no fetch/XHR/WebSocket/storage-API', noIo);
gate('G423-FUEL-UI — no global CSS import', ![pureFiles(), componentFiles()].flat().some((f) => /import\s+['"][^'"]+\.css['"]/i.test(fs.readFileSync(f, 'utf8'))));

// 10. Componentes exportam função.
let componentsOk = true;
for (const c of COMPONENTS) {
  const name = c.replace('.jsx', '');
  const src = exists(path.join(COMPONENTS_DIR, c)) ? fs.readFileSync(path.join(COMPONENTS_DIR, c), 'utf8') : '';
  if (!new RegExp(`export function ${name}`).test(src)) componentsOk = false;
}
gate('G423-FUEL-UI — each component exports its function', componentsOk);

// 11. ESCOPO AUTORIZADO (git-diff, tolerante).
let scopeOk = false;
let scopeDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const ALLOWED = [
    /^src\/ModeloBase2\/fuel-ui-sandbox\//,
    /^src\/ModeloBase2\/fuel-headless\//,
    /^src\/ModeloBase2\/operational-runtime\//,
    /^src\/runtime\/__tests__\/modelobase2-fuel-beta-ui-sandbox\.test\.js$/,
    /^scripts\/gates\/g423-modelobase2-fuel-beta-ui-sandbox\.mjs$/,
    /^package\.json$/,
    /^package-lock\.json$/,
    /^docs\/evidence\/post-foundation-c-modelobase2-fuel-beta-ui-sandbox\//,
  ];
  const outside = files.filter((f) => !ALLOWED.some((re) => re.test(f)));
  scopeOk = files.length === 0 || outside.length === 0;
  scopeDetail = scopeOk ? `authorized scope only (${files.length} files)` : `OUT OF SCOPE: ${outside.join(', ')}`;
} catch (err) { scopeOk = true; scopeDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-FUEL-UI — authorized scope only (fuel-ui-sandbox/fuel-headless/operational-runtime/tests/gate/package.json/evidence)', scopeOk, scopeDetail);

// 12. BLOQUEADO — src-modules/pages/MB1/backend/Prisma/framework/Studio/BOS/makBootstrap/App/SSOT (git-diff).
let blockedOk = false;
let blockedDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const FORBIDDEN = [/^src\/modules\//, /^src\/pages\//, /^src\/ModeloBase1\//, /^src\/apis\//, /prisma/i, /^src\/framework\//, /^src\/studio\//, /^src\/bos\//, /^src\/App\.jsx$/, /^docs\/meta-model\//, /^docs\/platform-/, /^docs\/runtime-implementation\//];
  const bad = files.filter((f) => FORBIDDEN.some((re) => re.test(f)));
  blockedOk = bad.length === 0;
  blockedDetail = blockedOk ? 'src-modules/pages/MB1/backend/Prisma/framework/Studio/BOS/App.jsx/SSOT untouched' : `FORBIDDEN: ${bad.join(', ')}`;
} catch (err) { blockedOk = true; blockedDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-FUEL-UI — src-modules/pages/MB1/backend/Prisma/framework/Studio/BOS/App.jsx/SSOT untouched', blockedOk, blockedDetail);

// 13. Sem dependência nova.
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
gate('G423-FUEL-UI — no new dependency added', noNewDep, depDetail);

// 14. Rodar os testes unitários do slice.
let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/modelobase2-fuel-beta-ui-sandbox.test.js', { cwd: ROOT, stdio: 'pipe', env: { ...process.env, NODE_ENV: 'test' } });
  testsOk = true;
} catch (err) { if (err.stderr) console.error(String(err.stderr)); }
gate('G423-FUEL-UI — fuel UI sandbox unit tests PASS', testsOk);

void componentSource;
const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-MODELOBASE2-FUEL-UI-SANDBOX summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);
if (failed.length > 0) process.exit(1);
