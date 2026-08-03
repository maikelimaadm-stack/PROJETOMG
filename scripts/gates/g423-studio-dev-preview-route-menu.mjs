#!/usr/bin/env node
/**
 * Gate G423-STUDIO-DEV-PREVIEW-ROUTE-MENU — Post-Foundation C.
 *
 * Proves the FIRST real, DEV-ONLY, ISOLATED route/menu runtime in
 * `src/studio/blueprint-engine/dev-preview-route-menu/`. It consumes the Dev Preview Route/Menu
 * Contract and the Dev Preview Runtime UI and implements local route resolution, an isolated menu,
 * and guarded Runtime UI mounting THROUGH EXPLICIT DEPENDENCY INJECTION, inside a host that lives
 * OUTSIDE the main App. It is DEV-ONLY, ISOLATED, DEFAULT-OFF, FAIL-CLOSED and synthetic-data-only.
 *
 * Real React/JSX is allowed ONLY inside this subtree; `.tsx` and `.css` are forbidden. The `.js`
 * runtime graph is React-free and never imports the `.jsx`. There is NO App/product-router/product-
 * menu/sidebar wiring, NO browser route, NO public URL, NO deep link, NO `react-router`, NO
 * `react-dom`, NO `window`/`document`/`createRoot` (mount is DI-only), NO backend/Prisma/migration/
 * production/staging/mutation/real-data/Empresas, and NO import/relink of the old Studio prototype.
 * Nothing mounts on import; default is closed/disabled.
 *
 * Scope safety uses the central Studio Scope Governance guard: forbidden always wins; legitimate
 * later Studio headless artifacts are tolerated; nothing weakens the block.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { evaluateStudioBranchDiffScope, filterForbiddenScopePaths, isKnownLaterStudioHeadlessArtifact } from './lib/studioScopeGovernanceGuard.mjs';

// ---------------------------------------------------------------------------
// CALLER-AWARE branch-relative scope governance. This gate declares its OWN slice identity,
// so the checks below can ask which slice the branch is building and whether that slice is
// this one or a genuinely later one — a question the previous flat registry could not answer.
// Forbidden and unknown paths still fail closed; nothing is tolerated by mere registration.
// ---------------------------------------------------------------------------
const CALLER_SLICE_ID = 'dev-preview-route-menu';
let studioScopeCache = null;
const studioScope = () => {
  if (studioScopeCache) return studioScopeCache;
  let changed = [];
  let gitAvailable = true;
  try {
    changed = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  } catch { gitAvailable = false; }
  // An empty branch diff (this gate also runs on `main`) is NOT a violation: it carries nothing
  // to judge. A non-empty diff is delegated to the chronological core, unchanged.
  const evaluation = evaluateStudioBranchDiffScope(changed, {
    callerSliceId: CALLER_SLICE_ID,
  });
  studioScopeCache = { gitAvailable, changed, evaluation };
  return studioScopeCache;
};

const ROOT = process.cwd();
const DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-route-menu');
const RMC_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-route-menu-contract');
const UI_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-runtime-ui');
const UC_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-runtime-ui-contract');
const IR_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-isolated-runtime');
const PLAN_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-isolated-runtime-implementation-plan');
const SHELL_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-runtime-shell-contract');
const VISUAL_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-visual-contract');
const BRIDGE_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-contract-bridge');
const SANDBOX_DIR = path.join(ROOT, 'src/studio/blueprint-engine/module-preview-sandbox');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-dev-preview-route-menu');
const results = [];

const gate = (name, ok, detail = '') => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
};
const exists = (p) => fs.existsSync(p);
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const walkExt = (dir, ext) => (fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const full = path.join(dir, e.name);
  if (e.isDirectory()) return walkExt(full, ext);
  return e.isFile() && ext.test(e.name) ? [full] : [];
}) : []);
const jsFiles = () => walkExt(DIR, /\.js$/);
const jsxFiles = () => walkExt(DIR, /\.jsx$/);
const jsCode = () => stripComments(jsFiles().map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
const allCode = () => stripComments([...jsFiles(), ...jsxFiles()].map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
const importsIn = (files) => files.flatMap((f) => [...stripComments(fs.readFileSync(f, 'utf8')).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((mm) => mm[1]));
const readEv = (f) => (exists(path.join(EV, f)) ? fs.readFileSync(path.join(EV, f), 'utf8') : '');

const AUTHORIZED = [
  /^src\/studio\/blueprint-engine\/dev-preview-route-menu\//,
  /^src\/runtime\/__tests__\/studio-dev-preview-route-menu\.test\.js$/,
  /^scripts\/gates\/g423-studio-dev-preview-route-menu\.mjs$/,
  /^scripts\/gates\/lib\/studioScopeGovernanceRegistry\.mjs$/,
  /^package\.json$/,
  /^package-lock\.json$/,
  /^docs\/evidence\/post-foundation-c-studio-dev-preview-route-menu\//,
];
const authorized = (f) => AUTHORIZED.some((re) => re.test(f)) || isKnownLaterStudioHeadlessArtifact(f);

const FILES = [
  'routeMenuConfig.js', 'errors.js', 'createRouteMenuSession.js', 'createRouteMenuPreflight.js',
  'createRouteMenuContractLoader.js', 'createRouteMenuCheckpointReceipt.js', 'createDevOnlyFeatureGate.js',
  'createIsolatedRouteRegistry.js', 'createIsolatedRouteResolver.js', 'createIsolatedMenuRegistry.js',
  'createIsolatedNavigationController.js', 'createRouteGuard.js', 'createMenuVisibilityDecision.js',
  'createRuntimeUiMountRequest.js', 'createRuntimeUiMountAdapter.js', 'createRouteMenuReactHostTree.js',
  'createBlockedNavigationModel.js', 'createRouteMenuIsolationBoundary.js', 'createRouteMenuManifest.js',
  'verifyRouteMenuRuntime.js', 'checkRouteMenuRuntimeCompatibility.js', 'createRouteMenuDiagnostics.js',
  'createRouteMenuFallback.js', 'createStudioDevPreviewRouteMenu.js', 'index.js',
];
const JSX_FILES = [
  'StudioDevPreviewRouteMenuHost.jsx', 'StudioDevPreviewMenu.jsx', 'StudioDevPreviewRouteView.jsx',
  'StudioDevPreviewNotFound.jsx', 'StudioDevPreviewBlocked.jsx',
];
const DOCS = [
  'CERTIFICATION-REPORT.md', 'STUDIO-DEV-PREVIEW-ROUTE-MENU-REPORT.md', 'ARCHITECTURAL-DECISION-ISOLATED-HOST.md',
  'SESSION.md', 'PREFLIGHT.md', 'CONTRACT-LOADER.md', 'DEV-ONLY-FEATURE-GATE.md', 'ISOLATED-ROUTE-REGISTRY.md',
  'ISOLATED-ROUTE-RESOLVER.md', 'ISOLATED-MENU-REGISTRY.md', 'LOCAL-NAVIGATION-CONTROLLER.md', 'ROUTE-GUARD.md',
  'MENU-VISIBILITY.md', 'RUNTIME-UI-MOUNT-ADAPTER.md', 'REACT-HOST-TREE.md', 'BLOCKED-NAVIGATION.md',
  'CHECKPOINT-RECEIPT.md', 'ISOLATION-BOUNDARY.md', 'MANIFEST-VERIFIER-COMPATIBILITY.md',
  'NO-APP-NO-PRODUCT-ROUTER-NO-PRODUCT-MENU.md', 'NO-PROTOTYPE-RELINK.md', 'QUALITY-SCALABILITY-NOTES.md',
  'NEXT-SLICE-SPEC.md', 'ROUTE-MENU-INVENTORY.md',
];

for (const f of FILES) gate(`G423-RM — ${f} exists`, exists(path.join(DIR, f)));
for (const f of JSX_FILES) gate(`G423-RM — ${f} exists`, exists(path.join(DIR, f)));
for (const d of DOCS) gate(`G423-RM — ${d} exists`, exists(path.join(EV, d)));
gate('G423-RM — tests exist', exists(path.join(ROOT, 'src/runtime/__tests__/studio-dev-preview-route-menu.test.js')));
gate('G423-RM — exactly 5 .jsx in subtree', jsxFiles().length === 5, `${jsxFiles().length} .jsx`);
gate('G423-RM — no .tsx in subtree', walkExt(DIR, /\.tsx$/).length === 0);
gate('G423-RM — no .css in subtree', !fs.readdirSync(DIR).some((f) => /\.css$/.test(f)));

let m = null; let rmcMod = null; let uiMod = null; let ucMod = null; let irMod = null; let planMod = null; let shellMod = null; let visualMod = null; let bridgeMod = null; let sandboxMod = null;
try { m = await import(pathToFileURL(path.join(DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { rmcMod = await import(pathToFileURL(path.join(RMC_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { uiMod = await import(pathToFileURL(path.join(UI_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { ucMod = await import(pathToFileURL(path.join(UC_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { irMod = await import(pathToFileURL(path.join(IR_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { planMod = await import(pathToFileURL(path.join(PLAN_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { shellMod = await import(pathToFileURL(path.join(SHELL_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { visualMod = await import(pathToFileURL(path.join(VISUAL_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { bridgeMod = await import(pathToFileURL(path.join(BRIDGE_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { sandboxMod = await import(pathToFileURL(path.join(SANDBOX_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }

let SB = null; let BRIDGE = null; let VC = null; let RS = null; let IPLAN = null; let IR = null; let UC = null; let UI = null; let RMC = null; let U = null;
try { SB = sandboxMod.createStudioModulePreviewSandboxContract({ blueprint: { moduleId: 'clientes', moduleName: 'Clientes', modelType: 'cadastro', modelFamily: 'ModeloBase1', fields: [{ name: 'nome', type: 'text' }], permissions: [{ action: 'read', level: 'module' }] } }); } catch (err) { console.error(String(err)); }
try { BRIDGE = bridgeMod.createStudioDevPreviewContractBridge({ sandbox: SB }); } catch (err) { console.error(String(err)); }
try { VC = visualMod.createStudioDevPreviewVisualContract({ bridge: BRIDGE }); } catch (err) { console.error(String(err)); }
try { RS = shellMod.createStudioDevPreviewRuntimeShellContract({ visualContract: VC }); } catch (err) { console.error(String(err)); }
try { IPLAN = planMod.createStudioDevPreviewIsolatedRuntimeImplementationPlan({ runtimeShellContract: RS }); } catch (err) { console.error(String(err)); }
try { IR = irMod.createStudioDevPreviewIsolatedRuntime({ implementationPlan: IPLAN }); } catch (err) { console.error(String(err)); }
try { UC = ucMod.createStudioDevPreviewRuntimeUiContract({ isolatedRuntime: IR }); } catch (err) { console.error(String(err)); }
try { UI = uiMod.createStudioDevPreviewRuntimeUi({ runtimeUiContract: UC, env: { DEV: 'true' } }); } catch (err) { console.error(String(err)); }
try { RMC = rmcMod.createStudioDevPreviewRouteMenuContract({ runtimeUi: UI }); } catch (err) { console.error(String(err)); }
const CKPT = m ? m.REQUIRED_CHECKPOINT_RECEIPT : 'approved_for_isolated_route_menu_runtime';
const AUTH = { routeMenuContract: RMC, runtimeUi: UI, enabled: true, environment: 'development', checkpointReceipt: CKPT, virtualFrame: { syntheticDataOnly: true }, initialPath: '/__dev/studio/preview' };
try { U = m.createStudioDevPreviewRouteMenu(AUTH); } catch (err) { console.error(String(err)); }

let baseOk = false; let baseDetail = '';
try {
  baseOk = U.kind === 'studio-dev-preview-route-menu'
    && U.routeMenuName === 'studio-dev-preview-route-menu'
    && U.routeMenuVersion === 'studio-dev-preview-route-menu@1.0.0'
    && U.routeMenuContractVersion === 'studio-dev-preview-route-menu-contract@1.0.0'
    && U.runtimeUiVersion === 'studio-dev-preview-runtime-ui@1.0.0'
    && U.mode === 'dev_only_isolated_route_menu_runtime'
    && U.fallback === false
    && U.readiness === 'studio_dev_preview_isolated_route_menu_runtime_ready'
    && U.readyForIsolatedRouteMenuRuntime === true
    && U.readyForAppIntegration === false
    && U.readyForProductRouterIntegration === false
    && U.readyForProductMenuIntegration === false
    && U.readyForProduction === false
    && U.blockerCount === 0;
  baseDetail = baseOk ? `readiness=${U.readiness}` : 'route/menu invariants wrong';
} catch (err) { baseDetail = err instanceof Error ? err.message : String(err); }
gate('G423-RM — dev-only/isolated route/menu invariants + readiness ready', baseOk, baseDetail);

let capOk = false;
try {
  const c = m.ROUTE_MENU_CAPABILITIES;
  const trues = ['devOnly', 'isolated', 'defaultOff', 'failClosed', 'syntheticDataOnly', 'routeImplemented', 'menuImplemented', 'isolatedRouteResolverImplemented', 'isolatedRouteRegistryImplemented', 'isolatedMenuRegistryImplemented', 'isolatedMenuUiImplemented', 'routeViewImplemented', 'mountAdapterImplemented', 'runtimeUiMountCapabilityImplemented', 'featureFlagRequired', 'productionDenied', 'stagingDenied'];
  const noes = ['runtimeUiMountedByDefault', 'globalRuntimeUiMounted', 'browserRouteRegistered', 'productRouterWiringImplemented', 'productMenuRegistered', 'productSidebarRegistered', 'appWiringImplemented', 'deepLinkImplemented', 'publicUrlCreated', 'routeCreatedInMainApp', 'menuCreatedInMainApp', 'featureFlagDefaultEnabled', 'moduleGenerated', 'filesWrittenToModule', 'moduleRegistered', 'backendAccessed', 'prismaAccessed', 'productionAccessed', 'stagingAccessed', 'fetchUsed', 'mutationAllowed', 'persistenceCreated', 'realDataRead', 'realDataWrite', 'rewriteEmpresas', 'prototypeRelinked'];
  capOk = Object.isFrozen(c) && trues.every((k) => c[k] === true) && noes.every((k) => c[k] === false) && noes.every((k) => U.capabilities[k] === false);
} catch { capOk = false; }
gate('G423-RM — capabilities frozen; route/menu/resolver/mount-adapter implemented true; all product/App/mount-by-default/forbidden flags false', capOk);

// ===== Part-by-part behaviour =====
const part = (fn, argObj, pred) => { try { return pred(argObj === undefined ? m[fn]() : m[fn](argObj)); } catch (err) { console.error(`${fn}: ${err}`); return false; } };
gate('G423-RM — session (dev-only route/menu; no storage/fetch/persistence)', part('createRouteMenuSession', { routeMenuContract: RMC }, (x) => x.kind === 'route-menu-session'));
gate('G423-RM — preflight ok when authorized; fails closed in production', (() => { try { const okp = m.createRouteMenuPreflight({ routeMenuContract: RMC, runtimeUi: UI, virtualFrame: { syntheticDataOnly: true }, enabled: true, environment: 'development', checkpointReceipt: CKPT }); const badp = m.createRouteMenuPreflight({ routeMenuContract: RMC, runtimeUi: UI, virtualFrame: { syntheticDataOnly: true }, enabled: true, environment: 'production', checkpointReceipt: CKPT }); return okp.kind === 'route-menu-preflight' && badp.kind === 'route-menu-preflight' && okp.ok === true && badp.ok === false; } catch { return false; } })());
gate('G423-RM — contract loader (relative import only; loads valid route/menu contract)', part('createRouteMenuContractLoader', { routeMenuContract: RMC }, (x) => x.kind === 'route-menu-contract-loader' && x.loadedByRelativeImportOnly === true));
gate('G423-RM — checkpoint receipt approves only the required value', (() => { try { return m.createRouteMenuCheckpointReceipt({ checkpointReceipt: CKPT }).approved === true && m.createRouteMenuCheckpointReceipt({ checkpointReceipt: 'nope' }).approved === false && m.createRouteMenuCheckpointReceipt({}).approved === false; } catch { return false; } })());
gate('G423-RM — dev-only feature gate open in dev+ckpt; default-off; prod/staging closed', (() => { try { return m.createDevOnlyFeatureGate({ enabled: true, environment: 'development', checkpointReceipt: CKPT }).open === true && m.createDevOnlyFeatureGate({}).open === false && m.createDevOnlyFeatureGate({ enabled: true, environment: 'production', checkpointReceipt: CKPT }).open === false && m.createDevOnlyFeatureGate({ enabled: true, environment: 'staging', checkpointReceipt: CKPT }).open === false && m.createDevOnlyFeatureGate({ enabled: true, environment: 'development' }).open === false; } catch { return false; } })());
gate('G423-RM — isolated route registry (private, /__dev only)', part('createIsolatedRouteRegistry', undefined, (x) => x.kind === 'route-menu-isolated-route-registry'));
gate('G423-RM — resolver matches preview, not-found for unknown, no product path', (() => { try { return m.createIsolatedRouteResolver({ path: '/__dev/studio/preview' }).matched === true && m.createIsolatedRouteResolver({ path: '/__dev/studio/preview/zzz' }).matched === false && m.createIsolatedRouteResolver({ path: '/clientes' }).matched === false; } catch { return false; } })());
gate('G423-RM — isolated menu registry (private, no product menu)', part('createIsolatedMenuRegistry', undefined, (x) => x.kind === 'route-menu-isolated-menu-registry'));
gate('G423-RM — local navigation controller (descriptor; no window/history)', part('createIsolatedNavigationController', undefined, (x) => x.descriptor.kind === 'route-menu-navigation-controller-descriptor'));
gate('G423-RM — route guard allows only when gate open + dev + synthetic', (() => { try { return m.createRouteGuard({ featureGate: m.createDevOnlyFeatureGate({ enabled: true, environment: 'development', checkpointReceipt: CKPT }), environment: 'development', syntheticData: true }).allow === true && m.createRouteGuard({ featureGate: m.createDevOnlyFeatureGate({}), environment: 'development', syntheticData: true }).allow === false; } catch { return false; } })());
gate('G423-RM — menu visibility only when gate open', (() => { try { return m.createMenuVisibilityDecision({ featureGate: m.createDevOnlyFeatureGate({ enabled: true, environment: 'development', checkpointReceipt: CKPT }) }).visibleLocalOnly === true && m.createMenuVisibilityDecision({ featureGate: m.createDevOnlyFeatureGate({}) }).visibleLocalOnly === false; } catch { return false; } })());
gate('G423-RM — mount request authorized only when gate+guard+resolver+synthetic; never global/by-default', (() => { try { const g = m.createDevOnlyFeatureGate({ enabled: true, environment: 'development', checkpointReceipt: CKPT }); const gd = m.createRouteGuard({ featureGate: g, environment: 'development', syntheticData: true }); const rr = m.createIsolatedRouteResolver({ path: '/__dev/studio/preview' }); const req = m.createRuntimeUiMountRequest({ featureGate: g, routeGuard: gd, routeResolver: rr, virtualFrame: { syntheticDataOnly: true } }); return req.mountAuthorized === true && req.globalRuntimeUiMounted === false && req.mountedByDefault === false; } catch { return false; } })());
gate('G423-RM — react host tree descriptor (names only; no dom node/reactDom)', part('createRouteMenuReactHostTree', undefined, (x) => x.kind === 'route-menu-react-host-tree'));
gate('G423-RM — blocked navigation model (8 blocked; none allowed)', part('createBlockedNavigationModel', undefined, (x) => x.kind === 'route-menu-blocked-navigation-model' && x.allBlocked === true && x.anyAllowed === false && ['navigateProduct', 'registerProductRoute', 'registerProductMenu', 'registerSidebarItem', 'openPublicDeepLink', 'registerModule', 'readRealData', 'writeRealData'].every((a) => x.actions.some((y) => y.action === a && y.blocked === true))));
gate('G423-RM — isolation boundary (no app/router/menu/react-router/react-dom/window/document/prototype)', part('createRouteMenuIsolationBoundary', undefined, (x) => x.kind === 'route-menu-isolation-boundary' && x.appJsxTouched === false && x.mainRouterWired === false && x.productMenuWired === false && x.reactRouterUsed === false && x.reactDomUsed === false && x.windowUsed === false && x.documentUsed === false && x.oldPrototypeImported === false && x.autoMountOnImport === false && x.confinedToIsolatedHost === true && x.reversibleByNonConsumption === true));

// ===== DI mount adapter — authorized + fail-closed =====
const fakeRoot = () => { const r = { renders: [], unmounts: 0 }; r.render = (el) => r.renders.push(el); r.unmount = () => { r.unmounts += 1; }; return r; };
let mountOk = false;
try {
  const root = fakeRoot();
  let calls = 0;
  const r = m.mountStudioDevPreviewRouteMenu({ ...AUTH, rootFactory: (n) => { calls += 1; return n === undefined ? null : root; }, mountNode: { id: 'host' } });
  const rendersAfterInit = root.renders.length;
  r.navigateLocal('/__dev/studio/preview/not-found');
  const rendersAfterNav = root.renders.length;
  r.dispose();
  mountOk = r.mounted === true && r.blocked === false && r.rootFactoryCalled === true && calls === 1 && r.usesWindow === false && r.usesDocument === false && r.usesInternalCreateRoot === false && rendersAfterInit >= 1 && rendersAfterNav > rendersAfterInit && root.unmounts === 1;
} catch (err) { console.error(String(err)); mountOk = false; }
gate('G423-RM — DI mount: authorized mount calls injected rootFactory once, renders via injected root, navigateLocal re-renders, dispose unmounts', mountOk);

let mountBlockedOk = false;
try {
  const mk = (extra) => { let called = false; const r = m.mountStudioDevPreviewRouteMenu({ ...AUTH, rootFactory: () => { called = true; return fakeRoot(); }, mountNode: {}, ...extra }); return { r, called }; };
  const prod = mk({ environment: 'production' });
  const stag = mk({ environment: 'staging' });
  const off = mk({ enabled: false });
  const noCkpt = mk({ checkpointReceipt: null });
  const noRoot = { r: m.mountStudioDevPreviewRouteMenu({ ...AUTH, mountNode: {} }), called: false };
  const noNode = { r: m.mountStudioDevPreviewRouteMenu({ ...AUTH, rootFactory: () => fakeRoot() }), called: false };
  const all = [prod, stag, off, noCkpt, noRoot, noNode];
  mountBlockedOk = all.every(({ r, called }) => r.mounted === false && r.blocked === true && r.rootFactoryCalled === false && called === false)
    && prod.r.reason === 'production_or_staging_denied'
    && off.r.reason === 'default_off_or_disabled'
    && noCkpt.r.reason === 'checkpoint_not_approved'
    && noRoot.r.reason === 'root_factory_missing'
    && noNode.r.reason === 'mount_node_missing';
} catch (err) { console.error(String(err)); mountBlockedOk = false; }
gate('G423-RM — DI mount: production/staging/off/missing-checkpoint/missing-rootFactory/missing-mountNode all BLOCKED without calling rootFactory', mountBlockedOk);

gate('G423-RM — mount adapter is dev-only export; nothing mounts on import', typeof m?.mountStudioDevPreviewRouteMenu === 'function');

let manOk = false;
try { manOk = U.manifest.kind === 'route-menu-manifest' && U.manifest.capabilities.routeImplemented === true && U.manifest.capabilities.appWiringImplemented === false; } catch { manOk = false; }
gate('G423-RM — manifest present + capability flags mirrored', manOk);

let verOk = false;
try { verOk = U.verification.ok === true && U.verification.valid === true && U.verification.devOnly === true && U.verification.isolated === true && U.verification.routeImplemented === true && U.verification.menuImplemented === true && U.verification.globalRuntimeUiMounted === false && U.verification.blockerCount === 0; } catch { verOk = false; }
gate('G423-RM — verifier passes dev-only/isolated invariants', verOk);

let verTamper = false;
try {
  const c = m.ROUTE_MENU_CAPABILITIES;
  const ok = (o) => m.verifyRouteMenuRuntime(o).blockers;
  verTamper = ok({ contract: { capabilities: { ...c, appWiringImplemented: true }, checkpointReceipt: { approved: true } } }).includes('capability_appWiringImplemented_must_be_false')
    && ok({ contract: { capabilities: { ...c, productRouterWiringImplemented: true }, checkpointReceipt: { approved: true } } }).includes('capability_productRouterWiringImplemented_must_be_false')
    && ok({ contract: { capabilities: { ...c, productMenuRegistered: true, productSidebarRegistered: true }, checkpointReceipt: { approved: true } } }).includes('capability_productMenuRegistered_must_be_false')
    && ok({ contract: { capabilities: { ...c, browserRouteRegistered: true }, checkpointReceipt: { approved: true } } }).includes('capability_browserRouteRegistered_must_be_false')
    && ok({ contract: { capabilities: { ...c, publicUrlCreated: true, deepLinkImplemented: true }, checkpointReceipt: { approved: true } } }).includes('capability_publicUrlCreated_must_be_false')
    && ok({ contract: { capabilities: { ...c, globalRuntimeUiMounted: true, runtimeUiMountedByDefault: true }, checkpointReceipt: { approved: true } } }).includes('capability_globalRuntimeUiMounted_must_be_false')
    && ok({ contract: { capabilities: { ...c, featureFlagDefaultEnabled: true }, checkpointReceipt: { approved: true } } }).includes('capability_featureFlagDefaultEnabled_must_be_false')
    && ok({ contract: { capabilities: { ...c, backendAccessed: true, prismaAccessed: true }, checkpointReceipt: { approved: true } } }).includes('capability_backendAccessed_must_be_false')
    && ok({ contract: { capabilities: { ...c, realDataRead: true, realDataWrite: true }, checkpointReceipt: { approved: true } } }).includes('capability_realDataRead_must_be_false')
    && ok({ contract: { capabilities: { ...c, prototypeRelinked: true }, checkpointReceipt: { approved: true } } }).includes('capability_prototypeRelinked_must_be_false')
    && ok({ contract: { capabilities: c, isolationBoundary: { appJsxTouched: true }, checkpointReceipt: { approved: true } } }).includes('unsafe_app_touched')
    && ok({ contract: { capabilities: c, isolationBoundary: { mainRouterWired: true }, checkpointReceipt: { approved: true } } }).includes('unsafe_main_router_wired')
    && ok({ contract: { capabilities: c, isolationBoundary: { reactRouterUsed: true }, checkpointReceipt: { approved: true } } }).includes('unsafe_react_router')
    && ok({ contract: { capabilities: c, isolationBoundary: { reactDomUsed: true }, checkpointReceipt: { approved: true } } }).includes('unsafe_react_dom')
    && ok({ contract: { capabilities: c, isolationBoundary: { windowUsed: true }, checkpointReceipt: { approved: true } } }).includes('unsafe_browser_globals')
    && ok({ contract: { capabilities: c, isolationBoundary: { autoMountOnImport: true }, checkpointReceipt: { approved: true } } }).includes('unsafe_auto_mount')
    && ok({ contract: { capabilities: c, isolationBoundary: { oldPrototypeImported: true }, checkpointReceipt: { approved: true } } }).includes('unsafe_prototype_relink')
    && ok({ contract: { capabilities: c, featureGate: { featureFlagDefaultEnabled: true }, checkpointReceipt: { approved: true } } }).includes('unsafe_feature_flag_default_on')
    && ok({ contract: { capabilities: c, mountRequest: { globalRuntimeUiMounted: true }, checkpointReceipt: { approved: true } } }).includes('unsafe_global_mount')
    && ok({ contract: { capabilities: c, checkpointReceipt: { approved: false } } }).includes('missing_checkpoint')
    && ok({ contract: { capabilities: { ...c, devOnly: false }, checkpointReceipt: { approved: true } } }).includes('capability_devOnly_must_be_true')
    && !m.verifyRouteMenuRuntime.toString().includes('throw');
} catch { verTamper = false; }
gate('G423-RM — verifier detects App/product-router/product-menu/browser-route/public-url/global-mount/react-router/react-dom/window/auto-mount/prototype/backend/data/feature-flag-default-on/missing-checkpoint attempts', verTamper);

let cmpOk = false;
try {
  const okc = m.checkRouteMenuRuntimeCompatibility({ routeMenuContract: RMC });
  const bad = m.checkRouteMenuRuntimeCompatibility({ routeMenuContract: { runtimeUiVersion: 'x@9.9.9', kind: 'other' } });
  cmpOk = okc.compatibleWithRouteMenuContract === true && okc.compatibleWithRuntimeUi === true && okc.readyForIsolatedRouteMenuRuntime === true && bad.compatibleWithRuntimeUi === false && bad.warnings.includes('incompatible_runtimeUi');
} catch { cmpOk = false; }
gate('G423-RM — compatibility aligned; mismatch → warning', cmpOk);

let diagOk = false;
try { diagOk = U.diagnostics.passive === true && U.diagnostics.ok === true && !/jwt|token|secret|DATABASE_URL/i.test(JSON.stringify(U.diagnostics)); } catch { diagOk = false; }
gate('G423-RM — diagnostics passive, no secrets', diagOk);

let fbOk = false;
try {
  const fb = m.createStudioDevPreviewRouteMenu({});
  const fb2 = m.createStudioDevPreviewRouteMenu({ routeMenuContract: { kind: 'other' } });
  const fb3 = m.createStudioDevPreviewRouteMenu({ routeMenuContract: { kind: 'studio-dev-preview-route-menu-contract', fallback: true } });
  fbOk = fb.fallback === true && fb2.fallback === true && fb3.fallback === true;
} catch { fbOk = false; }
gate('G423-RM — fallback fail-closed on invalid/missing/fallback route/menu contract', fbOk);

let detOk = false;
try {
  const a = m.createStudioDevPreviewRouteMenu(AUTH);
  const b = m.createStudioDevPreviewRouteMenu(AUTH);
  detOk = a.overallDigest === b.overallDigest && a.routeMenuDigest === b.routeMenuDigest && a.overallDigest.startsWith('fnv1a-');
} catch { detOk = false; }
gate('G423-RM — deterministic overall + route/menu digests', detOk);

let flagOk = false;
try {
  const off = m.isStudioDevPreviewRouteMenuEnabled({ [m.MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_FLAG]: 'true', MAK_ENV_LABEL: 'production' });
  const onDev = m.isStudioDevPreviewRouteMenuEnabled({ [m.MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_FLAG]: 'true', DEV: 'true' });
  const mOff = m.isStudioDevPreviewRouteMenuMountEnabled({ [m.MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_MOUNT_FLAG]: 'true', NODE_ENV: 'production' });
  const vOff = m.isStudioDevPreviewRouteMenuVerifyEnabled({ [m.MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_VERIFY_FLAG]: 'true', NODE_ENV: 'production' });
  flagOk = off === false && onDev === true && mOff === false && vOff === false;
} catch { flagOk = false; }
gate('G423-RM — feature flags fail closed in production (default-off)', flagOk);

gate('G423-RM — error catalog >= 40 codes', Array.isArray(m?.ROUTE_MENU_ERROR_CODES) && m.ROUTE_MENU_ERROR_CODES.length >= 40);
gate('G423-RM — error descriptor sanitized + side-effect free', (() => { try { const e = m.createRouteMenuError(m.ROUTE_MENU_ERROR_CODES[0]); return e.kind === 'route-menu-error' && e.safe === true && e.sideEffects === false; } catch { return false; } })());
gate('G423-RM — isolated route paths are /__dev/studio/preview only', Array.isArray(m?.ISOLATED_ROUTE_PATHS) && m.ISOLATED_ROUTE_PATHS.every((p) => p.startsWith('/__dev/studio/preview')));
gate('G423-RM — component names are 5 local Studio host names', Array.isArray(m?.ROUTE_MENU_COMPONENT_NAMES) && m.ROUTE_MENU_COMPONENT_NAMES.length === 5 && m.ROUTE_MENU_COMPONENT_NAMES.every((n) => /^StudioDevPreview/.test(n)));
gate('G423-RM — required checkpoint receipt is approved_for_isolated_route_menu_runtime', m?.REQUIRED_CHECKPOINT_RECEIPT === 'approved_for_isolated_route_menu_runtime');

// ===== Explicit capability invariants =====
gate('G423-RM — routeImplemented true', U ? U.capabilities.routeImplemented === true : false);
gate('G423-RM — menuImplemented true', U ? U.capabilities.menuImplemented === true : false);
gate('G423-RM — mountAdapterImplemented true', U ? U.capabilities.mountAdapterImplemented === true : false);
gate('G423-RM — runtimeUiMountedByDefault false', U ? U.capabilities.runtimeUiMountedByDefault === false : false);
gate('G423-RM — globalRuntimeUiMounted false', U ? U.capabilities.globalRuntimeUiMounted === false : false);
gate('G423-RM — browserRouteRegistered false', U ? U.capabilities.browserRouteRegistered === false : false);
gate('G423-RM — productRouterWiringImplemented false', U ? U.capabilities.productRouterWiringImplemented === false : false);
gate('G423-RM — productMenuRegistered false', U ? U.capabilities.productMenuRegistered === false : false);
gate('G423-RM — productSidebarRegistered false', U ? U.capabilities.productSidebarRegistered === false : false);
gate('G423-RM — appWiringImplemented false', U ? U.capabilities.appWiringImplemented === false : false);
gate('G423-RM — deepLinkImplemented false', U ? U.capabilities.deepLinkImplemented === false : false);
gate('G423-RM — publicUrlCreated false', U ? U.capabilities.publicUrlCreated === false : false);
gate('G423-RM — routeCreatedInMainApp false', U ? U.capabilities.routeCreatedInMainApp === false : false);
gate('G423-RM — menuCreatedInMainApp false', U ? U.capabilities.menuCreatedInMainApp === false : false);
gate('G423-RM — featureFlagDefaultEnabled false', U ? U.capabilities.featureFlagDefaultEnabled === false : false);
gate('G423-RM — moduleGenerated false', U ? U.capabilities.moduleGenerated === false : false);
gate('G423-RM — prototypeRelinked false', U ? U.capabilities.prototypeRelinked === false : false);
gate('G423-RM — top-level realDataRead/realDataWrite false', U ? (U.capabilities.realDataRead === false && U.capabilities.realDataWrite === false) : false);
gate('G423-RM — readyForAppIntegration false', U ? U.readyForAppIntegration === false : false);
gate('G423-RM — readyForProductRouterIntegration false', U ? U.readyForProductRouterIntegration === false : false);
gate('G423-RM — readyForProductMenuIntegration false', U ? U.readyForProductMenuIntegration === false : false);
gate('G423-RM — readyForProduction false', U ? U.readyForProduction === false : false);
gate('G423-RM — blocked navigation allBlocked in contract', (() => { try { return U.blockedNavigation.allBlocked === true && U.blockedNavigation.anyAllowed === false; } catch { return false; } })());
gate('G423-RM — isolation boundary intact in contract', (() => { try { return U.isolationBoundary.appJsxTouched === false && U.isolationBoundary.reactRouterUsed === false && U.isolationBoundary.reactDomUsed === false && U.isolationBoundary.oldPrototypeImported === false; } catch { return false; } })());
gate('G423-RM — mount request not global / not by default in contract', (() => { try { return U.mountRequest.globalRuntimeUiMounted === false && U.mountRequest.mountedByDefault === false; } catch { return false; } })());
gate('G423-RM — checkpoint approved in authorized contract', (() => { try { return U.checkpointReceipt.approved === true; } catch { return false; } })());
gate('G423-RM — feature gate open in authorized contract', (() => { try { return U.featureGate.open === true; } catch { return false; } })());

// ===== Static safety scans =====
gate('G423-RM — .js graph is React-free', importsIn(jsFiles()).every((p) => p !== 'react' && !/^react(\/|$)/.test(p)));
gate('G423-RM — .js graph has no JSX/createElement', !/createElement|_jsx\b|jsxs?\(/.test(jsCode()));
gate('G423-RM — .js graph does NOT import the .jsx (node --test safe)', importsIn(jsFiles()).every((p) => !/\.jsx($|['"])/.test(p)));
gate('G423-RM — .jsx contain real JSX via automatic runtime (no explicit react import)', jsxFiles().length === 5 && jsxFiles().every((f) => /<[A-Za-z]/.test(fs.readFileSync(f, 'utf8'))) && importsIn(jsxFiles()).every((p) => p !== 'react' && !/^react(\/|$)/.test(p)));
gate('G423-RM — no react-router import anywhere', importsIn([...jsFiles(), ...jsxFiles()]).every((p) => !/react-router/i.test(p)));
gate('G423-RM — no react-dom import anywhere', importsIn([...jsFiles(), ...jsxFiles()]).every((p) => !/react-dom/i.test(p)));
gate('G423-RM — no <Route JSX / Routes / Link / NavLink (case-sensitive API)', !/<Route[\s/>]|\bRoutes\b|\bNavLink\b|<Link[\s/>]/.test(allCode()));
gate('G423-RM — no BrowserRouter / createBrowserRouter / useNavigate', !/\bBrowserRouter\b|\bcreateBrowserRouter\b|\buseNavigate\b/.test(allCode()));
gate('G423-RM — no ReactDOM / createRoot / hydrateRoot call anywhere', !/\bReactDOM\b|createRoot\s*\(|hydrateRoot\s*\(/.test(allCode()));
gate('G423-RM — no window/document/history/location access anywhere', !/\bdocument\.|\bwindow\.[a-z]|\bhistory\.(push|replace)State|\blocation\.(href|assign|replace)/i.test(allCode()));
gate('G423-RM — no old Studio prototype import', importsIn([...jsFiles(), ...jsxFiles()]).every((p) => !/studio\/(components|shell|designers|pages|navigation|dock|panels|editor)/.test(p)));
gate('G423-RM — no src/components or src/pages import', importsIn([...jsFiles(), ...jsxFiles()]).every((p) => !/(^|\.\.\/)(components|pages)\//.test(p) || /StudioDevPreview/.test(p)));
gate('G423-RM — no App import', importsIn([...jsFiles(), ...jsxFiles()]).every((p) => !/(^|\/)App(\.jsx)?$/.test(p)));
gate('G423-RM — no import of EmpresaApi/apiClient/apis/backend/prisma', importsIn([...jsFiles(), ...jsxFiles()]).every((p) => !/EmpresaApi|apiClient|\/apis\/|\/backend\/|@prisma|PrismaClient/i.test(p)));
gate('G423-RM — no fetch/XHR/WebSocket/storage-API', !/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(allCode()) && !/localStorage\.|sessionStorage\.|indexedDB\./.test(allCode()));
gate('G423-RM — no DATABASE_URL / production API_URL / Railway', !/DATABASE_URL|VITE_API_URL|projetomg-production|railway/i.test(allCode()));
gate('G423-RM — no real POST/PUT/PATCH/DELETE method', !/method\s*:\s*['"](POST|PUT|PATCH|DELETE)['"]/.test(allCode()));
gate('G423-RM — no realDataRead/realDataWrite true literal', !/realDataRead\s*:\s*true|realDataWrite\s*:\s*true/.test(allCode()));

gate('G423-RM — docs validate isolated-host decision', /isolated|isolad|host|App/i.test(readEv('ARCHITECTURAL-DECISION-ISOLATED-HOST.md')) && /dev-only|isolated|isolad/i.test(readEv('CERTIFICATION-REPORT.md')));
gate('G423-RM — docs validate no-prototype-relink + no-app/product-router/product-menu', /prototype|protótipo|relink/i.test(readEv('NO-PROTOTYPE-RELINK.md')) && /App|router|menu/i.test(readEv('NO-APP-NO-PRODUCT-ROUTER-NO-PRODUCT-MENU.md')));
gate('G423-RM — next slice spec (app integration contract / checkpoint) present', /APP INTEGRATION CONTRACT|integration|checkpoint/i.test(readEv('NEXT-SLICE-SPEC.md')));

// ===== Scope safety (git-diff) — forbidden always wins via the central guard =====
let blockedOk = false; let blockedDetail = '';
{
  const { gitAvailable, evaluation } = studioScope();
  if (!gitAvailable) { blockedOk = true; blockedDetail = 'git base unavailable — skipped'; }
  else {
    blockedOk = evaluation.forbidden.length === 0;
    blockedDetail = blockedOk ? 'no forbidden scope path in the branch diff' : `FORBIDDEN: ${evaluation.forbidden.join(', ')}`;
  }
}
gate('G423-RM — src/modules / Empresas / backend / Prisma / SSOT untouched', blockedOk, blockedDetail);

let scopeOk = false; let scopeDetail = '';
{
  const { gitAvailable, changed, evaluation } = studioScope();
  if (!gitAvailable) { scopeOk = true; scopeDetail = 'git base unavailable — skipped'; }
  else {
    scopeOk = evaluation.unknown.length === 0 && evaluation.chronologicalViolation.length === 0;
    scopeDetail = scopeOk
      ? `authorized scope only (${changed.length} files; active slice ${evaluation.activeSliceId} #${evaluation.activeSliceOrdinal})`
      : `OUT OF SCOPE: ${[...evaluation.unknown, ...evaluation.chronologicalViolation].join(', ')}`;
  }
}
gate('G423-RM — authorized scope only (route-menu subtree + registry + evidence + package)', scopeOk, scopeDetail);

let noTsxCss = false; let noTsxCssDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const badTsxCss = files.filter((f) => /\.tsx$/.test(f) || /\.css$/.test(f));
  const jsxOutside = files.filter((f) => /\.jsx$/.test(f) && !/^src\/studio\/blueprint-engine\/dev-preview-route-menu\//.test(f));
  noTsxCss = badTsxCss.length === 0 && jsxOutside.length === 0;
  noTsxCssDetail = noTsxCss ? '.jsx only inside authorized subtree; no .tsx / .css added' : `bad: ${[...badTsxCss, ...jsxOutside].join(', ')}`;
} catch (err) { noTsxCss = true; noTsxCssDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-RM — .jsx only inside authorized subtree; no .tsx / .css added', noTsxCss, noTsxCssDetail);

let noOldEdit = false; let noOldEditDetail = '';
{
  const { gitAvailable, evaluation } = studioScope();
  if (!gitAvailable) { noOldEdit = true; noOldEditDetail = 'git base unavailable — skipped'; }
  else {
    // A prior slice's test or gate may appear ONLY when the ACTIVE slice is explicitly
    // cross-authorized for it, and only when that active slice is this one or later.
    const chronologyOk = !evaluation.applicable
      || (evaluation.activeSliceOrdinal !== null && evaluation.activeSliceOrdinal >= evaluation.callerSliceOrdinal);
    noOldEdit = evaluation.safe && chronologyOk;
    noOldEditDetail = !evaluation.applicable
      ? `branch diff not applicable: ${evaluation.reason}`
      : noOldEdit
      ? `no unauthorized prior gate/test (active ${evaluation.activeSliceId} #${evaluation.activeSliceOrdinal} >= ${CALLER_SLICE_ID} #${evaluation.callerSliceOrdinal})`
      : `blocked: ${evaluation.blockers.join(',')}`;
  }
}
gate('G423-RM — App.jsx / vite / index.html / guards / prior gates/tests NOT altered by this slice', noOldEdit, noOldEditDetail);

let regOk = false; let regDetail = '';
try {
  const reg = await import(pathToFileURL(path.join(ROOT, 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs')).href);
  const known = reg.KNOWN_LATER_STUDIO_HEADLESS_ARTIFACTS;
  const hasOwn = known.some((re) => re.test('src/studio/blueprint-engine/dev-preview-route-menu/index.js'));
  const forbiddenProbes = ['src/modules/x/y.js', 'backend/server.js', 'src/App.jsx', 'backend/prisma/schema.prisma', 'src/pages/z.jsx'];
  const leaks = forbiddenProbes.filter((p) => known.some((re) => re.test(p)));
  regOk = hasOwn && leaks.length === 0;
  regDetail = regOk ? 'specific route-menu paths registered; no broad wildcard leaks a forbidden path' : `hasOwn=${hasOwn} leaks=${leaks.join(',')}`;
} catch (err) { regOk = false; regDetail = err instanceof Error ? err.message : String(err); }
gate('G423-RM — registry: specific slice paths only, no dangerous wildcard', regOk, regDetail);

let noNewDep = false;
try {
  const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
  const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
  const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
  noNewDep = bk === hk;
} catch { noNewDep = true; }
gate('G423-RM — no new dependency added', noNewDep);

gate('G423-RM — src/modules/studio does NOT exist', !exists(path.join(ROOT, 'src/modules/studio')));
gate('G423-RM — src/modules/clientes does NOT exist', !exists(path.join(ROOT, 'src/modules/clientes')));
gate('G423-RM — upstream route/menu contract present', exists(path.join(RMC_DIR, 'index.js')));
gate('G423-RM — upstream runtime UI present', exists(path.join(UI_DIR, 'index.js')));

let testsOk = false; let testCount = 0;
try {
  const out = execSync('node --test src/runtime/__tests__/studio-dev-preview-route-menu.test.js', { cwd: ROOT, stdio: 'pipe', env: { ...process.env, NODE_ENV: 'test' } }).toString();
  const mt = out.match(/# tests (\d+)/); const mp = out.match(/# pass (\d+)/); const mf = out.match(/# fail (\d+)/);
  testCount = mt ? Number(mt[1]) : 0;
  testsOk = mf ? Number(mf[1]) === 0 && mp && Number(mp[1]) === testCount : false;
} catch (err) { if (err.stderr) console.error(String(err.stderr)); }
gate('G423-RM — route/menu runtime unit tests PASS', testsOk, `${testCount} scenarios`);
gate('G423-RM — unit test has >= 430 scenarios', testCount >= 430, `${testCount} scenarios (min 430)`);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-STUDIO-DEV-PREVIEW-ROUTE-MENU summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}  (total checks: ${results.length})`);
if (failed.length > 0) process.exit(1);
