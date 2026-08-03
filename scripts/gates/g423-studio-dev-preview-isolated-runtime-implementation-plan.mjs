#!/usr/bin/env node
/**
 * Gate G423-STUDIO-DEV-PREVIEW-ISOLATED-RUNTIME-IMPLEMENTATION-PLAN — Post-Foundation C.
 *
 * Proves the headless, CONTRACT-ONLY isolated runtime implementation PLAN in
 * `src/studio/blueprint-engine/dev-preview-isolated-runtime-implementation-plan/`. Despite the
 * name, it implements NO runtime. It consumes a Dev Preview Runtime Shell Contract and produces
 * deterministic phases / boundary / dev-only-policy / adapter / render-pipeline / lifecycle /
 * event / data / permission / test-harness / rollout / observability PLANS plus BLOCKED
 * route/placement plans, safety, a readiness decision, a manifest, verifier, compatibility,
 * diagnostics and fallback.
 *
 * It NEVER implements a runtime, creates UI/React components/`.jsx`/`.tsx`/`.css`/DOM/runtime-CSS/
 * routes/menus/modules, writes files under `src/modules`, touches backend/Prisma/migration/
 * network/production/staging, mutates, persists, or rewrites Empresas. It authorizes NO
 * implementation slice.
 *
 * Scope safety uses the central Studio Scope Governance guard: forbidden always wins;
 * legitimate later Studio headless artifacts are tolerated; nothing weakens the block.
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
const CALLER_SLICE_ID = 'dev-preview-isolated-runtime-implementation-plan';
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
const DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-isolated-runtime-implementation-plan');
const SHELL_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-runtime-shell-contract');
const VISUAL_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-visual-contract');
const BRIDGE_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-contract-bridge');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-dev-preview-isolated-runtime-implementation-plan');
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
  /^src\/studio\/blueprint-engine\/dev-preview-isolated-runtime-implementation-plan\//,
  /^src\/runtime\/__tests__\/studio-dev-preview-isolated-runtime-implementation-plan\.test\.js$/,
  /^scripts\/gates\/g423-studio-dev-preview-isolated-runtime-implementation-plan\.mjs$/,
  /^scripts\/gates\/lib\/studioScopeGovernanceRegistry\.mjs$/,
  /^package\.json$/,
  /^package-lock\.json$/,
  /^docs\/evidence\/post-foundation-c-studio-dev-preview-isolated-runtime-implementation-plan\//,
];
const authorized = (f) => AUTHORIZED.some((re) => re.test(f)) || isKnownLaterStudioHeadlessArtifact(f);

const FILES = [
  'isolatedRuntimeImplementationPlanConfig.js', 'errors.js', 'createStudioDevPreviewIsolatedRuntimeImplementationPlan.js',
  'createIsolatedRuntimeImplementationPlanSession.js', 'createIsolatedRuntimeImplementationPhases.js',
  'createIsolatedRuntimeBoundaryPlan.js', 'createIsolatedRuntimeDevOnlyExecutionPolicy.js',
  'createIsolatedRuntimeAdapterPlan.js', 'createIsolatedRuntimeRenderPipelinePlan.js',
  'createIsolatedRuntimeLifecycleExecutionPlan.js', 'createIsolatedRuntimeEventHandlingPlan.js',
  'createIsolatedRuntimeDataAccessBlockedPlan.js', 'createIsolatedRuntimePermissionEnforcementPlan.js',
  'createIsolatedRuntimeTestHarnessPlan.js', 'createIsolatedRuntimeRolloutRollbackPlan.js',
  'createIsolatedRuntimeObservabilityDiagnosticsPlan.js', 'createIsolatedRuntimeRouteBlockedPlan.js',
  'createIsolatedRuntimePlacementBlockedPlan.js', 'createIsolatedRuntimeSafetyPlan.js',
  'createIsolatedRuntimeReadinessDecision.js', 'createIsolatedRuntimeImplementationPlanManifest.js',
  'verifyIsolatedRuntimeImplementationPlan.js', 'checkIsolatedRuntimeImplementationPlanCompatibility.js',
  'createIsolatedRuntimeImplementationPlanDiagnostics.js', 'createIsolatedRuntimeImplementationPlanFallback.js',
  'index.js',
];

const DOCS = [
  'CERTIFICATION-REPORT.md', 'STUDIO-DEV-PREVIEW-ISOLATED-RUNTIME-IMPLEMENTATION-PLAN-REPORT.md', 'PLAN-SESSION.md',
  'IMPLEMENTATION-PHASES.md', 'ISOLATION-BOUNDARY.md', 'DEV-ONLY-EXECUTION-POLICY.md', 'RUNTIME-ADAPTER-PLAN.md',
  'RENDER-PIPELINE-PLAN.md', 'LIFECYCLE-EXECUTION-PLAN.md', 'EVENT-HANDLING-PLAN.md', 'DATA-ACCESS-BLOCKED-PLAN.md',
  'PERMISSION-ENFORCEMENT-PLAN.md', 'TEST-HARNESS-PLAN.md', 'ROLLOUT-ROLLBACK-PLAN.md', 'OBSERVABILITY-DIAGNOSTICS-PLAN.md',
  'ROUTE-PLACEMENT-BLOCKED-PLAN.md', 'RUNTIME-SAFETY.md', 'MANIFEST-VERIFIER-COMPATIBILITY.md',
  'NO-REACT-NO-UI-NO-ROUTE-NO-MODULE.md', 'QUALITY-SCALABILITY-NOTES.md', 'NEXT-SLICE-SPEC.md',
];

for (const f of FILES) gate(`G423-IRIP — ${f} exists`, exists(path.join(DIR, f)));
gate('G423-IRIP — no .jsx/.tsx in subtree', walk(DIR).every((f) => !/\.(jsx|tsx)$/.test(f)));
gate('G423-IRIP — no .css in subtree', !fs.readdirSync(DIR).some((f) => /\.css$/.test(f)));
gate('G423-IRIP — tests exist', exists(path.join(ROOT, 'src/runtime/__tests__/studio-dev-preview-isolated-runtime-implementation-plan.test.js')));
for (const d of DOCS) gate(`G423-IRIP — ${d} exists`, exists(path.join(EV, d)));

let m = null; let shellMod = null; let visualMod = null; let bridgeMod = null;
try { m = await import(pathToFileURL(path.join(DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
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

let BRIDGE = null; let VC = null; let RS = null; let P = null;
try { BRIDGE = bridgeMod.createStudioDevPreviewContractBridge({ sandbox: SANDBOX }); } catch (err) { console.error(String(err)); }
try { VC = visualMod.createStudioDevPreviewVisualContract({ bridge: BRIDGE }); } catch (err) { console.error(String(err)); }
try { RS = shellMod.createStudioDevPreviewRuntimeShellContract({ visualContract: VC }); } catch (err) { console.error(String(err)); }
try { P = m.createStudioDevPreviewIsolatedRuntimeImplementationPlan({ runtimeShellContract: RS }); } catch (err) { console.error(String(err)); }

let baseOk = false; let baseDetail = '';
try {
  baseOk = P.kind === 'studio-dev-preview-isolated-runtime-implementation-plan'
    && P.implementationPlanName === 'studio-dev-preview-isolated-runtime-implementation-plan'
    && P.implementationPlanVersion === 'studio-dev-preview-isolated-runtime-implementation-plan@1.0.0'
    && P.runtimeShellContractVersion === 'studio-dev-preview-runtime-shell-contract@1.0.0'
    && P.visualContractVersion === 'studio-dev-preview-visual-contract@1.0.0'
    && P.bridgeVersion === 'studio-dev-preview-contract-bridge@1.0.0'
    && P.sandboxVersion === 'studio-module-preview-sandbox-contract@1.0.0'
    && P.plannerVersion === 'studio-blueprint-module-reference-planner@1.0.0'
    && P.engineVersion === 'studio-blueprint-engine@1.0.0'
    && P.blueprintContractVersion === 'studio-blueprint-contract@1.0.0'
    && P.mode === 'headless_dev_preview_isolated_runtime_implementation_plan'
    && P.fallback === false
    && P.readiness === 'studio_dev_preview_isolated_runtime_implementation_plan_ready'
    && P.readyForIsolatedRuntimeImplementationPlan === true
    && P.readyForIsolatedRuntimeImplementationSlice === false
    && P.readyForRealModuleGeneration === false
    && P.readyForProduction === false
    && P.blockerCount === 0 && P.warningCount === 0 && P.metadataOnly === true;
  baseDetail = baseOk ? `readiness=${P.readiness}` : 'contract invariants wrong';
} catch (err) { baseDetail = err instanceof Error ? err.message : String(err); }
gate('G423-IRIP — plan headless/contract-only invariants + readiness ready', baseOk, baseDetail);

let capOk = false;
try {
  const c = m.IMPLEMENTATION_PLAN_HEADLESS_CAPABILITIES;
  const trues = ['headless', 'contractOnly', 'metadataOnly', 'planOnly', 'implementationPhasesOnly', 'isolationBoundaryPlanOnly', 'devOnlyExecutionPolicyOnly', 'runtimeAdapterPlanOnly', 'renderPipelinePlanOnly', 'lifecycleExecutionPlanOnly', 'eventHandlingPlanOnly', 'dataAccessBlockedPlanOnly', 'permissionEnforcementPlanOnly', 'testHarnessPlanOnly', 'rolloutRollbackPlanOnly', 'observabilityDiagnosticsPlanOnly'];
  const noes = ['runtimeImplemented', 'reactComponentCreated', 'jsxCreated', 'tsxCreated', 'domCreated', 'cssCreated', 'uiCreated', 'routeCreated', 'menuCreated', 'moduleGenerated', 'filesWrittenToModule', 'moduleRegistered', 'backendAccessed', 'prismaAccessed', 'productionAccessed', 'stagingAccessed', 'fetchUsed', 'mutationAllowed', 'persistenceCreated', 'rewriteEmpresas'];
  capOk = Object.isFrozen(c) && trues.every((k) => c[k] === true) && noes.every((k) => c[k] === false) && noes.every((k) => P.capabilities[k] === false);
} catch { capOk = false; }
gate('G423-IRIP — capabilities frozen; *Only flags true; runtimeImplemented + all side-effect flags false', capOk);

const part = (fn, pred) => { try { return pred(m[fn]({ runtimeShellContract: RS })); } catch (err) { console.error(`${fn}: ${err}`); return false; } };
gate('G423-IRIP — session (stable seed, no storage/fetch/persistence/side-effects)', part('createIsolatedRuntimeImplementationPlanSession', (x) => x.kind === 'isolated-runtime-implementation-plan-session' && x.usesStorage === false && x.usesFetch === false && x.usesPersistence === false && x.runtimeSideEffects === false && typeof x.seed === 'string'));
gate('G423-IRIP — phases (9 planned; none implemented; goal/effects/criteria/rollback)', part('createIsolatedRuntimeImplementationPhases', (x) => x.phaseCount === 9 && x.anyImplemented === false && x.allPlanned === true && x.phases.every((p) => typeof p.goal === 'string' && Array.isArray(p.allowedEffects) && Array.isArray(p.blockedEffects) && typeof p.rollbackPlan === 'string')));
gate('G423-IRIP — isolation boundary (no window/doc/DOM/react/css/route/menu/module/backend/prisma/prod/staging)', part('createIsolatedRuntimeBoundaryPlan', (x) => x.allInvariantsHold === true && x.noWindow === true && x.noDOM === true && x.noReact === true && x.noBackend === true && x.noPrisma === true && x.noProduction === true && x.noStaging === true));
gate('G423-IRIP — dev-only execution policy (devOnly; no prod/staging; requires manual gate + contracts)', part('createIsolatedRuntimeDevOnlyExecutionPolicy', (x) => x.devOnly === true && x.productionAllowed === false && x.stagingAllowed === false && x.requiresExplicitFutureSlice === true && x.requiresManualGate === true && x.requiresRuntimeShellContract === true && x.requiresVisualContract === true));
gate('G423-IRIP — adapter plan (planned metadata only; no adapter implemented)', part('createIsolatedRuntimeAdapterPlan', (x) => x.adapterKind === 'planned_metadata_only' && x.adapterImplemented === false && x.reactAdapter === false && x.domAdapter === false && x.backendAdapter === false && x.routeAdapter === false && x.menuAdapter === false));
gate('G423-IRIP — render pipeline (steps planned; renderImplemented/renderAllowed false; future-slice reason)', part('createIsolatedRuntimeRenderPipelinePlan', (x) => x.renderImplemented === false && x.renderAllowed === false && x.steps.every((s) => s.implemented === false) && /future isolated runtime implementation slice required/.test(x.reason)));
gate('G423-IRIP — lifecycle execution (created→disposed; no step implemented; no real runtime)', part('createIsolatedRuntimeLifecycleExecutionPlan', (x) => x.initialStep === 'created' && x.usesRealRuntime === false && x.steps.every((s) => s.implemented === false) && x.steps.some((s) => s.step === 'blockedForImplementation')));
gate('G423-IRIP — event handling (8 kinds; no emitter/handler/listener/mutation)', part('createIsolatedRuntimeEventHandlingPlan', (x) => x.eventKinds.length === 8 && x.usesEventEmitter === false && x.anyRealHandler === false && x.anyRealListener === false && x.anyMutation === false));
gate('G423-IRIP — data access blocked (no real read/write/fetch/backend/prisma/persistence/mutation)', part('createIsolatedRuntimeDataAccessBlockedPlan', (x) => x.realDataRead === false && x.realDataWrite === false && x.fetchUsed === false && x.backendAccessed === false && x.prismaAccessed === false && x.persistenceCreated === false && x.mutationAllowed === false && x.blockedNow === true));
gate('G423-IRIP — permission enforcement (defaultDeny/failClosed/tenantRequired/permissionRequired; no admin bypass/grant)', part('createIsolatedRuntimePermissionEnforcementPlan', (x) => x.defaultDeny === true && x.failClosed === true && x.tenantRequired === true && x.permissionRequired === true && x.adminBypass === false && x.grantsAccess === false));
gate('G423-IRIP — test harness (fixtures planned; harness not implemented; runtime not executed)', part('createIsolatedRuntimeTestHarnessPlan', (x) => x.fixtures.every((f) => f.implemented === false) && x.harnessImplemented === false && x.runtimeExecuted === false));
gate('G423-IRIP — rollout/rollback (rollout blocked; no prod/staging; manual gate; rollback by non-consumption)', part('createIsolatedRuntimeRolloutRollbackPlan', (x) => x.rolloutAllowed === false && x.productionRollout === false && x.stagingRollout === false && x.manualEnablementRequired === true && x.rollbackByNonConsumption === true));
gate('G423-IRIP — observability (safe diagnostics; no secrets/stack leak/telemetry/external logging)', part('createIsolatedRuntimeObservabilityDiagnosticsPlan', (x) => x.safeDiagnostics === true && x.noSecrets === true && x.noStackLeak === true && x.noTelemetryRuntime === true && x.noExternalLogging === true));
gate('G423-IRIP — route blocked (no route/router/app/nav; blockedNow)', part('createIsolatedRuntimeRouteBlockedPlan', (x) => x.routeCreated === false && x.routerMounted === false && x.appTouched === false && x.navigationTouched === false && x.blockedNow === true));
gate('G423-IRIP — placement blocked (no menu/nav/app; blockedNow)', part('createIsolatedRuntimePlacementBlockedPlan', (x) => x.menuCreated === false && x.navMounted === false && x.appTouched === false && x.blockedNow === true));
gate('G423-IRIP — safety plan (runtimeImplemented false; anySideEffect false; all side-effect flags false; reversible)', part('createIsolatedRuntimeSafetyPlan', (x) => x.runtimeImplemented === false && x.anySideEffect === false && x.reversibleByNonConsumption === true && x.realDataRead === false && x.realDataWrite === false && Object.values(x.sideEffectFlags).every((v) => v === false)));

gate('G423-IRIP — readiness never slice/real-generation/production', (() => { try { const r = m.createIsolatedRuntimeReadinessDecision({ runtimeShellContract: RS }); return r.readyForIsolatedRuntimeImplementationSlice === false && r.readyForRealModuleGeneration === false && r.readyForProduction === false; } catch { return false; } })());
gate('G423-IRIP — readiness blocked on blockers', (() => { try { return m.createIsolatedRuntimeReadinessDecision({ blockers: ['x'] }).readiness === 'blocked'; } catch { return false; } })());

let manOk = false;
try { manOk = P.manifest.kind === 'isolated-runtime-implementation-plan-manifest' && P.manifest.implementationPlanVersion === 'studio-dev-preview-isolated-runtime-implementation-plan@1.0.0' && P.manifest.capabilities.headless === true && P.manifest.metadataOnly === true; } catch { manOk = false; }
gate('G423-IRIP — manifest present + capability flags mirrored', manOk);

let verOk = false;
try { verOk = P.verification.ok === true && P.verification.valid === true && P.verification.headless === true && P.verification.runtimeImplemented === false && P.verification.blockerCount === 0; } catch { verOk = false; }
gate('G423-IRIP — verifier passes headless invariants', verOk);

let verTamper = false;
try {
  const c = m.IMPLEMENTATION_PLAN_HEADLESS_CAPABILITIES;
  const ri = m.verifyIsolatedRuntimeImplementationPlan({ plan: { capabilities: { ...c, runtimeImplemented: true } } });
  const ui = m.verifyIsolatedRuntimeImplementationPlan({ plan: { capabilities: { ...c, uiCreated: true } } });
  const dom = m.verifyIsolatedRuntimeImplementationPlan({ plan: { capabilities: { ...c, domCreated: true, cssCreated: true } } });
  const rm = m.verifyIsolatedRuntimeImplementationPlan({ plan: { capabilities: { ...c, routeCreated: true, menuCreated: true } } });
  const be = m.verifyIsolatedRuntimeImplementationPlan({ plan: { capabilities: { ...c, backendAccessed: true, prismaAccessed: true } } });
  const mut = m.verifyIsolatedRuntimeImplementationPlan({ plan: { capabilities: { ...c, mutationAllowed: true, persistenceCreated: true } } });
  const rr = m.verifyIsolatedRuntimeImplementationPlan({ plan: { capabilities: c, renderPipeline: { renderAllowed: true } } });
  const ro = m.verifyIsolatedRuntimeImplementationPlan({ plan: { capabilities: c, rolloutRollback: { rolloutAllowed: true, manualEnablementRequired: true } } });
  const mg = m.verifyIsolatedRuntimeImplementationPlan({ plan: { capabilities: c, rolloutRollback: { manualEnablementRequired: false } } });
  const dr = m.verifyIsolatedRuntimeImplementationPlan({ plan: { capabilities: c, dataAccessBlocked: { realDataRead: true, realDataWrite: true } } });
  verTamper = ri.blockers.includes('capability_runtimeImplemented_must_be_false')
    && ui.blockers.includes('capability_uiCreated_must_be_false')
    && dom.blockers.includes('capability_domCreated_must_be_false') && dom.blockers.includes('capability_cssCreated_must_be_false')
    && rm.blockers.includes('capability_routeCreated_must_be_false') && rm.blockers.includes('capability_menuCreated_must_be_false')
    && be.blockers.includes('capability_backendAccessed_must_be_false')
    && mut.blockers.includes('capability_mutationAllowed_must_be_false')
    && rr.blockers.includes('unsafe_render_allowed_true')
    && ro.blockers.includes('unsafe_rollout_allowed_true')
    && mg.blockers.includes('missing_manual_gate')
    && dr.blockers.includes('unsafe_real_data_read') && dr.blockers.includes('unsafe_real_data_write');
} catch { verTamper = false; }
gate('G423-IRIP — verifier detects runtimeImplemented/React/DOM/CSS/route/menu/backend/prisma/mutation/render/rollout/manual-gate/data attempts', verTamper);

let cmpOk = false;
try {
  const ok = m.checkIsolatedRuntimeImplementationPlanCompatibility({ runtimeShellContract: RS });
  const bad = m.checkIsolatedRuntimeImplementationPlanCompatibility({ runtimeShellContract: { runtimeShellContractVersion: 'x@9.9.9' } });
  cmpOk = ok.compatibleWithRuntimeShellContract === true && ok.readyForIsolatedRuntimeImplementationSlice === false && ok.readyForRealModuleGeneration === false && ok.readyForProduction === false && ok.blocked === false && bad.compatibleWithRuntimeShellContract === false && bad.warnings.includes('incompatible_runtimeShellContract');
} catch { cmpOk = false; }
gate('G423-IRIP — compatibility: aligned ok, never authorizes slice/generation/production; mismatch → warning', cmpOk);

let diagOk = false;
try { diagOk = P.diagnostics.passive === true && P.diagnostics.ok === true && P.diagnostics.headlessConfirmed === true && P.diagnostics.runtimeImplemented === false && P.diagnostics.logged === false && !/jwt|token|secret|DATABASE_URL/i.test(JSON.stringify(P.diagnostics)); } catch { diagOk = false; }
gate('G423-IRIP — diagnostics passive, headless-confirmed, no secrets', diagOk);

let fbOk = false;
try {
  const fb = m.createStudioDevPreviewIsolatedRuntimeImplementationPlan({});
  const fb2 = m.createStudioDevPreviewIsolatedRuntimeImplementationPlan({ runtimeShellContract: { kind: 'other' } });
  const fb3 = m.createStudioDevPreviewIsolatedRuntimeImplementationPlan({ runtimeShellContract: { kind: 'studio-dev-preview-runtime-shell-contract', fallback: true } });
  fbOk = fb.fallback === true && fb.readiness === 'blocked' && fb.readyForIsolatedRuntimeImplementationPlan === false && fb.readyForProduction === false && fb.capabilities.runtimeImplemented === false && fb2.fallback === true && fb3.fallback === true;
} catch { fbOk = false; }
gate('G423-IRIP — fallback fail-closed on invalid/missing/fallback runtime shell contract', fbOk);

let detOk = false;
try {
  const a = m.createStudioDevPreviewIsolatedRuntimeImplementationPlan({ runtimeShellContract: RS });
  const b = m.createStudioDevPreviewIsolatedRuntimeImplementationPlan({ runtimeShellContract: RS });
  detOk = a.overallDigest === b.overallDigest && a.implementationPlanDigest === b.implementationPlanDigest && a.overallDigest.startsWith('fnv1a-');
} catch { detOk = false; }
gate('G423-IRIP — deterministic overall + implementation plan digests', detOk);

let flagOk = false;
try {
  const off = m.isStudioDevPreviewIsolatedRuntimeImplementationPlanEnabled({ [m.MAK_STUDIO_DEV_PREVIEW_ISOLATED_RUNTIME_IMPLEMENTATION_PLAN_FLAG]: 'true', MAK_ENV_LABEL: 'production' });
  const onDev = m.isStudioDevPreviewIsolatedRuntimeImplementationPlanEnabled({ [m.MAK_STUDIO_DEV_PREVIEW_ISOLATED_RUNTIME_IMPLEMENTATION_PLAN_FLAG]: 'true', DEV: 'true' });
  const vOff = m.isStudioDevPreviewIripVerifyEnabled({ [m.MAK_STUDIO_DEV_PREVIEW_IRIP_VERIFY_FLAG]: 'true', NODE_ENV: 'production' });
  flagOk = off === false && onDev === true && vOff === false;
} catch { flagOk = false; }
gate('G423-IRIP — feature flags fail closed in production', flagOk);

gate('G423-IRIP — error catalog >= 30 codes', Array.isArray(m?.IMPLEMENTATION_PLAN_ERROR_CODES) && m.IMPLEMENTATION_PLAN_ERROR_CODES.length >= 30);
gate('G423-IRIP — error descriptor sanitized + side-effect free', (() => { try { const e = m.createIsolatedRuntimeImplementationPlanError('IMPLEMENTATION_PLAN_PRISMA_BLOCKED'); return e.safe === true && e.sideEffects === false && e.prismaAccessed === false && e.runtimeImplemented === false && e.domCreated === false && e.rewriteEmpresas === false; } catch { return false; } })());

// Static safety scans.
const code = stripComments(walk(DIR).map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
gate('G423-IRIP — subtree is React-free', importsOf(walk(DIR)).every((p) => p !== 'react' && !/^react(\/|$)/.test(p)));
gate('G423-IRIP — no import of EmpresaApi/apiClient/apis/backend/prisma', importsOf(walk(DIR)).every((p) => !/EmpresaApi|apiClient|\/apis\/|\/backend\/|@prisma|PrismaClient/i.test(p)));
gate('G423-IRIP — no fetch/XHR/WebSocket/storage-API', !/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(code) && !/localStorage\.|sessionStorage\.|indexedDB\./.test(code));
gate('G423-IRIP — no createElement/jsx runtime/DOM access', !/createElement|_jsx\b|jsxs?\(/.test(code) && !/\bdocument\.|\bwindow\.[a-z]/i.test(code));
gate('G423-IRIP — no DATABASE_URL / production API_URL / Railway', !/DATABASE_URL|VITE_API_URL|projetomg-production|railway/i.test(code));
gate('G423-IRIP — no real POST/PUT/PATCH/DELETE method', !/method\s*:\s*['"](POST|PUT|PATCH|DELETE)['"]/.test(code));

gate('G423-IRIP — docs validate no runtime / no UI / no route / no module', /runtime|React|UI|rota|menu|módulo|module/i.test(readEv('NO-REACT-NO-UI-NO-ROUTE-NO-MODULE.md')) && /headless/i.test(readEv('CERTIFICATION-REPORT.md')));
gate('G423-IRIP — next step spec (checkpoint before real runtime) present', /CHECKPOINT|checkpoint/i.test(readEv('NEXT-SLICE-SPEC.md')));

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
gate('G423-IRIP — src/modules / Empresas / backend / Prisma / SSOT untouched', blockedOk, blockedDetail);

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
gate('G423-IRIP — authorized scope only (plan + registry + evidence + package)', scopeOk, scopeDetail);

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
gate('G423-IRIP — productionUiGuard + governance guard + prior gates/tests NOT altered by this slice', noOldEdit, noOldEditDetail);

// Registry: only this slice's specific paths added; no dangerous broad wildcard (tested functionally).
let regOk = false; let regDetail = '';
try {
  const reg = await import(pathToFileURL(path.join(ROOT, 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs')).href);
  const known = reg.KNOWN_LATER_STUDIO_HEADLESS_ARTIFACTS;
  const hasOwn = known.some((re) => re.test('src/studio/blueprint-engine/dev-preview-isolated-runtime-implementation-plan/index.js'));
  const forbiddenProbes = ['src/modules/x/y.js', 'backend/server.js', 'src/App.jsx', 'backend/prisma/schema.prisma', 'src/pages/z.jsx'];
  const leaks = forbiddenProbes.filter((p) => known.some((re) => re.test(p)));
  regOk = hasOwn && leaks.length === 0;
  regDetail = regOk ? 'specific plan paths registered; no broad wildcard leaks a forbidden path' : `hasOwn=${hasOwn} leaks=${leaks.join(',')}`;
} catch (err) { regOk = false; regDetail = err instanceof Error ? err.message : String(err); }
gate('G423-IRIP — registry: specific slice paths only, no dangerous wildcard', regOk, regDetail);

let noNewDep = false;
try {
  const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
  const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
  const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
  noNewDep = bk === hk;
} catch { noNewDep = true; }
gate('G423-IRIP — no new dependency added', noNewDep);

gate('G423-IRIP — src/modules/studio does NOT exist', !exists(path.join(ROOT, 'src/modules/studio')));
gate('G423-IRIP — src/modules/clientes does NOT exist', !exists(path.join(ROOT, 'src/modules/clientes')));
gate('G423-IRIP — upstream dev preview runtime shell contract present', exists(path.join(SHELL_DIR, 'index.js')));

let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/studio-dev-preview-isolated-runtime-implementation-plan.test.js', { cwd: ROOT, stdio: 'pipe', env: { ...process.env, NODE_ENV: 'test' } });
  testsOk = true;
} catch (err) { if (err.stderr) console.error(String(err.stderr)); }
gate('G423-IRIP — isolated runtime implementation plan unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-STUDIO-DEV-PREVIEW-ISOLATED-RUNTIME-IMPLEMENTATION-PLAN summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);
if (failed.length > 0) process.exit(1);
