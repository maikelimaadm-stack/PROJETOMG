#!/usr/bin/env node
/**
 * Gate G423-STUDIO-DEV-PREVIEW-ROUTE-MENU-IMPLEMENTATION-PLAN — Post-Foundation C.
 *
 * Proves the headless, CONTRACT-ONLY, PLAN-ONLY route/menu implementation plan in
 * `src/studio/blueprint-engine/dev-preview-route-menu-implementation-plan/`. It consumes the Dev
 * Preview Route/Menu Contract and produces a deterministic PLAN for a future controlled route/menu
 * implementation — implementation phases, App/router wiring boundary plans, route/menu registration
 * plans, sidebar/navigation placement plan, dev-only access policy, route guard and menu visibility
 * implementation plans, deep-link policy plan, runtime UI mount boundary plan, blocked-navigation
 * action plan, test harness plan, manual enablement gate plan, rollout/rollback plan,
 * observability/diagnostics plan and prototype-relink prohibition plan.
 *
 * It IMPLEMENTS NO route/menu. It creates NO real route/menu/router, NO App/router/navigation/
 * sidebar wiring, NO router primitives, NO runtime UI mount (no ReactDOM/createRoot/window/
 * document), NO deep link, NO module, and never touches backend/Prisma/migration/production/
 * staging/mutation/real-data/Empresas, and NEVER relinks the old Studio prototype. No
 * `.jsx`/`.tsx`/`.css`.
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
const CALLER_SLICE_ID = 'dev-preview-route-menu-implementation-plan';
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
const DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-route-menu-implementation-plan');
const RMC_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-route-menu-contract');
const UI_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-runtime-ui');
const UC_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-runtime-ui-contract');
const IR_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-isolated-runtime');
const PLAN_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-isolated-runtime-implementation-plan');
const SHELL_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-runtime-shell-contract');
const VISUAL_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-visual-contract');
const BRIDGE_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-contract-bridge');
const SANDBOX_DIR = path.join(ROOT, 'src/studio/blueprint-engine/module-preview-sandbox');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-dev-preview-route-menu-implementation-plan');
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
const importsOf = (files) => files.flatMap((f) => [...stripComments(fs.readFileSync(f, 'utf8')).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((mm) => mm[1]));
const readEv = (f) => (exists(path.join(EV, f)) ? fs.readFileSync(path.join(EV, f), 'utf8') : '');

const AUTHORIZED = [
  /^src\/studio\/blueprint-engine\/dev-preview-route-menu-implementation-plan\//,
  /^src\/runtime\/__tests__\/studio-dev-preview-route-menu-implementation-plan\.test\.js$/,
  /^scripts\/gates\/g423-studio-dev-preview-route-menu-implementation-plan\.mjs$/,
  /^scripts\/gates\/lib\/studioScopeGovernanceRegistry\.mjs$/,
  /^package\.json$/,
  /^package-lock\.json$/,
  /^docs\/evidence\/post-foundation-c-studio-dev-preview-route-menu-implementation-plan\//,
];
const authorized = (f) => AUTHORIZED.some((re) => re.test(f)) || isKnownLaterStudioHeadlessArtifact(f);

const FILES = [
  'routeMenuImplementationPlanConfig.js', 'errors.js', 'createStudioDevPreviewRouteMenuImplementationPlan.js',
  'createRouteMenuImplementationPlanSession.js', 'createRouteMenuImplementationPhases.js',
  'createAppWiringBoundaryPlan.js', 'createRouterWiringBoundaryPlan.js', 'createRouteRegistrationPlan.js',
  'createMenuRegistrationPlan.js', 'createSidebarNavigationPlacementPlan.js', 'createDevOnlyAccessPolicy.js',
  'createRouteGuardImplementationPlan.js', 'createMenuVisibilityImplementationPlan.js', 'createDeepLinkPolicyPlan.js',
  'createRuntimeUiMountBoundaryPlan.js', 'createBlockedNavigationActionPlan.js', 'createRouteMenuTestHarnessPlan.js',
  'createRouteMenuManualEnablementGatePlan.js', 'createRouteMenuRolloutRollbackPlan.js',
  'createRouteMenuObservabilityDiagnosticsPlan.js', 'createPrototypeRelinkProhibitionPlan.js',
  'createRouteMenuSafetyPlan.js', 'createRouteMenuImplementationReadinessDecision.js',
  'createRouteMenuImplementationPlanManifest.js', 'verifyRouteMenuImplementationPlan.js',
  'checkRouteMenuImplementationPlanCompatibility.js', 'createRouteMenuImplementationPlanDiagnostics.js',
  'createRouteMenuImplementationPlanFallback.js', 'index.js',
];
const DOCS = [
  'CERTIFICATION-REPORT.md', 'STUDIO-DEV-PREVIEW-ROUTE-MENU-IMPLEMENTATION-PLAN-REPORT.md', 'PLAN-SESSION.md',
  'IMPLEMENTATION-PHASES.md', 'APP-WIRING-BOUNDARY-PLAN.md', 'ROUTER-WIRING-BOUNDARY-PLAN.md',
  'ROUTE-REGISTRATION-PLAN.md', 'MENU-REGISTRATION-PLAN.md', 'SIDEBAR-NAVIGATION-PLACEMENT-PLAN.md',
  'DEV-ONLY-ACCESS-POLICY.md', 'ROUTE-GUARD-IMPLEMENTATION-PLAN.md', 'MENU-VISIBILITY-IMPLEMENTATION-PLAN.md',
  'DEEP-LINK-POLICY-PLAN.md', 'RUNTIME-UI-MOUNT-BOUNDARY-PLAN.md', 'BLOCKED-NAVIGATION-ACTION-PLAN.md',
  'TEST-HARNESS-PLAN.md', 'MANUAL-ENABLEMENT-GATE-PLAN.md', 'ROLLOUT-ROLLBACK-PLAN.md',
  'OBSERVABILITY-DIAGNOSTICS-PLAN.md', 'PROTOTYPE-RELINK-PROHIBITION-PLAN.md', 'SAFETY-PLAN.md',
  'MANIFEST-VERIFIER-COMPATIBILITY.md', 'NO-APP-NO-ROUTE-NO-MENU-NO-MOUNT.md', 'QUALITY-SCALABILITY-NOTES.md',
  'NEXT-SLICE-SPEC.md',
];

for (const f of FILES) gate(`G423-RMP — ${f} exists`, exists(path.join(DIR, f)));
gate('G423-RMP — no .jsx in subtree', walk(DIR).every((f) => !/\.jsx$/.test(f)));
gate('G423-RMP — no .tsx in subtree', walk(DIR).every((f) => !/\.tsx$/.test(f)));
gate('G423-RMP — no .css in subtree', !fs.readdirSync(DIR).some((f) => /\.css$/.test(f)));
gate('G423-RMP — tests exist', exists(path.join(ROOT, 'src/runtime/__tests__/studio-dev-preview-route-menu-implementation-plan.test.js')));
for (const d of DOCS) gate(`G423-RMP — ${d} exists`, exists(path.join(EV, d)));

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
try { U = m.createStudioDevPreviewRouteMenuImplementationPlan({ routeMenuContract: RMC }); } catch (err) { console.error(String(err)); }

let baseOk = false; let baseDetail = '';
try {
  baseOk = U.kind === 'studio-dev-preview-route-menu-implementation-plan'
    && U.routeMenuImplementationPlanName === 'studio-dev-preview-route-menu-implementation-plan'
    && U.routeMenuImplementationPlanVersion === 'studio-dev-preview-route-menu-implementation-plan@1.0.0'
    && U.routeMenuContractVersion === 'studio-dev-preview-route-menu-contract@1.0.0'
    && U.runtimeUiVersion === 'studio-dev-preview-runtime-ui@1.0.0'
    && U.mode === 'headless_dev_preview_route_menu_implementation_plan'
    && U.fallback === false
    && U.readiness === 'studio_dev_preview_route_menu_implementation_plan_ready'
    && U.readyForRouteMenuImplementationPlan === true
    && U.readyForRouteMenuImplementationSlice === false
    && U.readyForAppIntegration === false
    && U.readyForRealModuleGeneration === false
    && U.readyForProduction === false
    && U.blockerCount === 0 && U.warningCount === 0 && U.metadataOnly === true;
  baseDetail = baseOk ? `readiness=${U.readiness}` : 'plan invariants wrong';
} catch (err) { baseDetail = err instanceof Error ? err.message : String(err); }
gate('G423-RMP — plan headless/plan-only invariants + readiness ready', baseOk, baseDetail);

let capOk = false;
try {
  const c = m.ROUTE_MENU_IMPLEMENTATION_PLAN_CAPABILITIES;
  const trues = ['headless', 'contractOnly', 'metadataOnly', 'planOnly', 'implementationPhasesOnly', 'appWiringBoundaryPlanOnly', 'routerWiringBoundaryPlanOnly', 'routeRegistrationPlanOnly', 'menuRegistrationPlanOnly', 'sidebarNavigationPlacementPlanOnly', 'devOnlyAccessPolicyOnly', 'routeGuardImplementationPlanOnly', 'menuVisibilityImplementationPlanOnly', 'deepLinkPolicyPlanOnly', 'runtimeUiMountBoundaryPlanOnly', 'blockedNavigationActionPlanOnly', 'testHarnessPlanOnly', 'manualEnablementGatePlanOnly', 'rolloutRollbackPlanOnly', 'observabilityDiagnosticsPlanOnly', 'prototypeRelinkProhibitionPlanOnly'];
  const noes = ['routeImplemented', 'menuImplemented', 'appWiringImplemented', 'routerWiringImplemented', 'navigationWiringImplemented', 'sidebarWiringImplemented', 'deepLinkImplemented', 'runtimeUiMounted', 'routeCreated', 'menuCreated', 'moduleGenerated', 'filesWrittenToModule', 'moduleRegistered', 'backendAccessed', 'prismaAccessed', 'productionAccessed', 'stagingAccessed', 'fetchUsed', 'mutationAllowed', 'persistenceCreated', 'realDataRead', 'realDataWrite', 'rewriteEmpresas', 'oldPrototypeImported'];
  capOk = Object.isFrozen(c) && trues.every((k) => c[k] === true) && noes.every((k) => c[k] === false) && noes.every((k) => U.capabilities[k] === false);
} catch { capOk = false; }
gate('G423-RMP — capabilities frozen; *Only flags true; route/menu/wiring/mount + all forbidden flags false', capOk);

const part = (fn, argObj, pred) => { try { return pred(argObj === undefined ? m[fn]() : m[fn](argObj)); } catch (err) { console.error(`${fn}: ${err}`); return false; } };
gate('G423-RMP — session (stable seed, no storage/fetch/persistence)', part('createRouteMenuImplementationPlanSession', { routeMenuContract: RMC }, (x) => x.kind === 'route-menu-implementation-plan-session' && x.usesStorage === false && x.usesFetch === false && x.usesPersistence === false && typeof x.seed === 'string'));
gate('G423-RMP — phases (13 planned, none implemented)', part('createRouteMenuImplementationPhases', undefined, (x) => x.phaseCount === 13 && x.allPlanned === true && x.anyImplemented === false));
gate('G423-RMP — app wiring boundary (appTouched/appWiringImplemented/appJsxAllowed false)', part('createAppWiringBoundaryPlan', undefined, (x) => x.appTouched === false && x.appWiringImplemented === false && x.appJsxAllowed === false));
gate('G423-RMP — router wiring boundary (no wiring/primitives/api)', part('createRouterWiringBoundaryPlan', undefined, (x) => x.routerWiringImplemented === false && x.routeElementCreated === false && x.routesElementCreated === false && x.browserRouterUsed === false && x.createBrowserRouterUsed === false && x.useNavigateUsed === false));
gate('G423-RMP — route registration plan (metadata; registration/route/deepLink not created)', part('createRouteRegistrationPlan', { routeMenuContract: RMC }, (x) => x.registrationImplemented === false && x.routeCreated === false && x.deepLinkCreated === false && typeof x.futurePath === 'string'));
gate('G423-RMP — menu registration plan (metadata; menu/sidebar/navigation not touched)', part('createMenuRegistrationPlan', { routeMenuContract: RMC }, (x) => x.registrationImplemented === false && x.menuCreated === false && x.sidebarTouched === false && x.navigationTouched === false));
gate('G423-RMP — sidebar/navigation placement plan (not implemented)', part('createSidebarNavigationPlacementPlan', undefined, (x) => x.placementPlanned === true && x.placementImplemented === false && x.sidebarWiringImplemented === false && x.navigationWiringImplemented === false));
gate('G423-RMP — dev-only access policy (devOnly; production/staging not allowed; requires slice+gate)', part('createDevOnlyAccessPolicy', undefined, (x) => x.devOnly === true && x.productionAllowed === false && x.stagingAllowed === false && x.requiresExplicitFutureSlice === true && x.requiresManualGate === true));
gate('G423-RMP — route guard plan (default-deny, fail-closed, production/staging denied)', part('createRouteGuardImplementationPlan', undefined, (x) => x.guardImplemented === false && x.defaultDeny === true && x.failClosed === true && x.productionDenied === true && x.stagingDenied === true));
gate('G423-RMP — menu visibility plan (not visible now; planned_only)', part('createMenuVisibilityImplementationPlan', undefined, (x) => x.visibilityImplemented === false && x.visibleNow === false && x.visibleInProduct === false && x.futureVisibility === 'planned_only'));
gate('G423-RMP — deep-link policy plan (not implemented/allowed; no browser/external nav)', part('createDeepLinkPolicyPlan', undefined, (x) => x.deepLinkImplemented === false && x.deepLinkAllowed === false && x.browserNavigationAllowed === false && x.externalLinkAllowed === false));
gate('G423-RMP — runtime UI mount boundary (no mount; no reactDom/createRoot/window/document)', part('createRuntimeUiMountBoundaryPlan', undefined, (x) => x.runtimeUiMounted === false && x.mountImplemented === false && x.reactDomUsed === false && x.createRootUsed === false && x.windowApiUsed === false && x.documentApiUsed === false && x.mountTargetCreated === false));
gate('G423-RMP — blocked navigation plan (9 blocked incl mountRuntimeUi/registerNavigationItem; none allowed)', part('createBlockedNavigationActionPlan', undefined, (x) => x.allBlocked === true && x.anyAllowed === false && x.actionCount === 9 && ['navigate', 'openRoute', 'deepLink', 'registerRoute', 'registerMenu', 'registerSidebarItem', 'registerNavigationItem', 'mountRuntimeUi', 'registerModule'].every((a) => x.actions.some((y) => y.action === a && y.blocked === true))));
gate('G423-RMP — test harness plan (planned; no real runtime/data)', part('createRouteMenuTestHarnessPlan', undefined, (x) => x.harnessImplemented === false && x.headless === true && x.usesRealRuntime === false && x.usesRealData === false && x.suiteCount >= 5));
gate('G423-RMP — manual gate plan (required checkpoint; authorizes nothing real)', part('createRouteMenuManualEnablementGatePlan', undefined, (x) => x.manualGateRequired === true && x.currentSliceAuthorization === 'plan_only' && x.authorizesRoute === false && x.authorizesMenu === false && x.authorizesAppWiring === false && x.authorizesRuntimeUiMount === false && x.authorizesProduction === false));
gate('G423-RMP — rollout/rollback plan (rollout blocked; rollback by non-consumption)', part('createRouteMenuRolloutRollbackPlan', undefined, (x) => x.rolloutAllowed === false && x.productionRollout === false && x.stagingRollout === false && x.rollbackByNonConsumption === true));
gate('G423-RMP — observability plan (safe; no secrets/telemetry/external logging)', part('createRouteMenuObservabilityDiagnosticsPlan', undefined, (x) => x.safeDiagnostics === true && x.withoutSecrets === true && x.noStackLeak === true && x.noTelemetryRuntime === true && x.noExternalLogging === true));
gate('G423-RMP — prototype relink prohibition (relink/import/copy/move not allowed)', part('createPrototypeRelinkProhibitionPlan', undefined, (x) => x.prototypeRelinkAllowed === false && x.prototypeImportAllowed === false && x.prototypeCopyAllowed === false && x.prototypeMoveAllowed === false && x.oldPrototypeImported === false && Array.isArray(x.forbiddenPrototypePaths)));
gate('G423-RMP — safety plan (anyForbiddenSideEffect false; reversible; all forbidden flags false)', part('createRouteMenuSafetyPlan', undefined, (x) => x.anyForbiddenSideEffect === false && x.reversibleByNonConsumption === true && Object.values(x.forbiddenFlags).every((v) => v === false)));

gate('G423-RMP — readiness never slice/app-integration/generation/production', (() => { try { const r = m.createRouteMenuImplementationReadinessDecision({}); return r.readyForRouteMenuImplementationSlice === false && r.readyForAppIntegration === false && r.readyForRealModuleGeneration === false && r.readyForProduction === false; } catch { return false; } })());
gate('G423-RMP — readiness blocked on blockers', (() => { try { return m.createRouteMenuImplementationReadinessDecision({ blockers: ['x'] }).readiness === 'blocked'; } catch { return false; } })());

let manOk = false;
try { manOk = U.manifest.kind === 'route-menu-implementation-plan-manifest' && U.manifest.routeMenuImplementationPlanVersion === 'studio-dev-preview-route-menu-implementation-plan@1.0.0' && U.manifest.capabilities.headless === true && U.manifest.capabilities.routeImplemented === false && U.manifest.metadataOnly === true; } catch { manOk = false; }
gate('G423-RMP — manifest present + capability flags mirrored', manOk);

let verOk = false;
try { verOk = U.verification.ok === true && U.verification.valid === true && U.verification.headless === true && U.verification.planOnly === true && U.verification.routeImplemented === false && U.verification.menuImplemented === false && U.verification.runtimeUiMounted === false && U.verification.blockerCount === 0; } catch { verOk = false; }
gate('G423-RMP — verifier passes headless/plan-only invariants', verOk);

let verTamper = false;
try {
  const c = m.ROUTE_MENU_IMPLEMENTATION_PLAN_CAPABILITIES;
  const ok = (o) => m.verifyRouteMenuImplementationPlan(o).blockers;
  verTamper = ok({ plan: { capabilities: { ...c, routeImplemented: true } } }).includes('capability_routeImplemented_must_be_false')
    && ok({ plan: { capabilities: { ...c, menuImplemented: true } } }).includes('capability_menuImplemented_must_be_false')
    && ok({ plan: { capabilities: { ...c, appWiringImplemented: true, routerWiringImplemented: true } } }).includes('capability_appWiringImplemented_must_be_false')
    && ok({ plan: { capabilities: { ...c, navigationWiringImplemented: true, sidebarWiringImplemented: true } } }).includes('capability_navigationWiringImplemented_must_be_false')
    && ok({ plan: { capabilities: { ...c, runtimeUiMounted: true } } }).includes('capability_runtimeUiMounted_must_be_false')
    && ok({ plan: { capabilities: { ...c, deepLinkImplemented: true } } }).includes('capability_deepLinkImplemented_must_be_false')
    && ok({ plan: { capabilities: { ...c, backendAccessed: true, prismaAccessed: true } } }).includes('capability_backendAccessed_must_be_false')
    && ok({ plan: { capabilities: { ...c, productionAccessed: true, stagingAccessed: true } } }).includes('capability_productionAccessed_must_be_false')
    && ok({ plan: { capabilities: { ...c, realDataRead: true, realDataWrite: true } } }).includes('capability_realDataRead_must_be_false')
    && ok({ plan: { capabilities: { ...c, oldPrototypeImported: true } } }).includes('capability_oldPrototypeImported_must_be_false')
    && ok({ plan: { capabilities: c, appWiringBoundary: { appTouched: true } } }).includes('unsafe_app_touched')
    && ok({ plan: { capabilities: c, routerWiringBoundary: { routeElementCreated: true } } }).includes('unsafe_router_primitive')
    && ok({ plan: { capabilities: c, routerWiringBoundary: { browserRouterUsed: true } } }).includes('unsafe_router_api')
    && ok({ plan: { capabilities: c, routeRegistration: { routeCreated: true } } }).includes('unsafe_route_registered')
    && ok({ plan: { capabilities: c, menuRegistration: { menuCreated: true } } }).includes('unsafe_menu_registered')
    && ok({ plan: { capabilities: c, runtimeUiMountBoundary: { runtimeUiMounted: true } } }).includes('unsafe_runtime_ui_mounted')
    && ok({ plan: { capabilities: c, runtimeUiMountBoundary: { windowApiUsed: true } } }).includes('unsafe_dom_globals')
    && ok({ plan: { capabilities: c, deepLinkPolicy: { deepLinkImplemented: true } } }).includes('unsafe_deep_link')
    && ok({ plan: { capabilities: c, prototypeRelinkProhibition: { prototypeRelinkAllowed: true } } }).includes('unsafe_prototype_relink')
    && ok({ plan: { capabilities: c, manualGate: { manualGateRequired: false } } }).includes('missing_manual_gate');
} catch { verTamper = false; }
gate('G423-RMP — verifier detects route/menu/app/router wiring/mount/router-primitives/dom-globals/deep-link/backend/production/data/prototype/manual-gate attempts', verTamper);

let cmpOk = false;
try {
  const okc = m.checkRouteMenuImplementationPlanCompatibility({ routeMenuContract: RMC });
  const bad = m.checkRouteMenuImplementationPlanCompatibility({ routeMenuContract: { routeMenuContractVersion: 'x@9.9.9' } });
  cmpOk = okc.compatibleWithRouteMenuContract === true && okc.compatibleWithRuntimeUi === true && okc.readyForRouteMenuImplementationPlan === true && okc.readyForRouteMenuImplementationSlice === false && okc.readyForAppIntegration === false && okc.readyForProduction === false && okc.status === 'ready_for_future_route_menu_implementation_slice_after_enterprise_checkpoint' && bad.compatibleWithRouteMenuContract === false && bad.warnings.includes('incompatible_routeMenuContract');
} catch { cmpOk = false; }
gate('G423-RMP — compatibility aligned; never authorizes slice/app-integration/generation/production; mismatch → warning', cmpOk);

let diagOk = false;
try { diagOk = U.diagnostics.passive === true && U.diagnostics.ok === true && U.diagnostics.headlessConfirmed === true && U.diagnostics.planOnlyConfirmed === true && U.diagnostics.routeImplemented === false && U.diagnostics.menuImplemented === false && !/jwt|token|secret|DATABASE_URL/i.test(JSON.stringify(U.diagnostics)); } catch { diagOk = false; }
gate('G423-RMP — diagnostics passive, headless/plan-only confirmed, no secrets', diagOk);

let fbOk = false;
try {
  const fb = m.createStudioDevPreviewRouteMenuImplementationPlan({});
  const fb2 = m.createStudioDevPreviewRouteMenuImplementationPlan({ routeMenuContract: { kind: 'other' } });
  const fb3 = m.createStudioDevPreviewRouteMenuImplementationPlan({ routeMenuContract: { kind: 'studio-dev-preview-route-menu-contract', fallback: true } });
  fbOk = fb.fallback === true && fb.readiness === 'blocked' && fb.readyForRouteMenuImplementationPlan === false && fb.readyForProduction === false && fb.capabilities.routeImplemented === false && fb2.fallback === true && fb3.fallback === true;
} catch { fbOk = false; }
gate('G423-RMP — fallback fail-closed on invalid/missing/fallback route/menu contract', fbOk);

let detOk = false;
try {
  const a = m.createStudioDevPreviewRouteMenuImplementationPlan({ routeMenuContract: RMC });
  const b = m.createStudioDevPreviewRouteMenuImplementationPlan({ routeMenuContract: RMC });
  detOk = a.overallDigest === b.overallDigest && a.routeMenuImplementationPlanDigest === b.routeMenuImplementationPlanDigest && a.overallDigest.startsWith('fnv1a-');
} catch { detOk = false; }
gate('G423-RMP — deterministic overall + route/menu implementation plan digests', detOk);

let flagOk = false;
try {
  const off = m.isStudioDevPreviewRouteMenuImplementationPlanEnabled({ [m.MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_IMPLEMENTATION_PLAN_FLAG]: 'true', MAK_ENV_LABEL: 'production' });
  const onDev = m.isStudioDevPreviewRouteMenuImplementationPlanEnabled({ [m.MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_IMPLEMENTATION_PLAN_FLAG]: 'true', DEV: 'true' });
  const vOff = m.isStudioDevPreviewRouteMenuImplementationVerifyEnabled({ [m.MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_IMPLEMENTATION_VERIFY_FLAG]: 'true', NODE_ENV: 'production' });
  flagOk = off === false && onDev === true && vOff === false;
} catch { flagOk = false; }
gate('G423-RMP — feature flags fail closed in production', flagOk);

gate('G423-RMP — error catalog >= 30 codes', Array.isArray(m?.ROUTE_MENU_IMPLEMENTATION_PLAN_ERROR_CODES) && m.ROUTE_MENU_IMPLEMENTATION_PLAN_ERROR_CODES.length >= 30);
gate('G423-RMP — error descriptor sanitized + side-effect free', (() => { try { const e = m.createRouteMenuImplementationPlanError('ROUTE_MENU_PLAN_PRISMA_BLOCKED'); return e.safe === true && e.sideEffects === false && e.routeImplemented === false && e.menuImplemented === false && e.oldPrototypeImported === false && e.realDataRead === false; } catch { return false; } })());

// Explicit plan invariants.
gate('G423-RMP — routeImplemented false', U ? U.capabilities.routeImplemented === false : false);
gate('G423-RMP — menuImplemented false', U ? U.capabilities.menuImplemented === false : false);
gate('G423-RMP — appWiringImplemented false', U ? U.capabilities.appWiringImplemented === false : false);
gate('G423-RMP — routerWiringImplemented false', U ? U.capabilities.routerWiringImplemented === false : false);
gate('G423-RMP — navigationWiringImplemented false', U ? U.capabilities.navigationWiringImplemented === false : false);
gate('G423-RMP — sidebarWiringImplemented false', U ? U.capabilities.sidebarWiringImplemented === false : false);
gate('G423-RMP — deepLinkImplemented false', U ? U.capabilities.deepLinkImplemented === false : false);
gate('G423-RMP — runtimeUiMounted false', U ? U.capabilities.runtimeUiMounted === false : false);
gate('G423-RMP — readyForRouteMenuImplementationSlice false', U ? U.readyForRouteMenuImplementationSlice === false : false);
gate('G423-RMP — readyForAppIntegration false', U ? U.readyForAppIntegration === false : false);
gate('G423-RMP — readyForRealModuleGeneration false', U ? U.readyForRealModuleGeneration === false : false);
gate('G423-RMP — readyForProduction false', U ? U.readyForProduction === false : false);
gate('G423-RMP — top-level realDataRead/realDataWrite false', U ? (U.capabilities.realDataRead === false && U.capabilities.realDataWrite === false) : false);
gate('G423-RMP — blocked navigation allBlocked in plan', (() => { try { return U.blockedNavigation.allBlocked === true && U.blockedNavigation.anyAllowed === false; } catch { return false; } })());
gate('G423-RMP — manual gate required in plan', (() => { try { return U.manualGate.manualGateRequired === true && U.manualGate.authorizesRoute === false; } catch { return false; } })());
gate('G423-RMP — prototype relink prohibited in plan', (() => { try { return U.prototypeRelinkProhibition.prototypeRelinkAllowed === false && U.prototypeRelinkProhibition.oldPrototypeImported === false; } catch { return false; } })());
gate('G423-RMP — runtime UI mount boundary intact in plan', (() => { try { return U.runtimeUiMountBoundary.runtimeUiMounted === false && U.runtimeUiMountBoundary.reactDomUsed === false; } catch { return false; } })());

// Static safety scans — React-Router + DOM API scanned case-sensitively.
const code = stripComments(walk(DIR).map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
gate('G423-RMP — subtree is React-free', importsOf(walk(DIR)).every((p) => p !== 'react' && !/^react(\/|$)/.test(p)));
gate('G423-RMP — no react-router / react-dom import', importsOf(walk(DIR)).every((p) => !/react-router|react-dom/i.test(p)));
gate('G423-RMP — no <Route JSX / Routes / Link / NavLink (case-sensitive API)', !/<Route[\s/>]|\bRoutes\b|\bNavLink\b|<Link[\s/>]/.test(code));
gate('G423-RMP — no BrowserRouter / createBrowserRouter', !/\bBrowserRouter\b|\bcreateBrowserRouter\b/.test(code));
gate('G423-RMP — no useNavigate / ReactDOM / createRoot call', !/\buseNavigate\b|\bReactDOM\b|createRoot\s*\(|hydrateRoot\s*\(/.test(code));
gate('G423-RMP — no window/document access', !/\bdocument\.|\bwindow\.[a-z]/i.test(code));
gate('G423-RMP — no import of EmpresaApi/apiClient/apis/backend/prisma', importsOf(walk(DIR)).every((p) => !/EmpresaApi|apiClient|\/apis\/|\/backend\/|@prisma|PrismaClient/i.test(p)));
gate('G423-RMP — no fetch/XHR/WebSocket/storage-API', !/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(code) && !/localStorage\.|sessionStorage\.|indexedDB\./.test(code));
gate('G423-RMP — no DATABASE_URL / production API_URL / Railway', !/DATABASE_URL|VITE_API_URL|projetomg-production|railway/i.test(code));
gate('G423-RMP — no real POST/PUT/PATCH/DELETE method', !/method\s*:\s*['"](POST|PUT|PATCH|DELETE)['"]/.test(code));
gate('G423-RMP — no realDataRead/realDataWrite true literal', !/realDataRead\s*:\s*true|realDataWrite\s*:\s*true/.test(code));
gate('G423-RMP — no old Studio prototype import', importsOf(walk(DIR)).every((p) => !/studio\/(components|shell|designers|pages|navigation|dock|panels|editor)/.test(p)));
gate('G423-RMP — no src/components or src/pages import', importsOf(walk(DIR)).every((p) => !/(^|\.\.\/)(components|pages)\//.test(p)));

gate('G423-RMP — docs validate plan not implementation + next slice checkpoint', /App|route|rota|menu|mount|montad/i.test(readEv('NO-APP-NO-ROUTE-NO-MENU-NO-MOUNT.md')) && /ENTERPRISE CHECKPOINT|checkpoint|FABLE/i.test(readEv('NEXT-SLICE-SPEC.md')));

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
gate('G423-RMP — src/modules / Empresas / backend / Prisma / SSOT untouched', blockedOk, blockedDetail);

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
gate('G423-RMP — authorized scope only (plan subtree + registry + evidence + package)', scopeOk, scopeDetail);

let noJsxTsxCss = false; let noJsxTsxCssDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const bad = files.filter((f) => /\.(jsx|tsx|css)$/.test(f));
  noJsxTsxCss = bad.length === 0;
  noJsxTsxCssDetail = noJsxTsxCss ? 'no .jsx / .tsx / .css added' : `bad: ${bad.join(', ')}`;
} catch (err) { noJsxTsxCss = true; noJsxTsxCssDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-RMP — no .jsx / .tsx / .css added in diff', noJsxTsxCss, noJsxTsxCssDetail);

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
gate('G423-RMP — productionUiGuard + governance guard + prior gates/tests NOT altered by this slice', noOldEdit, noOldEditDetail);

let regOk = false; let regDetail = '';
try {
  const reg = await import(pathToFileURL(path.join(ROOT, 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs')).href);
  const known = reg.KNOWN_LATER_STUDIO_HEADLESS_ARTIFACTS;
  const hasOwn = known.some((re) => re.test('src/studio/blueprint-engine/dev-preview-route-menu-implementation-plan/index.js'));
  const forbiddenProbes = ['src/modules/x/y.js', 'backend/server.js', 'src/App.jsx', 'backend/prisma/schema.prisma', 'src/pages/z.jsx'];
  const leaks = forbiddenProbes.filter((p) => known.some((re) => re.test(p)));
  regOk = hasOwn && leaks.length === 0;
  regDetail = regOk ? 'specific plan paths registered; no broad wildcard leaks a forbidden path' : `hasOwn=${hasOwn} leaks=${leaks.join(',')}`;
} catch (err) { regOk = false; regDetail = err instanceof Error ? err.message : String(err); }
gate('G423-RMP — registry: specific slice paths only, no dangerous wildcard', regOk, regDetail);

let noNewDep = false;
try {
  const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
  const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
  const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
  noNewDep = bk === hk;
} catch { noNewDep = true; }
gate('G423-RMP — no new dependency added', noNewDep);

gate('G423-RMP — src/modules/studio does NOT exist', !exists(path.join(ROOT, 'src/modules/studio')));
gate('G423-RMP — App.jsx untouched (not in diff)', (() => { try { const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); return !files.includes('src/App.jsx'); } catch { return true; } })());
gate('G423-RMP — upstream route/menu contract present', exists(path.join(RMC_DIR, 'index.js')));

let testsOk = false; let testCount = 0;
try {
  const out = execSync('node --test src/runtime/__tests__/studio-dev-preview-route-menu-implementation-plan.test.js', { cwd: ROOT, stdio: 'pipe', env: { ...process.env, NODE_ENV: 'test' } }).toString();
  const mt = out.match(/# tests (\d+)/); const mp = out.match(/# pass (\d+)/); const mf = out.match(/# fail (\d+)/);
  testCount = mt ? Number(mt[1]) : 0;
  testsOk = mf ? Number(mf[1]) === 0 && mp && Number(mp[1]) === testCount : false;
} catch (err) { if (err.stderr) console.error(String(err.stderr)); }
gate('G423-RMP — route/menu implementation plan unit tests PASS', testsOk, `${testCount} scenarios`);
gate('G423-RMP — unit test has >= 390 scenarios', testCount >= 390, `${testCount} scenarios (min 390)`);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-STUDIO-DEV-PREVIEW-ROUTE-MENU-IMPLEMENTATION-PLAN summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);
if (failed.length > 0) process.exit(1);
