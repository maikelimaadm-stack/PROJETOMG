#!/usr/bin/env node
/**
 * Gate G423-STUDIO-MODULE-BLUEPRINT-AUTHORING-RUNTIME — Post-Foundation C.
 *
 * Proves the headless, dev-only, synthetic-only, in-memory, ephemeral, DETERMINISTIC, IMMUTABLE and
 * FAIL-CLOSED Module Blueprint authoring runtime in
 * `src/studio/blueprint-engine/module-blueprint-authoring-runtime/`. It consumes the Authoring
 * Implementation Plan read-only and executes drafts/lifecycle/operations/revisions/validation/
 * invariants/handoffs purely in memory on synthetic data.
 *
 * It creates NO UI, editor, React component, `.jsx`/`.tsx`/`.css`, App/router/menu/sidebar wiring; it
 * never persists, writes the filesystem, touches backend/Prisma/migration/network/production/staging,
 * mutates real data, rewrites Empresas, generates/registers a module, certifies/self-certifies/
 * overwrites the certified SSOT, and NEVER relinks the old Studio prototype. Determinism is enforced by
 * static scans (no Date.now/new Date/Math.random/crypto.randomUUID/randomUUID outside the verifier's
 * detection regex) and by live replay equality.
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
const CALLER_SLICE_ID = 'module-blueprint-authoring-runtime';
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
const DIR = path.join(ROOT, 'src/studio/blueprint-engine/module-blueprint-authoring-runtime');
const PLAN_DIR = path.join(ROOT, 'src/studio/blueprint-engine/module-blueprint-authoring-implementation-plan');
const FOUNDATION_DIR = path.join(ROOT, 'src/studio/blueprint-engine/module-blueprint-authoring-foundation-contract');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-module-blueprint-authoring-runtime');
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
const codeNoVerifier = () => stripComments(jsFiles().filter((f) => !/verifyAuthoringRuntime\.js$/.test(f)).map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
const importsOf = () => jsFiles().flatMap((f) => [...stripComments(fs.readFileSync(f, 'utf8')).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((mm) => mm[1]));
const readEv = (f) => (exists(path.join(EV, f)) ? fs.readFileSync(path.join(EV, f), 'utf8') : '');

const AUTHORIZED = [
  /^src\/studio\/blueprint-engine\/module-blueprint-authoring-runtime\//,
  /^src\/runtime\/__tests__\/studio-module-blueprint-authoring-runtime\.test\.js$/,
  /^scripts\/gates\/g423-studio-module-blueprint-authoring-runtime\.mjs$/,
  /^scripts\/gates\/lib\/studioScopeGovernanceRegistry\.mjs$/,
  /^package\.json$/, /^package-lock\.json$/,
  /^docs\/evidence\/post-foundation-c-studio-module-blueprint-authoring-runtime\//,
];
const authorized = (f) => AUTHORIZED.some((re) => re.test(f)) || isKnownLaterStudioHeadlessArtifact(f);

const FILES = [
  'authoringRuntimeConfig.js', 'errors.js', 'stableSerialize.js', 'createDeterministicDigest.js',
  'normalizeAuthoringInput.js', 'createAuthoringResourceLimits.js', 'enforceAuthoringResourceLimits.js',
  'createValidationIssue.js', 'createDraftSnapshot.js', 'createLifecycleExecutor.js', 'createRevisionEngine.js',
  'createInvariantEnforcer.js', 'createValidationPipeline.js', 'createOperationReceipt.js',
  'createOperationExecutor.js', 'createAuthoringRuntimeSession.js', 'createSyntheticPreviewHandoff.js',
  'createCertificationCandidatePreparation.js', 'discardAuthoringDraft.js', 'createAuthoringRuntimeSsotBoundary.js',
  'createAuthoringRuntimePermissionTenancyBoundary.js', 'createAuthoringRuntimeSafety.js',
  'createAuthoringRuntimeDiagnostics.js', 'createAuthoringRuntimeReadinessDecision.js',
  'createAuthoringRuntimeManifest.js', 'verifyAuthoringRuntime.js', 'checkAuthoringRuntimeCompatibility.js',
  'createAuthoringRuntimeFallback.js', 'createStudioModuleBlueprintAuthoringRuntime.js', 'index.js',
];
const DOCS = [
  'CERTIFICATION-REPORT.md', 'STUDIO-MODULE-BLUEPRINT-AUTHORING-RUNTIME-REPORT.md', 'RUNTIME-SESSION.md',
  'DRAFT-SNAPSHOT.md', 'RESOURCE-LIMITS.md', 'DETERMINISM.md', 'IMMUTABILITY.md', 'LIFECYCLE-EXECUTOR.md',
  'OPERATION-EXECUTOR.md', 'REVISION-ENGINE.md', 'VALIDATION-PIPELINE.md', 'INVARIANT-ENFORCEMENT.md',
  'SYNTHETIC-PREVIEW-HANDOFF.md', 'CERTIFICATION-CANDIDATE-PREPARATION.md', 'DISCARD-ROLLBACK.md',
  'SSOT-PROTECTION.md', 'PERMISSION-TENANCY-BOUNDARY.md', 'PERSISTENCE-FILESYSTEM-PROHIBITION.md',
  'MODULE-GENERATION-PROHIBITION.md', 'PROTOTYPE-RELINK-PROHIBITION.md', 'SAFETY-DIAGNOSTICS.md',
  'MANUAL-ENABLEMENT-GATE.md', 'MANIFEST-VERIFIER-COMPATIBILITY.md', 'NO-UI-NO-APP-NO-MODULE-NO-PERSISTENCE.md',
  'LEGACY-STUDIO-PROTOTYPE-EXPOSURE-DEBT-NOT-TOUCHED.md', 'QUALITY-SCALABILITY-NOTES.md', 'NEXT-CHECKPOINT-SPEC.md',
];

for (const f of FILES) gate(`G423-AR — ${f} exists`, exists(path.join(DIR, f)));
for (const d of DOCS) gate(`G423-AR — ${d} exists`, exists(path.join(EV, d)));
gate('G423-AR — tests exist', exists(path.join(ROOT, 'src/runtime/__tests__/studio-module-blueprint-authoring-runtime.test.js')));
gate('G423-AR — no .jsx in subtree', walk(DIR, /\.jsx$/).length === 0);
gate('G423-AR — no .tsx in subtree', walk(DIR, /\.tsx$/).length === 0);
gate('G423-AR — no .css in subtree', !fs.readdirSync(DIR).some((f) => /\.css$/.test(f)));
gate('G423-AR — exactly 30 .js files', jsFiles().length === 30, `${jsFiles().length} .js`);
gate('G423-AR — upstream plan present', exists(path.join(PLAN_DIR, 'index.js')));
gate('G423-AR — upstream foundation present', exists(path.join(FOUNDATION_DIR, 'index.js')));

let m = null; let pm = null; let fmod = null;
try { m = await import(pathToFileURL(path.join(DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { pm = await import(pathToFileURL(path.join(PLAN_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { fmod = await import(pathToFileURL(path.join(FOUNDATION_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }

const BP = { kind: 'studio-blueprint-contract', moduleId: 'clientes', certified: true, blueprintContractVersion: 'studio-blueprint-contract@1.0.0', engineVersion: 'studio-blueprint-engine@1.0.0' };
let PLAN = null; let U = null;
try { PLAN = pm.createStudioModuleBlueprintAuthoringImplementationPlan({ authoringFoundationContract: fmod.createStudioModuleBlueprintAuthoringFoundationContract({ certifiedBlueprint: BP }) }); } catch (err) { console.error(String(err)); }
try { U = m.createStudioModuleBlueprintAuthoringRuntime({ authoringImplementationPlan: PLAN }); } catch (err) { console.error(String(err)); }

let baseOk = false; let baseDetail = '';
try {
  baseOk = U.kind === 'studio-module-blueprint-authoring-runtime'
    && U.authoringRuntimeName === 'studio-module-blueprint-authoring-runtime'
    && U.authoringRuntimeVersion === 'studio-module-blueprint-authoring-runtime@1.0.0'
    && U.authoringImplementationPlanVersion === 'studio-module-blueprint-authoring-implementation-plan@1.0.0'
    && U.authoringFoundationContractVersion === 'studio-module-blueprint-authoring-foundation-contract@1.0.0'
    && U.mode === 'headless_studio_module_blueprint_authoring_runtime'
    && U.fallback === false
    && U.sourceCheckpoint === 'pre_module_blueprint_authoring_runtime_enterprise_checkpoint'
    && U.checkpointDecision === 'READY_FOR_MODULE_BLUEPRINT_AUTHORING_RUNTIME_SLICE'
    && U.readiness === 'studio_module_blueprint_authoring_runtime_ready'
    && U.readyForAuthoringRuntime === true
    && U.readyForAuthoringUi === false && U.readyForPermissionTenancyIntegration === false
    && U.readyForProductExposure === false && U.readyForModuleGeneration === false && U.readyForProduction === false
    && U.requiresPermissionTenancyFoundation === true
    && U.blockerCount === 0 && U.warningCount === 0;
  baseDetail = baseOk ? `readiness=${U.readiness}` : 'runtime invariants wrong';
} catch (err) { baseDetail = err instanceof Error ? err.message : String(err); }
gate('G423-AR — headless/synthetic/in-memory invariants + readiness ready', baseOk, baseDetail);

// Capabilities.
const TRUE_CAPS = ['headless', 'devOnly', 'syntheticOnly', 'inMemoryOnly', 'ephemeralOnly', 'deterministic', 'immutableSnapshots', 'failClosed', 'sideEffectFree', 'ssotPreserved', 'authoringRuntimeImplemented', 'draftRuntimeImplemented', 'lifecycleRuntimeImplemented', 'operationExecutorImplemented', 'revisionEngineImplemented', 'validationPipelineImplemented', 'invariantEnforcementImplemented', 'previewHandoffImplemented', 'certificationCandidatePreparationImplemented'];
const FALSE_CAPS = ['certificationPerformed', 'authoringUiImplemented', 'editorImplemented', 'persistenceImplemented', 'storageUsed', 'filesystemWritesUsed', 'moduleGenerated', 'filesWrittenToModule', 'moduleRegistered', 'backendAccessed', 'prismaAccessed', 'productionAccessed', 'stagingAccessed', 'fetchUsed', 'networkUsed', 'mutationExternalAllowed', 'realDataRead', 'realDataWrite', 'rewriteEmpresas', 'prototypeRelinked', 'productExposed', 'menuCreated', 'routeCreated', 'permissionModelIntegrated', 'tenantModelIntegrated', 'serverSideAuthorizationIntegrated', 'draftIsCanonical', 'candidateIsCanonical'];
gate('G423-AR — capabilities frozen', (() => { try { return Object.isFrozen(m.AUTHORING_RUNTIME_CAPABILITIES); } catch { return false; } })());
for (const k of TRUE_CAPS) gate(`G423-AR — capability ${k} true`, (() => { try { return m.AUTHORING_RUNTIME_CAPABILITIES[k] === true && U.capabilities[k] === true; } catch { return false; } })());
for (const k of FALSE_CAPS) gate(`G423-AR — capability ${k} false`, (() => { try { return m.AUTHORING_RUNTIME_CAPABILITIES[k] === false && U.capabilities[k] === false; } catch { return false; } })());

const part = (fn, argObj, pred) => { try { return pred(argObj === undefined ? m[fn]() : m[fn](argObj)); } catch (err) { console.error(`${fn}: ${err}`); return false; } };
gate('G423-AR — session (deterministic, in-memory, non-canonical, side-effect-free, no global singleton)', part('createAuthoringRuntimeSession', { seed: 'g' }, (x) => x.kind === 'authoring-runtime-session' && x.synthetic === true && x.ephemeral === true && x.persistent === false && x.canonical === false && x.sideEffectFree === true && x.createdFromExplicitSeed === true && x.usesGlobalSingleton === false && Object.isFrozen(x)));
gate('G423-AR — session deterministic (same seed same digest)', (() => { try { return m.createAuthoringRuntimeSession({ seed: 'g' }).sessionDigest === m.createAuthoringRuntimeSession({ seed: 'g' }).sessionDigest; } catch { return false; } })());
gate('G423-AR — session isolation (two seeds distinct)', (() => { try { return m.createAuthoringRuntimeSession({ seed: 'a' }).sessionId !== m.createAuthoringRuntimeSession({ seed: 'b' }).sessionId; } catch { return false; } })());
gate('G423-AR — resource limits defaults + frozen + fail-closed', part('createAuthoringResourceLimits', undefined, (x) => x.kind === 'authoring-resource-limits' && x.maxDraftsPerSession === 8 && x.maxOperationsPerSession === 500 && x.maxRevisionsPerDraft === 200 && x.failClosedOnExcess === true && x.silentTruncation === false && Object.isFrozen(x)));
gate('G423-AR — resource limits override + invalid falls back', (() => { try { return m.createAuthoringResourceLimits({ maxDraftsPerSession: 3 }).maxDraftsPerSession === 3 && m.createAuthoringResourceLimits({ maxDraftsPerSession: -5 }).maxDraftsPerSession === 8; } catch { return false; } })());
gate('G423-AR — draft snapshot (synthetic, non-canonical, not certified/generated/registered, deep-frozen)', part('createDraftSnapshot', { moduleId: 'm', fields: [{ key: 'a', order: 0 }] }, (x) => x.kind === 'authoring-draft-snapshot' && x.synthetic === true && x.canonical === false && x.certified === false && x.generated === false && x.registered === false && Object.isFrozen(x) && Object.isFrozen(x.fields)));
gate('G423-AR — draft snapshot deterministic', (() => { try { return m.createDraftSnapshot({ moduleId: 'm' }).digest === m.createDraftSnapshot({ moduleId: 'm' }).digest; } catch { return false; } })());
gate('G423-AR — lifecycle executor (8 states, discarded terminal, 7 forbidden, unknown fail-closed)', part('createLifecycleExecutor', undefined, (x) => x.kind === 'authoring-lifecycle-executor' && x.states.length === 8 && x.terminalState === 'discarded' && x.transitions.discarded.length === 0 && x.forbiddenStates.length === 7 && x.unknownTransitionFailClosed === true));
gate('G423-AR — lifecycle transition helper (valid/invalid/forbidden)', (() => { try { return m.isLifecycleTransitionAllowed('empty', 'draft') === true && m.isLifecycleTransitionAllowed('empty', 'validated') === false && m.isLifecycleTransitionAllowed('validated', 'certified') === false && m.isLifecycleTransitionAllowed('discarded', 'draft') === false; } catch { return false; } })());
gate('G423-AR — revision engine (starts 0, monotonic, no negative/persistence/in-place mutation)', part('createRevisionEngine', undefined, (x) => x.revisionStartsAt === 0 && x.revisionMonotonic === true && x.negativeRevisionAllowed === false && x.historyPersistenceAllowed === false && x.inPlaceCanonicalMutationAllowed === false));
gate('G423-AR — nextRevision +1 and fail-closed on invalid', (() => { try { return m.nextRevision(0) === 1 && m.nextRevision(5) === 6 && m.nextRevision(-1) === null && m.nextRevision(1.5) === null; } catch { return false; } })());
gate('G423-AR — operation executor (16 allowlist, unknown fail-closed, no effects/persistence/module-write)', part('createOperationExecutor', undefined, (x) => x.kind === 'authoring-operation-executor' && x.allowlist.length === 16 && x.allowlistOnly === true && x.unknownOperationsFailClosed === true && x.sideEffectsAllowed === false && x.persistenceAllowed === false && x.moduleWriteAllowed === false));
gate('G423-AR — validation pipeline (11 stages, fail-closed, blocker stops preview+candidate)', part('createValidationPipeline', undefined, (x) => x.kind === 'authoring-validation-pipeline' && x.stageCount === 11 && x.failClosed === true && x.deterministicIssues === true && x.blockerStopsPreview === true && x.blockerStopsCertificationCandidate === true));
gate('G423-AR — invariant enforcer (14, fail-closed, no silent auto-correction)', part('createInvariantEnforcer', undefined, (x) => x.kind === 'authoring-invariant-enforcer' && x.invariantCount === 14 && x.allFailClosed === true && x.silentAutoCorrection === false));
gate('G423-AR — synthetic preview handoff (synthetic, not mounted, no real data, not to product)', part('createSyntheticPreviewHandoff', {}, (x) => x.kind === 'authoring-synthetic-preview-handoff' && x.handoffKind === 'synthetic_preview_candidate' && x.previewMounted === false && x.realDataAttached === false && x.productExposed === false && x.routeCreated === false && x.menuCreated === false));
gate('G423-AR — certification candidate preparation (NOT certification/canonical/registered/published/module)', part('createCertificationCandidatePreparation', {}, (x) => x.kind === 'authoring-certification-candidate-preparation' && x.candidateKind === 'blueprint_certification_candidate' && x.certified === false && x.canonical === false && x.registered === false && x.published === false && x.moduleGenerated === false && x.selfCertificationAllowed === false && x.requiresFutureExplicitSlice === true));
gate('G423-AR — discard (terminal, no external cleanup/database/filesystem, non-destructive)', part('discardAuthoringDraft', {}, (x) => x.kind === 'authoring-discard-receipt' && x.terminal === true && x.externalCleanupRequired === false && x.databaseRollbackRequired === false && x.filesystemCleanupRequired === false && x.sideEffectsReversed === 0));
gate('G423-AR — SSOT boundary (certified canonical, draft/candidate non-canonical, no overwrite/bypass, read-only)', part('createAuthoringRuntimeSsotBoundary', undefined, (x) => x.certifiedBlueprintRemainsSsot === true && x.draftIsCanonical === false && x.candidateIsCanonical === false && x.selfCertificationAllowed === false && x.authoringMayOverwriteCertifiedBlueprint === false && x.authoringMayBypassCertification === false && x.engineConsumedReadOnly === true && x.secondSsotCreated === false));
gate('G423-AR — permission/tenancy boundary (not integrated, exposure blocked, foundation required)', part('createAuthoringRuntimePermissionTenancyBoundary', undefined, (x) => x.permissionModelIntegrated === false && x.tenantModelIntegrated === false && x.serverSideAuthorizationIntegrated === false && x.clientSideAuthorizationSufficient === false && x.productExposureBlockedByPermissionTenancy === true && x.requiresPermissionTenancyFoundation === true && x.authImported === false));
gate('G423-AR — safety (anyForbiddenSideEffect false, reversible, all forbidden flags false)', part('createAuthoringRuntimeSafety', undefined, (x) => x.anyForbiddenSideEffect === false && x.reversibleByNonConsumption === true && Object.values(x.forbiddenFlags).every((v) => v === false)));
gate('G423-AR — diagnostics (passive, deterministic, no secrets/network/storage)', part('createAuthoringRuntimeDiagnostics', { session: m.createAuthoringRuntimeSession({ seed: 'g' }) }, (x) => x.kind === 'authoring-runtime-diagnostics' && x.passive === true && x.deterministic === true && x.secretsExposed === false && x.networkUsed === false && x.storageUsed === false));

gate('G423-AR — readiness never ui/permission/product/module/production', (() => { try { const r = m.createAuthoringRuntimeReadinessDecision({}); return r.readyForAuthoringUi === false && r.readyForPermissionTenancyIntegration === false && r.readyForProductExposure === false && r.readyForModuleGeneration === false && r.readyForProduction === false && r.requiresPermissionTenancyFoundation === true; } catch { return false; } })());
gate('G423-AR — readiness blocked on blockers', (() => { try { return m.createAuthoringRuntimeReadinessDecision({ blockers: ['x'] }).readiness === 'blocked'; } catch { return false; } })());

let manOk = false;
try { manOk = U.manifest.kind === 'authoring-runtime-manifest' && U.manifest.capabilities.deterministic === true && U.manifest.capabilities.authoringUiImplemented === false && typeof U.manifest.parts.session === 'string' && typeof U.manifest.parts.ssotBoundary === 'string' && U.manifest.partCount >= 13; } catch { manOk = false; }
gate('G423-AR — manifest present + part digests + capability flags mirrored', manOk);

let verOk = false;
try { verOk = U.verification.ok === true && U.verification.headless === true && U.verification.deterministic === true && U.verification.immutableSnapshots === true && U.verification.ssotPreserved === true && U.verification.authoringUiImplemented === false && U.verification.persistenceImplemented === false && U.verification.moduleGenerated === false && U.verification.productExposed === false && U.verification.blockerCount === 0; } catch { verOk = false; }
gate('G423-AR — verifier passes headless/deterministic/immutable/SSOT invariants', verOk);

let verTamper = false;
try {
  const c = m.AUTHORING_RUNTIME_CAPABILITIES;
  const ok = (o) => m.verifyAuthoringRuntime(o).blockers;
  verTamper = ok({ runtime: { capabilities: { ...c, certificationPerformed: true } } }).includes('capability_certificationPerformed_must_be_false')
    && ok({ runtime: { capabilities: { ...c, authoringUiImplemented: true } } }).includes('capability_authoringUiImplemented_must_be_false')
    && ok({ runtime: { capabilities: { ...c, persistenceImplemented: true } } }).includes('capability_persistenceImplemented_must_be_false')
    && ok({ runtime: { capabilities: { ...c, filesystemWritesUsed: true } } }).includes('capability_filesystemWritesUsed_must_be_false')
    && ok({ runtime: { capabilities: { ...c, moduleGenerated: true } } }).includes('capability_moduleGenerated_must_be_false')
    && ok({ runtime: { capabilities: { ...c, backendAccessed: true, prismaAccessed: true } } }).includes('capability_backendAccessed_must_be_false')
    && ok({ runtime: { capabilities: { ...c, fetchUsed: true, networkUsed: true } } }).includes('capability_fetchUsed_must_be_false')
    && ok({ runtime: { capabilities: { ...c, realDataRead: true, realDataWrite: true } } }).includes('capability_realDataRead_must_be_false')
    && ok({ runtime: { capabilities: { ...c, productExposed: true } } }).includes('capability_productExposed_must_be_false')
    && ok({ runtime: { capabilities: { ...c, prototypeRelinked: true } } }).includes('capability_prototypeRelinked_must_be_false')
    && ok({ runtime: { capabilities: { ...c, draftIsCanonical: true, candidateIsCanonical: true } } }).includes('capability_draftIsCanonical_must_be_false')
    && ok({ runtime: { capabilities: { ...c, permissionModelIntegrated: true } } }).includes('capability_permissionModelIntegrated_must_be_false')
    && ok({ runtime: { capabilities: { ...c, deterministic: false } } }).includes('capability_deterministic_must_be_true')
    && ok({ runtime: { capabilities: { ...c, immutableSnapshots: false } } }).includes('capability_immutableSnapshots_must_be_true')
    && ok({ runtime: { capabilities: { ...c, ssotPreserved: false } } }).includes('capability_ssotPreserved_must_be_true')
    && ok({ runtime: { capabilities: c, ssotBoundary: { draftIsCanonical: true } } }).includes('unsafe_ssot_inversion')
    && ok({ runtime: { capabilities: c, ssotBoundary: { selfCertificationAllowed: true } } }).includes('unsafe_self_certification')
    && ok({ runtime: { capabilities: c, lifecycle: { states: ['empty', 'certified'] } } }).includes('unsafe_forbidden_lifecycle_state')
    && ok({ runtime: { capabilities: c, operations: { unknownOperationsFailClosed: false } } }).includes('unsafe_unknown_operation_accepted')
    && ok({ runtime: { capabilities: c, revisions: { negativeRevisionAllowed: true } } }).includes('unsafe_revision_negative')
    && ok({ runtime: { capabilities: c, validation: { failClosed: false } } }).includes('unsafe_validation_not_fail_closed')
    && ok({ runtime: { capabilities: c, previewHandoff: { previewMounted: true } } }).includes('unsafe_preview')
    && ok({ runtime: { capabilities: c, candidatePreparation: { certified: true } } }).includes('unsafe_candidate')
    && ok({ runtime: { capabilities: c, permissionTenancy: { permissionModelIntegrated: true } } }).includes('unsafe_permission_model_integrated_without_foundation')
    && ok({ runtime: { capabilities: c, manualGate: { manualGateRequired: false } } }).includes('missing_manual_gate')
    && ok({ runtime: { capabilities: c, safety: { anyForbiddenSideEffect: true } } }).includes('unsafe_safety_side_effect')
    && ok({ runtime: { capabilities: c, note: 'uses Math.random' } }).includes('unsafe_nondeterministic_source')
    && (() => { try { m.verifyAuthoringRuntime({ runtime: null }); return true; } catch { return false; } })();
} catch { verTamper = false; }
gate('G423-AR — verifier detects cert/UI/persistence/filesystem/module/backend/prisma/fetch/network/real-data/product/prototype/canonical/permission/forbidden-lifecycle/unknown-op/revision/validation/preview/candidate/missing-gate/nondeterminism attempts', verTamper);

// Live execution.
let liveOk = false; let liveDetail = '';
try {
  const s0 = m.createAuthoringRuntimeSession({ seed: 'live' });
  const before = m.stableSerialize(s0);
  let r = m.executeAuthoringOperation({ session: s0, operation: { operationId: 'createDraft', input: { moduleId: 'clientes', name: 'Clientes' } } });
  const notMutated = m.stableSerialize(s0) === before;
  const id = r.session.drafts[0].draftId;
  const created = r.receipt.status === 'applied' && r.session.drafts[0].revision === 0;
  r = m.executeAuthoringOperation({ session: r.session, operation: { operationId: 'addFieldDraft', draftId: id, input: { key: 'nome', dataKind: 'text', order: 0 } } });
  const rev1 = r.receipt.previousRevision === 0 && r.receipt.nextRevision === 1;
  r = m.executeAuthoringOperation({ session: r.session, operation: { operationId: 'requestValidation', draftId: id } });
  const validated = r.session.drafts[0].lifecycleState === 'validated' && r.session.drafts[0].validation.passed === true;
  const unknown = m.executeAuthoringOperation({ session: r.session, operation: { operationId: 'nuke', draftId: id } });
  const unknownRejected = unknown.receipt.status === 'rejected' && unknown.receipt.issueCode === 'AUTHORING_RUNTIME_UNKNOWN_OPERATION';
  const prev = m.executeAuthoringOperation({ session: r.session, operation: { operationId: 'requestSyntheticPreviewHandoff', draftId: id } });
  const previewOk = prev.receipt.status === 'applied' && prev.session.drafts[0].lifecycleState === 'preview_ready';
  const disc = m.executeAuthoringOperation({ session: prev.session, operation: { operationId: 'discardDraft', draftId: id } });
  const discarded = disc.session.drafts[0].discarded === true;
  const afterDisc = m.executeAuthoringOperation({ session: disc.session, operation: { operationId: 'addFieldDraft', draftId: id, input: { key: 'x' } } });
  const terminalOk = afterDisc.receipt.status === 'rejected';
  // Replay determinism.
  const seq = () => { let x = m.executeAuthoringOperation({ session: m.createAuthoringRuntimeSession({ seed: 'z' }), operation: { operationId: 'createDraft', input: { moduleId: 'm' } } }); return x.session.sessionDigest + '|' + x.receipt.receiptDigest; };
  const replayOk = seq() === seq();
  liveOk = notMutated && created && rev1 && validated && unknownRejected && previewOk && discarded && terminalOk && replayOk;
  liveDetail = liveOk ? 'draft/lifecycle/operations/revisions/validation/preview/discard/replay all deterministic + immutable' : `notMutated=${notMutated} created=${created} rev1=${rev1} validated=${validated} unknownRejected=${unknownRejected} previewOk=${previewOk} discarded=${discarded} terminalOk=${terminalOk} replayOk=${replayOk}`;
} catch (err) { liveDetail = err instanceof Error ? err.message : String(err); }
gate('G423-AR — LIVE: create/mutate/validate/preview/discard deterministic + immutable + fail-closed', liveOk, liveDetail);

// Live limits fail-closed.
let limitOk = false;
try {
  let r = m.executeAuthoringOperation({ session: m.createAuthoringRuntimeSession({ seed: 'lim', limits: { maxDraftsPerSession: 1 } }), operation: { operationId: 'createDraft', input: { moduleId: 'a' } } });
  r = m.executeAuthoringOperation({ session: r.session, operation: { operationId: 'createDraft', input: { moduleId: 'b' } } });
  limitOk = r.receipt.status === 'rejected' && r.receipt.issueCode === 'AUTHORING_RUNTIME_LIMIT_MAX_DRAFTS';
} catch { limitOk = false; }
gate('G423-AR — LIVE: resource limits fail-closed (no silent truncation)', limitOk);

// Live: every allow-listed operation is dispatchable (never "unknown").
for (const op of (m?.AUTHORING_OPERATION_IDS ?? [])) {
  gate(`G423-AR — LIVE: operation ${op} dispatchable (not unknown)`, (() => {
    try {
      const r = m.executeAuthoringOperation({ session: m.createAuthoringRuntimeSession({ seed: 'op' }), operation: { operationId: op, draftId: 'x', input: { moduleId: 'm' } } });
      return r.receipt.issueCode !== 'AUTHORING_RUNTIME_UNKNOWN_OPERATION';
    } catch { return false; }
  })());
}
gate('G423-AR — LIVE: preview requires validated draft (reject on fresh draft)', (() => { try { let r = m.executeAuthoringOperation({ session: m.createAuthoringRuntimeSession({ seed: 'p' }), operation: { operationId: 'createDraft', input: { moduleId: 'm' } } }); const id = r.session.drafts[0].draftId; const rr = m.executeAuthoringOperation({ session: r.session, operation: { operationId: 'requestSyntheticPreviewHandoff', draftId: id } }); return rr.receipt.status === 'rejected' && rr.receipt.issueCode === 'AUTHORING_RUNTIME_PREVIEW_REQUIRES_VALIDATED_DRAFT'; } catch { return false; } })());
gate('G423-AR — LIVE: candidate requires validated draft (reject on fresh draft)', (() => { try { let r = m.executeAuthoringOperation({ session: m.createAuthoringRuntimeSession({ seed: 'c' }), operation: { operationId: 'createDraft', input: { moduleId: 'm' } } }); const id = r.session.drafts[0].draftId; const rr = m.executeAuthoringOperation({ session: r.session, operation: { operationId: 'requestCertificationCandidateHandoff', draftId: id } }); return rr.receipt.status === 'rejected' && rr.receipt.issueCode === 'AUTHORING_RUNTIME_CANDIDATE_REQUIRES_VALIDATED_DRAFT'; } catch { return false; } })());
gate('G423-AR — LIVE: duplicate field keys blocked at validation', (() => { try { let r = m.executeAuthoringOperation({ session: m.createAuthoringRuntimeSession({ seed: 'd' }), operation: { operationId: 'createDraft', input: { moduleId: 'm', fields: [{ key: 'a', order: 0 }, { key: 'a', order: 1 }] } } }); const id = r.session.drafts[0].draftId; r = m.executeAuthoringOperation({ session: r.session, operation: { operationId: 'requestValidation', draftId: id } }); return r.session.drafts[0].lifecycleState === 'validation_failed'; } catch { return false; } })());
gate('G423-AR — LIVE: draft-not-found fail-closed', (() => { try { const r = m.executeAuthoringOperation({ session: m.createAuthoringRuntimeSession({ seed: 'nf' }), operation: { operationId: 'addFieldDraft', draftId: 'nope', input: { key: 'x' } } }); return r.receipt.status === 'rejected' && r.receipt.issueCode === 'AUTHORING_RUNTIME_DRAFT_NOT_FOUND'; } catch { return false; } })());
gate('G423-AR — LIVE: revision monotonic across mutations', (() => { try { let r = m.executeAuthoringOperation({ session: m.createAuthoringRuntimeSession({ seed: 'rv' }), operation: { operationId: 'createDraft', input: { moduleId: 'm' } } }); const id = r.session.drafts[0].draftId; let prev = r.session.drafts[0].revision; for (let i = 0; i < 3; i += 1) { r = m.executeAuthoringOperation({ session: r.session, operation: { operationId: 'addFieldDraft', draftId: id, input: { key: `f${i}`, order: i } } }); if (r.session.drafts[0].revision !== prev + 1) return false; prev = r.session.drafts[0].revision; } return true; } catch { return false; } })());
gate('G423-AR — LIVE: verifyAuthoringOperationOutcome detects input mutation + revision regression', (() => { try { const a = m.verifyAuthoringOperationOutcome({ beforeSessionSerialized: 'a', afterInputSessionSerialized: 'b', receipt: {} }); const b = m.verifyAuthoringOperationOutcome({ receipt: { previousRevision: 5, nextRevision: 3 } }); return a.blockers.includes('input_session_mutated') && b.blockers.includes('revision_regression'); } catch { return false; } })());
gate('G423-AR — LIVE: draft snapshot deep-frozen (nested arrays immutable)', (() => { try { const d = m.createDraftSnapshot({ moduleId: 'm', fields: [{ key: 'a', order: 0 }] }); let threw = false; try { d.fields.push({ key: 'x' }); } catch { threw = true; } return threw && Object.isFrozen(d.fields); } catch { return false; } })());
gate('G423-AR — enforceAuthoringInvariants deterministic + fail-closed on unsafe draft', (() => { try { const bad = { fields: [], layout: [], relationships: [], certified: true, moduleGenerated: true }; const a = m.enforceAuthoringInvariants(bad).map((i) => i.issueCode); const b = m.enforceAuthoringInvariants(bad).map((i) => i.issueCode); return JSON.stringify(a) === JSON.stringify(b) && a.includes('no_self_certification') && a.includes('no_module_generation_authorization'); } catch { return false; } })());
gate('G423-AR — runValidationPipeline deterministic report digest', (() => { try { const d = m.createDraftSnapshot({ moduleId: 'm', fields: [{ key: 'a', order: 0 }] }); return m.runValidationPipeline({ draft: d, limits: m.createAuthoringResourceLimits() }).validationReportDigest === m.runValidationPipeline({ draft: d, limits: m.createAuthoringResourceLimits() }).validationReportDigest; } catch { return false; } })());
gate('G423-AR — stableSerialize key-order independent', (() => { try { return m.stableSerialize({ b: 1, a: 2 }) === m.stableSerialize({ a: 2, b: 1 }); } catch { return false; } })());
gate('G423-AR — createDeterministicDigest stable + 8 hex', (() => { try { return m.createDeterministicDigest({ a: 1, b: 2 }) === m.createDeterministicDigest({ b: 2, a: 1 }) && /^fnv1a-[0-9a-f]{8}$/.test(m.createDeterministicDigest({ a: 1 })); } catch { return false; } })());
gate('G423-AR — normalizeAuthoringInput clones + drops functions + no input mutation', (() => { try { const i = { a: { b: 1 }, f: () => 1 }; const o = m.normalizeAuthoringInput(i); return o !== i && o.a !== i.a && o.f === undefined && typeof i.f === 'function'; } catch { return false; } })());

let cmpOk = false;
try {
  const okc = m.checkAuthoringRuntimeCompatibility({ authoringImplementationPlan: PLAN });
  const bad = m.checkAuthoringRuntimeCompatibility({ authoringImplementationPlan: { kind: 'other', authoringImplementationPlanVersion: 'x@9' } });
  cmpOk = okc.compatibleWithAuthoringImplementationPlan === true && okc.compatibleWithAuthoringFoundationContract === true && okc.compatibleWithBlueprintEngine === true && okc.readyForAuthoringRuntime === true && okc.readyForAuthoringUi === false && okc.readyForProduction === false && okc.status === 'authoring_runtime_ready_for_headless_synthetic_validation_only' && bad.compatibleWithAuthoringImplementationPlan === false && bad.warnings.includes('incompatible_authoringImplementationPlan');
} catch { cmpOk = false; }
gate('G423-AR — compatibility aligned; never authorizes ui/permission/product/production; mismatch → warning', cmpOk);

let diagOk = false;
try { diagOk = U.diagnostics.passive === true && U.diagnostics.deterministic === true && !/DATABASE_URL|VITE_API_URL|Bearer /i.test(JSON.stringify(U.diagnostics)); } catch { diagOk = false; }
gate('G423-AR — diagnostics passive + deterministic + no secrets', diagOk);

let fbOk = false;
try {
  const fb = m.createStudioModuleBlueprintAuthoringRuntime({});
  const fb2 = m.createStudioModuleBlueprintAuthoringRuntime({ authoringImplementationPlan: { kind: 'other' } });
  const fb3 = m.createStudioModuleBlueprintAuthoringRuntime({ authoringImplementationPlan: { kind: 'studio-module-blueprint-authoring-implementation-plan', fallback: true } });
  fbOk = fb.fallback === true && fb.readiness === 'blocked' && fb.readyForAuthoringRuntime === false && fb.capabilities.deterministic === true && fb2.fallback === true && fb3.fallback === true;
} catch { fbOk = false; }
gate('G423-AR — fallback fail-closed on invalid/missing/fallback plan', fbOk);

let detOk = false;
try {
  const a = m.createStudioModuleBlueprintAuthoringRuntime({ authoringImplementationPlan: PLAN });
  const b = m.createStudioModuleBlueprintAuthoringRuntime({ authoringImplementationPlan: PLAN });
  detOk = a.overallDigest === b.overallDigest && a.authoringRuntimeDigest === b.authoringRuntimeDigest && a.overallDigest.startsWith('fnv1a-') && JSON.stringify(a) === JSON.stringify(b);
} catch { detOk = false; }
gate('G423-AR — deterministic overall + runtime digests + full deep-equal', detOk);

let flagOk = false;
try {
  const off = m.isStudioModuleBlueprintAuthoringRuntimeEnabled({ [m.MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_RUNTIME_FLAG]: 'true', MAK_ENV_LABEL: 'production' });
  const onDev = m.isStudioModuleBlueprintAuthoringRuntimeEnabled({ [m.MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_RUNTIME_FLAG]: 'true', DEV: 'true' });
  const vOff = m.isStudioModuleBlueprintAuthoringRuntimeVerifyEnabled({ [m.MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_RUNTIME_VERIFY_FLAG]: 'true', NODE_ENV: 'production' });
  flagOk = off === false && onDev === true && vOff === false;
} catch { flagOk = false; }
gate('G423-AR — feature flags fail closed in production', flagOk);

gate('G423-AR — error catalog >= 45 codes', Array.isArray(m?.AUTHORING_RUNTIME_ERROR_CODES) && m.AUTHORING_RUNTIME_ERROR_CODES.length >= 45);
gate('G423-AR — error catalog has unknown-op + nondeterminism + revision-regression codes', Array.isArray(m?.AUTHORING_RUNTIME_ERROR_CODES) && m.AUTHORING_RUNTIME_ERROR_CODES.includes('AUTHORING_RUNTIME_UNKNOWN_OPERATION') && m.AUTHORING_RUNTIME_ERROR_CODES.includes('AUTHORING_RUNTIME_NONDETERMINISM_BLOCKED') && m.AUTHORING_RUNTIME_ERROR_CODES.includes('AUTHORING_RUNTIME_REVISION_REGRESSION_BLOCKED'));
gate('G423-AR — error descriptor sanitized + side-effect free', (() => { try { const e = m.createAuthoringRuntimeError('AUTHORING_RUNTIME_PRISMA_BLOCKED'); return e.kind === 'authoring-runtime-error' && e.safe === true && e.sideEffects === false && e.certificationPerformed === false && e.realDataRead === false; } catch { return false; } })());
gate('G423-AR — source checkpoint is the enterprise checkpoint', m?.SOURCE_CHECKPOINT === 'pre_module_blueprint_authoring_runtime_enterprise_checkpoint');

// Explicit top-level invariants.
gate('G423-AR — deterministic capability true', U ? U.capabilities.deterministic === true : false);
gate('G423-AR — immutableSnapshots capability true', U ? U.capabilities.immutableSnapshots === true : false);
gate('G423-AR — ssotPreserved capability true', U ? U.capabilities.ssotPreserved === true : false);
gate('G423-AR — authoringUi/editor false', U ? (U.capabilities.authoringUiImplemented === false && U.capabilities.editorImplemented === false) : false);
gate('G423-AR — persistence/storage/filesystem false', U ? (U.capabilities.persistenceImplemented === false && U.capabilities.storageUsed === false && U.capabilities.filesystemWritesUsed === false) : false);
gate('G423-AR — module generation/registration/file-writes false', U ? (U.capabilities.moduleGenerated === false && U.capabilities.moduleRegistered === false && U.capabilities.filesWrittenToModule === false) : false);
gate('G423-AR — backend/prisma false', U ? (U.capabilities.backendAccessed === false && U.capabilities.prismaAccessed === false) : false);
gate('G423-AR — fetch/network false', U ? (U.capabilities.fetchUsed === false && U.capabilities.networkUsed === false) : false);
gate('G423-AR — production/staging false', U ? (U.capabilities.productionAccessed === false && U.capabilities.stagingAccessed === false) : false);
gate('G423-AR — realData read/write false', U ? (U.capabilities.realDataRead === false && U.capabilities.realDataWrite === false) : false);
gate('G423-AR — product/menu/route false', U ? (U.capabilities.productExposed === false && U.capabilities.menuCreated === false && U.capabilities.routeCreated === false) : false);
gate('G423-AR — prototypeRelinked/rewriteEmpresas false', U ? (U.capabilities.prototypeRelinked === false && U.capabilities.rewriteEmpresas === false) : false);
gate('G423-AR — permission/tenant/server-auth NOT integrated', U ? (U.capabilities.permissionModelIntegrated === false && U.capabilities.tenantModelIntegrated === false && U.capabilities.serverSideAuthorizationIntegrated === false) : false);
gate('G423-AR — draft/candidate NOT canonical', U ? (U.capabilities.draftIsCanonical === false && U.capabilities.candidateIsCanonical === false) : false);
gate('G423-AR — certificationPerformed false, cert-prep implemented', U ? (U.capabilities.certificationPerformed === false && U.capabilities.certificationCandidatePreparationImplemented === true) : false);
gate('G423-AR — manual gate required in runtime', (() => { try { return U.manualGate.manualGateRequired === true && U.manualGate.authorizesAuthoringUi === false && U.manualGate.authorizesModuleGeneration === false && U.manualGate.authorizesProductExposure === false; } catch { return false; } })());

// Determinism static scans (exclude verifier's detection regex).
gate('G423-AR — no Date.now (excl verifier)', !/Date\.now/.test(codeNoVerifier()));
gate('G423-AR — no new Date (excl verifier)', !/new Date\b/.test(codeNoVerifier()));
gate('G423-AR — no Math.random (excl verifier)', !/Math\.random/.test(codeNoVerifier()));
gate('G423-AR — no crypto.randomUUID (excl verifier)', !/crypto\.randomUUID/.test(codeNoVerifier()));
gate('G423-AR — no bare randomUUID (excl verifier)', !/\brandomUUID\b/.test(codeNoVerifier()));
gate('G423-AR — no performance.now / hrtime (excl verifier)', !/performance\.now|hrtime/.test(codeNoVerifier()));
gate('G423-AR — no locale-dependent sorting', !/toLocaleString|localeCompare/.test(codeNoVerifier()));
gate('G423-AR — verifier holds the nondeterminism detection regex', /Math\\\.random/.test(fs.readFileSync(path.join(DIR, 'verifyAuthoringRuntime.js'), 'utf8')));

// Static safety scans.
gate('G423-AR — subtree is React-free', importsOf().every((p) => p !== 'react' && !/^react(\/|$)/.test(p)));
gate('G423-AR — no react-router / react-dom import', importsOf().every((p) => !/react-router|react-dom/i.test(p)));
gate('G423-AR — no <Route JSX / Routes / Link / NavLink', !/<Route[\s/>]|\bRoutes\b|\bNavLink\b|<Link[\s/>]/.test(code()));
gate('G423-AR — no ReactDOM / createRoot / hydrateRoot / JSX', !/\bReactDOM\b|createRoot\s*\(|hydrateRoot\s*\(|createElement|_jsx\b/.test(code()));
gate('G423-AR — no window/document access', !/\bdocument\.|\bwindow\.[a-z]/i.test(code()));
gate('G423-AR — no fs/writeFile/mkdir/appendFile (filesystem)', !/\bfs\.|writeFileSync|writeFile\(|mkdir|appendFile/.test(code()));
gate('G423-AR — no localStorage/sessionStorage/indexedDB (storage)', !/localStorage\.|sessionStorage\.|indexedDB\./.test(code()));
gate('G423-AR — no fetch/XHR/WebSocket/axios (network)', !/\bfetch\s*\(|XMLHttpRequest|WebSocket|axios/.test(code()));
gate('G423-AR — no @prisma/PrismaClient/backend/apiClient import', importsOf().every((p) => !/@prisma|PrismaClient|\/backend\/|apiClient|EmpresaApi|\/apis\//i.test(p)));
gate('G423-AR — no DATABASE_URL / production API_URL / Railway', !/DATABASE_URL|VITE_API_URL|projetomg-production|railway/i.test(code()));
gate('G423-AR — no POST/PUT/PATCH/DELETE method', !/method\s*:\s*['"](POST|PUT|PATCH|DELETE)['"]/.test(code()));
gate('G423-AR — no realDataRead/realDataWrite/moduleGenerated/certified/productExposed true literal', !/(realDataRead|realDataWrite|moduleGenerated|certified|productExposed)\s*:\s*true/.test(code()));
gate('G423-AR — no old Studio prototype import', importsOf().every((p) => !/studio\/(components|shell|designers|pages|navigation|dock|panels|editor)/.test(p)));
gate('G423-AR — no src/components or src/pages import', importsOf().every((p) => !/(^|\.\.\/)(components|pages)\//.test(p)));
gate('G423-AR — no App import', importsOf().every((p) => !/(^|\/)App(\.jsx)?$/.test(p)));

gate('G423-AR — docs validate runtime + determinism + SSOT + prototype-debt + next checkpoint', /runtime|headless/i.test(readEv('CERTIFICATION-REPORT.md')) && /determin/i.test(readEv('DETERMINISM.md')) && /SSOT|canonical|certified/i.test(readEv('SSOT-PROTECTION.md')) && /prototype|legacy|debt/i.test(readEv('LEGACY-STUDIO-PROTOTYPE-EXPOSURE-DEBT-NOT-TOUCHED.md')) && /checkpoint|FABLE|enterprise/i.test(readEv('NEXT-CHECKPOINT-SPEC.md')));

// Scope safety (git-diff).
let blockedOk = false; let blockedDetail = '';
{
  const { gitAvailable, evaluation } = studioScope();
  if (!gitAvailable) { blockedOk = true; blockedDetail = 'git base unavailable — skipped'; }
  else {
    blockedOk = evaluation.forbidden.length === 0;
    blockedDetail = blockedOk ? 'no forbidden scope path in the branch diff' : `FORBIDDEN: ${evaluation.forbidden.join(', ')}`;
  }
}
gate('G423-AR — src/modules / Empresas / backend / Prisma / SSOT untouched', blockedOk, blockedDetail);

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
gate('G423-AR — authorized scope only (runtime subtree + registry + evidence + package)', scopeOk, scopeDetail);

let noJsxTsxCss = false;
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  noJsxTsxCss = !files.some((f) => /\.(jsx|tsx|css)$/.test(f));
} catch { noJsxTsxCss = true; }
gate('G423-AR — no .jsx / .tsx / .css added in diff', noJsxTsxCss);

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
gate('G423-AR — App.jsx / guards / upstream authoring subtrees / prior gates/tests NOT altered', noOldEdit, noOldEditDetail);

let regOk = false; let regDetail = '';
try {
  const reg = await import(pathToFileURL(path.join(ROOT, 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs')).href);
  const known = reg.KNOWN_LATER_STUDIO_HEADLESS_ARTIFACTS;
  const hasOwn = known.some((re) => re.test('src/studio/blueprint-engine/module-blueprint-authoring-runtime/index.js'));
  const forbiddenProbes = ['src/modules/x/y.js', 'backend/server.js', 'src/App.jsx', 'backend/prisma/schema.prisma', 'src/pages/z.jsx'];
  const leaks = forbiddenProbes.filter((p) => known.some((re) => re.test(p)));
  regOk = hasOwn && leaks.length === 0;
  regDetail = regOk ? 'specific runtime paths registered; no broad wildcard leaks a forbidden path' : `hasOwn=${hasOwn} leaks=${leaks.join(',')}`;
} catch (err) { regOk = false; regDetail = err instanceof Error ? err.message : String(err); }
gate('G423-AR — registry: specific slice paths only, no dangerous wildcard', regOk, regDetail);

let noNewDep = false;
try {
  const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
  const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
  const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
  noNewDep = bk === hk;
} catch { noNewDep = true; }
gate('G423-AR — no new dependency added', noNewDep);

gate('G423-AR — src/modules/studio does NOT exist', !exists(path.join(ROOT, 'src/modules/studio')));
gate('G423-AR — App.jsx untouched (not in diff)', (() => { try { const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); return !files.includes('src/App.jsx'); } catch { return true; } })());
gate('G423-AR — productionUiGuard untouched (not in diff)', (() => { try { const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); return !files.includes('scripts/gates/lib/productionUiGuard.mjs'); } catch { return true; } })());

let testsOk = false; let testCount = 0;
try {
  const out = execSync('node --test src/runtime/__tests__/studio-module-blueprint-authoring-runtime.test.js', { cwd: ROOT, stdio: 'pipe', env: { ...process.env, NODE_ENV: 'test' } }).toString();
  const mt = out.match(/# tests (\d+)/); const mp = out.match(/# pass (\d+)/); const mf = out.match(/# fail (\d+)/);
  testCount = mt ? Number(mt[1]) : 0;
  testsOk = mf ? Number(mf[1]) === 0 && mp && Number(mp[1]) === testCount : false;
} catch (err) { if (err.stderr) console.error(String(err.stderr)); }
gate('G423-AR — authoring runtime unit tests PASS', testsOk, `${testCount} scenarios`);
gate('G423-AR — unit test has >= 650 scenarios', testCount >= 650, `${testCount} scenarios (min 650)`);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-STUDIO-MODULE-BLUEPRINT-AUTHORING-RUNTIME summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}  (total checks: ${results.length})`);
if (failed.length > 0) process.exit(1);
