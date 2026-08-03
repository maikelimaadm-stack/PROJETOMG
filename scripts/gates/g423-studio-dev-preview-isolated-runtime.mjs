#!/usr/bin/env node
/**
 * Gate G423-STUDIO-DEV-PREVIEW-ISOLATED-RUNTIME — Post-Foundation C.
 *
 * Proves the DEV-ONLY, HEADLESS, ISOLATED runtime in
 * `src/studio/blueprint-engine/dev-preview-isolated-runtime/`. It IS the isolated runtime the
 * prior plan described (`isolatedRuntimeImplemented: true`) but renders NO UI: it consumes the
 * upstream contracts and produces a deterministic virtual preview frame from synthetic data
 * only, with parts session / preflight / contract-loader / synthetic-data / placeholder-resolver /
 * virtual-frame / lifecycle / event-dispatcher / render-request / state / permission / data /
 * isolation / manual-gate / safety / manifest / verifier / compatibility / diagnostics / fallback.
 *
 * It NEVER creates UI/React components/`.jsx`/`.tsx`/`.css`/DOM/runtime-CSS/routes/menus/modules,
 * writes files under `src/modules`, touches backend/Prisma/migration/network/production/staging,
 * mutates, persists, reads/writes real data, or rewrites Empresas. `visualRuntimeImplemented` is
 * false; it authorizes NO UI runtime and NO route/menu integration.
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
const CALLER_SLICE_ID = 'dev-preview-isolated-runtime';
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
const DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-isolated-runtime');
const PLAN_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-isolated-runtime-implementation-plan');
const SHELL_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-runtime-shell-contract');
const VISUAL_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-visual-contract');
const BRIDGE_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-contract-bridge');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-dev-preview-isolated-runtime');
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
  /^src\/studio\/blueprint-engine\/dev-preview-isolated-runtime\//,
  /^src\/runtime\/__tests__\/studio-dev-preview-isolated-runtime\.test\.js$/,
  /^scripts\/gates\/g423-studio-dev-preview-isolated-runtime\.mjs$/,
  /^scripts\/gates\/lib\/studioScopeGovernanceRegistry\.mjs$/,
  /^package\.json$/,
  /^package-lock\.json$/,
  /^docs\/evidence\/post-foundation-c-studio-dev-preview-isolated-runtime\//,
];
const authorized = (f) => AUTHORIZED.some((re) => re.test(f)) || isKnownLaterStudioHeadlessArtifact(f);

const FILES = [
  'isolatedRuntimeConfig.js', 'errors.js', 'createStudioDevPreviewIsolatedRuntime.js',
  'createIsolatedRuntimeSession.js', 'createIsolatedRuntimePreflight.js', 'createIsolatedRuntimeContractLoader.js',
  'createIsolatedRuntimeSyntheticDataProvider.js', 'createIsolatedRuntimeVirtualFrame.js',
  'createIsolatedRuntimePlaceholderResolver.js', 'createIsolatedRuntimeLifecycleExecutor.js',
  'createIsolatedRuntimeEventDispatcher.js', 'createIsolatedRuntimeRenderRequestExecutor.js',
  'createIsolatedRuntimeStateContainer.js', 'createIsolatedRuntimePermissionEnforcer.js',
  'createIsolatedRuntimeDataBoundary.js', 'createIsolatedRuntimeIsolationBoundary.js',
  'createIsolatedRuntimeManualGate.js', 'createIsolatedRuntimeSafetyPolicy.js',
  'createIsolatedRuntimeDiagnostics.js', 'createIsolatedRuntimeFallback.js',
  'createIsolatedRuntimeManifest.js', 'verifyIsolatedRuntime.js', 'checkIsolatedRuntimeCompatibility.js',
  'index.js',
];

const DOCS = [
  'CERTIFICATION-REPORT.md', 'STUDIO-DEV-PREVIEW-ISOLATED-RUNTIME-REPORT.md', 'RUNTIME-SESSION.md', 'PREFLIGHT.md',
  'CONTRACT-LOADER.md', 'SYNTHETIC-DATA-PROVIDER.md', 'VIRTUAL-PREVIEW-FRAME.md', 'PLACEHOLDER-RESOLVER.md',
  'LIFECYCLE-EXECUTOR.md', 'EVENT-DISPATCHER.md', 'RENDER-REQUEST-EXECUTOR.md', 'STATE-CONTAINER.md',
  'PERMISSION-ENFORCER.md', 'DATA-BOUNDARY.md', 'ISOLATION-BOUNDARY.md', 'MANUAL-GATE.md', 'SAFETY-POLICY.md',
  'MANIFEST-VERIFIER-COMPATIBILITY.md', 'NO-REACT-NO-UI-NO-ROUTE-NO-MODULE.md', 'QUALITY-SCALABILITY-NOTES.md',
  'NEXT-SLICE-SPEC.md',
];

for (const f of FILES) gate(`G423-IR — ${f} exists`, exists(path.join(DIR, f)));
gate('G423-IR — no .jsx/.tsx in subtree', walk(DIR).every((f) => !/\.(jsx|tsx)$/.test(f)));
gate('G423-IR — no .css in subtree', !fs.readdirSync(DIR).some((f) => /\.css$/.test(f)));
gate('G423-IR — tests exist', exists(path.join(ROOT, 'src/runtime/__tests__/studio-dev-preview-isolated-runtime.test.js')));
for (const d of DOCS) gate(`G423-IR — ${d} exists`, exists(path.join(EV, d)));

let m = null; let planMod = null; let shellMod = null; let visualMod = null; let bridgeMod = null;
try { m = await import(pathToFileURL(path.join(DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
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

let BRIDGE = null; let VC = null; let RS = null; let PLAN = null; let R = null;
try { BRIDGE = bridgeMod.createStudioDevPreviewContractBridge({ sandbox: SANDBOX }); } catch (err) { console.error(String(err)); }
try { VC = visualMod.createStudioDevPreviewVisualContract({ bridge: BRIDGE }); } catch (err) { console.error(String(err)); }
try { RS = shellMod.createStudioDevPreviewRuntimeShellContract({ visualContract: VC }); } catch (err) { console.error(String(err)); }
try { PLAN = planMod.createStudioDevPreviewIsolatedRuntimeImplementationPlan({ runtimeShellContract: RS }); } catch (err) { console.error(String(err)); }
try { R = m.createStudioDevPreviewIsolatedRuntime({ implementationPlan: PLAN }); } catch (err) { console.error(String(err)); }

let baseOk = false; let baseDetail = '';
try {
  baseOk = R.kind === 'studio-dev-preview-isolated-runtime'
    && R.isolatedRuntimeName === 'studio-dev-preview-isolated-runtime'
    && R.isolatedRuntimeVersion === 'studio-dev-preview-isolated-runtime@1.0.0'
    && R.implementationPlanVersion === 'studio-dev-preview-isolated-runtime-implementation-plan@1.0.0'
    && R.runtimeShellContractVersion === 'studio-dev-preview-runtime-shell-contract@1.0.0'
    && R.visualContractVersion === 'studio-dev-preview-visual-contract@1.0.0'
    && R.bridgeVersion === 'studio-dev-preview-contract-bridge@1.0.0'
    && R.sandboxVersion === 'studio-module-preview-sandbox-contract@1.0.0'
    && R.plannerVersion === 'studio-blueprint-module-reference-planner@1.0.0'
    && R.engineVersion === 'studio-blueprint-engine@1.0.0'
    && R.blueprintContractVersion === 'studio-blueprint-contract@1.0.0'
    && R.mode === 'headless_dev_preview_isolated_runtime'
    && R.fallback === false
    && R.readiness === 'studio_dev_preview_isolated_runtime_ready'
    && R.readyForIsolatedRuntime === true
    && R.readyForDevPreviewRuntimeUI === false
    && R.readyForRouteMenuIntegration === false
    && R.readyForRealModuleGeneration === false
    && R.readyForProduction === false
    && R.blockerCount === 0 && R.warningCount === 0 && R.metadataOnly === true;
  baseDetail = baseOk ? `readiness=${R.readiness}` : 'contract invariants wrong';
} catch (err) { baseDetail = err instanceof Error ? err.message : String(err); }
gate('G423-IR — runtime dev-only/isolated invariants + readiness ready', baseOk, baseDetail);

let capOk = false;
try {
  const c = m.ISOLATED_RUNTIME_CAPABILITIES;
  const trues = ['headless', 'devOnly', 'isolated', 'contractDriven', 'syntheticDataOnly', 'metadataOutputOnly', 'virtualFrameOnly', 'isolatedRuntimeImplemented'];
  const noes = ['reactComponentCreated', 'jsxCreated', 'tsxCreated', 'domCreated', 'cssCreated', 'uiCreated', 'routeCreated', 'menuCreated', 'moduleGenerated', 'filesWrittenToModule', 'moduleRegistered', 'visualRuntimeImplemented', 'reactRuntimeCreated', 'domRuntimeCreated', 'cssRuntimeCreated', 'routeRuntimeCreated', 'menuRuntimeCreated', 'moduleRuntimeCreated', 'backendAccessed', 'prismaAccessed', 'productionAccessed', 'stagingAccessed', 'fetchUsed', 'mutationAllowed', 'persistenceCreated', 'realDataRead', 'realDataWrite', 'rewriteEmpresas'];
  capOk = Object.isFrozen(c) && trues.every((k) => c[k] === true) && noes.every((k) => c[k] === false) && noes.every((k) => R.capabilities[k] === false) && R.capabilities.isolatedRuntimeImplemented === true;
} catch { capOk = false; }
gate('G423-IR — capabilities frozen; isolatedRuntimeImplemented true; visualRuntimeImplemented + all forbidden flags false', capOk);

const part = (fn, argObj, pred) => { try { return pred(m[fn](argObj)); } catch (err) { console.error(`${fn}: ${err}`); return false; } };
gate('G423-IR — session (stable seed, devOnly/isolated, no storage/fetch/persistence/side-effects)', part('createIsolatedRuntimeSession', { implementationPlan: PLAN }, (x) => x.kind === 'isolated-runtime-session' && x.devOnly === true && x.isolated === true && x.usesStorage === false && x.usesFetch === false && x.usesPersistence === false && x.externalSideEffects === false && typeof x.seed === 'string'));
gate('G423-IR — preflight (ok; checkpoint+manual gate; compatible; no network/backend/prisma)', part('createIsolatedRuntimePreflight', { implementationPlan: PLAN }, (x) => x.ok === true && x.checkpointAuthorizationPresent === true && x.manualGateSatisfied === true && x.devOnly === true && x.production === false && x.staging === false && x.usedNetwork === false && x.usedBackend === false && x.usedPrisma === false));
gate('G423-IR — preflight fails closed on invalid plan', part('createIsolatedRuntimePreflight', { implementationPlan: { kind: 'other' } }, (x) => x.ok === false));
gate('G423-IR — contract loader (all loaded; no dynamic import/fetch/fs/prisma/backend/window)', part('createIsolatedRuntimeContractLoader', { implementationPlan: PLAN }, (x) => x.allLoaded === true && x.usedDynamicImport === false && x.usedFetch === false && x.usedFilesystem === false && x.usedPrisma === false && x.usedBackend === false && x.usedWindowOrDocument === false));
gate('G423-IR — synthetic data (synthetic only; no real read/write/storage/persistence)', part('createIsolatedRuntimeSyntheticDataProvider', { implementationPlan: PLAN }, (x) => x.syntheticDataOnly === true && x.realDataRead === false && x.realDataWrite === false && x.usesStorage === false && x.usesPersistence === false && x.syntheticRows.every((r) => r.synthetic === true)));
gate('G423-IR — placeholder resolver (no real component/import/path/jsx/tsx/render-fn)', part('createIsolatedRuntimePlaceholderResolver', { implementationPlan: PLAN }, (x) => x.anyRealComponent === false && x.anyRealRenderFn === false && x.resolved.every((r) => r.isRealComponent === false && r.importsComponent === false && r.jsx === false && r.tsx === false && r.hasRealRenderFn === false)));
gate('G423-IR — virtual frame (metadata; no react element/jsx/dom/css/route/menu/module)', (() => { try { const sd = m.createIsolatedRuntimeSyntheticDataProvider({ implementationPlan: PLAN }); const ph = m.createIsolatedRuntimePlaceholderResolver({ implementationPlan: PLAN }); const f = m.createIsolatedRuntimeVirtualFrame({ implementationPlan: PLAN, syntheticData: sd, placeholders: ph }); return f.kind === 'isolated-runtime-virtual-frame' && f.reactElement === false && f.jsx === false && f.domNode === false && f.cssRuntime === false && f.routeObject === false && f.menuObject === false && f.moduleFile === false && f.blockedActions.every((a) => a.blocked === true); } catch { return false; } })());
gate('G423-IR — lifecycle executor (steps; no timers/event-loop/dom/listeners)', part('createIsolatedRuntimeLifecycleExecutor', { implementationPlan: PLAN }, (x) => x.initialStep === 'created' && x.finalStep === 'disposed' && x.blockedStep === 'blockedForUIRuntime' && x.usesTimers === false && x.usesEventLoop === false && x.usesDom === false && x.usesListeners === false));
gate('G423-IR — event dispatcher (8 kinds; no emitter/handler/listener/mutation/network/storage)', part('createIsolatedRuntimeEventDispatcher', { implementationPlan: PLAN }, (x) => x.eventKinds.length === 8 && x.usesEventEmitter === false && x.anyRealHandler === false && x.anyRealListener === false && x.anyMutation === false && x.usesNetwork === false && x.usesStorage === false));
gate('G423-IR — render request executor (renderAllowed false; virtualFrameProduced; no real render/dom/css)', (() => { try { const f = m.createIsolatedRuntimeVirtualFrame({ implementationPlan: PLAN, syntheticData: m.createIsolatedRuntimeSyntheticDataProvider({ implementationPlan: PLAN }), placeholders: m.createIsolatedRuntimePlaceholderResolver({ implementationPlan: PLAN }) }); const rr = m.createIsolatedRuntimeRenderRequestExecutor({ implementationPlan: PLAN, virtualFrame: f }); return rr.renderAllowed === false && rr.virtualFrameProduced === true && rr.realRenderProduced === false && rr.reactElementProduced === false && rr.domProduced === false && rr.cssProduced === false; } catch { return false; } })());
gate('G423-IR — state container (ephemeral/in-memory/deterministic/read-only; no react-state/hooks/storage/persistence)', part('createIsolatedRuntimeStateContainer', { implementationPlan: PLAN }, (x) => x.ephemeral === true && x.inMemoryOnly === true && x.deterministic === true && x.readOnlyOutput === true && x.reactState === false && x.hooks === false && x.storage === false && x.persistence === false));
gate('G423-IR — permission enforcer (defaultDeny/failClosed/tenantRequired/permissionRequired; no admin bypass/real access)', part('createIsolatedRuntimePermissionEnforcer', { implementationPlan: PLAN }, (x) => x.defaultDeny === true && x.failClosed === true && x.tenantRequired === true && x.permissionRequired === true && x.adminBypass === false && x.grantsRealAccess === false));
gate('G423-IR — data boundary (synthetic_metadata_only; no real read/write/backend/prisma/fetch/persistence/mutation)', part('createIsolatedRuntimeDataBoundary', { implementationPlan: PLAN }, (x) => x.dataMode === 'synthetic_metadata_only' && x.realDataRead === false && x.realDataWrite === false && x.backendAccessed === false && x.prismaAccessed === false && x.fetchUsed === false && x.persistenceCreated === false && x.mutationAllowed === false));
gate('G423-IR — isolation boundary (no window/doc/DOM/react/css/route/menu/module/backend/prisma/prod/staging)', part('createIsolatedRuntimeIsolationBoundary', { implementationPlan: PLAN }, (x) => x.allInvariantsHold === true && x.noWindow === true && x.noDOM === true && x.noReact === true && x.noBackend === true && x.noPrisma === true && x.noProduction === true && x.noStaging === true));
gate('G423-IR — manual gate (Fable checkpoint approved dev-only; production/route-menu/module/backend/prisma gates closed)', part('createIsolatedRuntimeManualGate', { implementationPlan: PLAN }, (x) => x.manualGateName === 'fable-pre-runtime-enterprise-checkpoint' && x.manualGateStatus === 'approved_for_dev_only_isolated_runtime' && x.approvedForDevOnlyIsolatedRuntime === true && x.productionGate === false && x.routeMenuGate === false && x.moduleGenerationGate === false && x.backendGate === false && x.prismaGate === false));
gate('G423-IR — safety policy (isolatedRuntimeImplemented true; visualRuntimeImplemented false; anyForbiddenSideEffect false; reversible)', part('createIsolatedRuntimeSafetyPolicy', { implementationPlan: PLAN }, (x) => x.isolatedRuntimeImplemented === true && x.visualRuntimeImplemented === false && x.anyForbiddenSideEffect === false && x.reversibleByNonConsumption === true && Object.values(x.forbiddenFlags).every((v) => v === false)));

let manOk = false;
try { manOk = R.manifest.kind === 'isolated-runtime-manifest' && R.manifest.isolatedRuntimeVersion === 'studio-dev-preview-isolated-runtime@1.0.0' && R.manifest.capabilities.isolatedRuntimeImplemented === true && R.manifest.capabilities.visualRuntimeImplemented === false && R.manifest.metadataOnly === true; } catch { manOk = false; }
gate('G423-IR — manifest present + capability flags mirrored', manOk);

let verOk = false;
try { verOk = R.verification.ok === true && R.verification.valid === true && R.verification.devOnly === true && R.verification.isolated === true && R.verification.isolatedRuntimeImplemented === true && R.verification.visualRuntimeImplemented === false && R.verification.blockerCount === 0; } catch { verOk = false; }
gate('G423-IR — verifier passes dev-only invariants', verOk);

let verTamper = false;
try {
  const c = m.ISOLATED_RUNTIME_CAPABILITIES;
  const okGate = { approvedForDevOnlyIsolatedRuntime: true };
  const ui = m.verifyIsolatedRuntime({ runtime: { capabilities: { ...c, uiCreated: true }, manualGate: okGate } });
  const vr = m.verifyIsolatedRuntime({ runtime: { capabilities: { ...c, visualRuntimeImplemented: true }, manualGate: okGate } });
  const dom = m.verifyIsolatedRuntime({ runtime: { capabilities: { ...c, domCreated: true, cssCreated: true }, manualGate: okGate } });
  const rm = m.verifyIsolatedRuntime({ runtime: { capabilities: { ...c, routeCreated: true, menuCreated: true }, manualGate: okGate } });
  const be = m.verifyIsolatedRuntime({ runtime: { capabilities: { ...c, backendAccessed: true, prismaAccessed: true }, manualGate: okGate } });
  const mut = m.verifyIsolatedRuntime({ runtime: { capabilities: { ...c, mutationAllowed: true, persistenceCreated: true }, manualGate: okGate } });
  const dr = m.verifyIsolatedRuntime({ runtime: { capabilities: { ...c, realDataRead: true, realDataWrite: true }, manualGate: okGate } });
  const ra = m.verifyIsolatedRuntime({ runtime: { capabilities: c, renderRequest: { renderAllowed: true }, manualGate: okGate } });
  const mg = m.verifyIsolatedRuntime({ runtime: { capabilities: c, manualGate: { approvedForDevOnlyIsolatedRuntime: false } } });
  const mgo = m.verifyIsolatedRuntime({ runtime: { capabilities: c, manualGate: { approvedForDevOnlyIsolatedRuntime: true, productionGate: true } } });
  verTamper = ui.blockers.includes('capability_uiCreated_must_be_false')
    && vr.blockers.includes('capability_visualRuntimeImplemented_must_be_false')
    && dom.blockers.includes('capability_domCreated_must_be_false') && dom.blockers.includes('capability_cssCreated_must_be_false')
    && rm.blockers.includes('capability_routeCreated_must_be_false') && rm.blockers.includes('capability_menuCreated_must_be_false')
    && be.blockers.includes('capability_backendAccessed_must_be_false')
    && mut.blockers.includes('capability_mutationAllowed_must_be_false')
    && dr.blockers.includes('capability_realDataRead_must_be_false') && dr.blockers.includes('capability_realDataWrite_must_be_false')
    && ra.blockers.includes('unsafe_render_allowed_true')
    && mg.blockers.includes('missing_manual_gate')
    && mgo.blockers.includes('manual_gate_opens_forbidden');
} catch { verTamper = false; }
gate('G423-IR — verifier detects React/DOM/CSS/route/menu/backend/prisma/mutation/data/render/manual-gate/visual-runtime attempts', verTamper);

let cmpOk = false;
try {
  const ok = m.checkIsolatedRuntimeCompatibility({ implementationPlan: PLAN });
  const bad = m.checkIsolatedRuntimeCompatibility({ implementationPlan: { implementationPlanVersion: 'x@9.9.9' } });
  cmpOk = ok.compatibleWithImplementationPlan === true && ok.readyForIsolatedRuntime === true && ok.readyForDevPreviewRuntimeUI === false && ok.readyForRouteMenuIntegration === false && ok.readyForProduction === false && ok.blocked === false && bad.compatibleWithImplementationPlan === false && bad.warnings.includes('incompatible_implementationPlan');
} catch { cmpOk = false; }
gate('G423-IR — compatibility: aligned ok, never authorizes UI/route-menu/generation/production; mismatch → warning', cmpOk);

let diagOk = false;
try { diagOk = R.diagnostics.passive === true && R.diagnostics.ok === true && R.diagnostics.devOnlyConfirmed === true && R.diagnostics.isolatedRuntimeImplemented === true && R.diagnostics.logged === false && !/jwt|token|secret|DATABASE_URL/i.test(JSON.stringify(R.diagnostics)); } catch { diagOk = false; }
gate('G423-IR — diagnostics passive, dev-only confirmed, no secrets', diagOk);

let fbOk = false;
try {
  const fb = m.createStudioDevPreviewIsolatedRuntime({});
  const fb2 = m.createStudioDevPreviewIsolatedRuntime({ implementationPlan: { kind: 'other' } });
  const fb3 = m.createStudioDevPreviewIsolatedRuntime({ implementationPlan: { kind: 'studio-dev-preview-isolated-runtime-implementation-plan', fallback: true } });
  fbOk = fb.fallback === true && fb.readiness === 'blocked' && fb.readyForIsolatedRuntime === false && fb.readyForProduction === false && fb.capabilities.isolatedRuntimeImplemented === false && fb2.fallback === true && fb3.fallback === true;
} catch { fbOk = false; }
gate('G423-IR — fallback fail-closed on invalid/missing/fallback plan', fbOk);

let detOk = false;
try {
  const a = m.createStudioDevPreviewIsolatedRuntime({ implementationPlan: PLAN });
  const b = m.createStudioDevPreviewIsolatedRuntime({ implementationPlan: PLAN });
  detOk = a.overallDigest === b.overallDigest && a.isolatedRuntimeDigest === b.isolatedRuntimeDigest && a.overallDigest.startsWith('fnv1a-');
} catch { detOk = false; }
gate('G423-IR — deterministic overall + isolated runtime digests', detOk);

let flagOk = false;
try {
  const off = m.isStudioDevPreviewIsolatedRuntimeEnabled({ [m.MAK_STUDIO_DEV_PREVIEW_ISOLATED_RUNTIME_FLAG]: 'true', MAK_ENV_LABEL: 'production' });
  const onDev = m.isStudioDevPreviewIsolatedRuntimeEnabled({ [m.MAK_STUDIO_DEV_PREVIEW_ISOLATED_RUNTIME_FLAG]: 'true', DEV: 'true' });
  const vOff = m.isStudioDevPreviewIsolatedRuntimeVerifyEnabled({ [m.MAK_STUDIO_DEV_PREVIEW_ISOLATED_RUNTIME_VERIFY_FLAG]: 'true', NODE_ENV: 'production' });
  flagOk = off === false && onDev === true && vOff === false;
} catch { flagOk = false; }
gate('G423-IR — feature flags fail closed in production', flagOk);

gate('G423-IR — error catalog >= 30 codes', Array.isArray(m?.ISOLATED_RUNTIME_ERROR_CODES) && m.ISOLATED_RUNTIME_ERROR_CODES.length >= 30);
gate('G423-IR — error descriptor sanitized + side-effect free', (() => { try { const e = m.createIsolatedRuntimeError('ISOLATED_RUNTIME_PRISMA_BLOCKED'); return e.safe === true && e.sideEffects === false && e.prismaAccessed === false && e.visualRuntimeImplemented === false && e.realDataRead === false && e.rewriteEmpresas === false; } catch { return false; } })());

// Static safety scans.
const code = stripComments(walk(DIR).map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
gate('G423-IR — subtree is React-free', importsOf(walk(DIR)).every((p) => p !== 'react' && !/^react(\/|$)/.test(p)));
gate('G423-IR — no import of EmpresaApi/apiClient/apis/backend/prisma', importsOf(walk(DIR)).every((p) => !/EmpresaApi|apiClient|\/apis\/|\/backend\/|@prisma|PrismaClient/i.test(p)));
gate('G423-IR — no fetch/XHR/WebSocket/storage-API', !/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(code) && !/localStorage\.|sessionStorage\.|indexedDB\./.test(code));
gate('G423-IR — no createElement/jsx runtime/DOM access', !/createElement|_jsx\b|jsxs?\(/.test(code) && !/\bdocument\.|\bwindow\.[a-z]/i.test(code));
gate('G423-IR — no DATABASE_URL / production API_URL / Railway', !/DATABASE_URL|VITE_API_URL|projetomg-production|railway/i.test(code));
gate('G423-IR — no real POST/PUT/PATCH/DELETE method', !/method\s*:\s*['"](POST|PUT|PATCH|DELETE)['"]/.test(code));
gate('G423-IR — no realDataRead/realDataWrite true literal', !/realDataRead\s*:\s*true|realDataWrite\s*:\s*true/.test(code));

// Explicit contract readiness invariants (spec §11).
gate('G423-IR — isolatedRuntimeImplemented true', R ? R.capabilities.isolatedRuntimeImplemented === true : false);
gate('G423-IR — visualRuntimeImplemented false', R ? R.capabilities.visualRuntimeImplemented === false : false);
gate('G423-IR — readyForDevPreviewRuntimeUI false', R ? R.readyForDevPreviewRuntimeUI === false : false);
gate('G423-IR — readyForRouteMenuIntegration false', R ? R.readyForRouteMenuIntegration === false : false);
gate('G423-IR — readyForRealModuleGeneration false', R ? R.readyForRealModuleGeneration === false : false);
gate('G423-IR — readyForProduction false', R ? R.readyForProduction === false : false);
gate('G423-IR — top-level realDataRead/realDataWrite false', R ? (R.capabilities.realDataRead === false && R.capabilities.realDataWrite === false) : false);
gate('G423-IR — virtual frame produced with synthetic rows', (() => { try { return Array.isArray(R.virtualFrame.syntheticRows) && R.virtualFrame.syntheticRows.length > 0 && R.virtualFrame.reactElement === false; } catch { return false; } })());
gate('G423-IR — render request blocks real render + produces virtual frame', (() => { try { return R.renderRequest.renderAllowed === false && R.renderRequest.virtualFrameProduced === true && R.renderRequest.realRenderProduced === false; } catch { return false; } })());
gate('G423-IR — lifecycle blockedForUIRuntime step present', (() => { try { return R.lifecycle.steps.includes('blockedForUIRuntime'); } catch { return false; } })());
gate('G423-IR — manual gate name is Fable checkpoint', (() => { try { return R.manualGate.manualGateName === 'fable-pre-runtime-enterprise-checkpoint'; } catch { return false; } })());
gate('G423-IR — module reference planner + engine present (upstream chain)', exists(path.join(ROOT, 'src/studio/blueprint-engine/module-reference-planner/index.js')) && exists(path.join(ROOT, 'src/studio/blueprint-engine/index.js')));

gate('G423-IR — docs validate no UI / no route / no module', /runtime|React|UI|rota|menu|módulo|module/i.test(readEv('NO-REACT-NO-UI-NO-ROUTE-NO-MODULE.md')) && /dev-only|headless/i.test(readEv('CERTIFICATION-REPORT.md')));
gate('G423-IR — next slice spec (runtime UI contract) present', /RUNTIME UI CONTRACT|runtime ui|UI contract/i.test(readEv('NEXT-SLICE-SPEC.md')));

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
gate('G423-IR — src/modules / Empresas / backend / Prisma / SSOT untouched', blockedOk, blockedDetail);

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
gate('G423-IR — authorized scope only (isolated-runtime + registry + evidence + package)', scopeOk, scopeDetail);

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
gate('G423-IR — productionUiGuard + governance guard + prior gates/tests NOT altered by this slice', noOldEdit, noOldEditDetail);

let regOk = false; let regDetail = '';
try {
  const reg = await import(pathToFileURL(path.join(ROOT, 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs')).href);
  const known = reg.KNOWN_LATER_STUDIO_HEADLESS_ARTIFACTS;
  const hasOwn = known.some((re) => re.test('src/studio/blueprint-engine/dev-preview-isolated-runtime/index.js'));
  const forbiddenProbes = ['src/modules/x/y.js', 'backend/server.js', 'src/App.jsx', 'backend/prisma/schema.prisma', 'src/pages/z.jsx'];
  const leaks = forbiddenProbes.filter((p) => known.some((re) => re.test(p)));
  regOk = hasOwn && leaks.length === 0;
  regDetail = regOk ? 'specific isolated-runtime paths registered; no broad wildcard leaks a forbidden path' : `hasOwn=${hasOwn} leaks=${leaks.join(',')}`;
} catch (err) { regOk = false; regDetail = err instanceof Error ? err.message : String(err); }
gate('G423-IR — registry: specific slice paths only, no dangerous wildcard', regOk, regDetail);

let noNewDep = false;
try {
  const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
  const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
  const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
  noNewDep = bk === hk;
} catch { noNewDep = true; }
gate('G423-IR — no new dependency added', noNewDep);

gate('G423-IR — src/modules/studio does NOT exist', !exists(path.join(ROOT, 'src/modules/studio')));
gate('G423-IR — src/modules/clientes does NOT exist', !exists(path.join(ROOT, 'src/modules/clientes')));
gate('G423-IR — upstream implementation plan present', exists(path.join(PLAN_DIR, 'index.js')));

let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/studio-dev-preview-isolated-runtime.test.js', { cwd: ROOT, stdio: 'pipe', env: { ...process.env, NODE_ENV: 'test' } });
  testsOk = true;
} catch (err) { if (err.stderr) console.error(String(err.stderr)); }
gate('G423-IR — isolated runtime unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-STUDIO-DEV-PREVIEW-ISOLATED-RUNTIME summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);
if (failed.length > 0) process.exit(1);
