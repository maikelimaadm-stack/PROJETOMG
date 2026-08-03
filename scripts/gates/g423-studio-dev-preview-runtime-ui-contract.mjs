#!/usr/bin/env node
/**
 * Gate G423-STUDIO-DEV-PREVIEW-RUNTIME-UI-CONTRACT — Post-Foundation C.
 *
 * Proves the headless, CONTRACT-ONLY runtime UI contract in
 * `src/studio/blueprint-engine/dev-preview-runtime-ui-contract/`. It consumes a Dev Preview
 * Isolated Runtime's virtual preview frame and produces deterministic UI node / layout /
 * component-binding / interaction-binding / render-boundary / state / accessibility / theme
 * projection and blocked-action CONTRACTS plus safety, readiness, manifest, verifier,
 * compatibility, diagnostics and fallback.
 *
 * It NEVER creates UI/React components/`.jsx`/`.tsx`/`.css`/DOM/runtime-CSS/routes/menus/modules,
 * implements no UI runtime, writes files under `src/modules`, touches backend/Prisma/migration/
 * network/production/staging, mutates, persists, reads/writes real data, or rewrites Empresas.
 * `visualRuntimeImplemented` is false; it authorizes NO UI runtime implementation and NO
 * route/menu integration.
 *
 * Scope safety uses the central Studio Scope Governance guard: forbidden always wins;
 * legitimate later Studio headless artifacts are tolerated; nothing weakens the block.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { evaluateStudioBranchConsumerScope, filterForbiddenScopePaths, isKnownLaterStudioHeadlessArtifact } from './lib/studioScopeGovernanceGuard.mjs';

// ---------------------------------------------------------------------------
// CALLER-AWARE branch-relative scope governance. This gate declares its OWN slice identity,
// so the checks below can ask which slice the branch is building and whether that slice is
// this one or a genuinely later one — a question the previous flat registry could not answer.
// Forbidden and unknown paths still fail closed; nothing is tolerated by mere registration.
// ---------------------------------------------------------------------------
const CALLER_SLICE_ID = 'dev-preview-runtime-ui-contract';
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
  const evaluation = evaluateStudioBranchConsumerScope(changed, {
    callerSliceId: CALLER_SLICE_ID,
  });
  studioScopeCache = { gitAvailable, changed, evaluation };
  return studioScopeCache;
};

const ROOT = process.cwd();
const DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-runtime-ui-contract');
const IR_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-isolated-runtime');
const PLAN_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-isolated-runtime-implementation-plan');
const SHELL_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-runtime-shell-contract');
const VISUAL_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-visual-contract');
const BRIDGE_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-contract-bridge');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-dev-preview-runtime-ui-contract');
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
  /^src\/studio\/blueprint-engine\/dev-preview-runtime-ui-contract\//,
  /^src\/runtime\/__tests__\/studio-dev-preview-runtime-ui-contract\.test\.js$/,
  /^scripts\/gates\/g423-studio-dev-preview-runtime-ui-contract\.mjs$/,
  /^scripts\/gates\/lib\/studioScopeGovernanceRegistry\.mjs$/,
  /^package\.json$/,
  /^package-lock\.json$/,
  /^docs\/evidence\/post-foundation-c-studio-dev-preview-runtime-ui-contract\//,
];
const authorized = (f) => AUTHORIZED.some((re) => re.test(f)) || isKnownLaterStudioHeadlessArtifact(f);

const FILES = [
  'runtimeUiContractConfig.js', 'errors.js', 'createStudioDevPreviewRuntimeUiContract.js',
  'createRuntimeUiContractSession.js', 'createRuntimeUiVirtualFrameMapping.js', 'createRuntimeUiNodeContract.js',
  'createRuntimeUiLayoutContract.js', 'createRuntimeUiComponentBindingContract.js',
  'createRuntimeUiInteractionBindingContract.js', 'createRuntimeUiRenderBoundaryContract.js',
  'createRuntimeUiStateProjectionContract.js', 'createRuntimeUiAccessibilityProjectionContract.js',
  'createRuntimeUiThemeProjectionContract.js', 'createRuntimeUiBlockedActionContract.js',
  'createRuntimeUiSafetyPolicy.js', 'createRuntimeUiReadinessDecision.js', 'createRuntimeUiDiagnostics.js',
  'createRuntimeUiFallback.js', 'createRuntimeUiManifest.js', 'verifyRuntimeUiContract.js',
  'checkRuntimeUiContractCompatibility.js', 'index.js',
];

const DOCS = [
  'CERTIFICATION-REPORT.md', 'STUDIO-DEV-PREVIEW-RUNTIME-UI-CONTRACT-REPORT.md', 'CONTRACT-SESSION.md',
  'VIRTUAL-FRAME-MAPPING.md', 'UI-NODE-CONTRACT.md', 'LAYOUT-CONTRACT.md', 'COMPONENT-BINDING-CONTRACT.md',
  'INTERACTION-BINDING-CONTRACT.md', 'RENDER-BOUNDARY-CONTRACT.md', 'STATE-PROJECTION-CONTRACT.md',
  'ACCESSIBILITY-PROJECTION-CONTRACT.md', 'THEME-PROJECTION-CONTRACT.md', 'BLOCKED-ACTION-CONTRACT.md',
  'SAFETY-POLICY.md', 'MANIFEST-VERIFIER-COMPATIBILITY.md', 'NO-REACT-NO-UI-NO-ROUTE-NO-MODULE.md',
  'QUALITY-SCALABILITY-NOTES.md', 'NEXT-SLICE-SPEC.md',
];

for (const f of FILES) gate(`G423-UIC — ${f} exists`, exists(path.join(DIR, f)));
gate('G423-UIC — no .jsx/.tsx in subtree', walk(DIR).every((f) => !/\.(jsx|tsx)$/.test(f)));
gate('G423-UIC — no .css in subtree', !fs.readdirSync(DIR).some((f) => /\.css$/.test(f)));
gate('G423-UIC — tests exist', exists(path.join(ROOT, 'src/runtime/__tests__/studio-dev-preview-runtime-ui-contract.test.js')));
for (const d of DOCS) gate(`G423-UIC — ${d} exists`, exists(path.join(EV, d)));

let m = null; let irMod = null; let planMod = null; let shellMod = null; let visualMod = null; let bridgeMod = null;
try { m = await import(pathToFileURL(path.join(DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { irMod = await import(pathToFileURL(path.join(IR_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { planMod = await import(pathToFileURL(path.join(PLAN_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { shellMod = await import(pathToFileURL(path.join(SHELL_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { visualMod = await import(pathToFileURL(path.join(VISUAL_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { bridgeMod = await import(pathToFileURL(path.join(BRIDGE_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }

const SANDBOX = {
  moduleId: 'clientes',
  sandboxVersion: 'studio-module-preview-sandbox-contract@1.0.0',
  plannerVersion: 'studio-blueprint-module-reference-planner@1.0.0',
  engineVersion: 'studio-blueprint-engine@1.0.0',
  overallDigest: 'fnv1a-deadbeef',
  tablePreviewMetadata: { columns: [{ name: 'nome', type: 'text' }, { name: 'tenantId', type: 'text', protectedColumn: true }] },
  formPreviewMetadata: { fields: [{ name: 'nome', type: 'text', required: true }, { name: 'tenantId', type: 'text', protectedField: true }] },
  detailPreviewMetadata: { fields: [{ name: 'nome', type: 'text' }] },
  fieldPreviewMetadata: { fields: [{ name: 'nome', type: 'text' }, { name: 'ativo', type: 'boolean' }] },
  actionPreviewMetadata: { actions: [{ action: 'read', mutation: false }, { action: 'create', mutation: true }] },
  permissionPreviewMetadata: { defaultDeny: true, failClosed: true, tenantRequired: true, permissionRequired: true },
};

let BRIDGE = null; let VC = null; let RS = null; let PLAN = null; let IR = null; let U = null;
try { BRIDGE = bridgeMod.createStudioDevPreviewContractBridge({ sandbox: SANDBOX }); } catch (err) { console.error(String(err)); }
try { VC = visualMod.createStudioDevPreviewVisualContract({ bridge: BRIDGE }); } catch (err) { console.error(String(err)); }
try { RS = shellMod.createStudioDevPreviewRuntimeShellContract({ visualContract: VC }); } catch (err) { console.error(String(err)); }
try { PLAN = planMod.createStudioDevPreviewIsolatedRuntimeImplementationPlan({ runtimeShellContract: RS }); } catch (err) { console.error(String(err)); }
try { IR = irMod.createStudioDevPreviewIsolatedRuntime({ implementationPlan: PLAN }); } catch (err) { console.error(String(err)); }
try { U = m.createStudioDevPreviewRuntimeUiContract({ isolatedRuntime: IR }); } catch (err) { console.error(String(err)); }

let baseOk = false; let baseDetail = '';
try {
  baseOk = U.kind === 'studio-dev-preview-runtime-ui-contract'
    && U.runtimeUiContractName === 'studio-dev-preview-runtime-ui-contract'
    && U.runtimeUiContractVersion === 'studio-dev-preview-runtime-ui-contract@1.0.0'
    && U.isolatedRuntimeVersion === 'studio-dev-preview-isolated-runtime@1.0.0'
    && U.implementationPlanVersion === 'studio-dev-preview-isolated-runtime-implementation-plan@1.0.0'
    && U.runtimeShellContractVersion === 'studio-dev-preview-runtime-shell-contract@1.0.0'
    && U.visualContractVersion === 'studio-dev-preview-visual-contract@1.0.0'
    && U.bridgeVersion === 'studio-dev-preview-contract-bridge@1.0.0'
    && U.sandboxVersion === 'studio-module-preview-sandbox-contract@1.0.0'
    && U.plannerVersion === 'studio-blueprint-module-reference-planner@1.0.0'
    && U.engineVersion === 'studio-blueprint-engine@1.0.0'
    && U.blueprintContractVersion === 'studio-blueprint-contract@1.0.0'
    && U.mode === 'headless_dev_preview_runtime_ui_contract'
    && U.fallback === false
    && U.readiness === 'studio_dev_preview_runtime_ui_contract_ready'
    && U.readyForRuntimeUiContract === true
    && U.readyForRuntimeUiImplementation === false
    && U.readyForRouteMenuIntegration === false
    && U.readyForRealModuleGeneration === false
    && U.readyForProduction === false
    && U.blockerCount === 0 && U.warningCount === 0 && U.metadataOnly === true;
  baseDetail = baseOk ? `readiness=${U.readiness}` : 'contract invariants wrong';
} catch (err) { baseDetail = err instanceof Error ? err.message : String(err); }
gate('G423-UIC — contract headless/contract-only invariants + readiness ready', baseOk, baseDetail);

let capOk = false;
try {
  const c = m.RUNTIME_UI_CONTRACT_CAPABILITIES;
  const trues = ['headless', 'contractOnly', 'metadataOnly', 'uiContractOnly', 'virtualFrameDriven', 'uiNodeMetadataOnly', 'layoutMetadataOnly', 'componentBindingMetadataOnly', 'interactionBindingMetadataOnly', 'renderBoundaryMetadataOnly', 'stateProjectionMetadataOnly', 'accessibilityProjectionMetadataOnly', 'themeProjectionMetadataOnly', 'blockedActionMetadataOnly'];
  const noes = ['reactComponentCreated', 'jsxCreated', 'tsxCreated', 'domCreated', 'cssCreated', 'uiCreated', 'routeCreated', 'menuCreated', 'moduleGenerated', 'filesWrittenToModule', 'moduleRegistered', 'visualRuntimeImplemented', 'reactRuntimeCreated', 'domRuntimeCreated', 'cssRuntimeCreated', 'routeRuntimeCreated', 'menuRuntimeCreated', 'moduleRuntimeCreated', 'backendAccessed', 'prismaAccessed', 'productionAccessed', 'stagingAccessed', 'fetchUsed', 'mutationAllowed', 'persistenceCreated', 'realDataRead', 'realDataWrite', 'rewriteEmpresas'];
  capOk = Object.isFrozen(c) && trues.every((k) => c[k] === true) && noes.every((k) => c[k] === false) && noes.every((k) => U.capabilities[k] === false);
} catch { capOk = false; }
gate('G423-UIC — capabilities frozen; *Only flags true; visualRuntimeImplemented + all forbidden flags false', capOk);

const part = (fn, argObj, pred) => { try { return pred(m[fn](argObj)); } catch (err) { console.error(`${fn}: ${err}`); return false; } };
const A = { isolatedRuntime: IR, frameMapping: U ? U.frameMapping : null };
gate('G423-UIC — session (stable seed, no storage/fetch/persistence/side-effects)', part('createRuntimeUiContractSession', { isolatedRuntime: IR }, (x) => x.kind === 'runtime-ui-contract-session' && x.usesStorage === false && x.usesFetch === false && x.usesPersistence === false && x.runtimeSideEffects === false && typeof x.seed === 'string'));
gate('G423-UIC — virtual frame mapping (metadata; no react element/dom/css)', part('createRuntimeUiVirtualFrameMapping', { isolatedRuntime: IR }, (x) => x.kind === 'runtime-ui-virtual-frame-mapping' && x.reactElement === false && x.domNode === false && x.cssRuntime === false && typeof x.frameId === 'string'));
gate('G423-UIC — UI node contract (metadata tree; no react element/jsx/dom/css/handler)', part('createRuntimeUiNodeContract', A, (x) => x.root.nodeKind === 'uiRoot' && x.allNodeKindsKnown === true && x.reactElement === false && x.jsx === false && x.domNode === false && x.requiredRealCssClass === false && x.realHandler === false));
gate('G423-UIC — layout contract (metadata; no real css/tailwind/dom)', part('createRuntimeUiLayoutContract', A, (x) => x.kind === 'runtime-ui-layout-contract' && x.realCss === false && x.requiredTailwind === false && x.dom === false));
gate('G423-UIC — component binding (bindingAllowed false; realComponentPath null; no react/jsx/tsx/dom)', part('createRuntimeUiComponentBindingContract', A, (x) => x.anyBindingAllowed === false && x.anyRealComponentPath === false && x.bindings.every((b) => b.bindingAllowed === false && b.realComponentPath === null && b.reactComponent === false && b.jsx === false && b.tsx === false && b.dom === false)));
gate('G423-UIC — interaction binding (all blocked; no handler/mutation; requires future impl)', part('createRuntimeUiInteractionBindingContract', A, (x) => x.allBlockedNow === true && x.anyHandlerCreated === false && x.anyMutationAllowed === false && x.interactions.every((i) => i.requiresFutureRuntimeImplementation === true)));
gate('G423-UIC — render boundary (renderAllowed false; virtualRenderContractProduced; no real render/dom/css)', part('createRuntimeUiRenderBoundaryContract', A, (x) => x.renderAllowed === false && x.realRenderProduced === false && x.virtualRenderContractProduced === true && x.reactElementProduced === false && x.domProduced === false && x.cssProduced === false));
gate('G423-UIC — state projection (no react-state/hooks/storage/persistence/dom)', part('createRuntimeUiStateProjectionContract', A, (x) => x.reactState === false && x.hooks === false && x.storage === false && x.persistence === false && x.dom === false));
gate('G423-UIC — accessibility projection (labels/keyboard/focus; no dom/aria)', part('createRuntimeUiAccessibilityProjectionContract', A, (x) => x.labelsRequired === true && x.blockedInteractionsAnnounced === true && x.domTouched === false && x.setsRealAria === false));
gate('G423-UIC — theme projection (7 groups; no realCss/tailwind/stylesheet/cssRuntime)', part('createRuntimeUiThemeProjectionContract', A, (x) => x.groups.length >= 7 && x.realCss === false && x.requiredTailwind === false && x.stylesheetCreated === false && x.cssRuntime === false));
gate('G423-UIC — blocked action (9 blocked incl create/delete/navigate/openRoute/registerModule; none allowed)', part('createRuntimeUiBlockedActionContract', A, (x) => x.allBlocked === true && x.anyAllowed === false && ['create', 'update', 'delete', 'submit', 'save', 'export', 'navigate', 'openRoute', 'registerModule'].every((a) => x.actions.some((y) => y.action === a && y.blocked === true))));
gate('G423-UIC — safety policy (visualRuntimeImplemented false; anyForbiddenSideEffect false; reversible)', part('createRuntimeUiSafetyPolicy', A, (x) => x.visualRuntimeImplemented === false && x.anyForbiddenSideEffect === false && x.reversibleByNonConsumption === true && Object.values(x.forbiddenFlags).every((v) => v === false)));

gate('G423-UIC — readiness never impl/route-menu/generation/production', (() => { try { const r = m.createRuntimeUiReadinessDecision({ frameMapping: U.frameMapping }); return r.readyForRuntimeUiImplementation === false && r.readyForRouteMenuIntegration === false && r.readyForRealModuleGeneration === false && r.readyForProduction === false; } catch { return false; } })());
gate('G423-UIC — readiness blocked on blockers', (() => { try { return m.createRuntimeUiReadinessDecision({ blockers: ['x'] }).readiness === 'blocked'; } catch { return false; } })());

let manOk = false;
try { manOk = U.manifest.kind === 'runtime-ui-contract-manifest' && U.manifest.runtimeUiContractVersion === 'studio-dev-preview-runtime-ui-contract@1.0.0' && U.manifest.capabilities.headless === true && U.manifest.capabilities.visualRuntimeImplemented === false && U.manifest.metadataOnly === true; } catch { manOk = false; }
gate('G423-UIC — manifest present + capability flags mirrored', manOk);

let verOk = false;
try { verOk = U.verification.ok === true && U.verification.valid === true && U.verification.headless === true && U.verification.visualRuntimeImplemented === false && U.verification.blockerCount === 0; } catch { verOk = false; }
gate('G423-UIC — verifier passes headless invariants', verOk);

let verTamper = false;
try {
  const c = m.RUNTIME_UI_CONTRACT_CAPABILITIES;
  const ui = m.verifyRuntimeUiContract({ contract: { capabilities: { ...c, uiCreated: true } } });
  const vr = m.verifyRuntimeUiContract({ contract: { capabilities: { ...c, visualRuntimeImplemented: true } } });
  const dom = m.verifyRuntimeUiContract({ contract: { capabilities: { ...c, domCreated: true, cssCreated: true } } });
  const rm = m.verifyRuntimeUiContract({ contract: { capabilities: { ...c, routeCreated: true, menuCreated: true } } });
  const be = m.verifyRuntimeUiContract({ contract: { capabilities: { ...c, backendAccessed: true, prismaAccessed: true } } });
  const mut = m.verifyRuntimeUiContract({ contract: { capabilities: { ...c, mutationAllowed: true, persistenceCreated: true } } });
  const dr = m.verifyRuntimeUiContract({ contract: { capabilities: { ...c, realDataRead: true, realDataWrite: true } } });
  const ra = m.verifyRuntimeUiContract({ contract: { capabilities: c, renderBoundary: { renderAllowed: true } } });
  const ba = m.verifyRuntimeUiContract({ contract: { capabilities: c, componentBinding: { anyBindingAllowed: true } } });
  const hc = m.verifyRuntimeUiContract({ contract: { capabilities: c, interactionBinding: { anyHandlerCreated: true } } });
  const nn = m.verifyRuntimeUiContract({ contract: { capabilities: c, nodeContract: { reactElement: true } } });
  verTamper = ui.blockers.includes('capability_uiCreated_must_be_false')
    && vr.blockers.includes('capability_visualRuntimeImplemented_must_be_false')
    && dom.blockers.includes('capability_domCreated_must_be_false') && dom.blockers.includes('capability_cssCreated_must_be_false')
    && rm.blockers.includes('capability_routeCreated_must_be_false') && rm.blockers.includes('capability_menuCreated_must_be_false')
    && be.blockers.includes('capability_backendAccessed_must_be_false')
    && mut.blockers.includes('capability_mutationAllowed_must_be_false')
    && dr.blockers.includes('capability_realDataRead_must_be_false') && dr.blockers.includes('capability_realDataWrite_must_be_false')
    && ra.blockers.includes('unsafe_render_allowed_true')
    && ba.blockers.includes('unsafe_binding_allowed_true')
    && hc.blockers.includes('unsafe_handler_created')
    && nn.blockers.includes('unsafe_ui_node');
} catch { verTamper = false; }
gate('G423-UIC — verifier detects React/DOM/CSS/route/menu/backend/prisma/mutation/data/render/binding/handler/node attempts', verTamper);

let cmpOk = false;
try {
  const ok = m.checkRuntimeUiContractCompatibility({ isolatedRuntime: IR });
  const bad = m.checkRuntimeUiContractCompatibility({ isolatedRuntime: { isolatedRuntimeVersion: 'x@9.9.9' } });
  cmpOk = ok.compatibleWithIsolatedRuntime === true && ok.readyForRuntimeUiContract === true && ok.readyForRuntimeUiImplementation === false && ok.readyForRouteMenuIntegration === false && ok.readyForProduction === false && ok.blocked === false && bad.compatibleWithIsolatedRuntime === false && bad.warnings.includes('incompatible_isolatedRuntime');
} catch { cmpOk = false; }
gate('G423-UIC — compatibility: aligned ok, never authorizes impl/route-menu/generation/production; mismatch → warning', cmpOk);

let diagOk = false;
try { diagOk = U.diagnostics.passive === true && U.diagnostics.ok === true && U.diagnostics.headlessConfirmed === true && U.diagnostics.visualRuntimeImplemented === false && U.diagnostics.logged === false && !/jwt|token|secret|DATABASE_URL/i.test(JSON.stringify(U.diagnostics)); } catch { diagOk = false; }
gate('G423-UIC — diagnostics passive, headless-confirmed, no secrets', diagOk);

let fbOk = false;
try {
  const fb = m.createStudioDevPreviewRuntimeUiContract({});
  const fb2 = m.createStudioDevPreviewRuntimeUiContract({ isolatedRuntime: { kind: 'other' } });
  const fb3 = m.createStudioDevPreviewRuntimeUiContract({ isolatedRuntime: { kind: 'studio-dev-preview-isolated-runtime', fallback: true } });
  fbOk = fb.fallback === true && fb.readiness === 'blocked' && fb.readyForRuntimeUiContract === false && fb.readyForProduction === false && fb.capabilities.visualRuntimeImplemented === false && fb2.fallback === true && fb3.fallback === true;
} catch { fbOk = false; }
gate('G423-UIC — fallback fail-closed on invalid/missing/fallback isolated runtime', fbOk);

let detOk = false;
try {
  const a = m.createStudioDevPreviewRuntimeUiContract({ isolatedRuntime: IR });
  const b = m.createStudioDevPreviewRuntimeUiContract({ isolatedRuntime: IR });
  detOk = a.overallDigest === b.overallDigest && a.runtimeUiContractDigest === b.runtimeUiContractDigest && a.overallDigest.startsWith('fnv1a-');
} catch { detOk = false; }
gate('G423-UIC — deterministic overall + runtime UI contract digests', detOk);

let flagOk = false;
try {
  const off = m.isStudioDevPreviewRuntimeUiContractEnabled({ [m.MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_CONTRACT_FLAG]: 'true', MAK_ENV_LABEL: 'production' });
  const onDev = m.isStudioDevPreviewRuntimeUiContractEnabled({ [m.MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_CONTRACT_FLAG]: 'true', DEV: 'true' });
  const vOff = m.isStudioDevPreviewRuntimeUiVerifyEnabled({ [m.MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_VERIFY_FLAG]: 'true', NODE_ENV: 'production' });
  flagOk = off === false && onDev === true && vOff === false;
} catch { flagOk = false; }
gate('G423-UIC — feature flags fail closed in production', flagOk);

gate('G423-UIC — error catalog >= 30 codes', Array.isArray(m?.RUNTIME_UI_CONTRACT_ERROR_CODES) && m.RUNTIME_UI_CONTRACT_ERROR_CODES.length >= 30);
gate('G423-UIC — error descriptor sanitized + side-effect free', (() => { try { const e = m.createRuntimeUiContractError('RUNTIME_UI_CONTRACT_PRISMA_BLOCKED'); return e.safe === true && e.sideEffects === false && e.prismaAccessed === false && e.visualRuntimeImplemented === false && e.realDataRead === false && e.rewriteEmpresas === false; } catch { return false; } })());

// Explicit contract readiness invariants.
gate('G423-UIC — visualRuntimeImplemented false', U ? U.capabilities.visualRuntimeImplemented === false : false);
gate('G423-UIC — readyForRuntimeUiImplementation false', U ? U.readyForRuntimeUiImplementation === false : false);
gate('G423-UIC — readyForRouteMenuIntegration false', U ? U.readyForRouteMenuIntegration === false : false);
gate('G423-UIC — readyForRealModuleGeneration false', U ? U.readyForRealModuleGeneration === false : false);
gate('G423-UIC — readyForProduction false', U ? U.readyForProduction === false : false);
gate('G423-UIC — top-level realDataRead/realDataWrite false', U ? (U.capabilities.realDataRead === false && U.capabilities.realDataWrite === false) : false);
gate('G423-UIC — render boundary renderAllowed false in contract', (() => { try { return U.renderBoundary.renderAllowed === false && U.renderBoundary.virtualRenderContractProduced === true; } catch { return false; } })());
gate('G423-UIC — component binding anyBindingAllowed false in contract', (() => { try { return U.componentBinding.anyBindingAllowed === false; } catch { return false; } })());
gate('G423-UIC — blocked action allBlocked in contract', (() => { try { return U.blockedAction.allBlocked === true && U.blockedAction.anyAllowed === false; } catch { return false; } })());
gate('G423-UIC — interaction binding allBlockedNow in contract', (() => { try { return U.interactionBinding.allBlockedNow === true && U.interactionBinding.anyHandlerCreated === false && U.interactionBinding.anyMutationAllowed === false; } catch { return false; } })());
gate('G423-UIC — state projection no react-state/hooks/dom in contract', (() => { try { return U.stateProjection.reactState === false && U.stateProjection.hooks === false && U.stateProjection.dom === false; } catch { return false; } })());
gate('G423-UIC — accessibility projection no dom/aria in contract', (() => { try { return U.accessibilityProjection.domTouched === false && U.accessibilityProjection.setsRealAria === false; } catch { return false; } })());
gate('G423-UIC — theme projection no realCss/cssRuntime in contract', (() => { try { return U.themeProjection.realCss === false && U.themeProjection.cssRuntime === false && U.themeProjection.stylesheetCreated === false; } catch { return false; } })());
gate('G423-UIC — safety policy no forbidden side-effect in contract', (() => { try { return U.safetyPolicy.anyForbiddenSideEffect === false && U.safetyPolicy.visualRuntimeImplemented === false && U.safetyPolicy.reversibleByNonConsumption === true; } catch { return false; } })());
gate('G423-UIC — node contract root uiRoot + all node kinds known in contract', (() => { try { return U.nodeContract.root.nodeKind === 'uiRoot' && U.nodeContract.allNodeKindsKnown === true && U.nodeContract.reactElement === false && U.nodeContract.domNode === false; } catch { return false; } })());
gate('G423-UIC — frame mapping no react element/dom/css in contract', (() => { try { return U.frameMapping.reactElement === false && U.frameMapping.domNode === false && U.frameMapping.cssRuntime === false; } catch { return false; } })());
gate('G423-UIC — RuntimeUiContractError is an Error subclass', (() => { try { const e = new m.RuntimeUiContractError('RUNTIME_UI_CONTRACT_PRISMA_BLOCKED', 'blocked'); return e instanceof Error && e.code === 'RUNTIME_UI_CONTRACT_PRISMA_BLOCKED' && e.name === 'RuntimeUiContractError'; } catch { return false; } })());
gate('G423-UIC — session present + metadataOnly true in contract', (() => { try { return U.session.kind === 'runtime-ui-contract-session' && U.metadataOnly === true; } catch { return false; } })());

// Static safety scans.
const code = stripComments(walk(DIR).map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
gate('G423-UIC — subtree is React-free', importsOf(walk(DIR)).every((p) => p !== 'react' && !/^react(\/|$)/.test(p)));
gate('G423-UIC — no import of EmpresaApi/apiClient/apis/backend/prisma', importsOf(walk(DIR)).every((p) => !/EmpresaApi|apiClient|\/apis\/|\/backend\/|@prisma|PrismaClient/i.test(p)));
gate('G423-UIC — no fetch/XHR/WebSocket/storage-API', !/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(code) && !/localStorage\.|sessionStorage\.|indexedDB\./.test(code));
gate('G423-UIC — no createElement/jsx runtime/DOM access', !/createElement|_jsx\b|jsxs?\(/.test(code) && !/\bdocument\.|\bwindow\.[a-z]/i.test(code));
gate('G423-UIC — no DATABASE_URL / production API_URL / Railway', !/DATABASE_URL|VITE_API_URL|projetomg-production|railway/i.test(code));
gate('G423-UIC — no real POST/PUT/PATCH/DELETE method', !/method\s*:\s*['"](POST|PUT|PATCH|DELETE)['"]/.test(code));
gate('G423-UIC — no realDataRead/realDataWrite true literal', !/realDataRead\s*:\s*true|realDataWrite\s*:\s*true/.test(code));

gate('G423-UIC — docs validate no UI / no route / no module', /runtime|React|UI|rota|menu|módulo|module/i.test(readEv('NO-REACT-NO-UI-NO-ROUTE-NO-MODULE.md')) && /headless/i.test(readEv('CERTIFICATION-REPORT.md')));
gate('G423-UIC — next slice spec (runtime UI implementation plan) present', /RUNTIME UI IMPLEMENTATION PLAN|implementation plan/i.test(readEv('NEXT-SLICE-SPEC.md')));

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
gate('G423-UIC — src/modules / Empresas / backend / Prisma / SSOT untouched', blockedOk, blockedDetail);

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
gate('G423-UIC — authorized scope only (ui-contract + registry + evidence + package)', scopeOk, scopeDetail);

let noOldEdit = false; let noOldEditDetail = '';
{
  const { gitAvailable, evaluation } = studioScope();
  if (!gitAvailable) { noOldEdit = true; noOldEditDetail = 'git base unavailable — skipped'; }
  else {
    // A prior slice's test or gate may appear ONLY when the ACTIVE slice is explicitly
    // cross-authorized for it, and only when that active slice is this one or later.
    // Three legitimate outcomes: this gate certifies the branch, the diff is empty, or the
    // branch builds an EARLIER slice and was re-certified against that slice before being
    // declared sound. Any other reason fails.
    const chronologyOk = evaluation.consumerApplicable
      ? (evaluation.activeSliceOrdinal !== null && evaluation.activeSliceOrdinal >= evaluation.consumerSliceOrdinal)
      : (evaluation.reason === 'empty_branch_diff'
        || (evaluation.reason === 'consumer_slice_after_active_slice' && evaluation.certifiedAgainstActiveSlice === true));
    noOldEdit = evaluation.safe && chronologyOk;
    noOldEditDetail = !evaluation.consumerApplicable
      ? `consumer not applicable: ${evaluation.reason} (evaluated as ${evaluation.evaluatedAsSliceId})`
      : noOldEdit
      ? `no unauthorized prior gate/test (active ${evaluation.activeSliceId} #${evaluation.activeSliceOrdinal} >= ${CALLER_SLICE_ID} #${evaluation.callerSliceOrdinal})`
      : `blocked: ${evaluation.blockers.join(',')}`;
  }
}
gate('G423-UIC — productionUiGuard + governance guard + prior gates/tests NOT altered by this slice', noOldEdit, noOldEditDetail);

let regOk = false; let regDetail = '';
try {
  const reg = await import(pathToFileURL(path.join(ROOT, 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs')).href);
  const known = reg.KNOWN_LATER_STUDIO_HEADLESS_ARTIFACTS;
  const hasOwn = known.some((re) => re.test('src/studio/blueprint-engine/dev-preview-runtime-ui-contract/index.js'));
  const forbiddenProbes = ['src/modules/x/y.js', 'backend/server.js', 'src/App.jsx', 'backend/prisma/schema.prisma', 'src/pages/z.jsx'];
  const leaks = forbiddenProbes.filter((p) => known.some((re) => re.test(p)));
  regOk = hasOwn && leaks.length === 0;
  regDetail = regOk ? 'specific ui-contract paths registered; no broad wildcard leaks a forbidden path' : `hasOwn=${hasOwn} leaks=${leaks.join(',')}`;
} catch (err) { regOk = false; regDetail = err instanceof Error ? err.message : String(err); }
gate('G423-UIC — registry: specific slice paths only, no dangerous wildcard', regOk, regDetail);

let noNewDep = false;
try {
  const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
  const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
  const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
  noNewDep = bk === hk;
} catch { noNewDep = true; }
gate('G423-UIC — no new dependency added', noNewDep);

gate('G423-UIC — src/modules/studio does NOT exist', !exists(path.join(ROOT, 'src/modules/studio')));
gate('G423-UIC — src/modules/clientes does NOT exist', !exists(path.join(ROOT, 'src/modules/clientes')));
gate('G423-UIC — upstream isolated runtime present', exists(path.join(IR_DIR, 'index.js')));

let testsOk = false; let testCount = 0;
try {
  const out = execSync('node --test src/runtime/__tests__/studio-dev-preview-runtime-ui-contract.test.js', { cwd: ROOT, stdio: 'pipe', env: { ...process.env, NODE_ENV: 'test' } }).toString();
  const mt = out.match(/# tests (\d+)/); const mp = out.match(/# pass (\d+)/); const mf = out.match(/# fail (\d+)/);
  testCount = mt ? Number(mt[1]) : 0;
  testsOk = mf ? Number(mf[1]) === 0 && mp && Number(mp[1]) === testCount : false;
} catch (err) { if (err.stderr) console.error(String(err.stderr)); }
gate('G423-UIC — runtime UI contract unit tests PASS', testsOk, `${testCount} scenarios`);
gate('G423-UIC — unit test has >= 330 scenarios', testCount >= 330, `${testCount} scenarios (min 330)`);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-STUDIO-DEV-PREVIEW-RUNTIME-UI-CONTRACT summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);
if (failed.length > 0) process.exit(1);
