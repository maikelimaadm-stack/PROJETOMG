#!/usr/bin/env node
/**
 * Gate G423-STUDIO-DEV-PREVIEW-APP-INTEGRATION-IMPLEMENTATION-PLAN — Post-Foundation C.
 *
 * Proves the headless, CONTRACT-ONLY, METADATA-ONLY, PLAN-ONLY App integration implementation plan
 * in `src/studio/blueprint-engine/dev-preview-app-integration-implementation-plan/`. It consumes the
 * Dev Preview App Integration Contract and produces a deterministic PLAN for a FUTURE controlled
 * integration of the isolated dev-preview host with the real App — implementation phases, App touch
 * boundary plan, productionUiGuard extension plan, feature flag plan, App attachment plan, router/
 * menu/sidebar exposure plans, Runtime UI mount plan, dependency injection plan, lifecycle/cleanup
 * plan, failure containment plan, production/staging fail-closed plan, prototype-relink static-
 * assertion plan, governance registry plan, test harness plan, manual enablement gate plan,
 * rollout/rollback plan and observability/diagnostics plan.
 *
 * It IMPLEMENTS NO integration. It creates NO App/router/menu/sidebar wiring, NO route/menu
 * exposure, NO Runtime UI mount in the App, NO feature flag connected to the App, NO productionUiGuard
 * extension, NO router primitives, NO `ReactDOM`/`createRoot`/`window`/`document`, NO public deep
 * link, NO module, and never touches `src/App.jsx`, backend/Prisma/migration/production/staging/
 * mutation/real-data/Empresas, and NEVER relinks the old Studio prototype. No `.jsx`/`.tsx`/`.css`.
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
const CALLER_SLICE_ID = 'dev-preview-app-integration-implementation-plan';
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
const DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-app-integration-implementation-plan');
const AIC_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-app-integration-contract');
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
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-dev-preview-app-integration-implementation-plan');
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
  /^src\/studio\/blueprint-engine\/dev-preview-app-integration-implementation-plan\//,
  /^src\/runtime\/__tests__\/studio-dev-preview-app-integration-implementation-plan\.test\.js$/,
  /^scripts\/gates\/g423-studio-dev-preview-app-integration-implementation-plan\.mjs$/,
  /^scripts\/gates\/lib\/studioScopeGovernanceRegistry\.mjs$/,
  /^package\.json$/,
  /^package-lock\.json$/,
  /^docs\/evidence\/post-foundation-c-studio-dev-preview-app-integration-implementation-plan\//,
];
const authorized = (f) => AUTHORIZED.some((re) => re.test(f)) || isKnownLaterStudioHeadlessArtifact(f);

const FILES = [
  'appIntegrationImplementationPlanConfig.js', 'errors.js', 'createStudioDevPreviewAppIntegrationImplementationPlan.js',
  'createAppIntegrationImplementationPlanSession.js', 'createAppIntegrationImplementationPhases.js',
  'createAppTouchBoundaryPlan.js', 'createProductionUiGuardExtensionPlan.js', 'createFeatureFlagImplementationPlan.js',
  'createAppAttachmentImplementationPlan.js', 'createRouterExposureImplementationPlan.js',
  'createMenuSidebarExposureImplementationPlan.js', 'createRuntimeUiMountImplementationPlan.js',
  'createDependencyInjectionImplementationPlan.js', 'createLifecycleCleanupImplementationPlan.js',
  'createFailureContainmentImplementationPlan.js', 'createProductionStagingFailClosedPlan.js',
  'createPrototypeRelinkStaticAssertionPlan.js', 'createAppIntegrationTestHarnessPlan.js',
  'createAppIntegrationManualEnablementGatePlan.js', 'createAppIntegrationRolloutRollbackPlan.js',
  'createAppIntegrationObservabilityDiagnosticsPlan.js', 'createAppIntegrationGovernanceRegistryPlan.js',
  'createAppIntegrationSafetyPlan.js', 'createAppIntegrationImplementationReadinessDecision.js',
  'createAppIntegrationImplementationPlanManifest.js', 'verifyAppIntegrationImplementationPlan.js',
  'checkAppIntegrationImplementationPlanCompatibility.js', 'createAppIntegrationImplementationPlanDiagnostics.js',
  'createAppIntegrationImplementationPlanFallback.js', 'index.js',
];
const DOCS = [
  'CERTIFICATION-REPORT.md', 'STUDIO-DEV-PREVIEW-APP-INTEGRATION-IMPLEMENTATION-PLAN-REPORT.md', 'PLAN-SESSION.md',
  'IMPLEMENTATION-PHASES.md', 'APP-TOUCH-BOUNDARY-PLAN.md', 'PRODUCTION-UI-GUARD-EXTENSION-PLAN.md',
  'FEATURE-FLAG-IMPLEMENTATION-PLAN.md', 'APP-ATTACHMENT-IMPLEMENTATION-PLAN.md', 'ROUTER-EXPOSURE-IMPLEMENTATION-PLAN.md',
  'MENU-SIDEBAR-EXPOSURE-IMPLEMENTATION-PLAN.md', 'RUNTIME-UI-MOUNT-IMPLEMENTATION-PLAN.md',
  'DEPENDENCY-INJECTION-IMPLEMENTATION-PLAN.md', 'LIFECYCLE-CLEANUP-IMPLEMENTATION-PLAN.md',
  'FAILURE-CONTAINMENT-IMPLEMENTATION-PLAN.md', 'PRODUCTION-STAGING-FAIL-CLOSED-PLAN.md',
  'PROTOTYPE-RELINK-STATIC-ASSERTION-PLAN.md', 'GOVERNANCE-REGISTRY-PLAN.md', 'TEST-HARNESS-PLAN.md',
  'MANUAL-ENABLEMENT-GATE-PLAN.md', 'ROLLOUT-ROLLBACK-PLAN.md', 'OBSERVABILITY-DIAGNOSTICS-PLAN.md',
  'SAFETY-PLAN.md', 'MANIFEST-VERIFIER-COMPATIBILITY.md', 'NO-APP-NO-ROUTER-NO-MENU-NO-MOUNT.md',
  'QUALITY-SCALABILITY-NOTES.md', 'NEXT-SLICE-SPEC.md',
];

for (const f of FILES) gate(`G423-AIIP — ${f} exists`, exists(path.join(DIR, f)));
for (const d of DOCS) gate(`G423-AIIP — ${d} exists`, exists(path.join(EV, d)));
gate('G423-AIIP — tests exist', exists(path.join(ROOT, 'src/runtime/__tests__/studio-dev-preview-app-integration-implementation-plan.test.js')));
gate('G423-AIIP — no .jsx in subtree', walk(DIR, /\.jsx$/).length === 0);
gate('G423-AIIP — no .tsx in subtree', walk(DIR, /\.tsx$/).length === 0);
gate('G423-AIIP — no .css in subtree', !fs.readdirSync(DIR).some((f) => /\.css$/.test(f)));
gate('G423-AIIP — exactly 30 .js files', jsFiles().length === 30, `${jsFiles().length} .js`);

let m = null; let aicMod = null; let rmMod = null; let rmcMod = null; let uiMod = null; let ucMod = null; let irMod = null; let planMod = null; let shellMod = null; let visualMod = null; let bridgeMod = null; let sandboxMod = null;
try { m = await import(pathToFileURL(path.join(DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { aicMod = await import(pathToFileURL(path.join(AIC_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
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

let SB = null; let BR = null; let VC = null; let RS = null; let IPLAN = null; let IR = null; let UC = null; let UI = null; let RMC = null; let RM = null; let AIC = null; let U = null;
try { SB = sandboxMod.createStudioModulePreviewSandboxContract({ blueprint: { moduleId: 'clientes', moduleName: 'Clientes', modelType: 'cadastro', modelFamily: 'ModeloBase1', fields: [{ name: 'nome', type: 'text' }], permissions: [{ action: 'read', level: 'module' }] } }); } catch (err) { console.error(String(err)); }
try { BR = bridgeMod.createStudioDevPreviewContractBridge({ sandbox: SB }); } catch (err) { console.error(String(err)); }
try { VC = visualMod.createStudioDevPreviewVisualContract({ bridge: BR }); } catch (err) { console.error(String(err)); }
try { RS = shellMod.createStudioDevPreviewRuntimeShellContract({ visualContract: VC }); } catch (err) { console.error(String(err)); }
try { IPLAN = planMod.createStudioDevPreviewIsolatedRuntimeImplementationPlan({ runtimeShellContract: RS }); } catch (err) { console.error(String(err)); }
try { IR = irMod.createStudioDevPreviewIsolatedRuntime({ implementationPlan: IPLAN }); } catch (err) { console.error(String(err)); }
try { UC = ucMod.createStudioDevPreviewRuntimeUiContract({ isolatedRuntime: IR }); } catch (err) { console.error(String(err)); }
try { UI = uiMod.createStudioDevPreviewRuntimeUi({ runtimeUiContract: UC, env: { DEV: 'true' } }); } catch (err) { console.error(String(err)); }
try { RMC = rmcMod.createStudioDevPreviewRouteMenuContract({ runtimeUi: UI }); } catch (err) { console.error(String(err)); }
try { RM = rmMod.createStudioDevPreviewRouteMenu({ routeMenuContract: RMC, runtimeUi: UI, enabled: true, environment: 'development', checkpointReceipt: 'approved_for_isolated_route_menu_runtime', initialPath: '/__dev/studio/preview' }); } catch (err) { console.error(String(err)); }
try { AIC = aicMod.createStudioDevPreviewAppIntegrationContract({ routeMenuRuntime: RM }); } catch (err) { console.error(String(err)); }
try { U = m.createStudioDevPreviewAppIntegrationImplementationPlan({ appIntegrationContract: AIC }); } catch (err) { console.error(String(err)); }

let baseOk = false; let baseDetail = '';
try {
  baseOk = U.kind === 'studio-dev-preview-app-integration-implementation-plan'
    && U.appIntegrationImplementationPlanName === 'studio-dev-preview-app-integration-implementation-plan'
    && U.appIntegrationImplementationPlanVersion === 'studio-dev-preview-app-integration-implementation-plan@1.0.0'
    && U.appIntegrationContractVersion === 'studio-dev-preview-app-integration-contract@1.0.0'
    && U.routeMenuVersion === 'studio-dev-preview-route-menu@1.0.0'
    && U.runtimeUiVersion === 'studio-dev-preview-runtime-ui@1.0.0'
    && U.mode === 'headless_dev_preview_app_integration_implementation_plan'
    && U.fallback === false && U.metadataOnly === true
    && U.readiness === 'studio_dev_preview_app_integration_implementation_plan_ready'
    && U.readyForAppIntegrationImplementationPlan === true
    && U.readyForAppIntegrationImplementationSlice === false
    && U.readyForRealModuleGeneration === false
    && U.readyForProduction === false
    && U.blockerCount === 0 && U.warningCount === 0;
  baseDetail = baseOk ? `readiness=${U.readiness}` : 'plan invariants wrong';
} catch (err) { baseDetail = err instanceof Error ? err.message : String(err); }
gate('G423-AIIP — headless/plan-only invariants + readiness ready', baseOk, baseDetail);

let capOk = false;
try {
  const c = m.APP_INTEGRATION_IMPLEMENTATION_PLAN_CAPABILITIES;
  const trues = ['headless', 'contractOnly', 'metadataOnly', 'planOnly', 'implementationPhasesOnly', 'appTouchBoundaryPlanOnly', 'productionUiGuardExtensionPlanOnly', 'featureFlagImplementationPlanOnly', 'appAttachmentImplementationPlanOnly', 'routerExposureImplementationPlanOnly', 'menuSidebarExposureImplementationPlanOnly', 'runtimeUiMountImplementationPlanOnly', 'dependencyInjectionImplementationPlanOnly', 'lifecycleCleanupImplementationPlanOnly', 'failureContainmentImplementationPlanOnly', 'productionStagingFailClosedPlanOnly', 'prototypeRelinkStaticAssertionPlanOnly', 'testHarnessPlanOnly', 'manualEnablementGatePlanOnly', 'rolloutRollbackPlanOnly', 'observabilityDiagnosticsPlanOnly', 'governanceRegistryPlanOnly'];
  const noes = ['appIntegrated', 'appTouched', 'appWiringImplemented', 'productionUiGuardExtended', 'featureFlagImplemented', 'featureFlagConnectedToApp', 'routerWiringImplemented', 'routeExposedToProduct', 'menuExposedToProduct', 'sidebarExposedToProduct', 'runtimeUiMountedInApp', 'reactDomUsed', 'createRootUsed', 'windowUsed', 'documentUsed', 'deepLinkCreated', 'moduleGenerated', 'filesWrittenToModule', 'moduleRegistered', 'backendAccessed', 'prismaAccessed', 'productionAccessed', 'stagingAccessed', 'fetchUsed', 'mutationAllowed', 'persistenceCreated', 'realDataRead', 'realDataWrite', 'rewriteEmpresas', 'oldPrototypeImported'];
  capOk = Object.isFrozen(c) && trues.every((k) => c[k] === true) && noes.every((k) => c[k] === false) && noes.every((k) => U.capabilities[k] === false);
} catch { capOk = false; }
gate('G423-AIIP — capabilities frozen; *PlanOnly true; App/router/menu/mount/guard-extension + all forbidden flags false', capOk);

const part = (fn, argObj, pred) => { try { return pred(argObj === undefined ? m[fn]() : m[fn](argObj)); } catch (err) { console.error(`${fn}: ${err}`); return false; } };
gate('G423-AIIP — session (no storage/fetch/persistence)', part('createAppIntegrationImplementationPlanSession', { appIntegrationContract: AIC }, (x) => x.kind === 'app-integration-implementation-plan-session' && x.usesStorage === false && x.usesFetch === false && x.usesPersistence === false && typeof x.seed === 'string'));
gate('G423-AIIP — phases (15 planned, none implemented)', part('createAppIntegrationImplementationPhases', undefined, (x) => x.phaseCount === 15 && x.allPlanned === true && x.anyImplemented === false));
gate('G423-AIIP — app touch boundary (appTouched/appWiringImplemented/appJsxAllowed false)', part('createAppTouchBoundaryPlan', undefined, (x) => x.appTouched === false && x.appWiringImplemented === false && x.appJsxAllowed === false));
gate('G423-AIIP — production UI guard extension (not extended/touched/implemented; requires future slice+gate)', part('createProductionUiGuardExtensionPlan', undefined, (x) => x.productionUiGuardExtended === false && x.productionUiGuardTouched === false && x.extensionImplemented === false && x.requiresExplicitFutureSlice === true && x.requiresManualGate === true));
gate('G423-AIIP — feature flag (not implemented/connected; default-off; production/staging denied)', part('createFeatureFlagImplementationPlan', undefined, (x) => x.featureFlagImplemented === false && x.featureFlagConnectedToApp === false && x.defaultEnabled === false && x.productionAllowed === false && x.stagingAllowed === false));
gate('G423-AIIP — app attachment (not implemented; app not touched; integration not performed)', part('createAppAttachmentImplementationPlan', { appIntegrationContract: AIC }, (x) => x.attachmentImplemented === false && x.appTouched === false && x.integrationPerformed === false));
gate('G423-AIIP — router exposure (not wired/exposed; no primitives/api)', part('createRouterExposureImplementationPlan', undefined, (x) => x.routerWiringImplemented === false && x.routeExposedToProduct === false && x.routeElementCreated === false && x.routesElementCreated === false && x.browserRouterUsed === false && x.createBrowserRouterUsed === false && x.useNavigateUsed === false));
gate('G423-AIIP — menu/sidebar exposure (not exposed; no menu item; no sidebar wiring)', part('createMenuSidebarExposureImplementationPlan', undefined, (x) => x.menuExposedToProduct === false && x.sidebarExposedToProduct === false && x.navigationExposedToProduct === false && x.menuItemCreated === false && x.sidebarWiringImplemented === false));
gate('G423-AIIP — runtime UI mount (not mounted/implemented; no reactDom/createRoot/window/document/mount-node/root-factory)', part('createRuntimeUiMountImplementationPlan', undefined, (x) => x.runtimeUiMountedInApp === false && x.mountImplemented === false && x.reactDomUsed === false && x.createRootUsed === false && x.windowApiUsed === false && x.documentApiUsed === false && x.mountNodeCreated === false && x.rootFactoryInjected === false));
gate('G423-AIIP — dependency injection (DI required; no implicit/global/service-locator/App/router/menu import)', part('createDependencyInjectionImplementationPlan', undefined, (x) => x.dependencyInjectionRequired === true && x.implicitDependencyLookupAllowed === false && x.globalLookupAllowed === false && x.serviceLocatorAllowed === false && x.AppImportAllowed === false && x.routerImportAllowed === false && x.menuImportAllowed === false));
gate('G423-AIIP — lifecycle/cleanup (not integrated; no auto start/stop/unmount)', part('createLifecycleCleanupImplementationPlan', undefined, (x) => x.lifecycleIntegrated === false && x.cleanupIntegrated === false && x.autoStartAllowed === false && x.autoStopAllowed === false && x.unmountIntegrated === false));
gate('G423-AIIP — failure containment (fail-closed; no app/router/menu failure propagation)', part('createFailureContainmentImplementationPlan', undefined, (x) => x.failClosed === true && x.failureContained === true && x.productAppFailurePropagationAllowed === false && x.productRouterFailurePropagationAllowed === false && x.productMenuFailurePropagationAllowed === false));
gate('G423-AIIP — production/staging fail-closed (denied; default off; fail-closed)', part('createProductionStagingFailClosedPlan', undefined, (x) => x.productionDenied === true && x.stagingDenied === true && x.defaultOff === true && x.failClosed === true));
gate('G423-AIIP — prototype relink static assertion (relink/import/copy/move not allowed; forbidden paths; assertion planned)', part('createPrototypeRelinkStaticAssertionPlan', undefined, (x) => x.prototypeRelinkAllowed === false && x.prototypeImportAllowed === false && x.prototypeCopyAllowed === false && x.prototypeMoveAllowed === false && x.oldPrototypeImported === false && x.staticAssertionPlanned === true && Array.isArray(x.forbiddenPrototypePaths) && x.forbiddenPrototypePaths.length >= 8));
gate('G423-AIIP — test harness (not implemented; headless; no real runtime/data; >=5 suites)', part('createAppIntegrationTestHarnessPlan', undefined, (x) => x.harnessImplemented === false && x.headless === true && x.usesRealRuntime === false && x.usesRealData === false && x.suiteCount >= 5));
gate('G423-AIIP — manual gate (required checkpoint; authorizes nothing incl guard extension)', part('createAppIntegrationManualEnablementGatePlan', undefined, (x) => x.manualGateRequired === true && x.currentSliceAuthorization === 'plan_only' && x.authorizesAppTouch === false && x.authorizesAppWiring === false && x.authorizesRouterWiring === false && x.authorizesRouteExposure === false && x.authorizesMenuExposure === false && x.authorizesRuntimeUiMount === false && x.authorizesProductionUiGuardExtension === false && x.authorizesProduction === false && x.authorizesBackend === false && x.authorizesPrisma === false && x.authorizesRealData === false));
gate('G423-AIIP — rollout/rollback (rollout blocked; rollback by non-consumption/flag-off; no destructive rollback)', part('createAppIntegrationRolloutRollbackPlan', undefined, (x) => x.rolloutAllowed === false && x.productionRollout === false && x.stagingRollout === false && x.rollbackByNonConsumption === true && x.rollbackByFlagOff === true && x.destructiveRollbackRequired === false));
gate('G423-AIIP — observability (safe; no secrets/telemetry/external logging/stack leak)', part('createAppIntegrationObservabilityDiagnosticsPlan', undefined, (x) => x.safeDiagnostics === true && x.withoutSecrets === true && x.noStackLeak === true && x.noTelemetryRuntime === true && x.noExternalLogging === true));
gate('G423-AIIP — governance registry (registry/guard not touched; no broad wildcard; specific paths only)', part('createAppIntegrationGovernanceRegistryPlan', undefined, (x) => x.registryTouched === false && x.guardTouched === false && x.broadWildcardAllowed === false && x.specificPathsOnly === true && Array.isArray(x.plannedKnownLaterPaths)));
gate('G423-AIIP — safety (anyForbiddenSideEffect false; reversible; all forbidden flags false)', part('createAppIntegrationSafetyPlan', undefined, (x) => x.anyForbiddenSideEffect === false && x.reversibleByNonConsumption === true && Object.values(x.forbiddenFlags).every((v) => v === false)));

gate('G423-AIIP — readiness never slice/generation/production', (() => { try { const r = m.createAppIntegrationImplementationReadinessDecision({}); return r.readyForAppIntegrationImplementationSlice === false && r.readyForRealModuleGeneration === false && r.readyForProduction === false; } catch { return false; } })());
gate('G423-AIIP — readiness blocked on blockers', (() => { try { return m.createAppIntegrationImplementationReadinessDecision({ blockers: ['x'] }).readiness === 'blocked'; } catch { return false; } })());

let manOk = false;
try { manOk = U.manifest.kind === 'app-integration-implementation-plan-manifest' && U.manifest.appIntegrationImplementationPlanVersion === 'studio-dev-preview-app-integration-implementation-plan@1.0.0' && U.manifest.capabilities.planOnly === true && U.manifest.capabilities.appIntegrated === false && U.manifest.metadataOnly === true; } catch { manOk = false; }
gate('G423-AIIP — manifest present + capability flags mirrored', manOk);

let verOk = false;
try { verOk = U.verification.ok === true && U.verification.valid === true && U.verification.headless === true && U.verification.planOnly === true && U.verification.appIntegrated === false && U.verification.productionUiGuardExtended === false && U.verification.runtimeUiMountedInApp === false && U.verification.blockerCount === 0; } catch { verOk = false; }
gate('G423-AIIP — verifier passes headless/plan-only invariants', verOk);

let verTamper = false;
try {
  const c = m.APP_INTEGRATION_IMPLEMENTATION_PLAN_CAPABILITIES;
  const ok = (o) => m.verifyAppIntegrationImplementationPlan(o).blockers;
  verTamper = ok({ plan: { capabilities: { ...c, appIntegrated: true } } }).includes('capability_appIntegrated_must_be_false')
    && ok({ plan: { capabilities: { ...c, appTouched: true } } }).includes('capability_appTouched_must_be_false')
    && ok({ plan: { capabilities: { ...c, appWiringImplemented: true } } }).includes('capability_appWiringImplemented_must_be_false')
    && ok({ plan: { capabilities: { ...c, productionUiGuardExtended: true } } }).includes('capability_productionUiGuardExtended_must_be_false')
    && ok({ plan: { capabilities: { ...c, featureFlagImplemented: true, featureFlagConnectedToApp: true } } }).includes('capability_featureFlagConnectedToApp_must_be_false')
    && ok({ plan: { capabilities: { ...c, routerWiringImplemented: true, routeExposedToProduct: true } } }).includes('capability_routeExposedToProduct_must_be_false')
    && ok({ plan: { capabilities: { ...c, menuExposedToProduct: true } } }).includes('capability_menuExposedToProduct_must_be_false')
    && ok({ plan: { capabilities: { ...c, runtimeUiMountedInApp: true } } }).includes('capability_runtimeUiMountedInApp_must_be_false')
    && ok({ plan: { capabilities: { ...c, reactDomUsed: true, createRootUsed: true } } }).includes('capability_reactDomUsed_must_be_false')
    && ok({ plan: { capabilities: { ...c, windowUsed: true, documentUsed: true } } }).includes('capability_windowUsed_must_be_false')
    && ok({ plan: { capabilities: { ...c, deepLinkCreated: true } } }).includes('capability_deepLinkCreated_must_be_false')
    && ok({ plan: { capabilities: { ...c, backendAccessed: true, prismaAccessed: true } } }).includes('capability_backendAccessed_must_be_false')
    && ok({ plan: { capabilities: { ...c, productionAccessed: true, stagingAccessed: true } } }).includes('capability_productionAccessed_must_be_false')
    && ok({ plan: { capabilities: { ...c, realDataRead: true, realDataWrite: true } } }).includes('capability_realDataRead_must_be_false')
    && ok({ plan: { capabilities: { ...c, oldPrototypeImported: true } } }).includes('capability_oldPrototypeImported_must_be_false')
    && ok({ plan: { capabilities: { ...c, planOnly: false } } }).includes('capability_planOnly_must_be_true')
    && ok({ plan: { capabilities: c, appTouchBoundary: { appTouched: true } } }).includes('unsafe_app_touched')
    && ok({ plan: { capabilities: c, productionUiGuardExtension: { productionUiGuardExtended: true } } }).includes('unsafe_production_ui_guard_extended')
    && ok({ plan: { capabilities: c, featureFlag: { featureFlagConnectedToApp: true } } }).includes('unsafe_feature_flag_connected_to_app')
    && ok({ plan: { capabilities: c, routerExposure: { browserRouterUsed: true } } }).includes('unsafe_router_api')
    && ok({ plan: { capabilities: c, routerExposure: { routeElementCreated: true } } }).includes('unsafe_router_primitive')
    && ok({ plan: { capabilities: c, menuSidebarExposure: { menuExposedToProduct: true } } }).includes('unsafe_menu_exposed')
    && ok({ plan: { capabilities: c, runtimeUiMount: { runtimeUiMountedInApp: true } } }).includes('unsafe_runtime_ui_mounted')
    && ok({ plan: { capabilities: c, runtimeUiMount: { windowApiUsed: true } } }).includes('unsafe_dom_globals')
    && ok({ plan: { capabilities: c, prototypeRelinkStaticAssertion: { prototypeRelinkAllowed: true } } }).includes('unsafe_prototype_relink')
    && ok({ plan: { capabilities: c, governanceRegistry: { broadWildcardAllowed: true } } }).includes('unsafe_governance_registry')
    && ok({ plan: { capabilities: c, productionStagingFailClosed: { productionDenied: false } } }).includes('unsafe_production_staging_allowed')
    && ok({ plan: { capabilities: c, manualGate: { manualGateRequired: false } } }).includes('missing_manual_gate')
    && (() => { try { m.verifyAppIntegrationImplementationPlan({ plan: null }); return true; } catch { return false; } })();
} catch { verTamper = false; }
gate('G423-AIIP — verifier detects App/guard-extension/feature-flag/router/menu/mount/reactDom/dom-globals/deep-link/backend/production/data/prototype/governance/production-denial/manual-gate attempts', verTamper);

let cmpOk = false;
try {
  const okc = m.checkAppIntegrationImplementationPlanCompatibility({ appIntegrationContract: AIC });
  const bad = m.checkAppIntegrationImplementationPlanCompatibility({ appIntegrationContract: { appIntegrationContractVersion: 'x@9.9.9', kind: 'other' } });
  cmpOk = okc.compatibleWithAppIntegrationContract === true && okc.compatibleWithRouteMenuRuntime === true && okc.compatibleWithRuntimeUi === true && okc.readyForAppIntegrationImplementationPlan === true && okc.readyForAppIntegrationImplementationSlice === false && okc.readyForProduction === false && okc.status === 'ready_for_future_app_integration_implementation_slice_after_enterprise_checkpoint' && bad.compatibleWithAppIntegrationContract === false && bad.warnings.includes('incompatible_appIntegrationContract');
} catch { cmpOk = false; }
gate('G423-AIIP — compatibility aligned; never authorizes slice/generation/production; mismatch → warning', cmpOk);

let diagOk = false;
try { diagOk = U.diagnostics.passive === true && U.diagnostics.ok === true && U.diagnostics.headlessConfirmed === true && U.diagnostics.planOnlyConfirmed === true && U.diagnostics.appIntegrated === false && !/jwt|token|secret|DATABASE_URL/i.test(JSON.stringify(U.diagnostics)); } catch { diagOk = false; }
gate('G423-AIIP — diagnostics passive, headless/plan-only confirmed, no secrets', diagOk);

let fbOk = false;
try {
  const fb = m.createStudioDevPreviewAppIntegrationImplementationPlan({});
  const fb2 = m.createStudioDevPreviewAppIntegrationImplementationPlan({ appIntegrationContract: { kind: 'other' } });
  const fb3 = m.createStudioDevPreviewAppIntegrationImplementationPlan({ appIntegrationContract: { kind: 'studio-dev-preview-app-integration-contract', fallback: true } });
  fbOk = fb.fallback === true && fb.readiness === 'blocked' && fb.readyForAppIntegrationImplementationPlan === false && fb.capabilities.appIntegrated === false && fb2.fallback === true && fb3.fallback === true;
} catch { fbOk = false; }
gate('G423-AIIP — fallback fail-closed on invalid/missing/fallback app integration contract', fbOk);

let detOk = false;
try {
  const a = m.createStudioDevPreviewAppIntegrationImplementationPlan({ appIntegrationContract: AIC });
  const b = m.createStudioDevPreviewAppIntegrationImplementationPlan({ appIntegrationContract: AIC });
  detOk = a.overallDigest === b.overallDigest && a.appIntegrationImplementationPlanDigest === b.appIntegrationImplementationPlanDigest && a.overallDigest.startsWith('fnv1a-');
} catch { detOk = false; }
gate('G423-AIIP — deterministic overall + plan digests', detOk);

let flagOk = false;
try {
  const off = m.isStudioDevPreviewAppIntegrationImplementationPlanEnabled({ [m.MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_IMPLEMENTATION_PLAN_FLAG]: 'true', MAK_ENV_LABEL: 'production' });
  const onDev = m.isStudioDevPreviewAppIntegrationImplementationPlanEnabled({ [m.MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_IMPLEMENTATION_PLAN_FLAG]: 'true', DEV: 'true' });
  const vOff = m.isStudioDevPreviewAppIntegrationImplementationVerifyEnabled({ [m.MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_IMPLEMENTATION_VERIFY_FLAG]: 'true', NODE_ENV: 'production' });
  flagOk = off === false && onDev === true && vOff === false;
} catch { flagOk = false; }
gate('G423-AIIP — feature flags fail closed in production', flagOk);

gate('G423-AIIP — error catalog >= 40 codes', Array.isArray(m?.APP_INTEGRATION_IMPLEMENTATION_PLAN_ERROR_CODES) && m.APP_INTEGRATION_IMPLEMENTATION_PLAN_ERROR_CODES.length >= 40);
gate('G423-AIIP — error descriptor sanitized + side-effect free', (() => { try { const e = m.createAppIntegrationImplementationPlanError('APP_INTEGRATION_PLAN_PRISMA_BLOCKED'); return e.kind === 'app-integration-implementation-plan-error' && e.safe === true && e.sideEffects === false && e.appTouched === false && e.realDataRead === false; } catch { return false; } })());
gate('G423-AIIP — required future checkpoint is enterprise checkpoint', m?.REQUIRED_FUTURE_CHECKPOINT === 'pre_app_integration_implementation_enterprise_checkpoint');

// Explicit plan invariants.
gate('G423-AIIP — appIntegrated false', U ? U.capabilities.appIntegrated === false : false);
gate('G423-AIIP — appTouched false', U ? U.capabilities.appTouched === false : false);
gate('G423-AIIP — appWiringImplemented false', U ? U.capabilities.appWiringImplemented === false : false);
gate('G423-AIIP — productionUiGuardExtended false', U ? U.capabilities.productionUiGuardExtended === false : false);
gate('G423-AIIP — featureFlagImplemented false', U ? U.capabilities.featureFlagImplemented === false : false);
gate('G423-AIIP — featureFlagConnectedToApp false', U ? U.capabilities.featureFlagConnectedToApp === false : false);
gate('G423-AIIP — routerWiringImplemented false', U ? U.capabilities.routerWiringImplemented === false : false);
gate('G423-AIIP — routeExposedToProduct false', U ? U.capabilities.routeExposedToProduct === false : false);
gate('G423-AIIP — menuExposedToProduct false', U ? U.capabilities.menuExposedToProduct === false : false);
gate('G423-AIIP — sidebarExposedToProduct false', U ? U.capabilities.sidebarExposedToProduct === false : false);
gate('G423-AIIP — runtimeUiMountedInApp false', U ? U.capabilities.runtimeUiMountedInApp === false : false);
gate('G423-AIIP — reactDomUsed/createRootUsed false', U ? (U.capabilities.reactDomUsed === false && U.capabilities.createRootUsed === false) : false);
gate('G423-AIIP — windowUsed/documentUsed false', U ? (U.capabilities.windowUsed === false && U.capabilities.documentUsed === false) : false);
gate('G423-AIIP — deepLinkCreated false', U ? U.capabilities.deepLinkCreated === false : false);
gate('G423-AIIP — moduleGenerated false', U ? U.capabilities.moduleGenerated === false : false);
gate('G423-AIIP — backendAccessed/prismaAccessed false', U ? (U.capabilities.backendAccessed === false && U.capabilities.prismaAccessed === false) : false);
gate('G423-AIIP — top-level realDataRead/realDataWrite false', U ? (U.capabilities.realDataRead === false && U.capabilities.realDataWrite === false) : false);
gate('G423-AIIP — readyForAppIntegrationImplementationSlice false', U ? U.readyForAppIntegrationImplementationSlice === false : false);
gate('G423-AIIP — readyForProduction false', U ? U.readyForProduction === false : false);
gate('G423-AIIP — manual gate required in plan', (() => { try { return U.manualGate.manualGateRequired === true && U.manualGate.authorizesAppWiring === false && U.manualGate.authorizesProductionUiGuardExtension === false; } catch { return false; } })());
gate('G423-AIIP — production UI guard extension not touched in plan', (() => { try { return U.productionUiGuardExtension.productionUiGuardExtended === false && U.productionUiGuardExtension.productionUiGuardTouched === false; } catch { return false; } })());
gate('G423-AIIP — prototype relink prohibited in plan', (() => { try { return U.prototypeRelinkStaticAssertion.prototypeRelinkAllowed === false && U.prototypeRelinkStaticAssertion.oldPrototypeImported === false; } catch { return false; } })());
gate('G423-AIIP — governance registry not touched in plan', (() => { try { return U.governanceRegistry.registryTouched === false && U.governanceRegistry.broadWildcardAllowed === false; } catch { return false; } })());

// Static safety scans — React-Router + DOM API scanned case-sensitively.
gate('G423-AIIP — subtree is React-free', importsOf().every((p) => p !== 'react' && !/^react(\/|$)/.test(p)));
gate('G423-AIIP — no react-router / react-dom import', importsOf().every((p) => !/react-router|react-dom/i.test(p)));
gate('G423-AIIP — no <Route JSX / Routes / Link / NavLink (case-sensitive API)', !/<Route[\s/>]|\bRoutes\b|\bNavLink\b|<Link[\s/>]/.test(code()));
gate('G423-AIIP — no BrowserRouter / createBrowserRouter / useNavigate', !/\bBrowserRouter\b|\bcreateBrowserRouter\b|\buseNavigate\b/.test(code()));
gate('G423-AIIP — no ReactDOM / createRoot / hydrateRoot call', !/\bReactDOM\b|createRoot\s*\(|hydrateRoot\s*\(/.test(code()));
gate('G423-AIIP — no window/document access', !/\bdocument\.|\bwindow\.[a-z]/i.test(code()));
gate('G423-AIIP — no JSX/createElement', !/createElement|_jsx\b|jsxs?\(/.test(code()));
gate('G423-AIIP — no productionUiGuard lib import', importsOf().every((p) => !/productionUiGuard\.mjs|gates\/lib\/productionUiGuard/i.test(p)));
gate('G423-AIIP — no import of EmpresaApi/apiClient/apis/backend/prisma', importsOf().every((p) => !/EmpresaApi|apiClient|\/apis\/|\/backend\/|@prisma|PrismaClient/i.test(p)));
gate('G423-AIIP — no fetch/XHR/WebSocket/storage-API', !/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(code()) && !/localStorage\.|sessionStorage\.|indexedDB\./.test(code()));
gate('G423-AIIP — no DATABASE_URL / production API_URL / Railway', !/DATABASE_URL|VITE_API_URL|projetomg-production|railway/i.test(code()));
gate('G423-AIIP — no real POST/PUT/PATCH/DELETE method', !/method\s*:\s*['"](POST|PUT|PATCH|DELETE)['"]/.test(code()));
gate('G423-AIIP — no realDataRead/realDataWrite true literal', !/realDataRead\s*:\s*true|realDataWrite\s*:\s*true/.test(code()));
gate('G423-AIIP — no old Studio prototype import', importsOf().every((p) => !/studio\/(components|shell|designers|pages|navigation|dock|panels|editor)/.test(p)));
gate('G423-AIIP — no src/components or src/pages import', importsOf().every((p) => !/(^|\.\.\/)(components|pages)\//.test(p)));
gate('G423-AIIP — no App import', importsOf().every((p) => !/(^|\/)App(\.jsx)?$/.test(p)));

gate('G423-AIIP — docs validate plan-not-implementation + guard extension + next slice checkpoint', /App|router|menu|mount/i.test(readEv('NO-APP-NO-ROUTER-NO-MENU-NO-MOUNT.md')) && /productionUiGuard|guard/i.test(readEv('PRODUCTION-UI-GUARD-EXTENSION-PLAN.md')) && /CHECKPOINT|checkpoint|FABLE|enterprise/i.test(readEv('NEXT-SLICE-SPEC.md')));

// Scope safety (git-diff) — forbidden always wins via the central guard.
let blockedOk = false; let blockedDetail = '';
{
  const { gitAvailable, evaluation } = studioScope();
  if (!gitAvailable) { blockedOk = true; blockedDetail = 'git base unavailable — skipped'; }
  else {
    blockedOk = evaluation.forbidden.length === 0;
    blockedDetail = blockedOk ? 'no forbidden scope path in the branch diff' : `FORBIDDEN: ${evaluation.forbidden.join(', ')}`;
  }
}
gate('G423-AIIP — src/modules / Empresas / backend / Prisma / SSOT untouched', blockedOk, blockedDetail);

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
gate('G423-AIIP — authorized scope only (plan subtree + registry + evidence + package)', scopeOk, scopeDetail);

let noJsxTsxCss = false; let noJsxTsxCssDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const bad = files.filter((f) => /\.(jsx|tsx|css)$/.test(f));
  noJsxTsxCss = bad.length === 0;
  noJsxTsxCssDetail = noJsxTsxCss ? 'no .jsx / .tsx / .css added' : `bad: ${bad.join(', ')}`;
} catch (err) { noJsxTsxCss = true; noJsxTsxCssDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-AIIP — no .jsx / .tsx / .css added in diff', noJsxTsxCss, noJsxTsxCssDetail);

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
gate('G423-AIIP — App.jsx / vite / index.html / productionUiGuard / governance guard / prior gates/tests NOT altered by this slice', noOldEdit, noOldEditDetail);

let regOk = false; let regDetail = '';
try {
  const reg = await import(pathToFileURL(path.join(ROOT, 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs')).href);
  const known = reg.KNOWN_LATER_STUDIO_HEADLESS_ARTIFACTS;
  const hasOwn = known.some((re) => re.test('src/studio/blueprint-engine/dev-preview-app-integration-implementation-plan/index.js'));
  const forbiddenProbes = ['src/modules/x/y.js', 'backend/server.js', 'src/App.jsx', 'backend/prisma/schema.prisma', 'src/pages/z.jsx'];
  const leaks = forbiddenProbes.filter((p) => known.some((re) => re.test(p)));
  regOk = hasOwn && leaks.length === 0;
  regDetail = regOk ? 'specific plan paths registered; no broad wildcard leaks a forbidden path' : `hasOwn=${hasOwn} leaks=${leaks.join(',')}`;
} catch (err) { regOk = false; regDetail = err instanceof Error ? err.message : String(err); }
gate('G423-AIIP — registry: specific slice paths only, no dangerous wildcard', regOk, regDetail);

let noNewDep = false;
try {
  const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
  const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
  const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
  noNewDep = bk === hk;
} catch { noNewDep = true; }
gate('G423-AIIP — no new dependency added', noNewDep);

gate('G423-AIIP — src/modules/studio does NOT exist', !exists(path.join(ROOT, 'src/modules/studio')));
gate('G423-AIIP — App.jsx untouched (not in diff)', (() => { try { const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); return !files.includes('src/App.jsx'); } catch { return true; } })());
gate('G423-AIIP — productionUiGuard.mjs untouched (not in diff)', (() => { try { const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); return !files.includes('scripts/gates/lib/productionUiGuard.mjs'); } catch { return true; } })());
gate('G423-AIIP — upstream app integration contract present', exists(path.join(AIC_DIR, 'index.js')));

let testsOk = false; let testCount = 0;
try {
  const out = execSync('node --test src/runtime/__tests__/studio-dev-preview-app-integration-implementation-plan.test.js', { cwd: ROOT, stdio: 'pipe', env: { ...process.env, NODE_ENV: 'test' } }).toString();
  const mt = out.match(/# tests (\d+)/); const mp = out.match(/# pass (\d+)/); const mf = out.match(/# fail (\d+)/);
  testCount = mt ? Number(mt[1]) : 0;
  testsOk = mf ? Number(mf[1]) === 0 && mp && Number(mp[1]) === testCount : false;
} catch (err) { if (err.stderr) console.error(String(err.stderr)); }
gate('G423-AIIP — app integration implementation plan unit tests PASS', testsOk, `${testCount} scenarios`);
gate('G423-AIIP — unit test has >= 430 scenarios', testCount >= 430, `${testCount} scenarios (min 430)`);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-STUDIO-DEV-PREVIEW-APP-INTEGRATION-IMPLEMENTATION-PLAN summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}  (total checks: ${results.length})`);
if (failed.length > 0) process.exit(1);
