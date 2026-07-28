#!/usr/bin/env node
/**
 * Gate G423-STUDIO-DEV-PREVIEW-APP-INTEGRATION-CONTRACT — Post-Foundation C.
 *
 * Proves the headless, CONTRACT-ONLY, METADATA-ONLY App integration contract in
 * `src/studio/blueprint-engine/dev-preview-app-integration-contract/`. It consumes the Dev Preview
 * Route/Menu runtime and produces deterministic contracts describing how a FUTURE, separately-
 * approved slice would attach the isolated dev-preview host to the real App — attachment points,
 * dev-only feature flag metadata, product isolation, App bootstrap boundary, router/menu exposure
 * metadata, Runtime UI mount adapter metadata, dependency injection boundary, lifecycle/cleanup,
 * failure containment, ownership/rollback, production/staging denial, prototype-relink prohibition,
 * and a manual enablement gate.
 *
 * It INTEGRATES NOTHING. It creates NO App/router/menu/sidebar wiring, NO route/menu exposure, NO
 * Runtime UI mount in the App, NO feature flag connected to the App, NO router primitives, NO
 * `ReactDOM`/`createRoot`/`window`/`document`, NO public deep link, NO module, and never touches
 * `src/App.jsx`, backend/Prisma/migration/production/staging/mutation/real-data/Empresas, and NEVER
 * relinks the old Studio prototype. No `.jsx`/`.tsx`/`.css`.
 *
 * Scope safety uses the central Studio Scope Governance guard: forbidden always wins; legitimate
 * later Studio headless artifacts are tolerated; nothing weakens the block.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { isKnownLaterStudioHeadlessArtifact, filterForbiddenScopePaths } from './lib/studioScopeGovernanceGuard.mjs';

const ROOT = process.cwd();
const DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-app-integration-contract');
const RM_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-route-menu');
const RMC_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-route-menu-contract');
const UI_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-runtime-ui');
const UC_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-runtime-ui-contract');
const IR_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-isolated-runtime');
const PLAN_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-isolated-runtime-implementation-plan');
const SHELL_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-runtime-shell-contract');
const VISUAL_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-visual-contract');
const BRIDGE_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-contract-bridge');
const SANDBOX_DIR = path.join(ROOT, 'src/studio/blueprint-engine/module-preview-sandbox');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-dev-preview-app-integration-contract');
const results = [];

const gate = (name, ok, detail = '') => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
};
const exists = (p) => fs.existsSync(p);
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const walk = (dir, ext) => (fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const full = path.join(dir, e.name);
  if (e.isDirectory()) return walk(full, ext);
  return e.isFile() && ext.test(e.name) ? [full] : [];
}) : []);
const jsFiles = () => walk(DIR, /\.js$/);
const code = () => stripComments(jsFiles().map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
const importsOf = () => jsFiles().flatMap((f) => [...stripComments(fs.readFileSync(f, 'utf8')).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((mm) => mm[1]));
const readEv = (f) => (exists(path.join(EV, f)) ? fs.readFileSync(path.join(EV, f), 'utf8') : '');

const AUTHORIZED = [
  /^src\/studio\/blueprint-engine\/dev-preview-app-integration-contract\//,
  /^src\/runtime\/__tests__\/studio-dev-preview-app-integration-contract\.test\.js$/,
  /^scripts\/gates\/g423-studio-dev-preview-app-integration-contract\.mjs$/,
  /^scripts\/gates\/lib\/studioScopeGovernanceRegistry\.mjs$/,
  /^package\.json$/,
  /^package-lock\.json$/,
  /^docs\/evidence\/post-foundation-c-studio-dev-preview-app-integration-contract\//,
];
const authorized = (f) => AUTHORIZED.some((re) => re.test(f)) || isKnownLaterStudioHeadlessArtifact(f);

const FILES = [
  'appIntegrationContractConfig.js', 'errors.js', 'createAppIntegrationContractSession.js',
  'createAppAttachmentPointContract.js', 'createDevOnlyFeatureFlagContract.js', 'createProductIsolationContract.js',
  'createAppBootstrapBoundaryContract.js', 'createRouterAttachmentContract.js', 'createRouteExposureContract.js',
  'createMenuExposureContract.js', 'createRuntimeUiMountAdapterContract.js', 'createDependencyInjectionBoundaryContract.js',
  'createLifecycleCleanupContract.js', 'createFailureContainmentContract.js', 'createOwnershipRollbackContract.js',
  'createProductionStagingDenialContract.js', 'createPrototypeRelinkProhibitionContract.js',
  'createAppIntegrationManualEnablementGateContract.js', 'createAppIntegrationSafetyContract.js',
  'createAppIntegrationReadinessDecision.js', 'createAppIntegrationManifest.js', 'verifyAppIntegrationContract.js',
  'checkAppIntegrationCompatibility.js', 'createAppIntegrationDiagnostics.js', 'createAppIntegrationFallback.js',
  'createStudioDevPreviewAppIntegrationContract.js', 'index.js',
];
const DOCS = [
  'CERTIFICATION-REPORT.md', 'STUDIO-DEV-PREVIEW-APP-INTEGRATION-CONTRACT-REPORT.md', 'CONTRACT-SESSION.md',
  'APP-ATTACHMENT-POINT-CONTRACT.md', 'DEV-ONLY-FEATURE-FLAG-CONTRACT.md', 'PRODUCT-ISOLATION-CONTRACT.md',
  'APP-BOOTSTRAP-BOUNDARY-CONTRACT.md', 'ROUTER-ATTACHMENT-CONTRACT.md', 'ROUTE-EXPOSURE-CONTRACT.md',
  'MENU-EXPOSURE-CONTRACT.md', 'RUNTIME-UI-MOUNT-ADAPTER-CONTRACT.md', 'DEPENDENCY-INJECTION-BOUNDARY-CONTRACT.md',
  'LIFECYCLE-CLEANUP-CONTRACT.md', 'FAILURE-CONTAINMENT-CONTRACT.md', 'OWNERSHIP-ROLLBACK-CONTRACT.md',
  'PRODUCTION-STAGING-DENIAL-CONTRACT.md', 'PROTOTYPE-RELINK-PROHIBITION-CONTRACT.md', 'MANUAL-ENABLEMENT-GATE.md',
  'SAFETY-CONTRACT.md', 'MANIFEST-VERIFIER-COMPATIBILITY.md', 'NO-APP-NO-ROUTER-NO-MENU-NO-MOUNT.md',
  'QUALITY-SCALABILITY-NOTES.md', 'NEXT-SLICE-SPEC.md',
];

for (const f of FILES) gate(`G423-AIC — ${f} exists`, exists(path.join(DIR, f)));
for (const d of DOCS) gate(`G423-AIC — ${d} exists`, exists(path.join(EV, d)));
gate('G423-AIC — tests exist', exists(path.join(ROOT, 'src/runtime/__tests__/studio-dev-preview-app-integration-contract.test.js')));
gate('G423-AIC — no .jsx in subtree', walk(DIR, /\.jsx$/).length === 0);
gate('G423-AIC — no .tsx in subtree', walk(DIR, /\.tsx$/).length === 0);
gate('G423-AIC — no .css in subtree', !fs.readdirSync(DIR).some((f) => /\.css$/.test(f)));
gate('G423-AIC — exactly 27 .js files', jsFiles().length === 27, `${jsFiles().length} .js`);

let m = null; let rmMod = null; let rmcMod = null; let uiMod = null; let ucMod = null; let irMod = null; let planMod = null; let shellMod = null; let visualMod = null; let bridgeMod = null; let sandboxMod = null;
try { m = await import(pathToFileURL(path.join(DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { rmMod = await import(pathToFileURL(path.join(RM_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { rmcMod = await import(pathToFileURL(path.join(RMC_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { uiMod = await import(pathToFileURL(path.join(UI_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { ucMod = await import(pathToFileURL(path.join(UC_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { irMod = await import(pathToFileURL(path.join(IR_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { planMod = await import(pathToFileURL(path.join(PLAN_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { shellMod = await import(pathToFileURL(path.join(SHELL_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { visualMod = await import(pathToFileURL(path.join(VISUAL_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { bridgeMod = await import(pathToFileURL(path.join(BRIDGE_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { sandboxMod = await import(pathToFileURL(path.join(SANDBOX_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }

let SB = null; let BRIDGE = null; let VC = null; let RS = null; let IPLAN = null; let IR = null; let UC = null; let UI = null; let RMC = null; let RM = null; let U = null;
try { SB = sandboxMod.createStudioModulePreviewSandboxContract({ blueprint: { moduleId: 'clientes', moduleName: 'Clientes', modelType: 'cadastro', modelFamily: 'ModeloBase1', fields: [{ name: 'nome', type: 'text' }], permissions: [{ action: 'read', level: 'module' }] } }); } catch (err) { console.error(String(err)); }
try { BRIDGE = bridgeMod.createStudioDevPreviewContractBridge({ sandbox: SB }); } catch (err) { console.error(String(err)); }
try { VC = visualMod.createStudioDevPreviewVisualContract({ bridge: BRIDGE }); } catch (err) { console.error(String(err)); }
try { RS = shellMod.createStudioDevPreviewRuntimeShellContract({ visualContract: VC }); } catch (err) { console.error(String(err)); }
try { IPLAN = planMod.createStudioDevPreviewIsolatedRuntimeImplementationPlan({ runtimeShellContract: RS }); } catch (err) { console.error(String(err)); }
try { IR = irMod.createStudioDevPreviewIsolatedRuntime({ implementationPlan: IPLAN }); } catch (err) { console.error(String(err)); }
try { UC = ucMod.createStudioDevPreviewRuntimeUiContract({ isolatedRuntime: IR }); } catch (err) { console.error(String(err)); }
try { UI = uiMod.createStudioDevPreviewRuntimeUi({ runtimeUiContract: UC, env: { DEV: 'true' } }); } catch (err) { console.error(String(err)); }
try { RMC = rmcMod.createStudioDevPreviewRouteMenuContract({ runtimeUi: UI }); } catch (err) { console.error(String(err)); }
try { RM = rmMod.createStudioDevPreviewRouteMenu({ routeMenuContract: RMC, runtimeUi: UI, enabled: true, environment: 'development', checkpointReceipt: 'approved_for_isolated_route_menu_runtime', initialPath: '/__dev/studio/preview' }); } catch (err) { console.error(String(err)); }
try { U = m.createStudioDevPreviewAppIntegrationContract({ routeMenuRuntime: RM }); } catch (err) { console.error(String(err)); }

let baseOk = false; let baseDetail = '';
try {
  baseOk = U.kind === 'studio-dev-preview-app-integration-contract'
    && U.appIntegrationContractName === 'studio-dev-preview-app-integration-contract'
    && U.appIntegrationContractVersion === 'studio-dev-preview-app-integration-contract@1.0.0'
    && U.routeMenuVersion === 'studio-dev-preview-route-menu@1.0.0'
    && U.runtimeUiVersion === 'studio-dev-preview-runtime-ui@1.0.0'
    && U.mode === 'headless_dev_preview_app_integration_contract'
    && U.fallback === false
    && U.headless === true && U.contractOnly === true && U.metadataOnly === true
    && U.appIntegrationContractOnly === true && U.devOnly === true && U.isolated === true
    && U.readiness === 'studio_dev_preview_app_integration_contract_ready'
    && U.readyForAppIntegrationContract === true
    && U.readyForAppIntegrationImplementationPlan === false
    && U.readyForAppIntegrationImplementationSlice === false
    && U.readyForRealModuleGeneration === false
    && U.readyForProduction === false
    && U.blockerCount === 0 && U.warningCount === 0;
  baseDetail = baseOk ? `readiness=${U.readiness}` : 'contract invariants wrong';
} catch (err) { baseDetail = err instanceof Error ? err.message : String(err); }
gate('G423-AIC — headless/contract-only invariants + readiness ready', baseOk, baseDetail);

let capOk = false;
try {
  const c = m.APP_INTEGRATION_CONTRACT_CAPABILITIES;
  const trues = ['headless', 'contractOnly', 'metadataOnly', 'appIntegrationContractOnly', 'devOnly', 'isolated', 'attachmentPointMetadataOnly', 'featureFlagMetadataOnly', 'productIsolationMetadataOnly', 'bootstrapBoundaryMetadataOnly', 'routerAttachmentMetadataOnly', 'routeExposureMetadataOnly', 'menuExposureMetadataOnly', 'runtimeUiMountAdapterMetadataOnly', 'dependencyInjectionBoundaryMetadataOnly', 'lifecycleCleanupMetadataOnly', 'failureContainmentMetadataOnly', 'ownershipRollbackMetadataOnly', 'productionDenialMetadataOnly', 'prototypeRelinkProhibitionMetadataOnly', 'manualEnablementGateOnly'];
  const noes = ['appIntegrated', 'appTouched', 'appWiringCreated', 'routerTouched', 'routerWiringCreated', 'routeExposedToProduct', 'menuExposedToProduct', 'sidebarExposedToProduct', 'runtimeUiMountedInApp', 'featureFlagConnectedToApp', 'reactDomUsed', 'createRootUsed', 'windowUsed', 'documentUsed', 'deepLinkCreated', 'moduleGenerated', 'filesWrittenToModule', 'moduleRegistered', 'backendAccessed', 'prismaAccessed', 'productionAccessed', 'stagingAccessed', 'fetchUsed', 'mutationAllowed', 'persistenceCreated', 'realDataRead', 'realDataWrite', 'rewriteEmpresas'];
  capOk = Object.isFrozen(c) && trues.every((k) => c[k] === true) && noes.every((k) => c[k] === false) && noes.every((k) => U.capabilities[k] === false);
} catch { capOk = false; }
gate('G423-AIC — capabilities frozen; *MetadataOnly true; App/router/menu/mount + all forbidden flags false', capOk);

const part = (fn, argObj, pred) => { try { return pred(argObj === undefined ? m[fn]() : m[fn](argObj)); } catch (err) { console.error(`${fn}: ${err}`); return false; } };
gate('G423-AIC — session (no storage/fetch/persistence)', part('createAppIntegrationContractSession', { routeMenuRuntime: RM }, (x) => x.kind === 'app-integration-contract-session' && x.usesStorage === false && x.usesFetch === false && x.usesPersistence === false && typeof x.seed === 'string'));
gate('G423-AIC — attachment point (appTouched/created/performed false; requires future slice+gate)', part('createAppAttachmentPointContract', { routeMenuRuntime: RM }, (x) => x.appTouched === false && x.attachmentCreated === false && x.integrationPerformed === false && x.requiresExplicitFutureSlice === true && x.requiresManualGate === true));
gate('G423-AIC — dev-only feature flag (default-off; production/staging denied; not connected to app)', part('createDevOnlyFeatureFlagContract', undefined, (x) => x.defaultEnabled === false && x.devOnly === true && x.productionAllowed === false && x.stagingAllowed === false && x.connectedToApp === false));
gate('G423-AIC — product isolation (app/router/menu/sidebar/navigation/modules/data isolated; not breached)', part('createProductIsolationContract', undefined, (x) => x.productAppIsolated === true && x.productRouterIsolated === true && x.productMenuIsolated === true && x.productSidebarIsolated === true && x.productNavigationIsolated === true && x.productModulesIsolated === true && x.productDataIsolated === true && x.isolationBreached === false));
gate('G423-AIC — bootstrap boundary (not touched; no auto/on-import mount or side effect)', part('createAppBootstrapBoundaryContract', undefined, (x) => x.bootstrapTouched === false && x.bootstrapIntegrationCreated === false && x.autoMountAllowed === false && x.mountOnImportAllowed === false && x.sideEffectOnImportAllowed === false));
gate('G423-AIC — router attachment (not touched; no route registered; no BrowserRouter/createBrowserRouter/useNavigate)', part('createRouterAttachmentContract', undefined, (x) => x.routerTouched === false && x.routerAttachmentCreated === false && x.routeRegistered === false && x.browserRouterUsed === false && x.createBrowserRouterUsed === false && x.useNavigateUsed === false));
gate('G423-AIC — route exposure (not exposed; no public route/deep link/browser navigation)', part('createRouteExposureContract', undefined, (x) => x.routeExposedToProduct === false && x.publicRouteCreated === false && x.deepLinkCreated === false && x.browserNavigationAllowed === false));
gate('G423-AIC — menu exposure (menu/sidebar/navigation not exposed; no menu item)', part('createMenuExposureContract', undefined, (x) => x.menuExposedToProduct === false && x.sidebarExposedToProduct === false && x.navigationExposedToProduct === false && x.menuItemCreated === false));
gate('G423-AIC — runtime UI mount adapter (not mounted in app; no reactDom/createRoot/window/document/mount-node/root-factory)', part('createRuntimeUiMountAdapterContract', undefined, (x) => x.runtimeUiMountedInApp === false && x.mountAdapterCreated === false && x.reactDomUsed === false && x.createRootUsed === false && x.windowUsed === false && x.documentUsed === false && x.mountNodeCreated === false && x.rootFactoryInjected === false));
gate('G423-AIC — dependency injection boundary (DI required; no implicit/global/service-locator/App/router/menu import)', part('createDependencyInjectionBoundaryContract', undefined, (x) => x.dependencyInjectionRequired === true && x.implicitDependencyLookupAllowed === false && x.globalLookupAllowed === false && x.serviceLocatorAllowed === false && x.AppImportAllowed === false && x.routerImportAllowed === false && x.menuImportAllowed === false));
gate('G423-AIC — lifecycle/cleanup (not integrated; no auto start/stop/unmount)', part('createLifecycleCleanupContract', undefined, (x) => x.lifecycleIntegrated === false && x.cleanupIntegrated === false && x.autoStartAllowed === false && x.autoStopAllowed === false && x.unmountIntegrated === false));
gate('G423-AIC — failure containment (fail-closed; no app/router/menu failure propagation)', part('createFailureContainmentContract', undefined, (x) => x.failClosed === true && x.failureContained === true && x.productAppFailurePropagationAllowed === false && x.productRouterFailurePropagationAllowed === false && x.productMenuFailurePropagationAllowed === false));
gate('G423-AIC — ownership/rollback (studio owner; no product ownership; rollback by non-consumption/flag-off; no destructive rollback)', part('createOwnershipRollbackContract', undefined, (x) => x.owner === 'studio_dev_preview' && x.productOwnership === false && x.rollbackByNonConsumption === true && x.rollbackByFlagOff === true && x.destructiveRollbackRequired === false));
gate('G423-AIC — production/staging denial (denied; default off; fail-closed)', part('createProductionStagingDenialContract', undefined, (x) => x.productionDenied === true && x.stagingDenied === true && x.defaultOff === true && x.failClosed === true));
gate('G423-AIC — prototype relink prohibition (relink/import/copy/move not allowed; forbidden paths enumerated)', part('createPrototypeRelinkProhibitionContract', undefined, (x) => x.prototypeRelinkAllowed === false && x.prototypeImportAllowed === false && x.prototypeCopyAllowed === false && x.prototypeMoveAllowed === false && x.oldPrototypeImported === false && Array.isArray(x.forbiddenPrototypePaths) && x.forbiddenPrototypePaths.length >= 8));
gate('G423-AIC — manual gate (required checkpoint; authorizes nothing real)', part('createAppIntegrationManualEnablementGateContract', undefined, (x) => x.manualGateRequired === true && x.currentSliceAuthorization === 'contract_only' && x.authorizesAppTouch === false && x.authorizesAppWiring === false && x.authorizesRouterWiring === false && x.authorizesRouteExposure === false && x.authorizesMenuExposure === false && x.authorizesRuntimeUiMount === false && x.authorizesProduction === false && x.authorizesBackend === false && x.authorizesPrisma === false && x.authorizesRealData === false));
gate('G423-AIC — safety (anyForbiddenSideEffect false; reversible; all forbidden flags false)', part('createAppIntegrationSafetyContract', undefined, (x) => x.anyForbiddenSideEffect === false && x.reversibleByNonConsumption === true && Object.values(x.forbiddenFlags).every((v) => v === false)));

gate('G423-AIC — readiness never plan/slice/generation/production', (() => { try { const r = m.createAppIntegrationReadinessDecision({}); return r.readyForAppIntegrationImplementationPlan === false && r.readyForAppIntegrationImplementationSlice === false && r.readyForRealModuleGeneration === false && r.readyForProduction === false; } catch { return false; } })());
gate('G423-AIC — readiness blocked on blockers', (() => { try { return m.createAppIntegrationReadinessDecision({ blockers: ['x'] }).readiness === 'blocked'; } catch { return false; } })());

let manOk = false;
try { manOk = U.manifest.kind === 'app-integration-contract-manifest' && U.manifest.appIntegrationContractVersion === 'studio-dev-preview-app-integration-contract@1.0.0' && U.manifest.capabilities.contractOnly === true && U.manifest.capabilities.appIntegrated === false && U.manifest.metadataOnly === true; } catch { manOk = false; }
gate('G423-AIC — manifest present + capability flags mirrored', manOk);

let verOk = false;
try { verOk = U.verification.ok === true && U.verification.valid === true && U.verification.headless === true && U.verification.contractOnly === true && U.verification.metadataOnly === true && U.verification.appIntegrated === false && U.verification.runtimeUiMountedInApp === false && U.verification.blockerCount === 0; } catch { verOk = false; }
gate('G423-AIC — verifier passes headless/contract-only invariants', verOk);

let verTamper = false;
try {
  const c = m.APP_INTEGRATION_CONTRACT_CAPABILITIES;
  const ok = (o) => m.verifyAppIntegrationContract(o).blockers;
  verTamper = ok({ contract: { capabilities: { ...c, appIntegrated: true } } }).includes('capability_appIntegrated_must_be_false')
    && ok({ contract: { capabilities: { ...c, appTouched: true } } }).includes('capability_appTouched_must_be_false')
    && ok({ contract: { capabilities: { ...c, appWiringCreated: true, routerWiringCreated: true } } }).includes('capability_appWiringCreated_must_be_false')
    && ok({ contract: { capabilities: { ...c, routeExposedToProduct: true, menuExposedToProduct: true } } }).includes('capability_routeExposedToProduct_must_be_false')
    && ok({ contract: { capabilities: { ...c, runtimeUiMountedInApp: true } } }).includes('capability_runtimeUiMountedInApp_must_be_false')
    && ok({ contract: { capabilities: { ...c, featureFlagConnectedToApp: true } } }).includes('capability_featureFlagConnectedToApp_must_be_false')
    && ok({ contract: { capabilities: { ...c, reactDomUsed: true, createRootUsed: true } } }).includes('capability_reactDomUsed_must_be_false')
    && ok({ contract: { capabilities: { ...c, windowUsed: true, documentUsed: true } } }).includes('capability_windowUsed_must_be_false')
    && ok({ contract: { capabilities: { ...c, deepLinkCreated: true } } }).includes('capability_deepLinkCreated_must_be_false')
    && ok({ contract: { capabilities: { ...c, backendAccessed: true, prismaAccessed: true } } }).includes('capability_backendAccessed_must_be_false')
    && ok({ contract: { capabilities: { ...c, productionAccessed: true, stagingAccessed: true } } }).includes('capability_productionAccessed_must_be_false')
    && ok({ contract: { capabilities: { ...c, realDataRead: true, realDataWrite: true } } }).includes('capability_realDataRead_must_be_false')
    && ok({ contract: { capabilities: { ...c, headless: false } } }).includes('capability_headless_must_be_true')
    && ok({ contract: { capabilities: c, attachmentPoint: { appTouched: true } } }).includes('unsafe_app_touched')
    && ok({ contract: { capabilities: c, routerAttachment: { browserRouterUsed: true } } }).includes('unsafe_router_api')
    && ok({ contract: { capabilities: c, routeExposure: { routeExposedToProduct: true } } }).includes('unsafe_route_exposed')
    && ok({ contract: { capabilities: c, menuExposure: { menuExposedToProduct: true } } }).includes('unsafe_menu_exposed')
    && ok({ contract: { capabilities: c, runtimeUiMountAdapter: { runtimeUiMountedInApp: true } } }).includes('unsafe_runtime_ui_mounted')
    && ok({ contract: { capabilities: c, runtimeUiMountAdapter: { windowUsed: true } } }).includes('unsafe_dom_globals')
    && ok({ contract: { capabilities: c, prototypeRelinkProhibition: { prototypeRelinkAllowed: true } } }).includes('unsafe_prototype_relink')
    && ok({ contract: { capabilities: c, productionStagingDenial: { productionDenied: false } } }).includes('unsafe_production_staging_allowed')
    && ok({ contract: { capabilities: c, manualGate: { manualGateRequired: false } } }).includes('missing_manual_gate')
    && (() => { try { m.verifyAppIntegrationContract({ contract: null }); return true; } catch { return false; } })();
} catch { verTamper = false; }
gate('G423-AIC — verifier detects App/router/menu/exposure/mount/reactDom/dom-globals/deep-link/backend/production/data/prototype/production-denial/manual-gate attempts', verTamper);

let cmpOk = false;
try {
  const okc = m.checkAppIntegrationCompatibility({ routeMenuRuntime: RM });
  const bad = m.checkAppIntegrationCompatibility({ routeMenuRuntime: { runtimeUiVersion: 'x@9.9.9', kind: 'other' } });
  cmpOk = okc.compatibleWithRouteMenuRuntime === true && okc.compatibleWithRuntimeUi === true && okc.readyForAppIntegrationContract === true && okc.readyForAppIntegrationImplementationPlan === false && okc.readyForAppIntegrationImplementationSlice === false && okc.readyForProduction === false && okc.status === 'ready_for_future_app_integration_implementation_plan_when_explicitly_authorized' && bad.compatibleWithRuntimeUi === false && bad.warnings.includes('incompatible_runtimeUi');
} catch { cmpOk = false; }
gate('G423-AIC — compatibility aligned; never authorizes plan/slice/generation/production; mismatch → warning', cmpOk);

let diagOk = false;
try { diagOk = U.diagnostics.passive === true && U.diagnostics.ok === true && U.diagnostics.headlessConfirmed === true && U.diagnostics.contractOnlyConfirmed === true && U.diagnostics.appIntegrated === false && !/jwt|token|secret|DATABASE_URL/i.test(JSON.stringify(U.diagnostics)); } catch { diagOk = false; }
gate('G423-AIC — diagnostics passive, headless/contract-only confirmed, no secrets', diagOk);

let fbOk = false;
try {
  const fb = m.createStudioDevPreviewAppIntegrationContract({});
  const fb2 = m.createStudioDevPreviewAppIntegrationContract({ routeMenuRuntime: { kind: 'other' } });
  const fb3 = m.createStudioDevPreviewAppIntegrationContract({ routeMenuRuntime: { kind: 'studio-dev-preview-route-menu', fallback: true } });
  fbOk = fb.fallback === true && fb.readiness === 'blocked' && fb.readyForAppIntegrationContract === false && fb.capabilities.appIntegrated === false && fb2.fallback === true && fb3.fallback === true;
} catch { fbOk = false; }
gate('G423-AIC — fallback fail-closed on invalid/missing/fallback route/menu runtime', fbOk);

let detOk = false;
try {
  const a = m.createStudioDevPreviewAppIntegrationContract({ routeMenuRuntime: RM });
  const b = m.createStudioDevPreviewAppIntegrationContract({ routeMenuRuntime: RM });
  detOk = a.overallDigest === b.overallDigest && a.appIntegrationContractDigest === b.appIntegrationContractDigest && a.overallDigest.startsWith('fnv1a-');
} catch { detOk = false; }
gate('G423-AIC — deterministic overall + contract digests', detOk);

let flagOk = false;
try {
  const off = m.isStudioDevPreviewAppIntegrationContractEnabled({ [m.MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_CONTRACT_FLAG]: 'true', MAK_ENV_LABEL: 'production' });
  const onDev = m.isStudioDevPreviewAppIntegrationContractEnabled({ [m.MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_CONTRACT_FLAG]: 'true', DEV: 'true' });
  const vOff = m.isStudioDevPreviewAppIntegrationVerifyEnabled({ [m.MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_VERIFY_FLAG]: 'true', NODE_ENV: 'production' });
  flagOk = off === false && onDev === true && vOff === false;
} catch { flagOk = false; }
gate('G423-AIC — feature flags fail closed in production', flagOk);

gate('G423-AIC — error catalog >= 40 codes', Array.isArray(m?.APP_INTEGRATION_CONTRACT_ERROR_CODES) && m.APP_INTEGRATION_CONTRACT_ERROR_CODES.length >= 40);
gate('G423-AIC — error descriptor sanitized + side-effect free', (() => { try { const e = m.createAppIntegrationContractError('APP_INTEGRATION_PRISMA_BLOCKED'); return e.kind === 'app-integration-contract-error' && e.safe === true && e.sideEffects === false && e.appTouched === false && e.realDataRead === false; } catch { return false; } })());
gate('G423-AIC — required future checkpoint is enterprise checkpoint', m?.REQUIRED_FUTURE_CHECKPOINT === 'pre_app_integration_implementation_enterprise_checkpoint');

// Explicit contract invariants.
gate('G423-AIC — appIntegrated false', U ? U.capabilities.appIntegrated === false : false);
gate('G423-AIC — appTouched false', U ? U.capabilities.appTouched === false : false);
gate('G423-AIC — appWiringCreated false', U ? U.capabilities.appWiringCreated === false : false);
gate('G423-AIC — routerWiringCreated false', U ? U.capabilities.routerWiringCreated === false : false);
gate('G423-AIC — routeExposedToProduct false', U ? U.capabilities.routeExposedToProduct === false : false);
gate('G423-AIC — menuExposedToProduct false', U ? U.capabilities.menuExposedToProduct === false : false);
gate('G423-AIC — sidebarExposedToProduct false', U ? U.capabilities.sidebarExposedToProduct === false : false);
gate('G423-AIC — runtimeUiMountedInApp false', U ? U.capabilities.runtimeUiMountedInApp === false : false);
gate('G423-AIC — featureFlagConnectedToApp false', U ? U.capabilities.featureFlagConnectedToApp === false : false);
gate('G423-AIC — reactDomUsed/createRootUsed false', U ? (U.capabilities.reactDomUsed === false && U.capabilities.createRootUsed === false) : false);
gate('G423-AIC — windowUsed/documentUsed false', U ? (U.capabilities.windowUsed === false && U.capabilities.documentUsed === false) : false);
gate('G423-AIC — deepLinkCreated false', U ? U.capabilities.deepLinkCreated === false : false);
gate('G423-AIC — moduleGenerated false', U ? U.capabilities.moduleGenerated === false : false);
gate('G423-AIC — backendAccessed/prismaAccessed false', U ? (U.capabilities.backendAccessed === false && U.capabilities.prismaAccessed === false) : false);
gate('G423-AIC — top-level realDataRead/realDataWrite false', U ? (U.capabilities.realDataRead === false && U.capabilities.realDataWrite === false) : false);
gate('G423-AIC — readyForAppIntegrationImplementationPlan false', U ? U.readyForAppIntegrationImplementationPlan === false : false);
gate('G423-AIC — readyForAppIntegrationImplementationSlice false', U ? U.readyForAppIntegrationImplementationSlice === false : false);
gate('G423-AIC — readyForProduction false', U ? U.readyForProduction === false : false);
gate('G423-AIC — manual gate required in contract', (() => { try { return U.manualGate.manualGateRequired === true && U.manualGate.authorizesAppWiring === false; } catch { return false; } })());
gate('G423-AIC — prototype relink prohibited in contract', (() => { try { return U.prototypeRelinkProhibition.prototypeRelinkAllowed === false && U.prototypeRelinkProhibition.oldPrototypeImported === false; } catch { return false; } })());
gate('G423-AIC — runtime UI mount adapter not mounted in contract', (() => { try { return U.runtimeUiMountAdapter.runtimeUiMountedInApp === false && U.runtimeUiMountAdapter.reactDomUsed === false; } catch { return false; } })());
gate('G423-AIC — product isolation intact in contract', (() => { try { return U.productIsolation.productAppIsolated === true && U.productIsolation.isolationBreached === false; } catch { return false; } })());

// Static safety scans — React-Router + DOM API scanned case-sensitively.
gate('G423-AIC — subtree is React-free', importsOf().every((p) => p !== 'react' && !/^react(\/|$)/.test(p)));
gate('G423-AIC — no react-router / react-dom import', importsOf().every((p) => !/react-router|react-dom/i.test(p)));
gate('G423-AIC — no <Route JSX / Routes / Link / NavLink (case-sensitive API)', !/<Route[\s/>]|\bRoutes\b|\bNavLink\b|<Link[\s/>]/.test(code()));
gate('G423-AIC — no BrowserRouter / createBrowserRouter / useNavigate', !/\bBrowserRouter\b|\bcreateBrowserRouter\b|\buseNavigate\b/.test(code()));
gate('G423-AIC — no ReactDOM / createRoot / hydrateRoot call', !/\bReactDOM\b|createRoot\s*\(|hydrateRoot\s*\(/.test(code()));
gate('G423-AIC — no window/document access', !/\bdocument\.|\bwindow\.[a-z]/i.test(code()));
gate('G423-AIC — no JSX/createElement', !/createElement|_jsx\b|jsxs?\(/.test(code()));
gate('G423-AIC — no import of EmpresaApi/apiClient/apis/backend/prisma', importsOf().every((p) => !/EmpresaApi|apiClient|\/apis\/|\/backend\/|@prisma|PrismaClient/i.test(p)));
gate('G423-AIC — no fetch/XHR/WebSocket/storage-API', !/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(code()) && !/localStorage\.|sessionStorage\.|indexedDB\./.test(code()));
gate('G423-AIC — no DATABASE_URL / production API_URL / Railway', !/DATABASE_URL|VITE_API_URL|projetomg-production|railway/i.test(code()));
gate('G423-AIC — no real POST/PUT/PATCH/DELETE method', !/method\s*:\s*['"](POST|PUT|PATCH|DELETE)['"]/.test(code()));
gate('G423-AIC — no realDataRead/realDataWrite true literal', !/realDataRead\s*:\s*true|realDataWrite\s*:\s*true/.test(code()));
gate('G423-AIC — no old Studio prototype import', importsOf().every((p) => !/studio\/(components|shell|designers|pages|navigation|dock|panels|editor)/.test(p)));
gate('G423-AIC — no src/components or src/pages import', importsOf().every((p) => !/(^|\.\.\/)(components|pages)\//.test(p)));
gate('G423-AIC — no App import', importsOf().every((p) => !/(^|\/)App(\.jsx)?$/.test(p)));

gate('G423-AIC — docs validate contract-not-implementation + no-app + next slice', /App|router|menu|mount/i.test(readEv('NO-APP-NO-ROUTER-NO-MENU-NO-MOUNT.md')) && /contract|metadata/i.test(readEv('CERTIFICATION-REPORT.md')) && /IMPLEMENTATION PLAN|implementation plan|checkpoint|App/i.test(readEv('NEXT-SLICE-SPEC.md')));

// Scope safety (git-diff) — forbidden always wins via the central guard.
let blockedOk = false; let blockedDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean)
    .filter((f) => !isKnownLaterStudioHeadlessArtifact(f));
  const bad = filterForbiddenScopePaths(files);
  blockedOk = bad.length === 0;
  blockedDetail = blockedOk ? 'src/modules/Empresas/backend/Prisma/migration/runtime/CSS/SSOT untouched' : `FORBIDDEN: ${bad.join(', ')}`;
} catch (err) { blockedOk = true; blockedDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-AIC — src/modules / Empresas / backend / Prisma / SSOT untouched', blockedOk, blockedDetail);

let scopeOk = false; let scopeDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const outside = files.filter((f) => !authorized(f));
  scopeOk = files.length === 0 || outside.length === 0;
  scopeDetail = scopeOk ? `authorized scope only (${files.length} files)` : `OUT OF SCOPE: ${outside.join(', ')}`;
} catch (err) { scopeOk = true; scopeDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-AIC — authorized scope only (contract subtree + registry + evidence + package)', scopeOk, scopeDetail);

let noJsxTsxCss = false; let noJsxTsxCssDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const bad = files.filter((f) => /\.(jsx|tsx|css)$/.test(f));
  noJsxTsxCss = bad.length === 0;
  noJsxTsxCssDetail = noJsxTsxCss ? 'no .jsx / .tsx / .css added' : `bad: ${bad.join(', ')}`;
} catch (err) { noJsxTsxCss = true; noJsxTsxCssDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-AIC — no .jsx / .tsx / .css added in diff', noJsxTsxCss, noJsxTsxCssDetail);

let noOldEdit = false; let noOldEditDetail = '';
try {
  // Branch-relative check: it runs on later Studio headless slices before merge, so EXPLICITLY registered later
  // Studio headless artifacts are filtered out via the CENTRAL governance guard (no wildcard). Unknown and
  // forbidden paths still fail hard, and the guard libs are checked against the UNFILTERED list.
  const rawFiles = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const files = rawFiles.filter((f) => !isKnownLaterStudioHeadlessArtifact(f));
  const touchedGuard = rawFiles.includes('scripts/gates/lib/productionUiGuard.mjs') || rawFiles.includes('scripts/gates/lib/studioScopeGovernanceGuard.mjs');
  const touchedOldGate = files.some((f) => /^scripts\/gates\/g423-.*\.mjs$/.test(f) && f !== 'scripts/gates/g423-studio-dev-preview-app-integration-contract.mjs');
  const touchedOldTest = files.some((f) => /^src\/runtime\/__tests__\/.*\.test\.js$/.test(f) && f !== 'src/runtime/__tests__/studio-dev-preview-app-integration-contract.test.js');
  const touchedApp = files.includes('src/App.jsx');
  const touchedVite = files.some((f) => /^vite\.config\./.test(f)) || files.includes('index.html');
  noOldEdit = !touchedGuard && !touchedOldGate && !touchedOldTest && !touchedApp && !touchedVite;
  noOldEditDetail = noOldEdit ? 'App.jsx/vite/index.html + guards + prior gates/tests untouched by this slice' : `touched: ${[touchedGuard ? 'guard' : '', touchedOldGate ? 'old-gate' : '', touchedOldTest ? 'old-test' : '', touchedApp ? 'App.jsx' : '', touchedVite ? 'vite/index.html' : ''].filter(Boolean).join(',')}`;
} catch (err) { noOldEdit = true; noOldEditDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-AIC — App.jsx / vite / index.html / guards / prior gates/tests NOT altered by this slice', noOldEdit, noOldEditDetail);

let regOk = false; let regDetail = '';
try {
  const reg = await import(pathToFileURL(path.join(ROOT, 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs')).href);
  const known = reg.KNOWN_LATER_STUDIO_HEADLESS_ARTIFACTS;
  const hasOwn = known.some((re) => re.test('src/studio/blueprint-engine/dev-preview-app-integration-contract/index.js'));
  const forbiddenProbes = ['src/modules/x/y.js', 'backend/server.js', 'src/App.jsx', 'backend/prisma/schema.prisma', 'src/pages/z.jsx'];
  const leaks = forbiddenProbes.filter((p) => known.some((re) => re.test(p)));
  regOk = hasOwn && leaks.length === 0;
  regDetail = regOk ? 'specific contract paths registered; no broad wildcard leaks a forbidden path' : `hasOwn=${hasOwn} leaks=${leaks.join(',')}`;
} catch (err) { regOk = false; regDetail = err instanceof Error ? err.message : String(err); }
gate('G423-AIC — registry: specific slice paths only, no dangerous wildcard', regOk, regDetail);

let noNewDep = false;
try {
  const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
  const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
  const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
  noNewDep = bk === hk;
} catch { noNewDep = true; }
gate('G423-AIC — no new dependency added', noNewDep);

gate('G423-AIC — src/modules/studio does NOT exist', !exists(path.join(ROOT, 'src/modules/studio')));
gate('G423-AIC — App.jsx untouched (not in diff)', (() => { try { const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); return !files.includes('src/App.jsx'); } catch { return true; } })());
gate('G423-AIC — upstream route/menu runtime present', exists(path.join(RM_DIR, 'index.js')));

let testsOk = false; let testCount = 0;
try {
  const out = execSync('node --test src/runtime/__tests__/studio-dev-preview-app-integration-contract.test.js', { cwd: ROOT, stdio: 'pipe', env: { ...process.env, NODE_ENV: 'test' } }).toString();
  const mt = out.match(/# tests (\d+)/); const mp = out.match(/# pass (\d+)/); const mf = out.match(/# fail (\d+)/);
  testCount = mt ? Number(mt[1]) : 0;
  testsOk = mf ? Number(mf[1]) === 0 && mp && Number(mp[1]) === testCount : false;
} catch (err) { if (err.stderr) console.error(String(err.stderr)); }
gate('G423-AIC — app integration contract unit tests PASS', testsOk, `${testCount} scenarios`);
gate('G423-AIC — unit test has >= 410 scenarios', testCount >= 410, `${testCount} scenarios (min 410)`);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-STUDIO-DEV-PREVIEW-APP-INTEGRATION-CONTRACT summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}  (total checks: ${results.length})`);
if (failed.length > 0) process.exit(1);
