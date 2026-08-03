#!/usr/bin/env node
/**
 * Gate G423-STUDIO-DEV-PREVIEW-RUNTIME-UI — Post-Foundation C.
 *
 * Proves the DEV-ONLY, ISOLATED UI runtime in `src/studio/blueprint-engine/dev-preview-runtime-ui/`.
 * It consumes the isolated runtime (#469), the runtime UI contract (#470) and the runtime UI
 * implementation plan (#471), and renders synthetic virtual preview frames into a CONFINED
 * React/JSX subtree. Real React/JSX is allowed ONLY inside this subtree; `.tsx` and `.css` are
 * forbidden; no ReactDOM/createRoot/window/document; no App/route/menu/module wiring; no
 * backend/Prisma/migration/production/staging/mutation/real-data; and NO import/relink of the old
 * Studio prototype.
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
const CALLER_SLICE_ID = 'dev-preview-runtime-ui';
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
const DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-runtime-ui');
const UC_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-runtime-ui-contract');
const UIP_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-runtime-ui-implementation-plan');
const IR_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-isolated-runtime');
const PLAN_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-isolated-runtime-implementation-plan');
const SHELL_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-runtime-shell-contract');
const VISUAL_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-visual-contract');
const BRIDGE_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-contract-bridge');
const SANDBOX_DIR = path.join(ROOT, 'src/studio/blueprint-engine/module-preview-sandbox');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-dev-preview-runtime-ui');
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
const jsxCode = () => stripComments(jsxFiles().map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
const allCode = () => stripComments([...jsFiles(), ...jsxFiles()].map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
const importsIn = (files) => files.flatMap((f) => [...stripComments(fs.readFileSync(f, 'utf8')).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((mm) => mm[1]));
const readEv = (f) => (exists(path.join(EV, f)) ? fs.readFileSync(path.join(EV, f), 'utf8') : '');

const AUTHORIZED = [
  /^src\/studio\/blueprint-engine\/dev-preview-runtime-ui\//,
  /^src\/runtime\/__tests__\/studio-dev-preview-runtime-ui\.test\.js$/,
  /^scripts\/gates\/g423-studio-dev-preview-runtime-ui\.mjs$/,
  /^scripts\/gates\/lib\/studioScopeGovernanceRegistry\.mjs$/,
  /^package\.json$/,
  /^package-lock\.json$/,
  /^docs\/evidence\/post-foundation-c-studio-dev-preview-runtime-ui\//,
];
const authorized = (f) => AUTHORIZED.some((re) => re.test(f)) || isKnownLaterStudioHeadlessArtifact(f);

const FILES = [
  'runtimeUiConfig.js', 'errors.js', 'createStudioDevPreviewRuntimeUi.js', 'createRuntimeUiSession.js',
  'createRuntimeUiPreflight.js', 'createRuntimeUiContractLoader.js', 'createRuntimeUiVirtualFrameInput.js',
  'createRuntimeUiDevFlagGate.js', 'createRuntimeUiIsolationBoundary.js', 'createRuntimeUiComponentRegistry.js',
  'createRuntimeUiInteractionRegistry.js', 'createRuntimeUiStateProjection.js',
  'createRuntimeUiAccessibilityProjection.js', 'createRuntimeUiThemeProjection.js',
  'createRuntimeUiBlockedActionModel.js', 'createRuntimeUiReactTree.js', 'createRuntimeUiManifest.js',
  'verifyRuntimeUi.js', 'checkRuntimeUiCompatibility.js', 'createRuntimeUiDiagnostics.js',
  'createRuntimeUiFallback.js', 'index.js',
];
const JSX_FILES = [
  'RuntimeUiRoot.jsx', 'RuntimeUiScreen.jsx', 'RuntimeUiSection.jsx', 'RuntimeUiSlot.jsx',
  'RuntimeUiPlaceholder.jsx', 'RuntimeUiBlockedActionBanner.jsx', 'RuntimeUiFallback.jsx',
];
const DOCS = [
  'CERTIFICATION-REPORT.md', 'STUDIO-DEV-PREVIEW-RUNTIME-UI-REPORT.md', 'RUNTIME-UI-SESSION.md',
  'PREFLIGHT.md', 'CONTRACT-LOADER.md', 'VIRTUAL-FRAME-INPUT.md', 'REACT-UI-TREE.md',
  'COMPONENT-REGISTRY.md', 'INTERACTION-REGISTRY.md', 'STATE-PROJECTION.md',
  'ACCESSIBILITY-PROJECTION.md', 'THEME-PROJECTION.md', 'BLOCKED-ACTIONS.md', 'DEV-FLAG-GATE.md',
  'ISOLATION-BOUNDARY.md', 'MANIFEST-VERIFIER-COMPATIBILITY.md',
  'NO-APP-NO-ROUTE-NO-MODULE-NO-PROTOTYPE-RELINK.md', 'QUALITY-SCALABILITY-NOTES.md', 'NEXT-SLICE-SPEC.md',
];

for (const f of FILES) gate(`G423-RUI — ${f} exists`, exists(path.join(DIR, f)));
for (const f of JSX_FILES) gate(`G423-RUI — ${f} exists`, exists(path.join(DIR, f)));
for (const d of DOCS) gate(`G423-RUI — ${d} exists`, exists(path.join(EV, d)));
gate('G423-RUI — tests exist', exists(path.join(ROOT, 'src/runtime/__tests__/studio-dev-preview-runtime-ui.test.js')));
gate('G423-RUI — exactly 7 .jsx in subtree', jsxFiles().length === 7);
gate('G423-RUI — no .tsx in subtree', walkExt(DIR, /\.tsx$/).length === 0);
gate('G423-RUI — no .css in subtree', !fs.readdirSync(DIR).some((f) => /\.css$/.test(f)));

let m = null; let ucMod = null; let uipMod = null; let irMod = null; let planMod = null; let shellMod = null; let visualMod = null; let bridgeMod = null; let sandboxMod = null;
try { m = await import(pathToFileURL(path.join(DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { ucMod = await import(pathToFileURL(path.join(UC_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { uipMod = await import(pathToFileURL(path.join(UIP_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { irMod = await import(pathToFileURL(path.join(IR_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { planMod = await import(pathToFileURL(path.join(PLAN_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { shellMod = await import(pathToFileURL(path.join(SHELL_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { visualMod = await import(pathToFileURL(path.join(VISUAL_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { bridgeMod = await import(pathToFileURL(path.join(BRIDGE_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { sandboxMod = await import(pathToFileURL(path.join(SANDBOX_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }

let SB = null; let BRIDGE = null; let VC = null; let RS = null; let IPLAN = null; let IR = null; let UC = null; let UIP = null; let U = null;
try { SB = sandboxMod.createStudioModulePreviewSandboxContract({ blueprint: { moduleId: 'clientes', moduleName: 'Clientes', modelType: 'cadastro', modelFamily: 'ModeloBase1', fields: [{ name: 'nome', type: 'text' }], permissions: [{ action: 'read', level: 'module' }] } }); } catch (err) { console.error(String(err)); }
try { BRIDGE = bridgeMod.createStudioDevPreviewContractBridge({ sandbox: SB }); } catch (err) { console.error(String(err)); }
try { VC = visualMod.createStudioDevPreviewVisualContract({ bridge: BRIDGE }); } catch (err) { console.error(String(err)); }
try { RS = shellMod.createStudioDevPreviewRuntimeShellContract({ visualContract: VC }); } catch (err) { console.error(String(err)); }
try { IPLAN = planMod.createStudioDevPreviewIsolatedRuntimeImplementationPlan({ runtimeShellContract: RS }); } catch (err) { console.error(String(err)); }
try { IR = irMod.createStudioDevPreviewIsolatedRuntime({ implementationPlan: IPLAN }); } catch (err) { console.error(String(err)); }
try { UC = ucMod.createStudioDevPreviewRuntimeUiContract({ isolatedRuntime: IR }); } catch (err) { console.error(String(err)); }
try { UIP = uipMod.createStudioDevPreviewRuntimeUiImplementationPlan({ runtimeUiContract: UC }); } catch (err) { console.error(String(err)); }
try { U = m.createStudioDevPreviewRuntimeUi({ runtimeUiContract: UC, implementationPlan: UIP, env: { DEV: 'true' } }); } catch (err) { console.error(String(err)); }

let baseOk = false; let baseDetail = '';
try {
  baseOk = U.kind === 'studio-dev-preview-runtime-ui'
    && U.runtimeUiName === 'studio-dev-preview-runtime-ui'
    && U.runtimeUiVersion === 'studio-dev-preview-runtime-ui@1.0.0'
    && U.runtimeUiContractVersion === 'studio-dev-preview-runtime-ui-contract@1.0.0'
    && U.isolatedRuntimeVersion === 'studio-dev-preview-isolated-runtime@1.0.0'
    && U.implementationPlanVersion === 'studio-dev-preview-runtime-ui-implementation-plan@1.0.0'
    && U.mode === 'dev_only_isolated_runtime_ui'
    && U.fallback === false
    && U.readiness === 'studio_dev_preview_runtime_ui_ready'
    && U.readyForRuntimeUi === true
    && U.readyForRouteMenuIntegration === false
    && U.readyForRealModuleGeneration === false
    && U.readyForProduction === false
    && U.blockerCount === 0 && U.warningCount === 0 && U.blockedActionsOnly === true;
  baseDetail = baseOk ? `readiness=${U.readiness}` : 'contract invariants wrong';
} catch (err) { baseDetail = err instanceof Error ? err.message : String(err); }
gate('G423-RUI — contract dev-only/isolated invariants + readiness ready', baseOk, baseDetail);

let capOk = false;
try {
  const c = m.RUNTIME_UI_CAPABILITIES;
  const trues = ['devOnly', 'isolated', 'contractDriven', 'syntheticDataOnly', 'virtualFrameDriven', 'blockedActionsOnly', 'reactComponentCreated', 'jsxCreated', 'uiCreated', 'runtimeUiImplemented', 'visualRuntimeImplemented', 'reactRuntimeCreated'];
  const noes = ['headless', 'tsxCreated', 'domCreated', 'cssCreated', 'routeCreated', 'menuCreated', 'moduleGenerated', 'filesWrittenToModule', 'moduleRegistered', 'domRuntimeCreated', 'cssRuntimeCreated', 'routeRuntimeCreated', 'menuRuntimeCreated', 'moduleRuntimeCreated', 'backendAccessed', 'prismaAccessed', 'productionAccessed', 'stagingAccessed', 'fetchUsed', 'mutationAllowed', 'persistenceCreated', 'realDataRead', 'realDataWrite', 'rewriteEmpresas', 'oldPrototypeImported', 'appWired'];
  capOk = Object.isFrozen(c) && trues.every((k) => c[k] === true) && noes.every((k) => c[k] === false) && noes.every((k) => U.capabilities[k] === false);
} catch { capOk = false; }
gate('G423-RUI — capabilities frozen; ui/react/jsx/runtimeUi/visualRuntime true; domRuntime + all forbidden flags false', capOk);

const part = (fn, argObj, pred) => { try { return pred(argObj === undefined ? m[fn]() : m[fn](argObj)); } catch (err) { console.error(`${fn}: ${err}`); return false; } };
gate('G423-RUI — session (stable seed, dev-only, no storage/fetch/persistence)', part('createRuntimeUiSession', { runtimeUiContract: UC }, (x) => x.kind === 'runtime-ui-session' && x.devOnly === true && x.isolated === true && x.usesStorage === false && x.usesFetch === false && x.usesPersistence === false));
gate('G423-RUI — preflight ok + fails closed in production', (() => { try { const okp = m.createRuntimeUiPreflight({ runtimeUiContract: UC, implementationPlan: UIP, env: { DEV: 'true' } }); const badp = m.createRuntimeUiPreflight({ runtimeUiContract: UC, implementationPlan: UIP, env: { MAK_ENV_LABEL: 'production' } }); return okp.ok === true && okp.manualGateSatisfied === true && badp.ok === false && badp.blockers.includes('production_forbidden'); } catch { return false; } })());
gate('G423-RUI — contract loader (relative import only; no fetch/network/dynamic)', part('createRuntimeUiContractLoader', { runtimeUiContract: UC }, (x) => x.loadedByRelativeImportOnly === true && x.usesFetch === false && x.usesNetwork === false && x.usesDynamicPath === false));
gate('G423-RUI — virtual frame input (synthetic only; no real read/write/storage/network)', part('createRuntimeUiVirtualFrameInput', { runtimeUiContract: UC }, (x) => x.syntheticDataOnly === true && x.realDataRead === false && x.realDataWrite === false && x.usesStorage === false && x.usesNetwork === false));
gate('G423-RUI — dev flag gate (dev-only; production/staging not allowed; open in dev)', part('createRuntimeUiDevFlagGate', { env: { DEV: 'true' } }, (x) => x.devOnly === true && x.productionAllowed === false && x.stagingAllowed === false && x.open === true));
gate('G423-RUI — isolation boundary (no app/route/menu/module/backend/prisma/prototype/reactDom/createRoot/domGlobals)', part('createRuntimeUiIsolationBoundary', undefined, (x) => x.appWired === false && x.routeWired === false && x.menuWired === false && x.moduleWired === false && x.backendAccessed === false && x.prismaAccessed === false && x.oldPrototypeImported === false && x.reactDomUsed === false && x.createRootUsed === false && x.domGlobalsUsed === false && x.componentsImported === false && x.pagesImported === false));
gate('G423-RUI — component registry (7 local; none from prototype; no forbidden import)', part('createRuntimeUiComponentRegistry', undefined, (x) => x.componentCount === 7 && x.allLocalToSubtree === true && x.anyFromOldPrototype === false && x.importsOldPrototype === false && x.importsPages === false && x.importsComponents === false));
gate('G423-RUI — interaction registry (all blocked; no real handler/mutation/navigation/submit/save)', part('createRuntimeUiInteractionRegistry', undefined, (x) => x.allBlocked === true && x.anyRealHandler === false && x.realMutation === false && x.realNavigation === false && x.realSubmit === false && x.realSave === false));
gate('G423-RUI — state projection (pure; no global hooks/window/document/storage/persistence/real-data)', part('createRuntimeUiStateProjection', undefined, (x) => x.pure === true && x.globalHooksState === false && x.usesWindow === false && x.usesDocument === false && x.usesStorage === false && x.persistence === false && x.realDataRead === false && x.realDataWrite === false));
gate('G423-RUI — accessibility projection (labels/roles/keyboard; no real aria/window/document/css)', part('createRuntimeUiAccessibilityProjection', undefined, (x) => x.labelsProvided === true && x.realAriaMutationInDom === false && x.usesWindow === false && x.usesDocument === false && x.cssRuntime === false));
gate('G423-RUI — theme projection (inline tokens; no css runtime/stylesheet/realCss/window/document)', part('createRuntimeUiThemeProjection', undefined, (x) => x.inlineStyleTokensOnly === true && x.cssRuntime === false && x.stylesheetCreated === false && x.realCss === false && x.usesWindow === false && x.usesDocument === false && x.groupCount >= 7));
gate('G423-RUI — blocked action model (11 blocked incl readRealData/writeRealData; none allowed)', part('createRuntimeUiBlockedActionModel', undefined, (x) => x.allBlocked === true && x.anyAllowed === false && x.actionCount === 11 && ['create', 'update', 'delete', 'submit', 'save', 'export', 'navigate', 'openRoute', 'registerModule', 'readRealData', 'writeRealData'].every((a) => x.actions.some((y) => y.action === a && y.blocked === true))));
gate('G423-RUI — react tree (root RuntimeUiRoot; react/jsx true; no dom node/reactDom/createRoot/mount/tsx)', part('createRuntimeUiReactTree', { runtimeUiContract: UC }, (x) => x.rootComponent === 'RuntimeUiRoot' && x.reactComponentCreated === true && x.jsxCreated === true && x.tsxCreated === false && x.domNodeCreated === false && x.reactDomUsed === false && x.createRootUsed === false && x.mountedToRealDom === false));

let manOk = false;
try { manOk = U.manifest.kind === 'runtime-ui-manifest' && U.manifest.runtimeUiVersion === 'studio-dev-preview-runtime-ui@1.0.0' && U.manifest.capabilities.uiCreated === true && U.manifest.capabilities.domRuntimeCreated === false; } catch { manOk = false; }
gate('G423-RUI — manifest present + capability flags mirrored', manOk);

let verOk = false;
try { verOk = U.verification.ok === true && U.verification.valid === true && U.verification.devOnly === true && U.verification.isolated === true && U.verification.runtimeUiImplemented === true && U.verification.domRuntimeCreated === false && U.verification.blockerCount === 0; } catch { verOk = false; }
gate('G423-RUI — verifier passes dev-only/isolated invariants', verOk);

let verTamper = false;
try {
  const c = m.RUNTIME_UI_CAPABILITIES;
  const ok = (o) => m.verifyRuntimeUi(o).blockers;
  verTamper = ok({ contract: { capabilities: { ...c, domRuntimeCreated: true } } }).includes('capability_domRuntimeCreated_must_be_false')
    && ok({ contract: { capabilities: { ...c, oldPrototypeImported: true } } }).includes('capability_oldPrototypeImported_must_be_false')
    && ok({ contract: { capabilities: { ...c, appWired: true } } }).includes('capability_appWired_must_be_false')
    && ok({ contract: { capabilities: { ...c, tsxCreated: true, cssCreated: true } } }).includes('capability_tsxCreated_must_be_false')
    && ok({ contract: { capabilities: { ...c, routeCreated: true, menuCreated: true } } }).includes('capability_routeCreated_must_be_false')
    && ok({ contract: { capabilities: { ...c, backendAccessed: true, prismaAccessed: true } } }).includes('capability_backendAccessed_must_be_false')
    && ok({ contract: { capabilities: { ...c, mutationAllowed: true, persistenceCreated: true } } }).includes('capability_mutationAllowed_must_be_false')
    && ok({ contract: { capabilities: { ...c, realDataRead: true, realDataWrite: true } } }).includes('capability_realDataRead_must_be_false')
    && ok({ contract: { capabilities: { ...c, productionAccessed: true, stagingAccessed: true } } }).includes('capability_productionAccessed_must_be_false')
    && ok({ contract: { capabilities: c, isolationBoundary: { oldPrototypeImported: true } } }).includes('unsafe_old_prototype_import')
    && ok({ contract: { capabilities: c, isolationBoundary: { componentsImported: true, pagesImported: true } } }).includes('unsafe_components_import')
    && ok({ contract: { capabilities: c, isolationBoundary: { appWired: true } } }).includes('unsafe_app_wired')
    && ok({ contract: { capabilities: c, isolationBoundary: { reactDomUsed: true, createRootUsed: true } } }).includes('unsafe_react_dom')
    && ok({ contract: { capabilities: c, isolationBoundary: { domGlobalsUsed: true } } }).includes('unsafe_dom_globals')
    && ok({ contract: { capabilities: c, interactionRegistry: { realMutation: true } } }).includes('unsafe_real_mutation')
    && ok({ contract: { capabilities: c, reactTree: { mountedToRealDom: true } } }).includes('unsafe_mounted_to_real_dom');
} catch { verTamper = false; }
gate('G423-RUI — verifier detects prototype/App/pages/components/ReactDOM/createRoot/window/document/tsx/route/menu/backend/prisma/mutation/data/production attempts', verTamper);

let cmpOk = false;
try {
  const okc = m.checkRuntimeUiCompatibility({ runtimeUiContract: UC });
  const bad = m.checkRuntimeUiCompatibility({ runtimeUiContract: { runtimeUiContractVersion: 'x@9.9.9' } });
  cmpOk = okc.compatibleWithRuntimeUiContract === true && okc.compatibleWithIsolatedRuntime === true && okc.readyForRuntimeUi === true && okc.readyForRouteMenuIntegration === false && okc.readyForProduction === false && okc.status === 'ready_for_future_dev_preview_route_menu_contract_when_explicitly_authorized' && bad.compatibleWithRuntimeUiContract === false && bad.warnings.includes('incompatible_runtimeUiContract');
} catch { cmpOk = false; }
gate('G423-RUI — compatibility aligned; never authorizes route-menu/generation/production; mismatch → warning', cmpOk);

let diagOk = false;
try { diagOk = U.diagnostics.passive === true && U.diagnostics.ok === true && U.diagnostics.devOnlyConfirmed === true && U.diagnostics.isolatedConfirmed === true && U.diagnostics.oldPrototypeImported === false && U.diagnostics.appWired === false && !/jwt|token|secret|DATABASE_URL/i.test(JSON.stringify(U.diagnostics)); } catch { diagOk = false; }
gate('G423-RUI — diagnostics passive, dev-only/isolated confirmed, no secrets', diagOk);

let fbOk = false;
try {
  const fb = m.createStudioDevPreviewRuntimeUi({});
  const fb2 = m.createStudioDevPreviewRuntimeUi({ runtimeUiContract: { kind: 'other' } });
  const fb3 = m.createStudioDevPreviewRuntimeUi({ runtimeUiContract: { kind: 'studio-dev-preview-runtime-ui-contract', fallback: true } });
  const fbProd = m.createStudioDevPreviewRuntimeUi({ runtimeUiContract: UC, env: { MAK_ENV_LABEL: 'production' } });
  fbOk = fb.fallback === true && fb.readiness === 'blocked' && fb.readyForRuntimeUi === false && fb.capabilities.uiCreated === false && fb2.fallback === true && fb3.fallback === true && fbProd.fallback === true;
} catch { fbOk = false; }
gate('G423-RUI — fallback fail-closed on invalid/missing/fallback contract + production', fbOk);

let detOk = false;
try {
  const a = m.createStudioDevPreviewRuntimeUi({ runtimeUiContract: UC, env: { DEV: 'true' } });
  const b = m.createStudioDevPreviewRuntimeUi({ runtimeUiContract: UC, env: { DEV: 'true' } });
  detOk = a.overallDigest === b.overallDigest && a.runtimeUiDigest === b.runtimeUiDigest && a.overallDigest.startsWith('fnv1a-');
} catch { detOk = false; }
gate('G423-RUI — deterministic overall + runtime UI digests', detOk);

let flagOk = false;
try {
  const off = m.isStudioDevPreviewRuntimeUiEnabled({ [m.MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_FLAG]: 'true', MAK_ENV_LABEL: 'production' });
  const onDev = m.isStudioDevPreviewRuntimeUiEnabled({ [m.MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_FLAG]: 'true', DEV: 'true' });
  const vOff = m.isStudioDevPreviewRuntimeUiVerifyEnabled({ [m.MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_VERIFY_FLAG]: 'true', NODE_ENV: 'production' });
  flagOk = off === false && onDev === true && vOff === false;
} catch { flagOk = false; }
gate('G423-RUI — feature flags fail closed in production', flagOk);

gate('G423-RUI — error catalog >= 30 codes', Array.isArray(m?.RUNTIME_UI_ERROR_CODES) && m.RUNTIME_UI_ERROR_CODES.length >= 30);
gate('G423-RUI — error descriptor sanitized + side-effect free', (() => { try { const e = m.createRuntimeUiError('RUNTIME_UI_PRISMA_BLOCKED'); return e.safe === true && e.sideEffects === false && e.oldPrototypeImported === false && e.appWired === false && e.tsxCreated === false && e.realDataRead === false; } catch { return false; } })());

// Explicit contract invariants.
gate('G423-RUI — runtimeUiImplemented true', U ? U.capabilities.runtimeUiImplemented === true : false);
gate('G423-RUI — visualRuntimeImplemented true', U ? U.capabilities.visualRuntimeImplemented === true : false);
gate('G423-RUI — reactComponentCreated true', U ? U.capabilities.reactComponentCreated === true : false);
gate('G423-RUI — jsxCreated true', U ? U.capabilities.jsxCreated === true : false);
gate('G423-RUI — uiCreated true', U ? U.capabilities.uiCreated === true : false);
gate('G423-RUI — tsxCreated false', U ? U.capabilities.tsxCreated === false : false);
gate('G423-RUI — domCreated false', U ? U.capabilities.domCreated === false : false);
gate('G423-RUI — cssCreated false', U ? U.capabilities.cssCreated === false : false);
gate('G423-RUI — domRuntimeCreated false', U ? U.capabilities.domRuntimeCreated === false : false);
gate('G423-RUI — routeCreated false', U ? U.capabilities.routeCreated === false : false);
gate('G423-RUI — menuCreated false', U ? U.capabilities.menuCreated === false : false);
gate('G423-RUI — moduleGenerated false', U ? U.capabilities.moduleGenerated === false : false);
gate('G423-RUI — moduleRegistered false', U ? U.capabilities.moduleRegistered === false : false);
gate('G423-RUI — oldPrototypeImported false', U ? U.capabilities.oldPrototypeImported === false : false);
gate('G423-RUI — appWired false', U ? U.capabilities.appWired === false : false);
gate('G423-RUI — top-level realDataRead/realDataWrite false', U ? (U.capabilities.realDataRead === false && U.capabilities.realDataWrite === false) : false);
gate('G423-RUI — readyForRouteMenuIntegration false', U ? U.readyForRouteMenuIntegration === false : false);
gate('G423-RUI — readyForRealModuleGeneration false', U ? U.readyForRealModuleGeneration === false : false);
gate('G423-RUI — readyForProduction false', U ? U.readyForProduction === false : false);
gate('G423-RUI — interaction registry allBlocked in contract', (() => { try { return U.interactionRegistry.allBlocked === true && U.interactionRegistry.anyRealHandler === false; } catch { return false; } })());
gate('G423-RUI — isolation boundary intact in contract', (() => { try { return U.isolationBoundary.appWired === false && U.isolationBoundary.oldPrototypeImported === false && U.isolationBoundary.reactDomUsed === false; } catch { return false; } })());
gate('G423-RUI — react tree not mounted to real dom in contract', (() => { try { return U.reactTree.mountedToRealDom === false && U.reactTree.tsxCreated === false; } catch { return false; } })());

// Static safety scans — .js graph is React-free; .jsx confined.
gate('G423-RUI — .js graph is React-free', importsIn(jsFiles()).every((p) => p !== 'react' && !/^react(\/|$)/.test(p)));
gate('G423-RUI — .js graph has no JSX/createElement', !/createElement|_jsx\b|jsxs?\(/.test(jsCode()));
gate('G423-RUI — .jsx contain real JSX via automatic runtime (no explicit react import)', jsxFiles().length === 7 && jsxFiles().every((f) => /<[A-Za-z]/.test(fs.readFileSync(f, 'utf8'))) && importsIn(jsxFiles()).every((p) => p !== 'react' && !/^react(\/|$)/.test(p)));
gate('G423-RUI — no react-dom import anywhere', importsIn([...jsFiles(), ...jsxFiles()]).every((p) => !/react-dom/i.test(p)));
gate('G423-RUI — no createRoot/hydrateRoot call anywhere', !/createRoot\s*\(|hydrateRoot\s*\(/.test(allCode()));
gate('G423-RUI — no window/document access anywhere', !/\bdocument\.|\bwindow\.[a-z]/i.test(allCode()));
gate('G423-RUI — no old Studio prototype import', importsIn([...jsFiles(), ...jsxFiles()]).every((p) => !/studio\/(components|shell|designers|pages|navigation|dock|panels|editor)/.test(p)));
gate('G423-RUI — no src/components or src/pages import', importsIn([...jsFiles(), ...jsxFiles()]).every((p) => !/(^|\.\.\/)(components|pages)\//.test(p) || /RuntimeUi/.test(p)));
gate('G423-RUI — no App import', importsIn([...jsFiles(), ...jsxFiles()]).every((p) => !/(^|\/)App(\.jsx)?$/.test(p)));
gate('G423-RUI — no import of EmpresaApi/apiClient/apis/backend/prisma', importsIn([...jsFiles(), ...jsxFiles()]).every((p) => !/EmpresaApi|apiClient|\/apis\/|\/backend\/|@prisma|PrismaClient/i.test(p)));
gate('G423-RUI — no fetch/XHR/WebSocket/storage-API', !/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(allCode()) && !/localStorage\.|sessionStorage\.|indexedDB\./.test(allCode()));
gate('G423-RUI — no DATABASE_URL / production API_URL / Railway', !/DATABASE_URL|VITE_API_URL|projetomg-production|railway/i.test(allCode()));
gate('G423-RUI — no real POST/PUT/PATCH/DELETE method', !/method\s*:\s*['"](POST|PUT|PATCH|DELETE)['"]/.test(allCode()));
gate('G423-RUI — no realDataRead/realDataWrite true literal', !/realDataRead\s*:\s*true|realDataWrite\s*:\s*true/.test(allCode()));

gate('G423-RUI — docs validate isolated/no-prototype-relink', /prototype|protótipo|isolated|isolad|App|route|rota/i.test(readEv('NO-APP-NO-ROUTE-NO-MODULE-NO-PROTOTYPE-RELINK.md')) && /dev-only|isolated|isolad/i.test(readEv('CERTIFICATION-REPORT.md')));
gate('G423-RUI — next slice spec (route/menu contract) present', /ROUTE\/MENU CONTRACT|route|menu/i.test(readEv('NEXT-SLICE-SPEC.md')));

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
gate('G423-RUI — src/modules / Empresas / backend / Prisma / SSOT untouched', blockedOk, blockedDetail);

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
gate('G423-RUI — authorized scope only (runtime-ui subtree + registry + evidence + package)', scopeOk, scopeDetail);

let noTsxCss = false; let noTsxCssDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const badTsxCss = files.filter((f) => /\.tsx$/.test(f) || /\.css$/.test(f));
  const jsxOutside = files.filter((f) => /\.jsx$/.test(f) && !/^src\/studio\/blueprint-engine\/dev-preview-runtime-ui\//.test(f));
  noTsxCss = badTsxCss.length === 0 && jsxOutside.length === 0;
  noTsxCssDetail = noTsxCss ? '.jsx only inside authorized subtree; no .tsx / .css added' : `bad: ${[...badTsxCss, ...jsxOutside].join(', ')}`;
} catch (err) { noTsxCss = true; noTsxCssDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-RUI — .jsx only inside authorized subtree; no .tsx / .css added', noTsxCss, noTsxCssDetail);

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
gate('G423-RUI — productionUiGuard + governance guard + prior gates/tests NOT altered by this slice', noOldEdit, noOldEditDetail);

let regOk = false; let regDetail = '';
try {
  const reg = await import(pathToFileURL(path.join(ROOT, 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs')).href);
  const known = reg.KNOWN_LATER_STUDIO_HEADLESS_ARTIFACTS;
  const hasOwn = known.some((re) => re.test('src/studio/blueprint-engine/dev-preview-runtime-ui/index.js'));
  const forbiddenProbes = ['src/modules/x/y.js', 'backend/server.js', 'src/App.jsx', 'backend/prisma/schema.prisma', 'src/pages/z.jsx'];
  const leaks = forbiddenProbes.filter((p) => known.some((re) => re.test(p)));
  regOk = hasOwn && leaks.length === 0;
  regDetail = regOk ? 'specific runtime-ui paths registered; no broad wildcard leaks a forbidden path' : `hasOwn=${hasOwn} leaks=${leaks.join(',')}`;
} catch (err) { regOk = false; regDetail = err instanceof Error ? err.message : String(err); }
gate('G423-RUI — registry: specific slice paths only, no dangerous wildcard', regOk, regDetail);

let noNewDep = false;
try {
  const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
  const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
  const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
  noNewDep = bk === hk;
} catch { noNewDep = true; }
gate('G423-RUI — no new dependency added', noNewDep);

gate('G423-RUI — src/modules/studio does NOT exist', !exists(path.join(ROOT, 'src/modules/studio')));
gate('G423-RUI — src/modules/clientes does NOT exist', !exists(path.join(ROOT, 'src/modules/clientes')));
gate('G423-RUI — upstream runtime UI contract present', exists(path.join(UC_DIR, 'index.js')));
gate('G423-RUI — upstream runtime UI implementation plan present', exists(path.join(UIP_DIR, 'index.js')));

let testsOk = false; let testCount = 0;
try {
  const out = execSync('node --test src/runtime/__tests__/studio-dev-preview-runtime-ui.test.js', { cwd: ROOT, stdio: 'pipe', env: { ...process.env, NODE_ENV: 'test' } }).toString();
  const mt = out.match(/# tests (\d+)/); const mp = out.match(/# pass (\d+)/); const mf = out.match(/# fail (\d+)/);
  testCount = mt ? Number(mt[1]) : 0;
  testsOk = mf ? Number(mf[1]) === 0 && mp && Number(mp[1]) === testCount : false;
} catch (err) { if (err.stderr) console.error(String(err.stderr)); }
gate('G423-RUI — runtime UI unit tests PASS', testsOk, `${testCount} scenarios`);
gate('G423-RUI — unit test has >= 380 scenarios', testCount >= 380, `${testCount} scenarios (min 380)`);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-STUDIO-DEV-PREVIEW-RUNTIME-UI summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);
if (failed.length > 0) process.exit(1);
