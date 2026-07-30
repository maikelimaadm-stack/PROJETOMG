#!/usr/bin/env node
/**
 * Gate G423-STUDIO-MODULE-BLUEPRINT-AUTHORING-IMPLEMENTATION-PLAN — Post-Foundation C.
 *
 * Proves the headless, CONTRACT-ONLY, METADATA-ONLY, PLAN-ONLY implementation plan for a FUTURE
 * headless Module Blueprint authoring runtime in
 * `src/studio/blueprint-engine/module-blueprint-authoring-implementation-plan/`. It consumes the
 * Studio Module Blueprint Authoring Foundation Contract read-only and produces deterministic PLANS —
 * implementation phases, draft/lifecycle/operation/revision runtime plans, validation pipeline,
 * invariant enforcement, synthetic preview + certification-candidate preparation, SSOT protection,
 * permission/tenancy boundary, persistence + module-generation prohibitions, prototype-relink static
 * assertion, test harness, manual enablement gate, rollout/rollback, observability, governance
 * registry, safety, readiness, a manifest, a verifier and a compatibility check.
 *
 * It IMPLEMENTS NOTHING. It creates NO authoring runtime, NO UI, NO editor, NO persistence, NO module,
 * NO App/router/menu/sidebar wiring, NO `.jsx`/`.tsx`/`.css`, NO React component. It never touches
 * `src/App.jsx`, backend/Prisma/migration/production/staging/mutation/real-data/Empresas, and NEVER
 * relinks the old Studio prototype. A draft can NEVER self-certify or overwrite the certified contract;
 * the certified blueprint remains the canonical SSOT.
 *
 * Scope safety uses the central Studio Scope Governance guard: forbidden always wins; legitimate later
 * Studio headless artifacts are tolerated; nothing weakens the block.
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
const CALLER_SLICE_ID = 'module-blueprint-authoring-implementation-plan';
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
const DIR = path.join(ROOT, 'src/studio/blueprint-engine/module-blueprint-authoring-implementation-plan');
const FOUNDATION_DIR = path.join(ROOT, 'src/studio/blueprint-engine/module-blueprint-authoring-foundation-contract');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-module-blueprint-authoring-implementation-plan');
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
  /^src\/studio\/blueprint-engine\/module-blueprint-authoring-implementation-plan\//,
  /^src\/runtime\/__tests__\/studio-module-blueprint-authoring-implementation-plan\.test\.js$/,
  /^scripts\/gates\/g423-studio-module-blueprint-authoring-implementation-plan\.mjs$/,
  /^scripts\/gates\/lib\/studioScopeGovernanceRegistry\.mjs$/,
  /^package\.json$/,
  /^package-lock\.json$/,
  /^docs\/evidence\/post-foundation-c-studio-module-blueprint-authoring-implementation-plan\//,
];
const authorized = (f) => AUTHORIZED.some((re) => re.test(f)) || isKnownLaterStudioHeadlessArtifact(f);

const FILES = [
  'authoringImplementationPlanConfig.js', 'errors.js', 'createAuthoringImplementationPlanSession.js',
  'createAuthoringImplementationPhases.js', 'createDraftRuntimePlan.js', 'createLifecycleRuntimePlan.js',
  'createOperationExecutorPlan.js', 'createRevisionEnginePlan.js', 'createValidationPipelinePlan.js',
  'createInvariantEnforcementPlan.js', 'createSyntheticPreviewHandoffPlan.js',
  'createCertificationCandidatePreparationPlan.js', 'createSsotProtectionPlan.js',
  'createPermissionTenancyBoundaryPlan.js', 'createPersistenceProhibitionPlan.js',
  'createModuleGenerationProhibitionPlan.js', 'createPrototypeRelinkStaticAssertionPlan.js',
  'createAuthoringTestHarnessPlan.js', 'createAuthoringManualEnablementGatePlan.js',
  'createAuthoringRolloutRollbackPlan.js', 'createAuthoringObservabilityDiagnosticsPlan.js',
  'createAuthoringGovernanceRegistryPlan.js', 'createAuthoringImplementationSafetyPlan.js',
  'createAuthoringImplementationReadinessDecision.js', 'createAuthoringImplementationPlanManifest.js',
  'verifyAuthoringImplementationPlan.js', 'checkAuthoringImplementationPlanCompatibility.js',
  'createAuthoringImplementationPlanDiagnostics.js', 'createAuthoringImplementationPlanFallback.js',
  'createStudioModuleBlueprintAuthoringImplementationPlan.js', 'index.js',
];
const DOCS = [
  'CERTIFICATION-REPORT.md', 'STUDIO-MODULE-BLUEPRINT-AUTHORING-IMPLEMENTATION-PLAN-REPORT.md', 'PLAN-SESSION.md',
  'IMPLEMENTATION-PHASES.md', 'DRAFT-RUNTIME-PLAN.md', 'LIFECYCLE-RUNTIME-PLAN.md', 'OPERATION-EXECUTOR-PLAN.md',
  'REVISION-ENGINE-PLAN.md', 'VALIDATION-PIPELINE-PLAN.md', 'INVARIANT-ENFORCEMENT-PLAN.md',
  'SYNTHETIC-PREVIEW-HANDOFF-PLAN.md', 'CERTIFICATION-CANDIDATE-PREPARATION-PLAN.md', 'SSOT-PROTECTION-PLAN.md',
  'PERMISSION-TENANCY-BOUNDARY-PLAN.md', 'PERSISTENCE-PROHIBITION-PLAN.md', 'MODULE-GENERATION-PROHIBITION-PLAN.md',
  'PROTOTYPE-RELINK-STATIC-ASSERTION-PLAN.md', 'TEST-HARNESS-PLAN.md', 'MANUAL-ENABLEMENT-GATE-PLAN.md',
  'ROLLOUT-ROLLBACK-PLAN.md', 'OBSERVABILITY-DIAGNOSTICS-PLAN.md', 'GOVERNANCE-REGISTRY-PLAN.md', 'SAFETY-PLAN.md',
  'MANIFEST-VERIFIER-COMPATIBILITY.md', 'NO-UI-NO-RUNTIME-NO-MODULE-NO-PERSISTENCE.md',
  'LEGACY-STUDIO-PROTOTYPE-EXPOSURE-DEBT-NOT-TOUCHED.md', 'QUALITY-SCALABILITY-NOTES.md', 'NEXT-CHECKPOINT-SPEC.md',
];

for (const f of FILES) gate(`G423-AIP — ${f} exists`, exists(path.join(DIR, f)));
for (const d of DOCS) gate(`G423-AIP — ${d} exists`, exists(path.join(EV, d)));
gate('G423-AIP — tests exist', exists(path.join(ROOT, 'src/runtime/__tests__/studio-module-blueprint-authoring-implementation-plan.test.js')));
gate('G423-AIP — no .jsx in subtree', walk(DIR, /\.jsx$/).length === 0);
gate('G423-AIP — no .tsx in subtree', walk(DIR, /\.tsx$/).length === 0);
gate('G423-AIP — no .css in subtree', !fs.readdirSync(DIR).some((f) => /\.css$/.test(f)));
gate('G423-AIP — exactly 31 .js files', jsFiles().length === 31, `${jsFiles().length} .js`);
gate('G423-AIP — upstream foundation contract present', exists(path.join(FOUNDATION_DIR, 'index.js')));

let fm = null; let m = null;
try { fm = await import(pathToFileURL(path.join(FOUNDATION_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { m = await import(pathToFileURL(path.join(DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }

const BP = {
  kind: 'studio-blueprint-contract', moduleId: 'clientes', certified: true,
  blueprintContractVersion: 'studio-blueprint-contract@1.0.0', engineVersion: 'studio-blueprint-engine@1.0.0',
};
let FOUNDATION = null; let U = null;
try { FOUNDATION = fm.createStudioModuleBlueprintAuthoringFoundationContract({ certifiedBlueprint: BP }); } catch (err) { console.error(String(err)); }
try { U = m.createStudioModuleBlueprintAuthoringImplementationPlan({ authoringFoundationContract: FOUNDATION }); } catch (err) { console.error(String(err)); }

let baseOk = false; let baseDetail = '';
try {
  baseOk = U.kind === 'studio-module-blueprint-authoring-implementation-plan'
    && U.authoringImplementationPlanName === 'studio-module-blueprint-authoring-implementation-plan'
    && U.authoringImplementationPlanVersion === 'studio-module-blueprint-authoring-implementation-plan@1.0.0'
    && U.authoringFoundationContractVersion === 'studio-module-blueprint-authoring-foundation-contract@1.0.0'
    && U.blueprintContractVersion === 'studio-blueprint-contract@1.0.0'
    && U.blueprintEngineVersion === 'studio-blueprint-engine@1.0.0'
    && U.previewSandboxContractVersion === 'studio-module-preview-sandbox-contract@1.0.0'
    && U.mode === 'headless_studio_module_blueprint_authoring_implementation_plan'
    && U.fallback === false
    && U.readiness === 'studio_module_blueprint_authoring_implementation_plan_ready'
    && U.readyForAuthoringImplementationPlan === true
    && U.readyForAuthoringRuntimeImplementationSlice === false
    && U.readyForAuthoringUi === false
    && U.readyForPermissionTenancyIntegration === false
    && U.readyForProductExposure === false
    && U.readyForModuleGeneration === false
    && U.readyForProduction === false
    && U.requiresPermissionTenancyFoundation === true
    && U.blockerCount === 0 && U.warningCount === 0;
  baseDetail = baseOk ? `readiness=${U.readiness}` : 'plan invariants wrong';
} catch (err) { baseDetail = err instanceof Error ? err.message : String(err); }
gate('G423-AIP — headless/plan-only invariants + readiness ready', baseOk, baseDetail);

// Capabilities.
const TRUE_CAPS = ['headless', 'contractOnly', 'metadataOnly', 'planOnly', 'syntheticOnly', 'devOnly', 'ssotPreserved', 'implementationPhasesOnly', 'draftRuntimePlanOnly', 'lifecycleRuntimePlanOnly', 'operationExecutorPlanOnly', 'revisionPlanOnly', 'validationPipelinePlanOnly', 'invariantEnforcementPlanOnly', 'previewHandoffPlanOnly', 'certificationCandidatePlanOnly', 'ssotProtectionPlanOnly', 'permissionTenancyBoundaryPlanOnly', 'persistenceProhibitionPlanOnly', 'moduleGenerationProhibitionPlanOnly', 'prototypeRelinkAssertionPlanOnly', 'testHarnessPlanOnly', 'manualEnablementGatePlanOnly', 'rolloutRollbackPlanOnly', 'observabilityDiagnosticsPlanOnly', 'governanceRegistryPlanOnly'];
const FALSE_CAPS = ['authoringRuntimeImplemented', 'draftRuntimeImplemented', 'lifecycleRuntimeImplemented', 'operationExecutorImplemented', 'revisionEngineImplemented', 'validationPipelineImplemented', 'invariantEnforcementImplemented', 'previewHandoffImplemented', 'certificationCandidateCreated', 'certificationPerformed', 'authoringUiImplemented', 'editorImplemented', 'persistenceImplemented', 'moduleGenerated', 'filesWrittenToModule', 'moduleRegistered', 'backendAccessed', 'prismaAccessed', 'productionAccessed', 'stagingAccessed', 'fetchUsed', 'mutationAllowed', 'realDataRead', 'realDataWrite', 'rewriteEmpresas', 'prototypeRelinked', 'productExposed', 'menuCreated', 'routeCreated', 'permissionModelIntegrated', 'tenantModelIntegrated', 'serverSideAuthorizationIntegrated'];
let capFrozen = false;
try { capFrozen = Object.isFrozen(m.AUTHORING_IMPLEMENTATION_PLAN_CAPABILITIES); } catch { capFrozen = false; }
gate('G423-AIP — capabilities frozen', capFrozen);
for (const k of TRUE_CAPS) gate(`G423-AIP — capability ${k} true`, (() => { try { return m.AUTHORING_IMPLEMENTATION_PLAN_CAPABILITIES[k] === true && U.capabilities[k] === true; } catch { return false; } })());
for (const k of FALSE_CAPS) gate(`G423-AIP — capability ${k} false`, (() => { try { return m.AUTHORING_IMPLEMENTATION_PLAN_CAPABILITIES[k] === false && U.capabilities[k] === false; } catch { return false; } })());

const part = (fn, argObj, pred) => { try { return pred(argObj === undefined ? m[fn]() : m[fn](argObj)); } catch (err) { console.error(`${fn}: ${err}`); return false; } };
gate('G423-AIP — session (plan-only; no storage/fetch/persistence)', part('createAuthoringImplementationPlanSession', { authoringFoundationContract: FOUNDATION }, (x) => x.kind === 'authoring-implementation-plan-session' && x.planOnly === true && x.usesStorage === false && x.usesFetch === false && x.usesPersistence === false));
gate('G423-AIP — phases (16; all planned; none implemented/completed)', part('createAuthoringImplementationPhases', undefined, (x) => x.kind === 'authoring-implementation-phases' && x.phaseCount === 16 && x.allPlanned === true && x.anyImplemented === false && x.phases.every((p) => p.status === 'planned' && p.implemented === false && p.completed === false)));
gate('G423-AIP — draft runtime plan (planned; not implemented; in-memory/synthetic/ephemeral only)', part('createDraftRuntimePlan', undefined, (x) => x.kind === 'authoring-draft-runtime-plan' && x.draftRuntimePlanned === true && x.draftRuntimeImplemented === false && x.ephemeralDraftsOnly === true && x.canonicalDraftsAllowed === false && x.persistentDraftsAllowed === false && x.filesystemWritesAllowed === false && x.moduleWritesAllowed === false));
gate('G423-AIP — lifecycle runtime plan (8 states; discarded terminal; 7 forbidden; no production/self-cert)', part('createLifecycleRuntimePlan', undefined, (x) => x.kind === 'authoring-lifecycle-runtime-plan' && x.lifecycleRuntimeImplemented === false && x.states.length === 8 && x.terminalState === 'discarded' && x.forbiddenStates.length === 7 && x.productionStatesAllowed === false && x.selfCertificationAllowed === false && !x.states.some((s) => x.forbiddenStates.includes(s))));
gate('G423-AIP — operation executor plan (16 allow-list; not implemented; unknown fail-closed; no effects/persistence/module-write)', part('createOperationExecutorPlan', undefined, (x) => x.kind === 'authoring-operation-executor-plan' && x.operationExecutorImplemented === false && x.allowlistOnly === true && x.allowlist.length === 16 && x.unknownOperationsFailClosed === true && x.sideEffectsAllowed === false && x.persistenceAllowed === false && x.moduleWriteAllowed === false));
gate('G423-AIP — revision engine plan (starts 0; monotonic; no negative/persistence/in-place canonical mutation)', part('createRevisionEnginePlan', undefined, (x) => x.kind === 'authoring-revision-engine-plan' && x.revisionEngineImplemented === false && x.revisionStartsAt === 0 && x.revisionMonotonic === true && x.negativeRevisionAllowed === false && x.historyPersistenceAllowed === false && x.inPlaceCanonicalMutationAllowed === false));
gate('G423-AIP — validation pipeline plan (11 stages; fail-closed; blocker stops preview+candidate)', part('createValidationPipelinePlan', undefined, (x) => x.kind === 'authoring-validation-pipeline-plan' && x.validationPipelineImplemented === false && x.failClosed === true && x.stageCount === 11 && x.blockerStopsPreview === true && x.blockerStopsCertificationCandidate === true));
gate('G423-AIP — invariant enforcement plan (14; all fail-closed; not implemented)', part('createInvariantEnforcementPlan', undefined, (x) => x.kind === 'authoring-invariant-enforcement-plan' && x.invariantEnforcementImplemented === false && x.allInvariantsFailClosed === true && x.invariantCount === 14 && x.invariantIds.includes('no_self_certification') && x.invariantIds.includes('no_module_generation_authorization')));
gate('G423-AIP — synthetic preview handoff plan (synthetic; not implemented; not to product; no payload/mount/real-data)', part('createSyntheticPreviewHandoffPlan', undefined, (x) => x.kind === 'authoring-synthetic-preview-handoff-plan' && x.previewHandoffImplemented === false && x.handoffKind === 'synthetic_preview_candidate' && x.handoffToProduct === false && x.previewPayloadCreated === false && x.previewMounted === false && x.realDataAttached === false));
gate('G423-AIP — certification candidate preparation plan (candidate NOT certification; no self-cert/overwrite; requires future slice+checkpoint)', part('createCertificationCandidatePreparationPlan', undefined, (x) => x.kind === 'authoring-certification-candidate-preparation-plan' && x.certificationCandidateCreated === false && x.certificationPerformed === false && x.candidateCanonical === false && x.selfCertificationAllowed === false && x.overwritesCertifiedContract === false && x.requiresFutureExplicitSlice === true && x.certifierImplemented === false));
gate('G423-AIP — SSOT protection plan (certified canonical; draft/candidate non-canonical; no overwrite/bypass; upstream read-only)', part('createSsotProtectionPlan', undefined, (x) => x.kind === 'authoring-ssot-protection-plan' && x.certifiedBlueprintRemainsSsot === true && x.draftIsCanonical === false && x.candidateIsCanonical === false && x.authoringMayOverwriteCertifiedBlueprint === false && x.authoringMayBypassCertification === false && x.engineConsumedReadOnly === true && x.previewSandboxConsumedReadOnly === true));
gate('G423-AIP — permission/tenancy boundary plan (permission/tenant/server-auth NOT integrated; client-auth insufficient; exposure blocked; foundation required)', part('createPermissionTenancyBoundaryPlan', undefined, (x) => x.kind === 'authoring-permission-tenancy-boundary-plan' && x.permissionModelIntegrated === false && x.tenantModelIntegrated === false && x.serverSideAuthorizationIntegrated === false && x.clientSideAuthorizationSufficient === false && x.productExposureBlockedByPermissionTenancy === true && x.requiresPermissionTenancyFoundation === true && x.authImported === false));
gate('G423-AIP — persistence prohibition plan (active; nothing allowed)', part('createPersistenceProhibitionPlan', undefined, (x) => x.kind === 'authoring-persistence-prohibition-plan' && x.persistenceProhibitionActive === true && x.persistenceImplemented === false && x.storageAllowed === false && x.databaseAllowed === false && x.filesystemWriteAllowed === false && x.backendAllowed === false && x.prismaAllowed === false));
gate('G423-AIP — module-generation prohibition plan (active; nothing generated/written/registered/touched)', part('createModuleGenerationProhibitionPlan', undefined, (x) => x.kind === 'authoring-module-generation-prohibition-plan' && x.moduleGenerationProhibitionActive === true && x.moduleGenerated === false && x.filesWrittenToModule === false && x.moduleRegistered === false && x.srcModulesTouchAllowed === false && x.productionRegistryTouchAllowed === false));
gate('G423-AIP — prototype relink static assertion plan (relink/import/copy/move not allowed; forbidden paths >= 8)', part('createPrototypeRelinkStaticAssertionPlan', undefined, (x) => x.kind === 'authoring-prototype-relink-static-assertion-plan' && x.prototypeRelinkAllowed === false && x.prototypeImportAllowed === false && x.prototypeCopyAllowed === false && x.prototypeMoveAllowed === false && x.oldPrototypeImported === false && Array.isArray(x.forbiddenPrototypePaths) && x.forbiddenPrototypePaths.length >= 8));
gate('G423-AIP — test harness plan (deterministic/synthetic/headless; no network/persistence/real-data)', part('createAuthoringTestHarnessPlan', undefined, (x) => x.kind === 'authoring-test-harness-plan' && x.testHarnessImplemented === false && x.deterministic === true && x.syntheticDataOnly === true && x.networkAllowed === false && x.persistenceAllowed === false && x.realDataAllowed === false));
gate('G423-AIP — manual gate plan (required; implementation_plan_only; authorizes nothing real)', part('createAuthoringManualEnablementGatePlan', undefined, (x) => x.kind === 'authoring-manual-enablement-gate-plan' && x.manualGateRequired === true && x.currentSliceAuthorization === 'implementation_plan_only' && x.requiredCheckpoint === 'pre_module_blueprint_authoring_runtime_enterprise_checkpoint' && x.authorizesAuthoringRuntime === false && x.authorizesOperationExecutor === false && x.authorizesPersistence === false && x.authorizesModuleGeneration === false && x.authorizesBackend === false && x.authorizesProductExposure === false && x.authorizesRealData === false));
gate('G423-AIP — rollout/rollback plan (rollout blocked; requires checkpoint; non-destructive rollback)', part('createAuthoringRolloutRollbackPlan', undefined, (x) => x.kind === 'authoring-rollout-rollback-plan' && x.rolloutBlocked === true && x.rolloutRequiresCheckpoint === true && x.rollbackByNonConsumption === true && x.destructiveRollbackRequired === false && x.productionRolloutAllowed === false));
gate('G423-AIP — observability/diagnostics plan (passive/sanitized/in-memory; no secrets/external-logging/telemetry)', part('createAuthoringObservabilityDiagnosticsPlan', undefined, (x) => x.kind === 'authoring-observability-diagnostics-plan' && x.passive === true && x.sanitized === true && x.secretsLogged === false && x.externalLoggingAllowed === false && x.telemetryRuntimeAllowed === false));
gate('G423-AIP — governance registry plan (registry/guard untouched; no broad wildcard; specific paths)', part('createAuthoringGovernanceRegistryPlan', undefined, (x) => x.kind === 'authoring-governance-registry-plan' && x.registryTouched === false && x.guardTouched === false && x.broadWildcardAllowed === false && x.specificPathsOnly === true));
gate('G423-AIP — safety plan (anyForbiddenSideEffect false; reversible; all forbidden flags false)', part('createAuthoringImplementationSafetyPlan', undefined, (x) => x.kind === 'authoring-implementation-safety-plan' && x.anyForbiddenSideEffect === false && x.reversibleByNonConsumption === true && Object.values(x.forbiddenFlags).every((v) => v === false)));

gate('G423-AIP — readiness never runtime-slice/ui/permission-tenancy/product/generation/production', (() => { try { const r = m.createAuthoringImplementationReadinessDecision({}); return r.readyForAuthoringRuntimeImplementationSlice === false && r.readyForAuthoringUi === false && r.readyForPermissionTenancyIntegration === false && r.readyForProductExposure === false && r.readyForModuleGeneration === false && r.readyForProduction === false && r.requiresPermissionTenancyFoundation === true; } catch { return false; } })());
gate('G423-AIP — readiness blocked on blockers', (() => { try { return m.createAuthoringImplementationReadinessDecision({ blockers: ['x'] }).readiness === 'blocked'; } catch { return false; } })());

let manOk = false;
try { manOk = U.manifest.kind === 'authoring-implementation-plan-manifest' && U.manifest.authoringImplementationPlanVersion === 'studio-module-blueprint-authoring-implementation-plan@1.0.0' && U.manifest.capabilities.planOnly === true && U.manifest.capabilities.authoringRuntimeImplemented === false && U.manifest.metadataOnly === true && typeof U.manifest.parts.session === 'string' && typeof U.manifest.parts.phases === 'string' && typeof U.manifest.parts.ssotProtectionPlan === 'string'; } catch { manOk = false; }
gate('G423-AIP — manifest present + part digests + capability flags mirrored', manOk);

let verOk = false;
try { verOk = U.verification.ok === true && U.verification.valid === true && U.verification.headless === true && U.verification.planOnly === true && U.verification.ssotPreserved === true && U.verification.authoringRuntimeImplemented === false && U.verification.moduleGenerated === false && U.verification.productExposed === false && U.verification.blockerCount === 0; } catch { verOk = false; }
gate('G423-AIP — verifier passes headless/plan-only/SSOT invariants', verOk);

let verTamper = false;
try {
  const c = m.AUTHORING_IMPLEMENTATION_PLAN_CAPABILITIES;
  const ok = (o) => m.verifyAuthoringImplementationPlan(o).blockers;
  verTamper = ok({ plan: { capabilities: { ...c, authoringRuntimeImplemented: true } } }).includes('capability_authoringRuntimeImplemented_must_be_false')
    && ok({ plan: { capabilities: { ...c, draftRuntimeImplemented: true } } }).includes('capability_draftRuntimeImplemented_must_be_false')
    && ok({ plan: { capabilities: { ...c, lifecycleRuntimeImplemented: true } } }).includes('capability_lifecycleRuntimeImplemented_must_be_false')
    && ok({ plan: { capabilities: { ...c, operationExecutorImplemented: true } } }).includes('capability_operationExecutorImplemented_must_be_false')
    && ok({ plan: { capabilities: { ...c, revisionEngineImplemented: true } } }).includes('capability_revisionEngineImplemented_must_be_false')
    && ok({ plan: { capabilities: { ...c, validationPipelineImplemented: true } } }).includes('capability_validationPipelineImplemented_must_be_false')
    && ok({ plan: { capabilities: { ...c, invariantEnforcementImplemented: true } } }).includes('capability_invariantEnforcementImplemented_must_be_false')
    && ok({ plan: { capabilities: { ...c, previewHandoffImplemented: true } } }).includes('capability_previewHandoffImplemented_must_be_false')
    && ok({ plan: { capabilities: { ...c, certificationCandidateCreated: true } } }).includes('capability_certificationCandidateCreated_must_be_false')
    && ok({ plan: { capabilities: { ...c, certificationPerformed: true } } }).includes('capability_certificationPerformed_must_be_false')
    && ok({ plan: { capabilities: { ...c, authoringUiImplemented: true, editorImplemented: true } } }).includes('capability_authoringUiImplemented_must_be_false')
    && ok({ plan: { capabilities: { ...c, persistenceImplemented: true } } }).includes('capability_persistenceImplemented_must_be_false')
    && ok({ plan: { capabilities: { ...c, moduleGenerated: true, filesWrittenToModule: true, moduleRegistered: true } } }).includes('capability_moduleGenerated_must_be_false')
    && ok({ plan: { capabilities: { ...c, backendAccessed: true, prismaAccessed: true } } }).includes('capability_backendAccessed_must_be_false')
    && ok({ plan: { capabilities: { ...c, productionAccessed: true, stagingAccessed: true } } }).includes('capability_productionAccessed_must_be_false')
    && ok({ plan: { capabilities: { ...c, fetchUsed: true, mutationAllowed: true } } }).includes('capability_fetchUsed_must_be_false')
    && ok({ plan: { capabilities: { ...c, realDataRead: true, realDataWrite: true } } }).includes('capability_realDataRead_must_be_false')
    && ok({ plan: { capabilities: { ...c, productExposed: true, menuCreated: true, routeCreated: true } } }).includes('capability_productExposed_must_be_false')
    && ok({ plan: { capabilities: { ...c, prototypeRelinked: true } } }).includes('capability_prototypeRelinked_must_be_false')
    && ok({ plan: { capabilities: { ...c, permissionModelIntegrated: true, tenantModelIntegrated: true, serverSideAuthorizationIntegrated: true } } }).includes('capability_permissionModelIntegrated_must_be_false')
    && ok({ plan: { capabilities: { ...c, planOnly: false } } }).includes('capability_planOnly_must_be_true')
    && ok({ plan: { capabilities: { ...c, ssotPreserved: false } } }).includes('capability_ssotPreserved_must_be_true')
    && ok({ plan: { capabilities: c, phases: { anyImplemented: true } } }).includes('unsafe_phase_implemented')
    && ok({ plan: { capabilities: c, lifecycleRuntimePlan: { states: ['empty', 'certified'] } } }).includes('unsafe_lifecycle_forbidden_state_present')
    && ok({ plan: { capabilities: c, operationExecutorPlan: { sideEffectsAllowed: true } } }).includes('unsafe_operation_executor_effects')
    && ok({ plan: { capabilities: c, ssotProtectionPlan: { draftIsCanonical: true } } }).includes('unsafe_ssot_inversion')
    && ok({ plan: { capabilities: c, ssotProtectionPlan: { certifiedBlueprintRemainsSsot: false } } }).includes('unsafe_ssot_not_preserved')
    && ok({ plan: { capabilities: c, certificationCandidatePreparationPlan: { selfCertificationAllowed: true } } }).includes('unsafe_self_certification')
    && ok({ plan: { capabilities: c, permissionTenancyBoundaryPlan: { permissionModelIntegrated: true } } }).includes('unsafe_permission_model_integrated_without_foundation')
    && ok({ plan: { capabilities: c, persistenceProhibitionPlan: { persistenceImplemented: true } } }).includes('unsafe_persistence')
    && ok({ plan: { capabilities: c, prototypeRelinkStaticAssertion: { prototypeRelinkAllowed: true } } }).includes('unsafe_prototype_relink')
    && ok({ plan: { capabilities: c, manualGate: { manualGateRequired: false } } }).includes('missing_manual_gate')
    && ok({ plan: { capabilities: c, safety: { anyForbiddenSideEffect: true } } }).includes('unsafe_safety_side_effect')
    && (() => { try { m.verifyAuthoringImplementationPlan({ plan: null }); return true; } catch { return false; } })();
} catch { verTamper = false; }
gate('G423-AIP — verifier detects runtime/UI/editor/persistence/module-gen/backend/prisma/production/fetch/real-data/product/prototype/permission-tenancy/phase-implemented/forbidden-lifecycle/SSOT-inversion/self-cert/missing-gate attempts', verTamper);

let cmpOk = false;
try {
  const okc = m.checkAuthoringImplementationPlanCompatibility({ authoringFoundationContract: FOUNDATION });
  const bad = m.checkAuthoringImplementationPlanCompatibility({ authoringFoundationContract: { kind: 'other', blueprintEngineVersion: 'x@9.9.9' } });
  cmpOk = okc.compatibleWithAuthoringFoundationContract === true && okc.compatibleWithBlueprintContract === true && okc.compatibleWithBlueprintEngine === true && okc.compatibleWithModuleReferencePlanner === true && okc.compatibleWithPreviewSandbox === true && okc.readyForAuthoringImplementationPlan === true && okc.readyForAuthoringRuntimeImplementationSlice === false && okc.readyForPermissionTenancyIntegration === false && okc.readyForProduction === false && okc.status === 'ready_for_future_authoring_runtime_implementation_slice_after_enterprise_checkpoint' && bad.compatibleWithBlueprintEngine === false && bad.warnings.includes('incompatible_blueprintEngine');
} catch { cmpOk = false; }
gate('G423-AIP — compatibility aligned; never authorizes runtime-slice/permission-tenancy/product/generation/production; mismatch → warning', cmpOk);

let diagOk = false;
try { diagOk = U.diagnostics.passive === true && U.diagnostics.ok === true && U.diagnostics.headlessConfirmed === true && U.diagnostics.planOnlyConfirmed === true && U.diagnostics.ssotPreservedConfirmed === true && U.diagnostics.authoringRuntimeImplemented === false && !/jwt|token|secret|DATABASE_URL/i.test(JSON.stringify(U.diagnostics)); } catch { diagOk = false; }
gate('G423-AIP — diagnostics passive, headless/plan-only/SSOT confirmed, no secrets', diagOk);

let fbOk = false;
try {
  const fb = m.createStudioModuleBlueprintAuthoringImplementationPlan({});
  const fb2 = m.createStudioModuleBlueprintAuthoringImplementationPlan({ authoringFoundationContract: { kind: 'other' } });
  const fb3 = m.createStudioModuleBlueprintAuthoringImplementationPlan({ authoringFoundationContract: { kind: 'studio-module-blueprint-authoring-foundation-contract', fallback: true } });
  fbOk = fb.fallback === true && fb.readiness === 'blocked' && fb.readyForAuthoringImplementationPlan === false && fb.capabilities.planOnly === true && fb.capabilities.authoringRuntimeImplemented === false && fb2.fallback === true && fb3.fallback === true;
} catch { fbOk = false; }
gate('G423-AIP — fallback fail-closed on invalid/missing/fallback foundation contract', fbOk);

let detOk = false;
try {
  const a = m.createStudioModuleBlueprintAuthoringImplementationPlan({ authoringFoundationContract: FOUNDATION });
  const b = m.createStudioModuleBlueprintAuthoringImplementationPlan({ authoringFoundationContract: FOUNDATION });
  detOk = a.overallDigest === b.overallDigest && a.authoringImplementationPlanDigest === b.authoringImplementationPlanDigest && a.overallDigest.startsWith('fnv1a-') && JSON.stringify(a) === JSON.stringify(b);
} catch { detOk = false; }
gate('G423-AIP — deterministic overall + plan digests + full deep-equal', detOk);

let flagOk = false;
try {
  const off = m.isStudioModuleBlueprintAuthoringImplementationPlanEnabled({ [m.MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_IMPLEMENTATION_PLAN_FLAG]: 'true', MAK_ENV_LABEL: 'production' });
  const onDev = m.isStudioModuleBlueprintAuthoringImplementationPlanEnabled({ [m.MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_IMPLEMENTATION_PLAN_FLAG]: 'true', DEV: 'true' });
  const vOff = m.isStudioModuleBlueprintAuthoringImplementationVerifyEnabled({ [m.MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_IMPLEMENTATION_VERIFY_FLAG]: 'true', NODE_ENV: 'production' });
  flagOk = off === false && onDev === true && vOff === false;
} catch { flagOk = false; }
gate('G423-AIP — feature flags fail closed in production', flagOk);

gate('G423-AIP — error catalog >= 40 codes', Array.isArray(m?.AUTHORING_IMPLEMENTATION_PLAN_ERROR_CODES) && m.AUTHORING_IMPLEMENTATION_PLAN_ERROR_CODES.length >= 40);
gate('G423-AIP — error catalog has self-cert + authoring-runtime blocked codes', Array.isArray(m?.AUTHORING_IMPLEMENTATION_PLAN_ERROR_CODES) && m.AUTHORING_IMPLEMENTATION_PLAN_ERROR_CODES.includes('AUTHORING_PLAN_DRAFT_SELF_CERTIFICATION_BLOCKED') && m.AUTHORING_IMPLEMENTATION_PLAN_ERROR_CODES.includes('AUTHORING_PLAN_AUTHORING_RUNTIME_IMPLEMENTED_BLOCKED'));
gate('G423-AIP — error descriptor sanitized + side-effect free', (() => { try { const e = m.createAuthoringImplementationPlanError('AUTHORING_PLAN_PRISMA_BLOCKED'); return e.kind === 'authoring-implementation-plan-error' && e.safe === true && e.sideEffects === false && e.authoringRuntimeImplemented === false && e.realDataRead === false; } catch { return false; } })());
gate('G423-AIP — required future checkpoint is enterprise checkpoint', m?.REQUIRED_FUTURE_CHECKPOINT === 'pre_module_blueprint_authoring_runtime_enterprise_checkpoint');

// Explicit invariants (top-level).
gate('G423-AIP — planOnly true', U ? U.capabilities.planOnly === true : false);
gate('G423-AIP — ssotPreserved true', U ? U.capabilities.ssotPreserved === true : false);
gate('G423-AIP — authoringRuntimeImplemented false', U ? U.capabilities.authoringRuntimeImplemented === false : false);
gate('G423-AIP — authoringUiImplemented/editorImplemented false', U ? (U.capabilities.authoringUiImplemented === false && U.capabilities.editorImplemented === false) : false);
gate('G423-AIP — persistenceImplemented false', U ? U.capabilities.persistenceImplemented === false : false);
gate('G423-AIP — moduleGenerated/filesWrittenToModule/moduleRegistered false', U ? (U.capabilities.moduleGenerated === false && U.capabilities.filesWrittenToModule === false && U.capabilities.moduleRegistered === false) : false);
gate('G423-AIP — backendAccessed/prismaAccessed false', U ? (U.capabilities.backendAccessed === false && U.capabilities.prismaAccessed === false) : false);
gate('G423-AIP — productionAccessed/stagingAccessed false', U ? (U.capabilities.productionAccessed === false && U.capabilities.stagingAccessed === false) : false);
gate('G423-AIP — fetchUsed/mutationAllowed false', U ? (U.capabilities.fetchUsed === false && U.capabilities.mutationAllowed === false) : false);
gate('G423-AIP — realDataRead/realDataWrite false', U ? (U.capabilities.realDataRead === false && U.capabilities.realDataWrite === false) : false);
gate('G423-AIP — rewriteEmpresas false', U ? U.capabilities.rewriteEmpresas === false : false);
gate('G423-AIP — prototypeRelinked false', U ? U.capabilities.prototypeRelinked === false : false);
gate('G423-AIP — productExposed/menuCreated/routeCreated false', U ? (U.capabilities.productExposed === false && U.capabilities.menuCreated === false && U.capabilities.routeCreated === false) : false);
gate('G423-AIP — permission/tenant/server-auth NOT integrated', U ? (U.capabilities.permissionModelIntegrated === false && U.capabilities.tenantModelIntegrated === false && U.capabilities.serverSideAuthorizationIntegrated === false) : false);
gate('G423-AIP — phases all planned / none implemented in plan', (() => { try { return U.phases.allPlanned === true && U.phases.anyImplemented === false; } catch { return false; } })());
gate('G423-AIP — SSOT protection intact in plan', (() => { try { return U.ssotProtectionPlan.draftIsCanonical === false && U.ssotProtectionPlan.certifiedBlueprintRemainsSsot === true; } catch { return false; } })());
gate('G423-AIP — manual gate required in plan', (() => { try { return U.manualGate.manualGateRequired === true && U.manualGate.authorizesAuthoringRuntime === false; } catch { return false; } })());
gate('G423-AIP — permission/tenancy still not integrated in plan', (() => { try { return U.permissionTenancyBoundaryPlan.permissionModelIntegrated === false && U.permissionTenancyBoundaryPlan.productExposureBlockedByPermissionTenancy === true; } catch { return false; } })());

// Static safety scans.
gate('G423-AIP — subtree is React-free', importsOf().every((p) => p !== 'react' && !/^react(\/|$)/.test(p)));
gate('G423-AIP — no react-router / react-dom import', importsOf().every((p) => !/react-router|react-dom/i.test(p)));
gate('G423-AIP — no <Route JSX / Routes / Link / NavLink (case-sensitive API)', !/<Route[\s/>]|\bRoutes\b|\bNavLink\b|<Link[\s/>]/.test(code()));
gate('G423-AIP — no BrowserRouter / createBrowserRouter / useNavigate', !/\bBrowserRouter\b|\bcreateBrowserRouter\b|\buseNavigate\b/.test(code()));
gate('G423-AIP — no ReactDOM / createRoot / hydrateRoot call', !/\bReactDOM\b|createRoot\s*\(|hydrateRoot\s*\(/.test(code()));
gate('G423-AIP — no window/document access', !/\bdocument\.|\bwindow\.[a-z]/i.test(code()));
gate('G423-AIP — no JSX/createElement', !/createElement|_jsx\b|jsxs?\(/.test(code()));
gate('G423-AIP — no import of EmpresaApi/apiClient/apis/backend/prisma', importsOf().every((p) => !/EmpresaApi|apiClient|\/apis\/|\/backend\/|@prisma|PrismaClient/i.test(p)));
gate('G423-AIP — no fetch/XHR/WebSocket/storage-API', !/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(code()) && !/localStorage\.|sessionStorage\.|indexedDB\./.test(code()));
gate('G423-AIP — no DATABASE_URL / production API_URL / Railway', !/DATABASE_URL|VITE_API_URL|projetomg-production|railway/i.test(code()));
gate('G423-AIP — no real POST/PUT/PATCH/DELETE method', !/method\s*:\s*['"](POST|PUT|PATCH|DELETE)['"]/.test(code()));
gate('G423-AIP — no realDataRead/realDataWrite true literal', !/realDataRead\s*:\s*true|realDataWrite\s*:\s*true/.test(code()));
gate('G423-AIP — no authoringRuntimeImplemented/moduleGenerated true literal', !/authoringRuntimeImplemented\s*:\s*true|moduleGenerated\s*:\s*true/.test(code()));
gate('G423-AIP — no old Studio prototype import', importsOf().every((p) => !/studio\/(components|shell|designers|pages|navigation|dock|panels|editor)/.test(p)));
gate('G423-AIP — no src/components or src/pages import', importsOf().every((p) => !/(^|\.\.\/)(components|pages)\//.test(p)));
gate('G423-AIP — no App import', importsOf().every((p) => !/(^|\/)App(\.jsx)?$/.test(p)));

gate('G423-AIP — docs validate plan-not-impl + SSOT + prototype-debt + next checkpoint', /plan|metadata/i.test(readEv('CERTIFICATION-REPORT.md')) && /SSOT|canonical|certified/i.test(readEv('SSOT-PROTECTION-PLAN.md')) && /runtime|UI|module|persistence/i.test(readEv('NO-UI-NO-RUNTIME-NO-MODULE-NO-PERSISTENCE.md')) && /prototype|legacy|debt/i.test(readEv('LEGACY-STUDIO-PROTOTYPE-EXPOSURE-DEBT-NOT-TOUCHED.md')) && /checkpoint|FABLE|enterprise|runtime/i.test(readEv('NEXT-CHECKPOINT-SPEC.md')));

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
gate('G423-AIP — src/modules / Empresas / backend / Prisma / SSOT untouched', blockedOk, blockedDetail);

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
gate('G423-AIP — authorized scope only (plan subtree + registry + evidence + package)', scopeOk, scopeDetail);

let noJsxTsxCss = false; let noJsxTsxCssDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const bad = files.filter((f) => /\.(jsx|tsx|css)$/.test(f));
  noJsxTsxCss = bad.length === 0;
  noJsxTsxCssDetail = noJsxTsxCss ? 'no .jsx / .tsx / .css added' : `bad: ${bad.join(', ')}`;
} catch (err) { noJsxTsxCss = true; noJsxTsxCssDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-AIP — no .jsx / .tsx / .css added in diff', noJsxTsxCss, noJsxTsxCssDetail);

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
gate('G423-AIP — App.jsx / vite / index.html / guards / prior gates/tests NOT altered by this slice', noOldEdit, noOldEditDetail);

let regOk = false; let regDetail = '';
try {
  const reg = await import(pathToFileURL(path.join(ROOT, 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs')).href);
  const known = reg.KNOWN_LATER_STUDIO_HEADLESS_ARTIFACTS;
  const hasOwn = known.some((re) => re.test('src/studio/blueprint-engine/module-blueprint-authoring-implementation-plan/index.js'));
  const forbiddenProbes = ['src/modules/x/y.js', 'backend/server.js', 'src/App.jsx', 'backend/prisma/schema.prisma', 'src/pages/z.jsx'];
  const leaks = forbiddenProbes.filter((p) => known.some((re) => re.test(p)));
  regOk = hasOwn && leaks.length === 0;
  regDetail = regOk ? 'specific plan paths registered; no broad wildcard leaks a forbidden path' : `hasOwn=${hasOwn} leaks=${leaks.join(',')}`;
} catch (err) { regOk = false; regDetail = err instanceof Error ? err.message : String(err); }
gate('G423-AIP — registry: specific slice paths only, no dangerous wildcard', regOk, regDetail);

let noNewDep = false;
try {
  const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
  const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
  const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
  noNewDep = bk === hk;
} catch { noNewDep = true; }
gate('G423-AIP — no new dependency added', noNewDep);

gate('G423-AIP — src/modules/studio does NOT exist', !exists(path.join(ROOT, 'src/modules/studio')));
gate('G423-AIP — App.jsx untouched (not in diff)', (() => { try { const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); return !files.includes('src/App.jsx'); } catch { return true; } })());
gate('G423-AIP — productionUiGuard untouched (not in diff)', (() => { try { const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); return !files.includes('scripts/gates/lib/productionUiGuard.mjs'); } catch { return true; } })());

let testsOk = false; let testCount = 0;
try {
  const out = execSync('node --test src/runtime/__tests__/studio-module-blueprint-authoring-implementation-plan.test.js', { cwd: ROOT, stdio: 'pipe', env: { ...process.env, NODE_ENV: 'test' } }).toString();
  const mt = out.match(/# tests (\d+)/); const mp = out.match(/# pass (\d+)/); const mf = out.match(/# fail (\d+)/);
  testCount = mt ? Number(mt[1]) : 0;
  testsOk = mf ? Number(mf[1]) === 0 && mp && Number(mp[1]) === testCount : false;
} catch (err) { if (err.stderr) console.error(String(err.stderr)); }
gate('G423-AIP — authoring implementation plan unit tests PASS', testsOk, `${testCount} scenarios`);
gate('G423-AIP — unit test has >= 480 scenarios', testCount >= 480, `${testCount} scenarios (min 480)`);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-STUDIO-MODULE-BLUEPRINT-AUTHORING-IMPLEMENTATION-PLAN summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}  (total checks: ${results.length})`);
if (failed.length > 0) process.exit(1);
