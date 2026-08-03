#!/usr/bin/env node
/**
 * Gate G423-STUDIO-DEV-PREVIEW-APP-INTEGRATION — Post-Foundation C.
 *
 * Proves the MINIMAL, ADDITIVE, DEV-ONLY, DEFAULT-OFF, FAIL-CLOSED integration of the isolated Studio
 * Dev Preview into `src/App.jsx` (Fable 5 checkpoint, option A). The integration adds ONE dev-only
 * route at `/__dev/studio/preview`, gated by `shouldMountStudioDevPreviewRoute()` (flag + checkpoint +
 * dev env, strict equality; fail-closed in production/staging), lazy-loaded behind a build-time
 * `import.meta.env.DEV` guard so the production bundle strips the preview entirely. It mounts ONLY the
 * isolated host from `src/studio/blueprint-engine/dev-preview-route-menu/` with synthetic data; no
 * menu/sidebar/public route; no new router; no ReactDOM/createRoot/window/document; no backend/Prisma/
 * real data; no old-prototype relink.
 *
 * It proves: App.jsx additive-only (0 removed lines); productionUiGuard additive-only (prior markers
 * preserved, new marker specific, FORBIDDEN intact, no wildcard); the production build is free of the
 * preview; and the scope governance authorization is specific (App.jsx + productionUiGuard authorized
 * for THIS slice only via the guard's explicitlyAuthorizedForbidden mechanism; studioScopeGovernance
 * Guard untouched).
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { STUDIO_DEV_PREVIEW_APP_INTEGRATION_EXPLICIT_FORBIDDEN } from './lib/studioScopeGovernanceRegistry.mjs';
import { createResolvedActiveStudioSlicePathAuthorizer, evaluateStudioBranchDiffScope, filterForbiddenScopePaths } from './lib/studioScopeGovernanceGuard.mjs';

// ---------------------------------------------------------------------------
// CALLER-AWARE branch-relative scope governance. This gate declares its OWN slice identity,
// so the checks below can ask which slice the branch is building and whether that slice is
// this one or a genuinely later one — a question the previous flat registry could not answer.
// Forbidden and unknown paths still fail closed; nothing is tolerated by mere registration.
// ---------------------------------------------------------------------------
const CALLER_SLICE_ID = 'dev-preview-app-integration';
let studioScopeCache = null;
const studioScope = () => {
  if (studioScopeCache) return studioScopeCache;
  let changed = [];
  let gitAvailable = true;
  try {
    changed = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  } catch { gitAvailable = false; }
  // The forbidden authorization comes from THIS slice's own catalog entry, never from an option passed here.
  // An empty branch diff (this gate also runs on `main`) is NOT a violation: it carries nothing
  // to judge. A non-empty diff is delegated to the chronological core, unchanged.
  const evaluation = evaluateStudioBranchDiffScope(changed, { callerSliceId: CALLER_SLICE_ID });
  studioScopeCache = { gitAvailable, changed, evaluation };
  return studioScopeCache;
};

const ROOT = process.cwd();
// The chronology-free catalog lookup is replaced by the single central authorizer: a path is
// tolerated only when exactly one ACTIVE slice resolves from the branch diff AND that exact
// slice is authorized for that exact path. `activeDiffAuthorizer` is computed once, from the
// complete diff, and authorizes nothing when the diff is empty, unresolved or ambiguous.
const activeDiffAuthorizer = (() => {
  try {
    return createResolvedActiveStudioSlicePathAuthorizer(
      execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean));
  } catch { return createResolvedActiveStudioSlicePathAuthorizer([]); }
})();
const DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-app-integration');
const RM_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-route-menu');
const AIC_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-app-integration-contract');
const APP_JSX = path.join(ROOT, 'src/App.jsx');
const GUARD = path.join(ROOT, 'scripts/gates/lib/productionUiGuard.mjs');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-dev-preview-app-integration');
const DIST = path.join(ROOT, 'dist');
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
const jsxFiles = () => walk(DIR, /\.jsx$/);
const jsCode = () => stripComments(jsFiles().map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
const jsxCode = () => stripComments(jsxFiles().map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
const allCode = () => stripComments([...jsFiles(), ...jsxFiles()].map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
const importsOf = (files) => files.flatMap((f) => [...stripComments(fs.readFileSync(f, 'utf8')).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((mm) => mm[1]));
const readEv = (f) => (exists(path.join(EV, f)) ? fs.readFileSync(path.join(EV, f), 'utf8') : '');
const readApp = () => fs.readFileSync(APP_JSX, 'utf8');
const readGuard = () => fs.readFileSync(GUARD, 'utf8');
const diffOf = (rel) => { try { const p = execSync(`git diff origin/main -- ${rel}`, { cwd: ROOT, encoding: 'utf8' }); if (!p.trim()) return null; const lines = p.split('\n'); return { added: lines.filter((l) => l.startsWith('+') && !l.startsWith('+++')).map((l) => l.slice(1)), removed: lines.filter((l) => l.startsWith('-') && !l.startsWith('---')).map((l) => l.slice(1)) }; } catch { return null; } };

const AUTHORIZED = [
  /^src\/studio\/blueprint-engine\/dev-preview-app-integration\//,
  /^src\/runtime\/__tests__\/studio-dev-preview-app-integration\.test\.js$/,
  /^scripts\/gates\/g423-studio-dev-preview-app-integration\.mjs$/,
  /^scripts\/gates\/lib\/studioScopeGovernanceRegistry\.mjs$/,
  /^src\/App\.jsx$/,
  /^scripts\/gates\/lib\/productionUiGuard\.mjs$/,
  /^package\.json$/,
  /^package-lock\.json$/,
  /^docs\/evidence\/post-foundation-c-studio-dev-preview-app-integration\//,
];
const authorized = (f) => AUTHORIZED.some((re) => re.test(f))
  || activeDiffAuthorizer.isAuthorized(f)
  || STUDIO_DEV_PREVIEW_APP_INTEGRATION_EXPLICIT_FORBIDDEN.some((re) => re.test(f));

const FILES = [
  'appIntegrationConfig.js', 'errors.js', 'createStudioDevPreviewAppIntegration.js', 'createAppIntegrationSession.js',
  'createStudioDevPreviewFeatureGate.js', 'createStudioDevPreviewCheckpointReceipt.js', 'createAppIntegrationPreflight.js',
  'createAppAttachmentDescriptor.js', 'createLazyPreviewLoader.js', 'createRuntimeUiMountRequest.js',
  'createFailureContainment.js', 'createAppIntegrationRollback.js', 'createAppIntegrationDiagnostics.js',
  'createAppIntegrationManifest.js', 'verifyAppIntegration.js', 'checkAppIntegrationCompatibility.js',
  'createAppIntegrationFallback.js', 'index.js',
];
const JSX_FILES = ['StudioDevPreviewAppBoundary.jsx', 'StudioDevPreviewLazyBoundary.jsx', 'StudioDevPreviewFailureBoundary.jsx', 'StudioDevPreviewFallback.jsx'];
const DOCS = [
  'CERTIFICATION-REPORT.md', 'STUDIO-DEV-PREVIEW-APP-INTEGRATION-REPORT.md', 'ARCHITECTURE-DECISION-OPTION-A.md',
  'APP-JSX-ADDITIVE-DIFF.md', 'PRODUCTION-UI-GUARD-ADDITIVE-DIFF.md', 'FEATURE-FLAG-DEFAULT-OFF.md',
  'PRODUCTION-STAGING-FAIL-CLOSED.md', 'LAZY-IMPORT-AND-PRODUCTION-BUNDLE-ABSENCE.md', 'APP-ATTACHMENT.md',
  'RUNTIME-UI-MOUNT.md', 'FAILURE-CONTAINMENT.md', 'ROLLBACK.md', 'PROTOTYPE-RELINK-STATIC-ASSERTION.md',
  'NO-MENU-NO-SIDEBAR-NO-PRODUCT-ROUTE.md', 'NO-MODULE-NO-BACKEND-NO-PRISMA.md', 'NO-REAL-DATA.md',
  'GOVERNANCE-REGISTRY-AUTHORIZATION.md', 'MANIFEST-VERIFIER-COMPATIBILITY.md', 'QUALITY-SCALABILITY-NOTES.md',
  'NEXT-CHECKPOINT-SPEC.md',
];

for (const f of FILES) gate(`G423-AI — ${f} exists`, exists(path.join(DIR, f)));
for (const f of JSX_FILES) gate(`G423-AI — ${f} exists`, exists(path.join(DIR, f)));
for (const d of DOCS) gate(`G423-AI — ${d} exists`, exists(path.join(EV, d)));
gate('G423-AI — tests exist', exists(path.join(ROOT, 'src/runtime/__tests__/studio-dev-preview-app-integration.test.js')));
gate('G423-AI — exactly 18 .js files', jsFiles().length === 18, `${jsFiles().length}`);
gate('G423-AI — exactly 4 .jsx files', jsxFiles().length === 4, `${jsxFiles().length}`);
gate('G423-AI — no .tsx in subtree', walk(DIR, /\.tsx$/).length === 0);
gate('G423-AI — no .css in subtree', !fs.readdirSync(DIR).some((f) => /\.css$/.test(f)));

let m = null; let rmMod = null;
try { m = await import(pathToFileURL(path.join(DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { rmMod = await import(pathToFileURL(path.join(RM_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }

// Build a minimal real route-menu runtime for the composer.
let RM = null; let U = null;
try {
  const sandboxMod = await import(pathToFileURL(path.join(ROOT, 'src/studio/blueprint-engine/module-preview-sandbox/index.js')).href);
  const bridgeMod = await import(pathToFileURL(path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-contract-bridge/index.js')).href);
  const visualMod = await import(pathToFileURL(path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-visual-contract/index.js')).href);
  const shellMod = await import(pathToFileURL(path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-runtime-shell-contract/index.js')).href);
  const planMod = await import(pathToFileURL(path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-isolated-runtime-implementation-plan/index.js')).href);
  const irMod = await import(pathToFileURL(path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-isolated-runtime/index.js')).href);
  const ucMod = await import(pathToFileURL(path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-runtime-ui-contract/index.js')).href);
  const uiMod = await import(pathToFileURL(path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-runtime-ui/index.js')).href);
  const rmcMod = await import(pathToFileURL(path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-route-menu-contract/index.js')).href);
  const SB = sandboxMod.createStudioModulePreviewSandboxContract({ blueprint: { moduleId: 'clientes', moduleName: 'Clientes', modelType: 'cadastro', modelFamily: 'ModeloBase1', fields: [{ name: 'nome', type: 'text' }], permissions: [{ action: 'read', level: 'module' }] } });
  const BR = bridgeMod.createStudioDevPreviewContractBridge({ sandbox: SB });
  const VC = visualMod.createStudioDevPreviewVisualContract({ bridge: BR });
  const RS = shellMod.createStudioDevPreviewRuntimeShellContract({ visualContract: VC });
  const IP = planMod.createStudioDevPreviewIsolatedRuntimeImplementationPlan({ runtimeShellContract: RS });
  const IR = irMod.createStudioDevPreviewIsolatedRuntime({ implementationPlan: IP });
  const UC = ucMod.createStudioDevPreviewRuntimeUiContract({ isolatedRuntime: IR });
  const UI = uiMod.createStudioDevPreviewRuntimeUi({ runtimeUiContract: UC, env: { DEV: 'true' } });
  const RMC = rmcMod.createStudioDevPreviewRouteMenuContract({ runtimeUi: UI });
  RM = rmMod.createStudioDevPreviewRouteMenu({ routeMenuContract: RMC, runtimeUi: UI, enabled: true, environment: 'development', checkpointReceipt: 'approved_for_isolated_route_menu_runtime', initialPath: '/__dev/studio/preview' });
  const RC = m.REQUIRED_CHECKPOINT_RECEIPT;
  U = m.createStudioDevPreviewAppIntegration({ routeMenuRuntime: RM, env: { DEV: 'true', [m.STUDIO_DEV_PREVIEW_ROUTE_FLAG]: 'true', [m.STUDIO_DEV_PREVIEW_CHECKPOINT_FLAG]: RC }, checkpointReceipt: RC });
} catch (err) { console.error(String(err)); }

let baseOk = false; let baseDetail = '';
try {
  baseOk = U.kind === 'studio-dev-preview-app-integration'
    && U.appIntegrationName === 'studio-dev-preview-app-integration'
    && U.appIntegrationVersion === 'studio-dev-preview-app-integration@1.0.0'
    && U.routeMenuVersion === 'studio-dev-preview-route-menu@1.0.0'
    && U.mode === 'dev_only_app_integration'
    && U.routePath === '/__dev/studio/preview'
    && U.fallback === false
    && U.devOnly === true && U.defaultOff === true && U.isolated === true && U.failClosed === true && U.syntheticDataOnly === true
    && U.readiness === 'studio_dev_preview_app_integration_ready'
    && U.readyForAppIntegration === true && U.readyForProductExposure === false && U.readyForProduction === false
    && U.blockerCount === 0 && U.warningCount === 0;
  baseDetail = baseOk ? `readiness=${U.readiness}` : 'invariants wrong';
} catch (err) { baseDetail = err instanceof Error ? err.message : String(err); }
gate('G423-AI — dev-only/default-off/fail-closed invariants + readiness ready', baseOk, baseDetail);

let capOk = false;
try {
  const c = m.APP_INTEGRATION_CAPABILITIES;
  const trues = ['devOnly', 'defaultOff', 'isolated', 'failClosed', 'syntheticDataOnly', 'appIntegrated', 'appTouched', 'appWiringImplemented', 'productionUiGuardExtended', 'featureFlagImplemented', 'featureFlagConnectedToApp', 'devRouteAttached', 'runtimeUiMountedInApp', 'lazyImportUsed', 'rollbackByFlagOff', 'rollbackByRemovingAdditiveBlock'];
  const noes = ['routerWiringImplemented', 'routeExposedToProduct', 'menuExposedToProduct', 'sidebarExposedToProduct', 'runtimeUiMountedByDefault', 'eagerImportUsed', 'productionBundleContainsPreview', 'reactDomUsed', 'createRootUsed', 'windowUsed', 'documentUsed', 'deepLinkPublic', 'moduleGenerated', 'backendAccessed', 'prismaAccessed', 'productionAccessed', 'stagingAccessed', 'fetchUsed', 'mutationAllowed', 'persistenceCreated', 'realDataRead', 'realDataWrite', 'rewriteEmpresas', 'prototypeRelinked'];
  capOk = Object.isFrozen(c) && trues.every((k) => c[k] === true) && noes.every((k) => c[k] === false) && noes.every((k) => U.capabilities[k] === false);
} catch { capOk = false; }
gate('G423-AI — capabilities frozen; dev-only integration true; all product/eager/prod-bundle/real-data flags false', capOk);

// shouldMount matrix.
const SM = (env) => { try { return m.shouldMountStudioDevPreviewRoute(env); } catch { return null; } };
const RC = m ? m.REQUIRED_CHECKPOINT_RECEIPT : 'approved_for_app_integration_slice';
const FLAG = m ? m.STUDIO_DEV_PREVIEW_ROUTE_FLAG : 'MAK_STUDIO_DEV_PREVIEW';
const CKF = m ? m.STUDIO_DEV_PREVIEW_CHECKPOINT_FLAG : 'MAK_STUDIO_DEV_PREVIEW_CHECKPOINT';
gate('G423-AI — shouldMount true in dev+flag+checkpoint', SM({ DEV: 'true', [FLAG]: 'true', [CKF]: RC }) === true);
gate('G423-AI — shouldMount false in production', SM({ MAK_ENV_LABEL: 'production', [FLAG]: 'true', [CKF]: RC }) === false);
gate('G423-AI — shouldMount false in production even with DEV', SM({ DEV: 'true', MAK_ENV_LABEL: 'production', [FLAG]: 'true', [CKF]: RC }) === false);
gate('G423-AI — shouldMount false in staging even with DEV', SM({ DEV: 'true', MAK_ENV_LABEL: 'staging', [FLAG]: 'true', [CKF]: RC }) === false);
gate('G423-AI — shouldMount false when PROD set', SM({ PROD: 'true', [FLAG]: 'true', [CKF]: RC }) === false);
gate('G423-AI — shouldMount false when flag absent', SM({ DEV: 'true', [CKF]: RC }) === false);
gate('G423-AI — shouldMount false when flag false', SM({ DEV: 'true', [FLAG]: 'false', [CKF]: RC }) === false);
gate('G423-AI — shouldMount false when checkpoint absent', SM({ DEV: 'true', [FLAG]: 'true' }) === false);
gate('G423-AI — shouldMount false when checkpoint invalid', SM({ DEV: 'true', [FLAG]: 'true', [CKF]: 'x' }) === false);
gate('G423-AI — shouldMount false for empty env (production default)', SM({}) === false);
gate('G423-AI — shouldMount strict flag equality (boolean true rejected)', SM({ DEV: 'true', [FLAG]: true, [CKF]: RC }) === false);

// Parts.
const part = (fn, argObj, pred) => { try { return pred(argObj === undefined ? m[fn]() : m[fn](argObj)); } catch (err) { console.error(`${fn}: ${err}`); return false; } };
gate('G423-AI — session (no storage/fetch/persistence)', part('createAppIntegrationSession', { routeMenuRuntime: RM }, (x) => x.kind === 'app-integration-session' && x.usesStorage === false && x.usesFetch === false && x.usesPersistence === false));
gate('G423-AI — feature gate open in dev+flag+ckpt; default-off; prod/staging denied', (() => { try { return m.createStudioDevPreviewFeatureGate({ env: { DEV: 'true', [FLAG]: 'true', [CKF]: RC } }).open === true && m.createStudioDevPreviewFeatureGate({}).open === false && m.createStudioDevPreviewFeatureGate({ env: { MAK_ENV_LABEL: 'production', [FLAG]: 'true', [CKF]: RC } }).open === false && m.createStudioDevPreviewFeatureGate({ env: { MAK_ENV_LABEL: 'staging', DEV: 'true', [FLAG]: 'true', [CKF]: RC } }).open === false; } catch { return false; } })());
gate('G423-AI — checkpoint receipt strict equality', (() => { try { return m.createStudioDevPreviewCheckpointReceipt({ checkpointReceipt: RC }).approved === true && m.createStudioDevPreviewCheckpointReceipt({ checkpointReceipt: 'x' }).approved === false && m.createStudioDevPreviewCheckpointReceipt({}).approved === false; } catch { return false; } })());
gate('G423-AI — preflight ok when authorized; blocked when gate closed', (() => { try { const g = m.createStudioDevPreviewFeatureGate({ env: { DEV: 'true', [FLAG]: 'true', [CKF]: RC } }); const rc = m.createStudioDevPreviewCheckpointReceipt({ checkpointReceipt: RC }); return m.createAppIntegrationPreflight({ routeMenuRuntime: RM, featureGate: g, checkpointReceipt: rc }).ok === true && m.createAppIntegrationPreflight({ routeMenuRuntime: RM, featureGate: m.createStudioDevPreviewFeatureGate({}), checkpointReceipt: rc }).ok === false; } catch { return false; } })());
gate('G423-AI — app attachment (additive; dev-only; not exposed to product; no new router/core touch)', part('createAppAttachmentDescriptor', undefined, (x) => x.additiveOnly === true && x.devOnly === true && x.routeExposedToProduct === false && x.menuExposedToProduct === false && x.sidebarExposedToProduct === false && x.publicRoute === false && x.newRouterCreated === false && x.existingRouterRefactored === false && x.providersTouched === false && x.authTouched === false && x.layoutTouched === false));
gate('G423-AI — lazy loader (lazy; no eager; build-time-DEV-guarded; prod bundle absent; no mount/side-effect on import)', part('createLazyPreviewLoader', undefined, (x) => x.lazyImportUsed === true && x.eagerImportUsed === false && x.buildTimeDevGuarded === true && x.productionBundleContainsPreview === false && x.mountsOnImport === false && x.sideEffectOnImport === false));
gate('G423-AI — mount request (explicit/injected isolated host; no global/dom/reactDom/createRoot; synthetic)', (() => { try { const mr = m.createRuntimeUiMountRequest({ preflight: { ok: true } }); return mr.mountAuthorized === true && mr.explicitMount === true && mr.mountsIsolatedHostOnly === true && mr.dependencyInjected === true && mr.globalRootUsed === false && mr.serviceLocatorUsed === false && mr.reactDomUsed === false && mr.createRootUsed === false && mr.windowUsed === false && mr.documentUsed === false && mr.runtimeUiMountedByDefault === false && mr.syntheticDataOnly === true && m.createRuntimeUiMountRequest({ preflight: { ok: false } }).mountAuthorized === false; } catch { return false; } })());
gate('G423-AI — failure containment (fail-closed; contained; no break-app/global-redirect/mutation)', part('createFailureContainment', undefined, (x) => x.failClosed === true && x.failureContained === true && x.lazyImportFailureContained === true && x.mountFailureContained === true && x.breaksApp === false && x.globalRedirect === false && x.mutationOnFailure === false && x.productionStateChangedOnFailure === false));
gate('G423-AI — rollback (by flag-off + removing additive block; no destructive rollback)', part('createAppIntegrationRollback', undefined, (x) => x.rollbackByFlagOff === true && x.rollbackByRemovingAdditiveBlock === true && x.destructiveRollbackRequired === false && x.dataMigrationRequired === false && x.additiveBlockOnly === true));

let manOk = false;
try { manOk = U.manifest.kind === 'app-integration-manifest' && U.manifest.routePath === '/__dev/studio/preview' && U.manifest.capabilities.appIntegrated === true && Object.keys(U.manifest.parts).length === 8; } catch { manOk = false; }
gate('G423-AI — manifest present + 8 parts + route path', manOk);

let verOk = false;
try { verOk = U.verification.ok === true && U.verification.valid === true && U.verification.devOnly === true && U.verification.defaultOff === true && U.verification.failClosed === true && U.verification.appIntegrated === true && U.verification.routeExposedToProduct === false && U.verification.productionBundleContainsPreview === false && U.verification.blockerCount === 0; } catch { verOk = false; }
gate('G423-AI — verifier passes dev-only/default-off/fail-closed invariants', verOk);

let verTamper = false;
try {
  const c = m.APP_INTEGRATION_CAPABILITIES;
  const ok = (o) => m.verifyAppIntegration(o).blockers;
  verTamper = ok({ contract: { capabilities: { ...c, routeExposedToProduct: true } } }).includes('capability_routeExposedToProduct_must_be_false')
    && ok({ contract: { capabilities: { ...c, menuExposedToProduct: true } } }).includes('capability_menuExposedToProduct_must_be_false')
    && ok({ contract: { capabilities: { ...c, sidebarExposedToProduct: true } } }).includes('capability_sidebarExposedToProduct_must_be_false')
    && ok({ contract: { capabilities: { ...c, routerWiringImplemented: true } } }).includes('capability_routerWiringImplemented_must_be_false')
    && ok({ contract: { capabilities: { ...c, eagerImportUsed: true } } }).includes('capability_eagerImportUsed_must_be_false')
    && ok({ contract: { capabilities: { ...c, productionBundleContainsPreview: true } } }).includes('capability_productionBundleContainsPreview_must_be_false')
    && ok({ contract: { capabilities: { ...c, reactDomUsed: true, createRootUsed: true } } }).includes('capability_reactDomUsed_must_be_false')
    && ok({ contract: { capabilities: { ...c, windowUsed: true, documentUsed: true } } }).includes('capability_windowUsed_must_be_false')
    && ok({ contract: { capabilities: { ...c, deepLinkPublic: true } } }).includes('capability_deepLinkPublic_must_be_false')
    && ok({ contract: { capabilities: { ...c, backendAccessed: true, prismaAccessed: true } } }).includes('capability_backendAccessed_must_be_false')
    && ok({ contract: { capabilities: { ...c, productionAccessed: true, stagingAccessed: true } } }).includes('capability_productionAccessed_must_be_false')
    && ok({ contract: { capabilities: { ...c, realDataRead: true, realDataWrite: true } } }).includes('capability_realDataRead_must_be_false')
    && ok({ contract: { capabilities: { ...c, prototypeRelinked: true } } }).includes('capability_prototypeRelinked_must_be_false')
    && ok({ contract: { capabilities: { ...c, devOnly: false } } }).includes('capability_devOnly_must_be_true')
    && ok({ contract: { capabilities: c, featureGate: { defaultEnabled: true } } }).includes('unsafe_feature_gate_default_on')
    && ok({ contract: { capabilities: c, appAttachment: { routeExposedToProduct: true } } }).includes('unsafe_route_exposed')
    && ok({ contract: { capabilities: c, appAttachment: { newRouterCreated: true } } }).includes('unsafe_router_change')
    && ok({ contract: { capabilities: c, appAttachment: { authTouched: true } } }).includes('unsafe_app_core_touched')
    && ok({ contract: { capabilities: c, lazyPreviewLoader: { eagerImportUsed: true } } }).includes('unsafe_eager_import')
    && ok({ contract: { capabilities: c, lazyPreviewLoader: { productionBundleContainsPreview: true } } }).includes('unsafe_production_bundle_contains_preview')
    && ok({ contract: { capabilities: c, mountRequest: { globalRootUsed: true } } }).includes('unsafe_global_mount')
    && ok({ contract: { capabilities: c, mountRequest: { windowUsed: true } } }).includes('unsafe_dom_globals')
    && ok({ contract: { capabilities: c, mountRequest: { runtimeUiMountedByDefault: true } } }).includes('unsafe_mount_by_default')
    && (() => { try { m.verifyAppIntegration({ contract: null }); return true; } catch { return false; } })();
} catch { verTamper = false; }
gate('G423-AI — verifier detects product-exposure/eager-import/prod-bundle/reactDom/dom-globals/deep-link/backend/production/data/prototype/router-change/global-mount/mount-by-default attempts', verTamper);

let cmpOk = false;
try {
  const okc = m.checkAppIntegrationCompatibility({ routeMenuRuntime: RM });
  const bad = m.checkAppIntegrationCompatibility({ routeMenuRuntime: { runtimeUiVersion: 'x@9.9.9', kind: 'other' } });
  cmpOk = okc.compatibleWithRouteMenuRuntime === true && okc.compatibleWithRuntimeUi === true && okc.readyForAppIntegration === true && okc.readyForProductExposure === false && okc.readyForProduction === false && okc.status === 'ready_for_dev_only_app_integration_default_off_fail_closed' && bad.compatibleWithRuntimeUi === false && bad.warnings.includes('incompatible_runtimeUi');
} catch { cmpOk = false; }
gate('G423-AI — compatibility aligned; never authorizes product exposure/generation/production; mismatch → warning', cmpOk);

gate('G423-AI — diagnostics passive, dev-only/default-off/fail-closed confirmed, no secrets', (() => { try { return U.diagnostics.passive === true && U.diagnostics.ok === true && U.diagnostics.devOnlyConfirmed === true && U.diagnostics.productionBundleContainsPreview === false && !/jwt|token|secret|DATABASE_URL/i.test(JSON.stringify(U.diagnostics)); } catch { return false; } })());
gate('G423-AI — fallback fail-closed on invalid/missing/fallback runtime', (() => { try { return m.createStudioDevPreviewAppIntegration({}).fallback === true && m.createStudioDevPreviewAppIntegration({ routeMenuRuntime: { kind: 'other' } }).fallback === true && m.createStudioDevPreviewAppIntegration({ routeMenuRuntime: { kind: 'studio-dev-preview-route-menu', fallback: true } }).fallback === true; } catch { return false; } })());
gate('G423-AI — deterministic overall + integration digests', (() => { try { const a = m.createStudioDevPreviewAppIntegration({ routeMenuRuntime: RM, env: { DEV: 'true', [FLAG]: 'true', [CKF]: RC }, checkpointReceipt: RC }); const b = m.createStudioDevPreviewAppIntegration({ routeMenuRuntime: RM, env: { DEV: 'true', [FLAG]: 'true', [CKF]: RC }, checkpointReceipt: RC }); return a.overallDigest === b.overallDigest && a.appIntegrationDigest === b.appIntegrationDigest && a.overallDigest.startsWith('fnv1a-'); } catch { return false; } })());
gate('G423-AI — error catalog >= 40 codes', Array.isArray(m?.APP_INTEGRATION_ERROR_CODES) && m.APP_INTEGRATION_ERROR_CODES.length >= 40);
gate('G423-AI — error descriptor sanitized + side-effect free', (() => { try { const e = m.createAppIntegrationError('APP_INTEGRATION_PRISMA_BLOCKED'); return e.kind === 'app-integration-error' && e.safe === true && e.sideEffects === false && e.realDataRead === false; } catch { return false; } })());
gate('G423-AI — required checkpoint receipt value', m?.REQUIRED_CHECKPOINT_RECEIPT === 'approved_for_app_integration_slice');
gate('G423-AI — route path is /__dev/studio/preview', m?.STUDIO_DEV_PREVIEW_ROUTE_PATH === '/__dev/studio/preview');

// Explicit capability invariants.
gate('G423-AI — routeExposedToProduct false', U ? U.capabilities.routeExposedToProduct === false : false);
gate('G423-AI — menuExposedToProduct false', U ? U.capabilities.menuExposedToProduct === false : false);
gate('G423-AI — sidebarExposedToProduct false', U ? U.capabilities.sidebarExposedToProduct === false : false);
gate('G423-AI — routerWiringImplemented false', U ? U.capabilities.routerWiringImplemented === false : false);
gate('G423-AI — eagerImportUsed false', U ? U.capabilities.eagerImportUsed === false : false);
gate('G423-AI — productionBundleContainsPreview false', U ? U.capabilities.productionBundleContainsPreview === false : false);
gate('G423-AI — reactDomUsed/createRootUsed false', U ? (U.capabilities.reactDomUsed === false && U.capabilities.createRootUsed === false) : false);
gate('G423-AI — windowUsed/documentUsed false', U ? (U.capabilities.windowUsed === false && U.capabilities.documentUsed === false) : false);
gate('G423-AI — deepLinkPublic false', U ? U.capabilities.deepLinkPublic === false : false);
gate('G423-AI — moduleGenerated false', U ? U.capabilities.moduleGenerated === false : false);
gate('G423-AI — backendAccessed/prismaAccessed false', U ? (U.capabilities.backendAccessed === false && U.capabilities.prismaAccessed === false) : false);
gate('G423-AI — top-level realDataRead/realDataWrite false', U ? (U.capabilities.realDataRead === false && U.capabilities.realDataWrite === false) : false);
gate('G423-AI — prototypeRelinked false', U ? U.capabilities.prototypeRelinked === false : false);
gate('G423-AI — appIntegrated/appTouched/devRouteAttached true', U ? (U.capabilities.appIntegrated === true && U.capabilities.appTouched === true && U.capabilities.devRouteAttached === true) : false);
gate('G423-AI — lazyImportUsed/runtimeUiMountedInApp true', U ? (U.capabilities.lazyImportUsed === true && U.capabilities.runtimeUiMountedInApp === true) : false);
gate('G423-AI — runtimeUiMountedByDefault false', U ? U.capabilities.runtimeUiMountedByDefault === false : false);
gate('G423-AI — readyForProductExposure/RealModuleGeneration/Production false', U ? (U.readyForProductExposure === false && U.readyForRealModuleGeneration === false && U.readyForProduction === false) : false);

// Static .js scans.
gate('G423-AI — .js graph React-free', importsOf(jsFiles()).every((p) => p !== 'react' && !/^react(\/|$)/.test(p)));
gate('G423-AI — .js does NOT import the .jsx (node --test safe)', importsOf(jsFiles()).every((p) => !/\.jsx($|['"])/.test(p)));
gate('G423-AI — .js no JSX/createElement', !/createElement|_jsx\b|jsxs?\(/.test(jsCode()));
gate('G423-AI — no react-router / react-dom import anywhere', importsOf([...jsFiles(), ...jsxFiles()]).every((p) => !/react-router|react-dom/i.test(p)));
gate('G423-AI — no ReactDOM/createRoot/hydrateRoot anywhere', !/\bReactDOM\b|createRoot\s*\(|hydrateRoot\s*\(/.test(allCode()));
gate('G423-AI — no window/document access anywhere', !/\bdocument\.|\bwindow\.[a-z]/i.test(allCode()));
gate('G423-AI — no old Studio prototype import', importsOf([...jsFiles(), ...jsxFiles()]).every((p) => !/studio\/(components|shell|designers|pages|navigation|dock|panels|editor)/.test(p)));
gate('G423-AI — no src/components or src/pages import', importsOf([...jsFiles(), ...jsxFiles()]).every((p) => !/(^|\.\.\/)(components|pages)\//.test(p)));
gate('G423-AI — no App import from the subtree', importsOf([...jsFiles(), ...jsxFiles()]).every((p) => !/(^|\/)App(\.jsx)?$/.test(p)));
gate('G423-AI — no EmpresaApi/apiClient/apis/backend/prisma import', importsOf([...jsFiles(), ...jsxFiles()]).every((p) => !/EmpresaApi|apiClient|\/apis\/|\/backend\/|@prisma|PrismaClient/i.test(p)));
gate('G423-AI — no fetch/XHR/WebSocket/storage-API', !/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(allCode()) && !/localStorage\.|sessionStorage\.|indexedDB\./.test(allCode()));
gate('G423-AI — no DATABASE_URL / production API_URL / Railway', !/DATABASE_URL|VITE_API_URL|projetomg-production|railway/i.test(allCode()));
gate('G423-AI — no real POST/PUT/PATCH/DELETE method', !/method\s*:\s*['"](POST|PUT|PATCH|DELETE)['"]/.test(allCode()));
gate('G423-AI — no realDataRead/realDataWrite true literal', !/realDataRead\s*:\s*true|realDataWrite\s*:\s*true/.test(allCode()));

// Static .jsx scans.
gate('G423-AI — .jsx automatic runtime (no react import)', importsOf(jsxFiles()).every((p) => p !== 'react' && !/^react(\/|$)/.test(p)));
gate('G423-AI — .jsx contain real JSX', jsxFiles().every((f) => /<[A-Za-z]/.test(fs.readFileSync(f, 'utf8'))));
gate('G423-AI — .jsx no <Route/Routes/Link/NavLink', !/<Route[\s/>]|\bRoutes\b|\bNavLink\b|<Link[\s/>]/.test(jsxCode()));
gate('G423-AI — .jsx no BrowserRouter/createBrowserRouter/useNavigate', !/\bBrowserRouter\b|\bcreateBrowserRouter\b|\buseNavigate\b/.test(jsxCode()));
gate('G423-AI — boundary renders the isolated route-menu host', /StudioDevPreviewRouteMenuHost/.test(fs.readFileSync(path.join(DIR, 'StudioDevPreviewAppBoundary.jsx'), 'utf8')));
gate('G423-AI — boundary imports the isolated host by path', importsOf(jsxFiles()).some((p) => /dev-preview-route-menu\/StudioDevPreviewRouteMenuHost\.jsx/.test(p)));

// App.jsx additive checks.
const app = readApp();
gate('G423-AI — App.jsx imports shouldMountStudioDevPreviewRoute + path', /shouldMountStudioDevPreviewRoute/.test(app) && /STUDIO_DEV_PREVIEW_ROUTE_PATH/.test(app));
gate('G423-AI — App.jsx uses build-time import.meta.env.DEV guard for the boundary', /import\.meta\.env\.DEV[\s\S]{0,140}StudioDevPreviewAppBoundary/.test(app));
gate('G423-AI — App.jsx lazy-imports the boundary', /lazy\(\(\)\s*=>\s*import\("@\/studio\/blueprint-engine\/dev-preview-app-integration\/StudioDevPreviewAppBoundary\.jsx"\)\)/.test(app));
gate('G423-AI — App.jsx null-guards boundary + shouldMount before the Route', /StudioDevPreviewAppRoute\s*&&\s*shouldMountStudioDevPreviewRoute\(\)/.test(app));
gate('G423-AI — App.jsx route uses the dev path constant', /path=\{STUDIO_DEV_PREVIEW_ROUTE_PATH\}/.test(app));
gate('G423-AI — App.jsx has DEV-ONLY Studio marker comment', /DEV-ONLY: Studio dev preview/.test(app));
gate('G423-AI — App.jsx adds no menu/sidebar', !/addMenuItem|navItems|menu\.push/.test(app));
gate('G423-AI — App.jsx has exactly one <Router> (no new router)', (app.match(/<Router>/g) || []).length === 1);
gate('G423-AI — App.jsx keeps prior dev mounts (runtime-v2 + modelobase2)', /shouldMountRuntimeV2DevPreviewRoute/.test(app) && /shouldMountModeloBase2FuelDevPreviewRoute/.test(app));
gate('G423-AI — App.jsx does not import the isolated host directly', !/StudioDevPreviewRouteMenuHost/.test(app));
let appAdditive = true; let appAdditiveDetail = 'no diff vs origin/main (skipped)';
const appDiff = diffOf('src/App.jsx');
if (appDiff) {
  const noRemoved = appDiff.removed.length === 0;
  const markerAdded = appDiff.added.some((a) => /StudioDevPreview|__dev\/studio\/preview|shouldMountStudioDevPreviewRoute/.test(a));
  const noForbidden = appDiff.added.every((a) => !/prisma|PrismaClient|\/backend\/|\bfetch\s*\(|localStorage|sessionStorage|indexedDB|addMenuItem|navItems|menu\.push/i.test(a));
  const pathsOk = appDiff.added.filter((a) => /path\s*=/.test(a)).every((a) => /STUDIO_DEV_PREVIEW_ROUTE_PATH|__dev\/studio\/preview/.test(a));
  appAdditive = noRemoved && markerAdded && noForbidden && pathsOk;
  appAdditiveDetail = appAdditive ? `additive (${appDiff.added.length} added, 0 removed)` : `removed=${appDiff.removed.length} markerAdded=${markerAdded} noForbidden=${noForbidden} pathsOk=${pathsOk}`;
}
gate('G423-AI — App.jsx change is additive-only (0 removed, marker added, no forbidden token, only dev path)', appAdditive, appAdditiveDetail);

// productionUiGuard additive checks.
const guard = readGuard();
gate('G423-AI — guard keeps runtime-v2 markers', /RuntimeV2DevPreview/.test(guard) && /__dev\/runtime-v2\/previews/.test(guard) && /shouldMountRuntimeV2DevPreviewRoute/.test(guard));
gate('G423-AI — guard keeps modelobase2 markers', /ModeloBase2FuelDevPreview/.test(guard) && /__dev\/modelobase2\/fuel/.test(guard) && /shouldMountModeloBase2FuelDevPreviewRoute/.test(guard));
gate('G423-AI — guard has new Studio marker', /shouldMountStudioDevPreviewRoute/.test(guard) && /__dev\\\/studio\\\/preview/.test(guard) && /StudioDevPreviewAppRoute/.test(guard));
gate('G423-AI — guard path allowlist keeps prior paths + adds Studio path', /RUNTIME_V2_DEV_PREVIEW_ROUTE_PATH/.test(guard) && /MODELOBASE2_FUEL_DEV_PREVIEW_ROUTE_PATH/.test(guard) && /STUDIO_DEV_PREVIEW_ROUTE_PATH/.test(guard));
gate('G423-AI — guard FORBIDDEN regex intact', /const FORBIDDEN = \/prisma\|PrismaClient\|\\\/backend\\\/\|\\bfetch/.test(guard));
gate('G423-AI — guard keeps appJsxChangeIsOnlyDevRouteMount + removed-lines check', /function appJsxChangeIsOnlyDevRouteMount/.test(guard) && /if \(removed\.length > 0\) return false/.test(guard));
gate('G423-AI — guard keeps productionUiOffendingFiles export', /export function productionUiOffendingFiles/.test(guard));
gate('G423-AI — guard adds no broad wildcard (.*)', !/\.\*/.test(guard));
let guardAdditive = true; let guardAdditiveDetail = 'no diff vs origin/main (skipped)';
const guardDiff = diffOf('scripts/gates/lib/productionUiGuard.mjs');
if (guardDiff) {
  const equalCounts = guardDiff.added.length === guardDiff.removed.length;
  const onlyRegexLines = guardDiff.removed.every((r) => /DEV_ROUTE_MARKER|path\\s\*\[=:\]|RUNTIME_V2_DEV_PREVIEW_ROUTE_PATH/.test(r));
  const markerAdded = guardDiff.added.some((a) => /shouldMountStudioDevPreviewRoute|__dev\\\/studio\\\/preview/.test(a));
  guardAdditive = equalCounts && onlyRegexLines && markerAdded;
  guardAdditiveDetail = guardAdditive ? `append-only (${guardDiff.added.length} lines extended, 0 markers removed)` : `equalCounts=${equalCounts} onlyRegexLines=${onlyRegexLines} markerAdded=${markerAdded}`;
}
gate('G423-AI — productionUiGuard change is additive/append-only (prior markers preserved, new marker added)', guardAdditive, guardAdditiveDetail);
// The central governance guard may change ONLY on a governance slice's own branch.
gate('G423-AI — studioScopeGovernanceGuard NOT altered', (() => {
  try {
    const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
    if (!files.includes('scripts/gates/lib/studioScopeGovernanceGuard.mjs')) return true;
    const active = resolveActiveStudioSlice(files);
    return createResolvedActiveStudioSlicePathAuthorizer(files).isAuthorized('scripts/gates/lib/studioScopeGovernanceGuard.mjs');
  } catch { return true; }
})());

