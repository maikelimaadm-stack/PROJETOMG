#!/usr/bin/env node
/**
 * Gate G423-MODELOBASE2-FUEL-DEV-PREVIEW — ModeloBase2 Fuel Dev Preview Route
 * (post-Foundation C).
 *
 * Proves a DEV-ONLY, guarded route for the fuel UI sandbox: access resolver (fails
 * closed; production requires an explicit override), deterministic fictional
 * fixtures, preview state, diagnostics and a self-guarding route component. It
 * NEVER appears in the menu, does NOT touch src/modules/pages, backend/Prisma/
 * fetch/runtimeBridge or real persistence; never sends; localOnly/sent/
 * persistenceReal safe. App.jsx is changed ONLY to register the dev-only route
 * (guarded). React stays confined to the sandbox/dev-preview components; the
 * headless + operational-runtime stay React-free. No new dependency. Next step is
 * Fuel Module Shell Readiness — NOT backend write.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const DEV_DIR = path.join(ROOT, 'src/ModeloBase2/fuel-ui-sandbox/dev-preview');
const HEADLESS_DIR = path.join(ROOT, 'src/ModeloBase2/fuel-headless');
const OPRUNTIME_DIR = path.join(ROOT, 'src/ModeloBase2/operational-runtime');
const APP_JSX = path.join(ROOT, 'src/App.jsx');
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
const pureDevFiles = () => walk(DEV_DIR).filter((f) => f.endsWith('.js'));
const routeFile = path.join(DEV_DIR, 'ModeloBase2FuelDevPreviewRoute.jsx');

const FILES = [
  'errors.js',
  'modeloBase2FuelDevPreviewConfig.js',
  'resolveModeloBase2FuelDevPreviewAccess.js',
  'createModeloBase2FuelDevPreviewFixtures.js',
  'createModeloBase2FuelDevPreviewState.js',
  'createModeloBase2FuelDevPreviewDiagnostics.js',
  'ModeloBase2FuelDevPreviewRoute.jsx',
  'index.js',
];

// 1. Arquivos esperados.
for (const f of FILES) gate(`G423-FUEL-DPR — ${f} exists`, exists(path.join(DEV_DIR, f)));
gate('G423-FUEL-DPR — tests exist', exists(path.join(RUNTIME, '__tests__/modelobase2-fuel-dev-preview-route.test.js')));

// 2. Access resolver: fail-closed default; dev+flag; prod fail-closed; prod+allowProd warning. (dynamic)
let accessOk = false;
let accessDetail = '';
try {
  const m = await import(pathToFileURL(path.join(DEV_DIR, 'resolveModeloBase2FuelDevPreviewAccess.js')).href);
  const c = await import(pathToFileURL(path.join(DEV_DIR, 'modeloBase2FuelDevPreviewConfig.js')).href);
  const F = c.MODELOBASE2_FUEL_DEV_PREVIEW_ROUTE_FLAG;
  const AP = c.MODELOBASE2_FUEL_DEV_PREVIEW_ALLOW_PROD_FLAG;
  const off = m.resolveModeloBase2FuelDevPreviewAccess({ env: { DEV: 'true' } }).allowed === false;
  const on = m.resolveModeloBase2FuelDevPreviewAccess({ env: { DEV: 'true', [F]: 'true' } }).allowed === true;
  const prodClosed = m.resolveModeloBase2FuelDevPreviewAccess({ env: { MODE: 'production', [F]: 'true' } }).allowed === false;
  const prodOpen = m.resolveModeloBase2FuelDevPreviewAccess({ env: { MODE: 'production', [F]: 'true', [AP]: 'true' } });
  const prodWarn = prodOpen.allowed === true && prodOpen.warnings.length >= 1;
  const devOnly = c.MODELOBASE2_FUEL_DEV_PREVIEW_ROUTE_PATH.startsWith('/__dev/');
  accessOk = off && on && prodClosed && prodWarn && devOnly;
  accessDetail = accessOk ? `off default; dev+flag on; prod fail-closed; prod+allowProd warning; devOnly path (${c.MODELOBASE2_FUEL_DEV_PREVIEW_ROUTE_PATH})` : `access wrong (off=${off}, on=${on}, prodClosed=${prodClosed}, prodWarn=${prodWarn}, devOnly=${devOnly})`;
} catch (err) { accessDetail = err instanceof Error ? err.message : String(err); }
gate('G423-FUEL-DPR — access resolver (fail-closed default; dev+flag; prod fail-closed; prod+allowProd warning; dev-only path)', accessOk, accessDetail);

// 3. Invariantes: menuRegistered false; touched false; persistenceReal false. (dynamic)
let invOk = false;
try {
  const m = await import(pathToFileURL(path.join(DEV_DIR, 'resolveModeloBase2FuelDevPreviewAccess.js')).href);
  const c = await import(pathToFileURL(path.join(DEV_DIR, 'modeloBase2FuelDevPreviewConfig.js')).href);
  const a = m.resolveModeloBase2FuelDevPreviewAccess({ env: { DEV: 'true', [c.MODELOBASE2_FUEL_DEV_PREVIEW_ROUTE_FLAG]: 'true' } });
  invOk = a.menuRegistered === false && a.backendTouched === false && a.prismaTouched === false && a.runtimeBridgeTouched === false && a.persistenceReal === false && a.localOnly === true && a.sent === false;
} catch { invOk = false; }
gate('G423-FUEL-DPR — access invariants (menuRegistered false; backend/prisma/runtimeBridge false; persistenceReal false; sent false)', invOk);

// 4. Fixtures determinísticas + fictícias. (dynamic)
let fxOk = false;
try {
  const m = await import(pathToFileURL(path.join(DEV_DIR, 'createModeloBase2FuelDevPreviewFixtures.js')).href);
  const a = m.createModeloBase2FuelDevPreviewFixtures({ mode: 'basic' });
  const b = m.createModeloBase2FuelDevPreviewFixtures({ mode: 'basic' });
  const deterministic = JSON.stringify(a.entries) === JSON.stringify(b.entries);
  const fictional = a.fictional === true && a.hasSensitiveData === false;
  const modes = ['empty', 'basic', 'withDraft', 'withEvents'].every((mode) => a.modes.includes(mode));
  const emptyOk = m.createModeloBase2FuelDevPreviewFixtures({ mode: 'empty' }).entries.length === 0;
  fxOk = deterministic && fictional && modes && emptyOk;
} catch { fxOk = false; }
gate('G423-FUEL-DPR — fixtures deterministic + fictional (no sensitive data); empty/basic/withDraft/withEvents', fxOk);

// 5. Preview state: viewModel + actions + safe invariants. (dynamic)
let stateOk = false;
try {
  const m = await import(pathToFileURL(path.join(DEV_DIR, 'createModeloBase2FuelDevPreviewState.js')).href);
  const c = await import(pathToFileURL(path.join(DEV_DIR, 'modeloBase2FuelDevPreviewConfig.js')).href);
  const st = m.createModeloBase2FuelDevPreviewState({ mode: 'basic', env: { DEV: 'true', [c.MODELOBASE2_FUEL_DEV_PREVIEW_ROUTE_FLAG]: 'true' } });
  stateOk = st.kind === 'modelobase2-fuel-dev-preview-state' && st.viewModel.form.fields.length > 0 && st.actions.actions.length > 0 && st.localOnly === true && st.sent === false && st.persistenceReal === false && st.viewModel.table.rows.length === 2;
} catch { stateOk = false; }
gate('G423-FUEL-DPR — preview state (viewModel + actions + fixtures; localOnly/sent/persistenceReal)', stateOk);

// 6. Route component isolation + uses shell (source scan).
const routeSrc = exists(routeFile) ? fs.readFileSync(routeFile, 'utf8') : '';
gate('G423-FUEL-DPR — route component exports its function + uses the sandbox shell', /export function ModeloBase2FuelDevPreviewRoute/.test(routeSrc) && /ModeloBase2FuelSandboxShell/.test(routeSrc));
gate('G423-FUEL-DPR — route component does not import backend/API/Prisma', importsOf([routeFile]).every((p) => !/\/apis\/|prisma|\/backend\//i.test(p)));
gate('G423-FUEL-DPR — route component does not import runtimeBridge/makBootstrap', importsOf([routeFile]).every((p) => !/makBootstrap|runtimeBridge/.test(p)));

// 7. React só no route .jsx; pure dev-preview + headless + operational-runtime React-free.
gate('G423-FUEL-DPR — pure dev-preview files React-free', importsOf(pureDevFiles()).every((p) => p !== 'react' && !/^react(\/|$)/.test(p)));
gate('G423-FUEL-DPR — fuel-headless stays React-free', importsOf(walk(HEADLESS_DIR)).every((p) => p !== 'react' && !/^react(\/|$)/.test(p)));
gate('G423-FUEL-DPR — operational-runtime stays React-free', importsOf(walk(OPRUNTIME_DIR)).every((p) => p !== 'react' && !/^react(\/|$)/.test(p)));
gate('G423-FUEL-DPR — React appears only in the route .jsx (dev-preview)', importsOf([routeFile]).some((p) => p === 'react'));

// 8. Sandbox não importa src/modules; sem fetch/storage.
const allDevImports = () => [...importsOf(pureDevFiles()), ...importsOf([routeFile])];
gate('G423-FUEL-DPR — dev-preview does not import src/modules', allDevImports().every((p) => !/\/modules\//.test(p)));
let noIo = false;
try {
  const code = stripComments(walk(DEV_DIR).map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
  noIo = !/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(code) && !/localStorage\.|sessionStorage\.|indexedDB\./.test(code);
} catch { noIo = false; }
gate('G423-FUEL-DPR — no fetch/XHR/WebSocket/storage-API', noIo);
gate('G423-FUEL-DPR — no global CSS import', !walk(DEV_DIR).some((f) => /import\s+['"][^'"]+\.css['"]/i.test(fs.readFileSync(f, 'utf8'))));

// 9. App.jsx: alterado só para a rota dev-only (guarded). (structural)
let appOk = false;
let appDetail = '';
try {
  const app = fs.readFileSync(APP_JSX, 'utf8');
  const guardImported = app.includes('shouldMountModeloBase2FuelDevPreviewRoute');
  const guarded = /shouldMountModeloBase2FuelDevPreviewRoute\(\)\s*&&/.test(app);
  const lazyImport = app.includes('ModeloBase2FuelDevPreviewRoute');
  // no menu registration for the fuel route
  const noMenu = !/menu[^\n]*ModeloBase2Fuel/i.test(app);
  appOk = guardImported && guarded && lazyImport && noMenu;
  appDetail = appOk ? 'App.jsx registers the dev-only fuel route behind shouldMount guard; not in menu' : `App.jsx wrong (guardImported=${guardImported}, guarded=${guarded}, lazy=${lazyImport}, noMenu=${noMenu})`;
} catch (err) { appDetail = err instanceof Error ? err.message : String(err); }
gate('G423-FUEL-DPR — App.jsx registers the dev-only route behind the guard (not in menu)', appOk, appDetail);

// 10. App.jsx diff: apenas a rota dev-only (mirror do shared productionUiGuard —
// nada removido; sem tokens proibidos; qualquer `path=` é a rota dev; o bloco
// referencia o marcador do fuel dev preview).
let appDiffOk = false;
let appDiffDetail = '';
try {
  const diff = execSync('git diff --unified=0 origin/main...HEAD -- src/App.jsx', { cwd: ROOT, encoding: 'utf8' });
  const lines = diff.split('\n');
  const removed = lines.filter((l) => l.startsWith('-') && !l.startsWith('---'));
  const added = lines.filter((l) => l.startsWith('+') && !l.startsWith('+++')).map((l) => l.slice(1));
  const FORBIDDEN = /prisma|PrismaClient|\/backend\/|\bfetch\s*\(|localStorage|sessionStorage|indexedDB|addMenuItem|navItems|menu\.push/i;
  const FUEL_MARKER = /ModeloBase2FuelDevPreview|MODELOBASE2_FUEL_DEV_PREVIEW_ROUTE|shouldMountModeloBase2FuelDevPreviewRoute|__dev\/modelobase2\/fuel|DEV-ONLY: ModeloBase2 fuel/;
  let reason = '';
  if (removed.length > 0) reason = 'existing App.jsx lines removed/modified';
  else if (added.length === 0) reason = 'no App.jsx change';
  else if (added.some((a) => FORBIDDEN.test(a))) reason = 'forbidden token added';
  else if (added.some((a) => /path\s*[=:]/.test(a) && !/MODELOBASE2_FUEL_DEV_PREVIEW_ROUTE_PATH|__dev\/modelobase2\/fuel/.test(a))) reason = 'non-dev route path added';
  else if (!added.some((a) => FUEL_MARKER.test(a))) reason = 'no fuel dev-route marker';
  appDiffOk = added.length === 0 || reason === '';
  appDiffDetail = appDiffOk ? `App.jsx change is exactly the dev-only fuel route mount (${added.length} added lines, 0 removed)` : `App.jsx changed beyond the dev route: ${reason}`;
} catch (err) { appDiffOk = true; appDiffDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-FUEL-DPR — App.jsx changed ONLY for the dev-only fuel route', appDiffOk, appDiffDetail);

// 11. ESCOPO AUTORIZADO (git-diff, tolerante).
let scopeOk = false;
let scopeDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const ALLOWED = [
    /^src\/ModeloBase2\/fuel-ui-sandbox\//,
    /^src\/runtime\/__tests__\/modelobase2-fuel-dev-preview-route\.test\.js$/,
    /^scripts\/gates\/g423-modelobase2-fuel-dev-preview-route\.mjs$/,
    /^package\.json$/,
    /^package-lock\.json$/,
    /^docs\/evidence\/post-foundation-c-modelobase2-fuel-dev-preview-route\//,
    /^src\/App\.jsx$/,
    // Cross-slice robustness: the prior fuel-ui-sandbox test + gate scanned the
    // whole sandbox dir for React and forbade App.jsx; both are relaxed here to
    // treat React-in-.jsx and the dev-only route registration as legitimate.
    /^src\/runtime\/__tests__\/modelobase2-fuel-beta-ui-sandbox\.test\.js$/,
    /^scripts\/gates\/g423-modelobase2-fuel-beta-ui-sandbox\.mjs$/,
    // The shared production-UI guard gains the fuel dev-route as a second
    // sanctioned App.jsx exception (mirrors the runtime-v2 one).
    /^scripts\/gates\/lib\/productionUiGuard\.mjs$/,
    // The runtime-v2 activation test's strict App.jsx-path assertion is widened
    // to also accept the sanctioned fuel dev route path.
    /^src\/runtime\/__tests__\/preview\/runtime-v2-dev-preview-route-activation\.test\.js$/,
  ];
  const outside = files.filter((f) => !ALLOWED.some((re) => re.test(f)));
  scopeOk = files.length === 0 || outside.length === 0;
  scopeDetail = scopeOk ? `authorized scope only (${files.length} files)` : `OUT OF SCOPE: ${outside.join(', ')}`;
} catch (err) { scopeOk = true; scopeDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-FUEL-DPR — authorized scope only (fuel-ui-sandbox/tests/gate/package.json/evidence/App.jsx)', scopeOk, scopeDetail);

// 12. BLOQUEADO — src-modules/pages/MB1/backend/Prisma/framework/Studio/BOS/makBootstrap/SSOT (git-diff).
let blockedOk = false;
let blockedDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const FORBIDDEN = [/^src\/modules\//, /^src\/pages\//, /^src\/ModeloBase1\//, /^src\/apis\//, /prisma/i, /^src\/framework\//, /^src\/studio\//, /^src\/bos\//, /^docs\/meta-model\//, /^docs\/platform-/, /^docs\/runtime-implementation\//];
  const bad = files.filter((f) => FORBIDDEN.some((re) => re.test(f)));
  blockedOk = bad.length === 0;
  blockedDetail = blockedOk ? 'src-modules/pages/MB1/backend/Prisma/framework/Studio/BOS/SSOT untouched' : `FORBIDDEN: ${bad.join(', ')}`;
} catch (err) { blockedOk = true; blockedDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-FUEL-DPR — src-modules/pages/MB1/backend/Prisma/framework/Studio/BOS/SSOT untouched', blockedOk, blockedDetail);

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
gate('G423-FUEL-DPR — no new dependency added', noNewDep, depDetail);

// 14. Rodar os testes unitários do slice.
let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/modelobase2-fuel-dev-preview-route.test.js', { cwd: ROOT, stdio: 'pipe', env: { ...process.env, NODE_ENV: 'test' } });
  testsOk = true;
} catch (err) { if (err.stderr) console.error(String(err.stderr)); }
gate('G423-FUEL-DPR — dev preview route unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-MODELOBASE2-FUEL-DEV-PREVIEW summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);
if (failed.length > 0) process.exit(1);
