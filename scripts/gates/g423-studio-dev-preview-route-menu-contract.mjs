#!/usr/bin/env node
/**
 * Gate G423-STUDIO-DEV-PREVIEW-ROUTE-MENU-CONTRACT — Post-Foundation C.
 *
 * Proves the headless, CONTRACT-ONLY route/menu contract in
 * `src/studio/blueprint-engine/dev-preview-route-menu-contract/`. It consumes the Dev Preview
 * Runtime UI and produces the deterministic CONTRACT for a future controlled route/menu
 * integration — route descriptor/eligibility/guard/isolation/visibility/access, menu placement/
 * visibility/eligibility, navigation boundary, deep-link blocked, App/router/menu wiring blocked,
 * manual enablement gate, rollout/rollback and safety.
 *
 * It creates NO real route/menu/router, NO App/router/navigation/sidebar wiring, NO Route/Routes/
 * NavLink/Link/BrowserRouter/createBrowserRouter/useNavigate, NO deep link, NO module, and never
 * touches backend/Prisma/migration/network/production/staging, mutates, persists, reads/writes
 * real data, rewrites Empresas, or imports the old Studio prototype. No `.jsx`/`.tsx`/`.css`.
 *
 * Scope safety uses the central Studio Scope Governance guard: forbidden always wins; legitimate
 * later Studio headless artifacts are tolerated; nothing weakens the block.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { isKnownLaterStudioHeadlessArtifact, filterForbiddenScopePaths } from './lib/studioScopeGovernanceGuard.mjs';
import { evaluateStudioBranchScope } from './lib/studioScopeGovernanceGuard.mjs';

// ---------------------------------------------------------------------------
// CALLER-AWARE branch-relative scope governance. This gate declares its OWN slice identity,
// so the checks below can ask which slice the branch is building and whether that slice is
// this one or a genuinely later one — a question the previous flat registry could not answer.
// Forbidden and unknown paths still fail closed; nothing is tolerated by mere registration.
// ---------------------------------------------------------------------------
const CALLER_SLICE_ID = 'dev-preview-route-menu-contract';
let studioScopeCache = null;
const studioScope = () => {
  if (studioScopeCache) return studioScopeCache;
  let changed = [];
  let gitAvailable = true;
  try {
    changed = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  } catch { gitAvailable = false; }
  const evaluation = evaluateStudioBranchScope(changed, {
    callerSliceId: CALLER_SLICE_ID,
  });
  studioScopeCache = { gitAvailable, changed, evaluation };
  return studioScopeCache;
};

const ROOT = process.cwd();
const DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-route-menu-contract');
const UI_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-runtime-ui');
const UC_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-runtime-ui-contract');
const IR_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-isolated-runtime');
const PLAN_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-isolated-runtime-implementation-plan');
const SHELL_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-runtime-shell-contract');
const VISUAL_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-visual-contract');
const BRIDGE_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-contract-bridge');
const SANDBOX_DIR = path.join(ROOT, 'src/studio/blueprint-engine/module-preview-sandbox');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-dev-preview-route-menu-contract');
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
  /^src\/studio\/blueprint-engine\/dev-preview-route-menu-contract\//,
  /^src\/runtime\/__tests__\/studio-dev-preview-route-menu-contract\.test\.js$/,
  /^scripts\/gates\/g423-studio-dev-preview-route-menu-contract\.mjs$/,
  /^scripts\/gates\/lib\/studioScopeGovernanceRegistry\.mjs$/,
  /^package\.json$/,
  /^package-lock\.json$/,
  /^docs\/evidence\/post-foundation-c-studio-dev-preview-route-menu-contract\//,
];
const authorized = (f) => AUTHORIZED.some((re) => re.test(f)) || isKnownLaterStudioHeadlessArtifact(f);

const FILES = [
  'routeMenuContractConfig.js', 'errors.js', 'createStudioDevPreviewRouteMenuContract.js',
  'createRouteMenuContractSession.js', 'createDevPreviewRouteDescriptorContract.js',
  'createDevPreviewRouteEligibilityContract.js', 'createDevPreviewRouteGuardContract.js',
  'createDevPreviewRouteIsolationContract.js', 'createDevPreviewRouteVisibilityContract.js',
  'createDevPreviewRouteAccessDecision.js', 'createDevPreviewMenuPlacementContract.js',
  'createDevPreviewMenuVisibilityContract.js', 'createDevPreviewMenuEligibilityContract.js',
  'createDevPreviewNavigationBoundaryContract.js', 'createDevPreviewDeepLinkBlockedContract.js',
  'createDevPreviewAppWiringBlockedContract.js', 'createDevPreviewManualEnablementGateContract.js',
  'createDevPreviewRouteMenuRolloutRollbackContract.js', 'createDevPreviewRouteMenuSafetyContract.js',
  'createDevPreviewRouteMenuReadinessDecision.js', 'createDevPreviewRouteMenuManifest.js',
  'verifyDevPreviewRouteMenuContract.js', 'checkDevPreviewRouteMenuCompatibility.js',
  'createDevPreviewRouteMenuDiagnostics.js', 'createDevPreviewRouteMenuFallback.js', 'index.js',
];
const DOCS = [
  'CERTIFICATION-REPORT.md', 'STUDIO-DEV-PREVIEW-ROUTE-MENU-CONTRACT-REPORT.md', 'CONTRACT-SESSION.md',
  'ROUTE-DESCRIPTOR-CONTRACT.md', 'ROUTE-ELIGIBILITY-CONTRACT.md', 'ROUTE-GUARD-CONTRACT.md',
  'ROUTE-ISOLATION-CONTRACT.md', 'ROUTE-VISIBILITY-CONTRACT.md', 'ROUTE-ACCESS-DECISION.md',
  'MENU-PLACEMENT-CONTRACT.md', 'MENU-VISIBILITY-CONTRACT.md', 'MENU-ELIGIBILITY-CONTRACT.md',
  'NAVIGATION-BOUNDARY-CONTRACT.md', 'DEEP-LINK-BLOCKED-CONTRACT.md', 'APP-ROUTER-MENU-WIRING-BLOCKED.md',
  'MANUAL-ENABLEMENT-GATE.md', 'ROLLOUT-ROLLBACK.md', 'SAFETY-CONTRACT.md',
  'MANIFEST-VERIFIER-COMPATIBILITY.md', 'NO-APP-NO-ROUTE-NO-MENU-NO-MODULE.md', 'NO-PROTOTYPE-RELINK.md',
  'QUALITY-SCALABILITY-NOTES.md', 'NEXT-SLICE-SPEC.md',
];

for (const f of FILES) gate(`G423-RMC — ${f} exists`, exists(path.join(DIR, f)));
gate('G423-RMC — no .jsx in subtree', walk(DIR).every((f) => !/\.jsx$/.test(f)));
gate('G423-RMC — no .tsx in subtree', walk(DIR).every((f) => !/\.tsx$/.test(f)));
gate('G423-RMC — no .css in subtree', !fs.readdirSync(DIR).some((f) => /\.css$/.test(f)));
gate('G423-RMC — tests exist', exists(path.join(ROOT, 'src/runtime/__tests__/studio-dev-preview-route-menu-contract.test.js')));
for (const d of DOCS) gate(`G423-RMC — ${d} exists`, exists(path.join(EV, d)));

let m = null; let uiMod = null; let ucMod = null; let irMod = null; let planMod = null; let shellMod = null; let visualMod = null; let bridgeMod = null; let sandboxMod = null;
try { m = await import(pathToFileURL(path.join(DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { uiMod = await import(pathToFileURL(path.join(UI_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { ucMod = await import(pathToFileURL(path.join(UC_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { irMod = await import(pathToFileURL(path.join(IR_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { planMod = await import(pathToFileURL(path.join(PLAN_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { shellMod = await import(pathToFileURL(path.join(SHELL_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { visualMod = await import(pathToFileURL(path.join(VISUAL_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { bridgeMod = await import(pathToFileURL(path.join(BRIDGE_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { sandboxMod = await import(pathToFileURL(path.join(SANDBOX_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }

let SB = null; let BRIDGE = null; let VC = null; let RS = null; let IPLAN = null; let IR = null; let UC = null; let UI = null; let U = null;
try { SB = sandboxMod.createStudioModulePreviewSandboxContract({ blueprint: { moduleId: 'clientes', moduleName: 'Clientes', modelType: 'cadastro', modelFamily: 'ModeloBase1', fields: [{ name: 'nome', type: 'text' }], permissions: [{ action: 'read', level: 'module' }] } }); } catch (err) { console.error(String(err)); }
try { BRIDGE = bridgeMod.createStudioDevPreviewContractBridge({ sandbox: SB }); } catch (err) { console.error(String(err)); }
try { VC = visualMod.createStudioDevPreviewVisualContract({ bridge: BRIDGE }); } catch (err) { console.error(String(err)); }
try { RS = shellMod.createStudioDevPreviewRuntimeShellContract({ visualContract: VC }); } catch (err) { console.error(String(err)); }
try { IPLAN = planMod.createStudioDevPreviewIsolatedRuntimeImplementationPlan({ runtimeShellContract: RS }); } catch (err) { console.error(String(err)); }
try { IR = irMod.createStudioDevPreviewIsolatedRuntime({ implementationPlan: IPLAN }); } catch (err) { console.error(String(err)); }
try { UC = ucMod.createStudioDevPreviewRuntimeUiContract({ isolatedRuntime: IR }); } catch (err) { console.error(String(err)); }
try { UI = uiMod.createStudioDevPreviewRuntimeUi({ runtimeUiContract: UC, env: { DEV: 'true' } }); } catch (err) { console.error(String(err)); }
try { U = m.createStudioDevPreviewRouteMenuContract({ runtimeUi: UI }); } catch (err) { console.error(String(err)); }

let baseOk = false; let baseDetail = '';
try {
  baseOk = U.kind === 'studio-dev-preview-route-menu-contract'
    && U.routeMenuContractName === 'studio-dev-preview-route-menu-contract'
    && U.routeMenuContractVersion === 'studio-dev-preview-route-menu-contract@1.0.0'
    && U.runtimeUiVersion === 'studio-dev-preview-runtime-ui@1.0.0'
    && U.runtimeUiContractVersion === 'studio-dev-preview-runtime-ui-contract@1.0.0'
    && U.isolatedRuntimeVersion === 'studio-dev-preview-isolated-runtime@1.0.0'
    && U.mode === 'headless_dev_preview_route_menu_contract'
    && U.fallback === false
    && U.readiness === 'studio_dev_preview_route_menu_contract_ready'
    && U.readyForRouteMenuContract === true
    && U.readyForRouteMenuImplementation === false
    && U.readyForAppIntegration === false
    && U.readyForRealModuleGeneration === false
    && U.readyForProduction === false
    && U.blockerCount === 0 && U.warningCount === 0 && U.metadataOnly === true;
  baseDetail = baseOk ? `readiness=${U.readiness}` : 'contract invariants wrong';
} catch (err) { baseDetail = err instanceof Error ? err.message : String(err); }
gate('G423-RMC — contract headless/contract-only invariants + readiness ready', baseOk, baseDetail);

let capOk = false;
try {
  const c = m.ROUTE_MENU_CONTRACT_CAPABILITIES;
  const trues = ['headless', 'contractOnly', 'metadataOnly', 'routeContractOnly', 'menuContractOnly', 'navigationContractOnly', 'devOnly', 'isolated', 'routeDescriptorMetadataOnly', 'routeEligibilityMetadataOnly', 'routeGuardMetadataOnly', 'routeIsolationMetadataOnly', 'routeVisibilityMetadataOnly', 'menuPlacementMetadataOnly', 'menuVisibilityMetadataOnly', 'navigationBoundaryMetadataOnly', 'deepLinkBlockedMetadataOnly', 'manualEnablementGateOnly'];
  const noes = ['routeCreated', 'menuCreated', 'appWiringCreated', 'routerWiringCreated', 'navigationWiringCreated', 'sidebarWiringCreated', 'deepLinkCreated', 'linkCreated', 'navLinkCreated', 'moduleGenerated', 'filesWrittenToModule', 'moduleRegistered', 'backendAccessed', 'prismaAccessed', 'productionAccessed', 'stagingAccessed', 'fetchUsed', 'mutationAllowed', 'persistenceCreated', 'realDataRead', 'realDataWrite', 'rewriteEmpresas', 'oldPrototypeImported'];
  capOk = Object.isFrozen(c) && trues.every((k) => c[k] === true) && noes.every((k) => c[k] === false) && noes.every((k) => U.capabilities[k] === false);
} catch { capOk = false; }
gate('G423-RMC — capabilities frozen; *Only flags true; route/menu/wiring + all forbidden flags false', capOk);

const part = (fn, argObj, pred) => { try { return pred(argObj === undefined ? m[fn]() : m[fn](argObj)); } catch (err) { console.error(`${fn}: ${err}`); return false; } };
gate('G423-RMC — session (stable seed, no storage/fetch/persistence)', part('createRouteMenuContractSession', { runtimeUi: UI }, (x) => x.kind === 'route-menu-contract-session' && x.usesStorage === false && x.usesFetch === false && x.usesPersistence === false && typeof x.seed === 'string'));
gate('G423-RMC — route descriptor (metadata; routeCreated/appRegistered/routerRegistered false)', part('createDevPreviewRouteDescriptorContract', { runtimeUi: UI }, (x) => x.routeCreated === false && x.componentMounted === false && x.appRegistered === false && x.routerRegistered === false && x.metadataOnly === true));
gate('G423-RMC — route eligibility (future only; not current wiring)', part('createDevPreviewRouteEligibilityContract', undefined, (x) => x.eligibleForFutureImplementation === true && x.eligibleForCurrentWiring === false && x.requiresManualGate === true));
gate('G423-RMC — route guard (default-deny, fail-closed, production/staging denied)', part('createDevPreviewRouteGuardContract', undefined, (x) => x.defaultDeny === true && x.failClosed === true && x.productionDenied === true && x.stagingDenied === true));
gate('G423-RMC — route isolation (no app/router/route/menu/sidebar reg; no prototype relink)', part('createDevPreviewRouteIsolationContract', undefined, (x) => x.noAppWiring === true && x.noRouterWiring === true && x.noRouteRegistration === true && x.noMenuRegistration === true && x.noSidebarRegistration === true && x.noPrototypeRelink === true));
gate('G423-RMC — route visibility (not visible now; future contract_only)', part('createDevPreviewRouteVisibilityContract', undefined, (x) => x.visibleNow === false && x.visibleInDevMenuNow === false && x.visibleInProductNow === false && x.futureVisibility === 'contract_only'));
gate('G423-RMC — route access decision (deny now; fail-closed in production)', (() => { try { const ok = m.createDevPreviewRouteAccessDecision({ env: { DEV: 'true' } }); const bad = m.createDevPreviewRouteAccessDecision({ env: { MAK_ENV_LABEL: 'production' } }); return ok.accessGrantedNow === false && ok.decision === 'deny_contract_only' && bad.accessGrantedNow === false && bad.productionDetected === true; } catch { return false; } })());
gate('G423-RMC — menu placement (metadata; menuCreated/menuItemRegistered/sidebarTouched false)', part('createDevPreviewMenuPlacementContract', { runtimeUi: UI }, (x) => x.menuCreated === false && x.menuItemRegistered === false && x.sidebarTouched === false && x.navigationTouched === false));
gate('G423-RMC — menu visibility (not visible now; future contract_only)', part('createDevPreviewMenuVisibilityContract', undefined, (x) => x.visibleNow === false && x.futureVisibility === 'contract_only'));
gate('G423-RMC — menu eligibility (future only; not current wiring)', part('createDevPreviewMenuEligibilityContract', undefined, (x) => x.eligibleForFutureImplementation === true && x.eligibleForCurrentWiring === false));
gate('G423-RMC — navigation boundary (7 blocked incl registerRoute/registerMenu; none allowed)', part('createDevPreviewNavigationBoundaryContract', undefined, (x) => x.allBlocked === true && x.anyAllowed === false && x.actionCount === 7 && ['navigate', 'openRoute', 'deepLink', 'registerRoute', 'registerMenu', 'registerSidebarItem', 'registerModule'].every((a) => x.actions.some((y) => y.action === a && y.blocked === true))));
gate('G423-RMC — deep-link blocked (nothing created/allowed; no browser navigation)', part('createDevPreviewDeepLinkBlockedContract', undefined, (x) => x.deepLinkCreated === false && x.deepLinkAllowed === false && x.externalLinkAllowed === false && x.browserNavigationAllowed === false));
gate('G423-RMC — app wiring blocked (app/router/routes/menu/sidebar/navigation untouched; wiring not allowed)', part('createDevPreviewAppWiringBlockedContract', undefined, (x) => x.appTouched === false && x.routerTouched === false && x.routesTouched === false && x.menuTouched === false && x.sidebarTouched === false && x.navigationTouched === false && x.wiringAllowed === false));
gate('G423-RMC — manual gate (required checkpoint; authorizes nothing real)', part('createDevPreviewManualEnablementGateContract', undefined, (x) => x.manualGateRequired === true && x.currentSliceAuthorization === 'contract_only' && x.authorizesRoute === false && x.authorizesMenu === false && x.authorizesAppWiring === false && x.authorizesProduction === false));
gate('G423-RMC — rollout/rollback (rollout blocked; rollback by non-consumption)', part('createDevPreviewRouteMenuRolloutRollbackContract', undefined, (x) => x.rolloutAllowed === false && x.productionRollout === false && x.stagingRollout === false && x.rollbackByNonConsumption === true));
gate('G423-RMC — safety (anyForbiddenSideEffect false; reversible; all forbidden flags false)', part('createDevPreviewRouteMenuSafetyContract', undefined, (x) => x.anyForbiddenSideEffect === false && x.reversibleByNonConsumption === true && Object.values(x.forbiddenFlags).every((v) => v === false)));

gate('G423-RMC — readiness never impl/app-integration/generation/production', (() => { try { const r = m.createDevPreviewRouteMenuReadinessDecision({}); return r.readyForRouteMenuImplementation === false && r.readyForAppIntegration === false && r.readyForRealModuleGeneration === false && r.readyForProduction === false; } catch { return false; } })());
gate('G423-RMC — readiness blocked on blockers', (() => { try { return m.createDevPreviewRouteMenuReadinessDecision({ blockers: ['x'] }).readiness === 'blocked'; } catch { return false; } })());

let manOk = false;
try { manOk = U.manifest.kind === 'dev-preview-route-menu-manifest' && U.manifest.routeMenuContractVersion === 'studio-dev-preview-route-menu-contract@1.0.0' && U.manifest.capabilities.headless === true && U.manifest.capabilities.routeCreated === false && U.manifest.metadataOnly === true; } catch { manOk = false; }
gate('G423-RMC — manifest present + capability flags mirrored', manOk);

let verOk = false;
try { verOk = U.verification.ok === true && U.verification.valid === true && U.verification.headless === true && U.verification.routeCreated === false && U.verification.menuCreated === false && U.verification.blockerCount === 0; } catch { verOk = false; }
gate('G423-RMC — verifier passes headless invariants', verOk);

let verTamper = false;
try {
  const c = m.ROUTE_MENU_CONTRACT_CAPABILITIES;
  const ok = (o) => m.verifyDevPreviewRouteMenuContract(o).blockers;
  verTamper = ok({ contract: { capabilities: { ...c, routeCreated: true } } }).includes('capability_routeCreated_must_be_false')
    && ok({ contract: { capabilities: { ...c, menuCreated: true } } }).includes('capability_menuCreated_must_be_false')
    && ok({ contract: { capabilities: { ...c, appWiringCreated: true, routerWiringCreated: true } } }).includes('capability_appWiringCreated_must_be_false')
    && ok({ contract: { capabilities: { ...c, navigationWiringCreated: true, sidebarWiringCreated: true } } }).includes('capability_navigationWiringCreated_must_be_false')
    && ok({ contract: { capabilities: { ...c, navLinkCreated: true, linkCreated: true } } }).includes('capability_navLinkCreated_must_be_false')
    && ok({ contract: { capabilities: { ...c, deepLinkCreated: true } } }).includes('capability_deepLinkCreated_must_be_false')
    && ok({ contract: { capabilities: { ...c, productionAccessed: true, stagingAccessed: true } } }).includes('capability_productionAccessed_must_be_false')
    && ok({ contract: { capabilities: { ...c, backendAccessed: true, prismaAccessed: true } } }).includes('capability_backendAccessed_must_be_false')
    && ok({ contract: { capabilities: { ...c, realDataRead: true, realDataWrite: true } } }).includes('capability_realDataRead_must_be_false')
    && ok({ contract: { capabilities: { ...c, oldPrototypeImported: true } } }).includes('capability_oldPrototypeImported_must_be_false')
    && ok({ contract: { capabilities: c, routeDescriptor: { routeCreated: true } } }).includes('unsafe_route_created')
    && ok({ contract: { capabilities: c, menuPlacement: { menuCreated: true } } }).includes('unsafe_menu_created')
    && ok({ contract: { capabilities: c, deepLinkBlocked: { deepLinkCreated: true } } }).includes('unsafe_deep_link')
    && ok({ contract: { capabilities: c, appWiringBlocked: { wiringAllowed: true } } }).includes('unsafe_wiring_allowed')
    && ok({ contract: { capabilities: c, routeIsolation: { noPrototypeRelink: false } } }).includes('unsafe_prototype_relink')
    && ok({ contract: { capabilities: c, manualGate: { manualGateRequired: false } } }).includes('missing_manual_gate');
} catch { verTamper = false; }
gate('G423-RMC — verifier detects route/menu/wiring/NavLink/Link/deepLink/production/backend/data/prototype-relink/manual-gate attempts', verTamper);

let cmpOk = false;
try {
  const ok = m.checkDevPreviewRouteMenuCompatibility({ runtimeUi: UI });
  const bad = m.checkDevPreviewRouteMenuCompatibility({ runtimeUi: { runtimeUiVersion: 'x@9.9.9' } });
  cmpOk = ok.compatibleWithRuntimeUi === true && ok.readyForRouteMenuContract === true && ok.readyForRouteMenuImplementation === false && ok.readyForAppIntegration === false && ok.readyForProduction === false && ok.status === 'ready_for_future_route_menu_implementation_plan_after_enterprise_checkpoint' && bad.compatibleWithRuntimeUi === false && bad.warnings.includes('incompatible_runtimeUi');
} catch { cmpOk = false; }
gate('G423-RMC — compatibility aligned; never authorizes impl/app-integration/generation/production; mismatch → warning', cmpOk);

let diagOk = false;
try { diagOk = U.diagnostics.passive === true && U.diagnostics.ok === true && U.diagnostics.headlessConfirmed === true && U.diagnostics.contractOnlyConfirmed === true && U.diagnostics.routeCreated === false && U.diagnostics.menuCreated === false && !/jwt|token|secret|DATABASE_URL/i.test(JSON.stringify(U.diagnostics)); } catch { diagOk = false; }
gate('G423-RMC — diagnostics passive, headless/contract-only confirmed, no secrets', diagOk);

let fbOk = false;
try {
  const fb = m.createStudioDevPreviewRouteMenuContract({});
  const fb2 = m.createStudioDevPreviewRouteMenuContract({ runtimeUi: { kind: 'other' } });
  const fb3 = m.createStudioDevPreviewRouteMenuContract({ runtimeUi: { kind: 'studio-dev-preview-runtime-ui', fallback: true } });
  fbOk = fb.fallback === true && fb.readiness === 'blocked' && fb.readyForRouteMenuContract === false && fb.readyForProduction === false && fb.capabilities.routeCreated === false && fb2.fallback === true && fb3.fallback === true;
} catch { fbOk = false; }
gate('G423-RMC — fallback fail-closed on invalid/missing/fallback runtime UI', fbOk);

let detOk = false;
try {
  const a = m.createStudioDevPreviewRouteMenuContract({ runtimeUi: UI });
  const b = m.createStudioDevPreviewRouteMenuContract({ runtimeUi: UI });
  detOk = a.overallDigest === b.overallDigest && a.routeMenuContractDigest === b.routeMenuContractDigest && a.overallDigest.startsWith('fnv1a-');
} catch { detOk = false; }
gate('G423-RMC — deterministic overall + route/menu contract digests', detOk);

let flagOk = false;
try {
  const off = m.isStudioDevPreviewRouteMenuContractEnabled({ [m.MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_CONTRACT_FLAG]: 'true', MAK_ENV_LABEL: 'production' });
  const onDev = m.isStudioDevPreviewRouteMenuContractEnabled({ [m.MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_CONTRACT_FLAG]: 'true', DEV: 'true' });
  const vOff = m.isStudioDevPreviewRouteMenuVerifyEnabled({ [m.MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_VERIFY_FLAG]: 'true', NODE_ENV: 'production' });
  flagOk = off === false && onDev === true && vOff === false;
} catch { flagOk = false; }
gate('G423-RMC — feature flags fail closed in production', flagOk);

gate('G423-RMC — error catalog >= 30 codes', Array.isArray(m?.ROUTE_MENU_CONTRACT_ERROR_CODES) && m.ROUTE_MENU_CONTRACT_ERROR_CODES.length >= 30);
gate('G423-RMC — error descriptor sanitized + side-effect free', (() => { try { const e = m.createRouteMenuContractError('ROUTE_MENU_CONTRACT_PRISMA_BLOCKED'); return e.safe === true && e.sideEffects === false && e.routeCreated === false && e.menuCreated === false && e.oldPrototypeImported === false && e.realDataRead === false; } catch { return false; } })());

// Explicit contract invariants.
gate('G423-RMC — routeCreated false', U ? U.capabilities.routeCreated === false : false);
gate('G423-RMC — menuCreated false', U ? U.capabilities.menuCreated === false : false);
gate('G423-RMC — appWiringCreated false', U ? U.capabilities.appWiringCreated === false : false);
gate('G423-RMC — routerWiringCreated false', U ? U.capabilities.routerWiringCreated === false : false);
gate('G423-RMC — navigationWiringCreated false', U ? U.capabilities.navigationWiringCreated === false : false);
gate('G423-RMC — sidebarWiringCreated false', U ? U.capabilities.sidebarWiringCreated === false : false);
gate('G423-RMC — deepLinkCreated false', U ? U.capabilities.deepLinkCreated === false : false);
gate('G423-RMC — linkCreated/navLinkCreated false', U ? (U.capabilities.linkCreated === false && U.capabilities.navLinkCreated === false) : false);
gate('G423-RMC — readyForRouteMenuImplementation false', U ? U.readyForRouteMenuImplementation === false : false);
gate('G423-RMC — readyForAppIntegration false', U ? U.readyForAppIntegration === false : false);
gate('G423-RMC — readyForRealModuleGeneration false', U ? U.readyForRealModuleGeneration === false : false);
gate('G423-RMC — readyForProduction false', U ? U.readyForProduction === false : false);
gate('G423-RMC — top-level realDataRead/realDataWrite false', U ? (U.capabilities.realDataRead === false && U.capabilities.realDataWrite === false) : false);
gate('G423-RMC — navigation boundary allBlocked in contract', (() => { try { return U.navigationBoundary.allBlocked === true && U.navigationBoundary.anyAllowed === false; } catch { return false; } })());
gate('G423-RMC — manual gate required in contract', (() => { try { return U.manualGate.manualGateRequired === true && U.manualGate.authorizesRoute === false; } catch { return false; } })());
gate('G423-RMC — route isolation no prototype relink in contract', (() => { try { return U.routeIsolation.noPrototypeRelink === true; } catch { return false; } })());

// Static safety scans — React-Router API scanned case-sensitively.
const code = stripComments(walk(DIR).map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
gate('G423-RMC — subtree is React-free', importsOf(walk(DIR)).every((p) => p !== 'react' && !/^react(\/|$)/.test(p)));
gate('G423-RMC — no react-router import', importsOf(walk(DIR)).every((p) => !/react-router/i.test(p)));
gate('G423-RMC — no <Route JSX / Routes / NavLink (case-sensitive API)', !/<Route[\s/>]|\bRoutes\b|\bNavLink\b/.test(code));
gate('G423-RMC — no BrowserRouter / createBrowserRouter', !/\bBrowserRouter\b|\bcreateBrowserRouter\b/.test(code));
gate('G423-RMC — no useNavigate', !/\buseNavigate\b/.test(code));
gate('G423-RMC — no import of EmpresaApi/apiClient/apis/backend/prisma', importsOf(walk(DIR)).every((p) => !/EmpresaApi|apiClient|\/apis\/|\/backend\/|@prisma|PrismaClient/i.test(p)));
gate('G423-RMC — no fetch/XHR/WebSocket/storage-API', !/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(code) && !/localStorage\.|sessionStorage\.|indexedDB\./.test(code));
gate('G423-RMC — no window/document access', !/\bdocument\.|\bwindow\.[a-z]/i.test(code));
gate('G423-RMC — no DATABASE_URL / production API_URL / Railway', !/DATABASE_URL|VITE_API_URL|projetomg-production|railway/i.test(code));
gate('G423-RMC — no real POST/PUT/PATCH/DELETE method', !/method\s*:\s*['"](POST|PUT|PATCH|DELETE)['"]/.test(code));
gate('G423-RMC — no realDataRead/realDataWrite true literal', !/realDataRead\s*:\s*true|realDataWrite\s*:\s*true/.test(code));
gate('G423-RMC — no old Studio prototype import', importsOf(walk(DIR)).every((p) => !/studio\/(components|shell|designers|pages|navigation|dock|panels|editor)/.test(p)));
gate('G423-RMC — no src/components or src/pages import', importsOf(walk(DIR)).every((p) => !/(^|\.\.\/)(components|pages)\//.test(p)));

gate('G423-RMC — docs validate no app/route/menu + prototype relink', /route|rota|menu|App|module|módulo/i.test(readEv('NO-APP-NO-ROUTE-NO-MENU-NO-MODULE.md')) && /prototype|protótipo|relink/i.test(readEv('NO-PROTOTYPE-RELINK.md')));
gate('G423-RMC — next slice spec (route/menu implementation plan) present', /IMPLEMENTATION PLAN|implementation|checkpoint/i.test(readEv('NEXT-SLICE-SPEC.md')));

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
gate('G423-RMC — src/modules / Empresas / backend / Prisma / SSOT untouched', blockedOk, blockedDetail);

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
gate('G423-RMC — authorized scope only (contract subtree + registry + evidence + package)', scopeOk, scopeDetail);

let noJsxTsxCss = false; let noJsxTsxCssDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const bad = files.filter((f) => /\.(jsx|tsx|css)$/.test(f));
  noJsxTsxCss = bad.length === 0;
  noJsxTsxCssDetail = noJsxTsxCss ? 'no .jsx / .tsx / .css added' : `bad: ${bad.join(', ')}`;
} catch (err) { noJsxTsxCss = true; noJsxTsxCssDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-RMC — no .jsx / .tsx / .css added in diff', noJsxTsxCss, noJsxTsxCssDetail);

let noOldEdit = false; let noOldEditDetail = '';
{
  const { gitAvailable, evaluation } = studioScope();
  if (!gitAvailable) { noOldEdit = true; noOldEditDetail = 'git base unavailable — skipped'; }
  else {
    // A prior slice's test or gate may appear ONLY when the ACTIVE slice is explicitly
    // cross-authorized for it, and only when that active slice is this one or later.
    const chronologyOk = evaluation.activeSliceOrdinal !== null && evaluation.activeSliceOrdinal >= evaluation.callerSliceOrdinal;
    noOldEdit = evaluation.safe && chronologyOk;
    noOldEditDetail = noOldEdit
      ? `no unauthorized prior gate/test (active ${evaluation.activeSliceId} #${evaluation.activeSliceOrdinal} >= ${CALLER_SLICE_ID} #${evaluation.callerSliceOrdinal})`
      : `blocked: ${evaluation.blockers.join(',')}`;
  }
}
gate('G423-RMC — productionUiGuard + governance guard + prior gates/tests NOT altered by this slice', noOldEdit, noOldEditDetail);

let regOk = false; let regDetail = '';
try {
  const reg = await import(pathToFileURL(path.join(ROOT, 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs')).href);
  const known = reg.KNOWN_LATER_STUDIO_HEADLESS_ARTIFACTS;
  const hasOwn = known.some((re) => re.test('src/studio/blueprint-engine/dev-preview-route-menu-contract/index.js'));
  const forbiddenProbes = ['src/modules/x/y.js', 'backend/server.js', 'src/App.jsx', 'backend/prisma/schema.prisma', 'src/pages/z.jsx'];
  const leaks = forbiddenProbes.filter((p) => known.some((re) => re.test(p)));
  regOk = hasOwn && leaks.length === 0;
  regDetail = regOk ? 'specific route-menu-contract paths registered; no broad wildcard leaks a forbidden path' : `hasOwn=${hasOwn} leaks=${leaks.join(',')}`;
} catch (err) { regOk = false; regDetail = err instanceof Error ? err.message : String(err); }
gate('G423-RMC — registry: specific slice paths only, no dangerous wildcard', regOk, regDetail);

let noNewDep = false;
try {
  const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
  const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
  const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
  noNewDep = bk === hk;
} catch { noNewDep = true; }
gate('G423-RMC — no new dependency added', noNewDep);

gate('G423-RMC — src/modules/studio does NOT exist', !exists(path.join(ROOT, 'src/modules/studio')));
gate('G423-RMC — App.jsx untouched (not in diff)', (() => { try { const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); return !files.includes('src/App.jsx'); } catch { return true; } })());
gate('G423-RMC — upstream runtime UI present', exists(path.join(UI_DIR, 'index.js')));

let testsOk = false; let testCount = 0;
try {
  const out = execSync('node --test src/runtime/__tests__/studio-dev-preview-route-menu-contract.test.js', { cwd: ROOT, stdio: 'pipe', env: { ...process.env, NODE_ENV: 'test' } }).toString();
  const mt = out.match(/# tests (\d+)/); const mp = out.match(/# pass (\d+)/); const mf = out.match(/# fail (\d+)/);
  testCount = mt ? Number(mt[1]) : 0;
  testsOk = mf ? Number(mf[1]) === 0 && mp && Number(mp[1]) === testCount : false;
} catch (err) { if (err.stderr) console.error(String(err.stderr)); }
gate('G423-RMC — route/menu contract unit tests PASS', testsOk, `${testCount} scenarios`);
gate('G423-RMC — unit test has >= 370 scenarios', testCount >= 370, `${testCount} scenarios (min 370)`);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-STUDIO-DEV-PREVIEW-ROUTE-MENU-CONTRACT summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);
if (failed.length > 0) process.exit(1);