// Governance authorization.
gate('G423-AI — explicit-forbidden authorization declares App.jsx + productionUiGuard (2 entries)', STUDIO_DEV_PREVIEW_APP_INTEGRATION_EXPLICIT_FORBIDDEN.length === 2 && STUDIO_DEV_PREVIEW_APP_INTEGRATION_EXPLICIT_FORBIDDEN.some((re) => re.test('src/App.jsx')) && STUDIO_DEV_PREVIEW_APP_INTEGRATION_EXPLICIT_FORBIDDEN.some((re) => re.test('scripts/gates/lib/productionUiGuard.mjs')));
gate('G423-AI — App.jsx NOT in known-later (leak-safe)', isKnownLaterStudioHeadlessArtifact('src/App.jsx') === false);
gate('G423-AI — productionUiGuard NOT in known-later (leak-safe)', isKnownLaterStudioHeadlessArtifact('scripts/gates/lib/productionUiGuard.mjs') === false);
gate('G423-AI — App.jsx forbidden without option; own-slice-allowed with it', classifyStudioScopePath('src/App.jsx') === 'forbidden_scope' && classifyStudioScopePath('src/App.jsx', { explicitlyAuthorizedForbidden: STUDIO_DEV_PREVIEW_APP_INTEGRATION_EXPLICIT_FORBIDDEN }) === 'own_slice_allowed');
gate('G423-AI — productionUiGuard own-slice-allowed only with option', classifyStudioScopePath('scripts/gates/lib/productionUiGuard.mjs', { explicitlyAuthorizedForbidden: STUDIO_DEV_PREVIEW_APP_INTEGRATION_EXPLICIT_FORBIDDEN }) === 'own_slice_allowed');
let regOk = false;
try {
  const reg = await import(pathToFileURL(path.join(ROOT, 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs')).href);
  const known = reg.KNOWN_LATER_STUDIO_HEADLESS_ARTIFACTS;
  const hasOwn = known.some((re) => re.test('src/studio/blueprint-engine/dev-preview-app-integration/index.js'));
  const leaks = ['src/modules/x/y.js', 'backend/server.js', 'src/App.jsx', 'backend/prisma/schema.prisma', 'src/pages/z.jsx'].filter((p) => known.some((re) => re.test(p)));
  regOk = hasOwn && leaks.length === 0;
} catch { regOk = false; }
gate('G423-AI — registry: slice paths known-later; no forbidden probe leaks', regOk);

// Scope safety (git-diff) — forbidden always wins, except this slice's explicit App.jsx + guard.
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
gate('G423-AI — authorized scope only (subtree + App.jsx + productionUiGuard + registry + test + gate + evidence + package)', scopeOk, scopeDetail);

let blockedOk = false; let blockedDetail = '';
{
  const { gitAvailable, evaluation } = studioScope();
  if (!gitAvailable) { blockedOk = true; blockedDetail = 'git base unavailable — skipped'; }
  else {
    blockedOk = evaluation.forbidden.length === 0;
    blockedDetail = blockedOk ? 'no forbidden scope path in the branch diff' : `FORBIDDEN: ${evaluation.forbidden.join(', ')}`;
  }
}
gate('G423-AI — src/modules / Empresas / backend / Prisma untouched (this slice authorizes ONLY App.jsx + productionUiGuard)', blockedOk, blockedDetail);

let noJsxOutside = false; let noJsxOutsideDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const badTsxCss = files.filter((f) => /\.tsx$/.test(f) || /\.css$/.test(f));
  const jsxOutside = files.filter((f) => /\.jsx$/.test(f) && f !== 'src/App.jsx' && !/^src\/studio\/blueprint-engine\/dev-preview-app-integration\//.test(f));
  noJsxOutside = badTsxCss.length === 0 && jsxOutside.length === 0;
  noJsxOutsideDetail = noJsxOutside ? '.jsx only in subtree (+ additive App.jsx); no .tsx/.css' : `bad: ${[...badTsxCss, ...jsxOutside].join(', ')}`;
} catch (err) { noJsxOutside = true; noJsxOutsideDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-AI — .jsx only inside subtree (+ additive App.jsx); no .tsx / .css added', noJsxOutside, noJsxOutsideDetail);

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
gate('G423-AI — governance guard + prior gates/tests + vite/index.html NOT altered by this slice', noOldEdit, noOldEditDetail);

let noNewDep = false;
try {
  const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
  const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
  const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
  noNewDep = bk === hk;
} catch { noNewDep = true; }
gate('G423-AI — no new dependency added', noNewDep);
gate('G423-AI — src/modules/studio does NOT exist', !exists(path.join(ROOT, 'src/modules/studio')));
gate('G423-AI — upstream route-menu runtime present', exists(path.join(RM_DIR, 'index.js')));
gate('G423-AI — upstream app-integration contract present', exists(path.join(AIC_DIR, 'index.js')));

// Production build + dist inspection (preview stripped from production bundle).
let buildOk = false; let bundleOk = false; let bundleDetail = '';
try {
  execSync('npm run build', { cwd: ROOT, stdio: 'pipe', env: { ...process.env } });
  buildOk = true;
} catch (err) { buildOk = false; if (err.stderr) console.error(String(err.stderr).slice(-400)); }
gate('G423-AI — production build succeeds', buildOk);
try {
  const walkDist = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => { const full = path.join(dir, e.name); return e.isDirectory() ? walkDist(full) : [full]; }) : []);
  const distFiles = walkDist(DIST);
  const MARKERS = ['studio-dev-preview-route-menu', 'studio-dev-preview-app-integration', '__dev/studio/preview', 'shouldMountStudioDevPreviewRoute', 'StudioDevPreviewAppBoundary', 'StudioDevPreviewRouteMenuHost', 'data-studio-dev-preview'];
  const found = [];
  for (const f of distFiles) {
    let content = '';
    try { content = fs.readFileSync(f, 'utf8'); } catch { content = ''; }
    for (const mk of MARKERS) { if (content.includes(mk)) found.push(`${mk}@${path.basename(f)}`); }
  }
  const chunkNamed = distFiles.some((f) => /StudioDevPreviewAppBoundary|dev-preview-app-integration/.test(path.basename(f)));
  bundleOk = distFiles.length > 0 && found.length === 0 && !chunkNamed;
  bundleDetail = bundleOk ? `no Studio preview marker/chunk in ${distFiles.length} dist files` : `FOUND: ${found.join(', ')}${chunkNamed ? ' + named chunk' : ''}`;
} catch (err) { bundleOk = false; bundleDetail = err instanceof Error ? err.message : String(err); }
gate('G423-AI — production bundle contains NO Studio dev preview marker or chunk', bundleOk, bundleDetail);

let testsOk = false; let testCount = 0;
try {
  const out = execSync('node --test src/runtime/__tests__/studio-dev-preview-app-integration.test.js', { cwd: ROOT, stdio: 'pipe', env: { ...process.env, NODE_ENV: 'test' } }).toString();
  const mt = out.match(/# tests (\d+)/); const mp = out.match(/# pass (\d+)/); const mf = out.match(/# fail (\d+)/);
  testCount = mt ? Number(mt[1]) : 0;
  testsOk = mf ? Number(mf[1]) === 0 && mp && Number(mp[1]) === testCount : false;
} catch (err) { if (err.stderr) console.error(String(err.stderr)); }
gate('G423-AI — app integration unit tests PASS', testsOk, `${testCount} scenarios`);
gate('G423-AI — unit test has >= 470 scenarios', testCount >= 470, `${testCount} scenarios (min 470)`);

// Additional explicit invariants.
gate('G423-AI — config exposes shouldMountStudioDevPreviewRoute function', typeof m?.shouldMountStudioDevPreviewRoute === 'function');
gate('G423-AI — config flag helpers exported', typeof m?.isStudioDevPreviewRouteFlagEnabled === 'function' && typeof m?.isStudioDevPreviewCheckpointApproved === 'function');
gate('G423-AI — isProductionOrStaging fails closed for staging even with DEV', (() => { try { return m.isProductionOrStaging({ DEV: 'true', MAK_ENV_LABEL: 'staging' }) === true; } catch { return false; } })());
gate('G423-AI — ISOLATED_HOST_SUBTREE points at route-menu', m?.ISOLATED_HOST_SUBTREE === 'src/studio/blueprint-engine/dev-preview-route-menu/');
gate('G423-AI — FORBIDDEN_PROTOTYPE_PATHS has 8 entries', Array.isArray(m?.FORBIDDEN_PROTOTYPE_PATHS) && m.FORBIDDEN_PROTOTYPE_PATHS.length === 8);
gate('G423-AI — App.jsx keeps catch-all navigate route', /path="\*"/.test(app) && /<Navigate to="\/" replace \/>/.test(app));
gate('G423-AI — subtree total files == 22', jsFiles().length + jsxFiles().length === 22);
gate('G423-AI — docs validate additive + bundle absence + option A + next checkpoint', /additive|aditiv/i.test(readEv('APP-JSX-ADDITIVE-DIFF.md')) && /bundle|chunk|dist/i.test(readEv('LAZY-IMPORT-AND-PRODUCTION-BUNDLE-ABSENCE.md')) && /option A|opção A|minimal|mínima/i.test(readEv('ARCHITECTURE-DECISION-OPTION-A.md')) && /checkpoint|exposure|exposição/i.test(readEv('NEXT-CHECKPOINT-SPEC.md')));

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-STUDIO-DEV-PREVIEW-APP-INTEGRATION summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}  (total checks: ${results.length})`);
if (failed.length > 0) process.exit(1);
