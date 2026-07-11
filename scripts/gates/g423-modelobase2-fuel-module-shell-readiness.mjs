#!/usr/bin/env node
/**
 * Gate G423-MODELOBASE2-FUEL-MODULE-SHELL — ModeloBase2 Fuel Module Shell Readiness
 * (post-Foundation C).
 *
 * Proves a READINESS layer that PREPARES a future real fuel module: module
 * contract, metadata, route/menu/permission plans, persistence boundary, UI
 * composition readiness, diagnostics and fallback. It registers NOTHING — no
 * module, no route, no menu; it does NOT touch src/modules/pages, App.jsx, the
 * menu, backend/Prisma/fetch/runtimeBridge or real persistence; never sends;
 * localOnly/sent/persistenceReal safe. React stays confined to the OPTIONAL shell
 * preview `.jsx`; every helper is React-free. No new dependency. Next step is Fuel
 * Controlled Module Registration or Fuel Beta Module Shell Candidate — NOT backend
 * write.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const SHELL_DIR = path.join(ROOT, 'src/ModeloBase2/fuel-module-shell');
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
const pureShellFiles = () => walk(SHELL_DIR).filter((f) => f.endsWith('.js'));
const jsxShellFiles = () => walk(SHELL_DIR).filter((f) => f.endsWith('.jsx'));

const FILES = [
  'errors.js',
  'modeloBase2FuelModuleShellConfig.js',
  'createModeloBase2FuelModuleShellReadiness.js',
  'createModeloBase2FuelModuleContract.js',
  'createModeloBase2FuelModuleMetadata.js',
  'createModeloBase2FuelModuleRoutePlan.js',
  'createModeloBase2FuelModuleMenuPlan.js',
  'createModeloBase2FuelModulePermissionPlan.js',
  'createModeloBase2FuelModulePersistenceBoundary.js',
  'createModeloBase2FuelModuleUiComposition.js',
  'createModeloBase2FuelModuleReadinessDiagnostics.js',
  'createModeloBase2FuelModuleFallback.js',
  'index.js',
];

// 1. Arquivos esperados.
for (const f of FILES) gate(`G423-FUEL-MSR — ${f} exists`, exists(path.join(SHELL_DIR, f)));
gate('G423-FUEL-MSR — tests exist', exists(path.join(RUNTIME, '__tests__/modelobase2-fuel-module-shell-readiness.test.js')));

// 2. Readiness composer: identity + no-registration invariants. (dynamic)
let readyOk = false;
let readyDetail = '';
try {
  const m = await import(pathToFileURL(path.join(SHELL_DIR, 'createModeloBase2FuelModuleShellReadiness.js')).href);
  const c = await import(pathToFileURL(path.join(SHELL_DIR, 'modeloBase2FuelModuleShellConfig.js')).href);
  const r = m.createModeloBase2FuelModuleShellReadiness({ env: { DEV: 'true', [c.FUEL_MODULE_SHELL_READINESS_FLAG]: 'true' } });
  const identity = r.domain === 'fuel' && r.moduleId === 'modelobase2-fuel' && r.modelFamily === 'modeloBase2' && r.modelType === 'operacional';
  const noReg = r.moduleRegistered === false && r.routeRegistered === false && r.menuRegistered === false && r.backendRegistered === false;
  const safe = r.localOnly === true && r.sent === false && r.persistenceReal === false;
  readyOk = identity && noReg && safe;
  readyDetail = readyOk ? 'domain/moduleId/family/type OK; nothing registered; localOnly/sent:false/persistenceReal:false' : `wrong (identity=${identity}, noReg=${noReg}, safe=${safe})`;
} catch (err) { readyDetail = err instanceof Error ? err.message : String(err); }
gate('G423-FUEL-MSR — readiness composer (identity; moduleRegistered/routeRegistered/menuRegistered/backendRegistered false; safe)', readyOk, readyDetail);

// 3. Module contract: fuel commands/events; dangerous capabilities false. (dynamic)
let contractOk = false;
try {
  const m = await import(pathToFileURL(path.join(SHELL_DIR, 'createModeloBase2FuelModuleContract.js')).href);
  const c = m.createModeloBase2FuelModuleContract();
  const cmds = c.commands.includes('createFuelDraft') && c.commands.includes('submitFuelDraft');
  const evts = c.events.includes('fuel.draft.created') && c.events.includes('fuel.entry.added');
  const danger = c.capabilities.backendWrite === false && c.capabilities.connector === false && c.capabilities.workflow === false && c.capabilities.marketplacePublish === false;
  contractOk = cmds && evts && danger;
} catch { contractOk = false; }
gate('G423-FUEL-MSR — module contract (fuel commands + events; dangerous capabilities false)', contractOk);

// 4. Metadata: displayName Combustível; category Operacional. (dynamic)
let metaOk = false;
try {
  const m = await import(pathToFileURL(path.join(SHELL_DIR, 'createModeloBase2FuelModuleMetadata.js')).href);
  const md = m.createModeloBase2FuelModuleMetadata();
  metaOk = md.displayName === 'Combustível' && md.category === 'Operacional' && md.routes.registered === false && md.menu.registered === false && md.permissions.registered === false;
} catch { metaOk = false; }
gate('G423-FUEL-MSR — metadata (displayName Combustível; category Operacional; routes/menu/permissions planned-only)', metaOk);

// 5. Route plan: dev preview path; no production route registered. (dynamic)
let routeOk = false;
try {
  const m = await import(pathToFileURL(path.join(SHELL_DIR, 'createModeloBase2FuelModuleRoutePlan.js')).href);
  const rp = m.createModeloBase2FuelModuleRoutePlan();
  routeOk = rp.devPreviewRoutePath === '/__dev/modelobase2/fuel' && rp.routeRegistered === false && rp.currentAppJsChange === false && rp.productionAllowed === false;
} catch { routeOk = false; }
gate('G423-FUEL-MSR — route plan (dev preview path; routeRegistered false; no current App.jsx change; production not allowed)', routeOk);

// 6. Menu plan: menuRegistered false. (dynamic)
let menuPlanOk = false;
try {
  const m = await import(pathToFileURL(path.join(SHELL_DIR, 'createModeloBase2FuelModuleMenuPlan.js')).href);
  const mp = m.createModeloBase2FuelModuleMenuPlan();
  menuPlanOk = mp.menuRegistered === false && mp.productionAllowed === false;
} catch { menuPlanOk = false; }
gate('G423-FUEL-MSR — menu plan (menuRegistered false; production not allowed)', menuPlanOk);

// 7. Permission plan: fail-closed; global auth untouched. (dynamic)
let permOk = false;
try {
  const m = await import(pathToFileURL(path.join(SHELL_DIR, 'createModeloBase2FuelModulePermissionPlan.js')).href);
  const pp = m.createModeloBase2FuelModulePermissionPlan();
  permOk = pp.permissionsRegistered === false && pp.authGlobalChanged === false && pp.failClosed === true && pp.blocked.includes('fuel.backend_write');
} catch { permOk = false; }
gate('G423-FUEL-MSR — permission plan (permissionsRegistered false; authGlobalChanged false; failClosed; dangerous blocked)', permOk);

// 8. Persistence boundary: blocks backend/Prisma/required storage. (dynamic)
let persistOk = false;
try {
  const m = await import(pathToFileURL(path.join(SHELL_DIR, 'createModeloBase2FuelModulePersistenceBoundary.js')).href);
  const pb = m.createModeloBase2FuelModulePersistenceBoundary();
  persistOk = pb.persistenceReal === false && pb.localOnly === true && pb.sent === false
    && pb.backendTouched === false && pb.prismaTouched === false && pb.runtimeBridgeTouched === false
    && pb.blockedNow.includes('backend write') && pb.blockedNow.includes('Prisma write')
    && pb.blockedNow.includes('IndexedDB required') && pb.blockedNow.includes('localStorage required');
} catch { persistOk = false; }
gate('G423-FUEL-MSR — persistence boundary (persistenceReal false; blocks backend/Prisma/required-storage)', persistOk);

// 9. UI composition: references sandbox shell; not mounted/production-ready. (dynamic)
let uiOk = false;
try {
  const m = await import(pathToFileURL(path.join(SHELL_DIR, 'createModeloBase2FuelModuleUiComposition.js')).href);
  const ui = m.createModeloBase2FuelModuleUiComposition();
  uiOk = ui.shellComponent === 'ModeloBase2FuelSandboxShell' && ui.componentAvailable === true
    && ui.mountedInApp === false && ui.routeRegistered === false && ui.menuRegistered === false && ui.productionReady === false;
} catch { uiOk = false; }
gate('G423-FUEL-MSR — ui composition (references sandbox shell; mountedInApp/productionReady false)', uiOk);

// 10. Diagnostics: readiness ready_for_beta_shell (enabled) / blocked (disabled). (dynamic)
let diagOk = false;
try {
  const ui = await import(pathToFileURL(path.join(SHELL_DIR, 'createModeloBase2FuelModuleUiComposition.js')).href);
  const d = await import(pathToFileURL(path.join(SHELL_DIR, 'createModeloBase2FuelModuleReadinessDiagnostics.js')).href);
  const comp = ui.createModeloBase2FuelModuleUiComposition();
  const on = d.createModeloBase2FuelModuleReadinessDiagnostics({ enabled: true, uiComposition: comp });
  const off = d.createModeloBase2FuelModuleReadinessDiagnostics({ enabled: false, uiComposition: comp });
  diagOk = ['ready_for_beta_shell', 'partial'].includes(on.readiness) && off.readiness === 'blocked'
    && on.moduleRegistered === false && on.routeRegistered === false && on.menuRegistered === false && on.backendRegistered === false;
} catch { diagOk = false; }
gate('G423-FUEL-MSR — diagnostics (ready_for_beta_shell/partial when enabled; blocked when off; nothing registered)', diagOk);

// 11. Fallback: every scenario registers/touches nothing (passive rollback). (dynamic)
let fbOk = false;
try {
  const m = await import(pathToFileURL(path.join(SHELL_DIR, 'createModeloBase2FuelModuleFallback.js')).href);
  const scenarios = m.FUEL_MODULE_FALLBACK_SCENARIOS;
  fbOk = scenarios.length > 0 && scenarios.every((s) => {
    const fb = m.createModeloBase2FuelModuleFallback({ scenario: s });
    return fb.moduleRegistered === false && fb.routeRegistered === false && fb.menuRegistered === false
      && fb.backendRegistered === false && fb.backendTouched === false && fb.persistenceReal === false
      && typeof fb.fallbackReason === 'string' && fb.rollbackPlan && fb.rollbackPlan.passive === true;
  });
} catch { fbOk = false; }
gate('G423-FUEL-MSR — fallback (all scenarios register/touch nothing; passive rollback plan)', fbOk);

// 12. React só no .jsx opcional; helpers puros + headless + operational-runtime React-free.
gate('G423-FUEL-MSR — pure shell helpers React-free', importsOf(pureShellFiles()).every((p) => p !== 'react' && !/^react(\/|$)/.test(p)));
gate('G423-FUEL-MSR — fuel-headless stays React-free', importsOf(walk(HEADLESS_DIR)).every((p) => p !== 'react' && !/^react(\/|$)/.test(p)));
gate('G423-FUEL-MSR — operational-runtime stays React-free', importsOf(walk(OPRUNTIME_DIR)).every((p) => p !== 'react' && !/^react(\/|$)/.test(p)));
gate('G423-FUEL-MSR — React only in the optional shell preview .jsx', jsxShellFiles().length === 0 || importsOf(jsxShellFiles()).some((p) => p === 'react'));

// 13. Sem import de src/modules/pages/App.jsx; sem fetch/storage; sem CSS global.
gate('G423-FUEL-MSR — no import of src/modules', importsOf(walk(SHELL_DIR)).every((p) => !/\/modules\//.test(p)));
gate('G423-FUEL-MSR — no import of src/pages', importsOf(walk(SHELL_DIR)).every((p) => !/\/pages\//.test(p)));
gate('G423-FUEL-MSR — no import of App.jsx', importsOf(walk(SHELL_DIR)).every((p) => !/App\.jsx/.test(p)));
gate('G423-FUEL-MSR — no import of backend/API/Prisma', importsOf(walk(SHELL_DIR)).every((p) => !/\/apis\/|prisma|\/backend\//i.test(p)));
gate('G423-FUEL-MSR — no import of runtimeBridge/makBootstrap', importsOf(walk(SHELL_DIR)).every((p) => !/makBootstrap|runtimeBridge/.test(p)));
let noIo = false;
try {
  const code = stripComments(walk(SHELL_DIR).map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
  noIo = !/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(code) && !/localStorage\.|sessionStorage\.|indexedDB\./.test(code);
} catch { noIo = false; }
gate('G423-FUEL-MSR — no fetch/XHR/WebSocket/storage-API', noIo);
gate('G423-FUEL-MSR — no menu-registration tokens', !/addMenuItem|navItems|menu\.push/.test(walk(SHELL_DIR).map((f) => fs.readFileSync(f, 'utf8')).join('\n')));
gate('G423-FUEL-MSR — no global CSS import', !walk(SHELL_DIR).some((f) => /import\s+['"][^'"]+\.css['"]/i.test(fs.readFileSync(f, 'utf8'))));

// 14. App.jsx untouched (git-diff, branch-relative; empty diff passes).
let appOk = false;
let appDetail = '';
try {
  const changed = execSync('git diff --name-only origin/main...HEAD -- src/App.jsx', { cwd: ROOT, encoding: 'utf8' }).trim();
  appOk = changed.length === 0;
  appDetail = appOk ? 'App.jsx untouched' : `App.jsx changed: ${changed}`;
} catch (err) { appOk = true; appDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-FUEL-MSR — App.jsx untouched (no route/menu registered)', appOk, appDetail);

// 15. Next step is a controlled registration/candidate, not backend write. (dynamic)
let nextOk = false;
try {
  const c = await import(pathToFileURL(path.join(SHELL_DIR, 'modeloBase2FuelModuleShellConfig.js')).href);
  const steps = c.FUEL_MODULE_NEXT_STEPS;
  nextOk = Array.isArray(steps) && steps.length > 0
    && steps.some((s) => /Registration|Candidate/i.test(s))
    && steps.every((s) => !/backend\s*write/i.test(s));
} catch { nextOk = false; }
gate('G423-FUEL-MSR — next step is Fuel Controlled Module Registration / Beta Module Shell Candidate (not backend write)', nextOk);

// 16. ESCOPO AUTORIZADO (git-diff, tolerante).
let scopeOk = false;
let scopeDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const ALLOWED = [
    /^src\/ModeloBase2\/fuel-module-shell\//,
    /^src\/ModeloBase2\/fuel-ui-sandbox\//,
    /^src\/ModeloBase2\/fuel-headless\//,
    /^src\/runtime\/__tests__\/modelobase2-fuel-module-shell-readiness\.test\.js$/,
    /^scripts\/gates\/g423-modelobase2-fuel-module-shell-readiness\.mjs$/,
    /^package\.json$/,
    /^package-lock\.json$/,
    /^docs\/evidence\/post-foundation-c-modelobase2-fuel-module-shell-readiness\//,
  ];
  const outside = files.filter((f) => !ALLOWED.some((re) => re.test(f)));
  scopeOk = files.length === 0 || outside.length === 0;
  scopeDetail = scopeOk ? `authorized scope only (${files.length} files)` : `OUT OF SCOPE: ${outside.join(', ')}`;
} catch (err) { scopeOk = true; scopeDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-FUEL-MSR — authorized scope only (fuel-module-shell/tests/gate/package.json/evidence)', scopeOk, scopeDetail);

// 17. BLOQUEADO — src-modules/pages/App.jsx/MB1/backend/Prisma/framework/Studio/BOS/menu/SSOT (git-diff).
let blockedOk = false;
let blockedDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const FORBIDDEN = [/^src\/modules\//, /^src\/pages\//, /^src\/App\.jsx$/, /^src\/ModeloBase1\//, /^src\/apis\//, /prisma/i, /^src\/framework\//, /^src\/studio\//, /^src\/bos\//, /^src\/components\//, /^docs\/meta-model\//, /^docs\/platform-/, /^docs\/runtime-implementation\//];
  const bad = files.filter((f) => FORBIDDEN.some((re) => re.test(f)));
  blockedOk = bad.length === 0;
  blockedDetail = blockedOk ? 'src-modules/pages/App.jsx/MB1/backend/Prisma/framework/Studio/BOS/global-components/SSOT untouched' : `FORBIDDEN: ${bad.join(', ')}`;
} catch (err) { blockedOk = true; blockedDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-FUEL-MSR — src-modules/pages/App.jsx/MB1/backend/Prisma/framework/Studio/BOS/SSOT untouched', blockedOk, blockedDetail);

// 18. Sem dependência nova.
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
gate('G423-FUEL-MSR — no new dependency added', noNewDep, depDetail);

// 19. Rodar os testes unitários do slice.
let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/modelobase2-fuel-module-shell-readiness.test.js', { cwd: ROOT, stdio: 'pipe', env: { ...process.env, NODE_ENV: 'test' } });
  testsOk = true;
} catch (err) { if (err.stderr) console.error(String(err.stderr)); }
gate('G423-FUEL-MSR — module shell readiness unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-MODELOBASE2-FUEL-MODULE-SHELL summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);
if (failed.length > 0) process.exit(1);
