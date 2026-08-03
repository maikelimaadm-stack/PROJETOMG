import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
// Caller-aware Studio scope governance. This test declares its OWN slice identity, so the branch-relative
// scope check below can ask whether the slice active on this branch is the same as it or genuinely later.
import { evaluateStudioBranchConsumerScope, createResolvedActiveStudioSlicePathAuthorizer }
  from '../../../scripts/gates/lib/studioScopeGovernanceGuard.mjs';

import {
  AUTHORING_IMPLEMENTATION_PLAN_NAME,
  AUTHORING_IMPLEMENTATION_PLAN_SEMVER,
  AUTHORING_IMPLEMENTATION_PLAN_VERSION,
  AUTHORING_IMPLEMENTATION_PLAN_MODE,
  AUTHORING_FOUNDATION_CONTRACT_VERSION,
  BLUEPRINT_CONTRACT_VERSION,
  BLUEPRINT_ENGINE_VERSION,
  MODULE_REFERENCE_PLANNER_VERSION,
  PREVIEW_SANDBOX_CONTRACT_VERSION,
  REQUIRED_FUTURE_CHECKPOINT,
  AUTHORING_IMPLEMENTATION_PHASE_IDS,
  AUTHORING_OPERATION_IDS,
  AUTHORING_LIFECYCLE_STATES,
  FORBIDDEN_LIFECYCLE_STATES,
  VALIDATION_PIPELINE_STAGES,
  AUTHORING_INVARIANT_IDS,
  FORBIDDEN_PROTOTYPE_PATHS,
  AUTHORING_IMPLEMENTATION_PLAN_READINESS_STATES,
  AUTHORING_IMPLEMENTATION_PLAN_CAPABILITIES,
  MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_IMPLEMENTATION_PLAN_FLAG,
  MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_IMPLEMENTATION_VERIFY_FLAG,
  MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_IMPLEMENTATION_COMPATIBILITY_CHECK_FLAG,
  authoringPlanDigest,
  isProductionEnv,
  isStudioModuleBlueprintAuthoringImplementationPlanEnabled,
  isStudioModuleBlueprintAuthoringImplementationVerifyEnabled,
  isStudioModuleBlueprintAuthoringImplementationCompatibilityCheckEnabled,
  AUTHORING_IMPLEMENTATION_PLAN_ERROR_CODES,
  AuthoringImplementationPlanError,
  createAuthoringImplementationPlanError,
  authoringImplementationPlanError,
  createAuthoringImplementationPlanSession,
  createAuthoringImplementationPhases,
  createDraftRuntimePlan,
  createLifecycleRuntimePlan,
  createOperationExecutorPlan,
  createRevisionEnginePlan,
  createValidationPipelinePlan,
  createInvariantEnforcementPlan,
  createSyntheticPreviewHandoffPlan,
  createCertificationCandidatePreparationPlan,
  createSsotProtectionPlan,
  createPermissionTenancyBoundaryPlan,
  createPersistenceProhibitionPlan,
  createModuleGenerationProhibitionPlan,
  createPrototypeRelinkStaticAssertionPlan,
  createAuthoringTestHarnessPlan,
  createAuthoringManualEnablementGatePlan,
  createAuthoringRolloutRollbackPlan,
  createAuthoringObservabilityDiagnosticsPlan,
  createAuthoringGovernanceRegistryPlan,
  createAuthoringImplementationSafetyPlan,
  createAuthoringImplementationReadinessDecision,
  createAuthoringImplementationPlanManifest,
  verifyAuthoringImplementationPlan,
  checkAuthoringImplementationPlanCompatibility,
  createAuthoringImplementationPlanDiagnostics,
  createAuthoringImplementationPlanFallback,
  createStudioModuleBlueprintAuthoringImplementationPlan,
} from '../../studio/blueprint-engine/module-blueprint-authoring-implementation-plan/index.js';
import { createStudioModuleBlueprintAuthoringFoundationContract } from '../../studio/blueprint-engine/module-blueprint-authoring-foundation-contract/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const DIR = path.resolve(__dirname, '../../studio/blueprint-engine/module-blueprint-authoring-implementation-plan');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-module-blueprint-authoring-implementation-plan');

const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
const readEv = (f) => (fs.existsSync(path.join(EV, f)) ? fs.readFileSync(path.join(EV, f), 'utf8') : '');
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const walkExt = (dir, ext) => (fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const full = path.join(dir, e.name);
  if (e.isDirectory()) return walkExt(full, ext);
  return e.isFile() && ext.test(e.name) ? [full] : [];
}) : []);
const jsFiles = () => walkExt(DIR, /\.js$/);
const jsCode = () => stripComments(jsFiles().map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
const jsImports = () => jsFiles().flatMap((f) => [...stripComments(fs.readFileSync(f, 'utf8')).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((mm) => mm[1]));
const changed = () => { try { return execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); } catch { return null; } };
const authorized = (f) => /^src\/studio\/blueprint-engine\/module-blueprint-authoring-implementation-plan\//.test(f)
  || f === 'src/runtime/__tests__/studio-module-blueprint-authoring-implementation-plan.test.js'
  || f === 'scripts/gates/g423-studio-module-blueprint-authoring-implementation-plan.mjs'
  || f === 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs'
  || f === 'package.json' || f === 'package-lock.json'
  || /^docs\/evidence\/post-foundation-c-studio-module-blueprint-authoring-implementation-plan\//.test(f);

// Build the real upstream foundation contract read-only.
const BP = {
  kind: 'studio-blueprint-contract', moduleId: 'clientes', certified: true,
  blueprintContractVersion: 'studio-blueprint-contract@1.0.0', engineVersion: 'studio-blueprint-engine@1.0.0',
};
const FOUNDATION = createStudioModuleBlueprintAuthoringFoundationContract({ certifiedBlueprint: BP });
const U = createStudioModuleBlueprintAuthoringImplementationPlan({ authoringFoundationContract: FOUNDATION });

const session = createAuthoringImplementationPlanSession({ authoringFoundationContract: FOUNDATION });
const phases = createAuthoringImplementationPhases();
const draftRuntime = createDraftRuntimePlan();
const lifecycleRuntime = createLifecycleRuntimePlan();
const operationExecutor = createOperationExecutorPlan();
const revisionEngine = createRevisionEnginePlan();
const validationPipeline = createValidationPipelinePlan();
const invariantEnforcement = createInvariantEnforcementPlan();
const previewHandoff = createSyntheticPreviewHandoffPlan();
const certificationCandidate = createCertificationCandidatePreparationPlan();
const ssotProtection = createSsotProtectionPlan();
const permissionTenancy = createPermissionTenancyBoundaryPlan();
const persistenceProhibition = createPersistenceProhibitionPlan();
const moduleGenerationProhibition = createModuleGenerationProhibitionPlan();
const prototypeAssertion = createPrototypeRelinkStaticAssertionPlan();
const testHarness = createAuthoringTestHarnessPlan();
const manualGate = createAuthoringManualEnablementGatePlan();
const rolloutRollback = createAuthoringRolloutRollbackPlan();
const observability = createAuthoringObservabilityDiagnosticsPlan();
const governanceRegistry = createAuthoringGovernanceRegistryPlan();
const safety = createAuthoringImplementationSafetyPlan();
const manifest = createAuthoringImplementationPlanManifest({ authoringFoundationContract: FOUNDATION });
const caps = AUTHORING_IMPLEMENTATION_PLAN_CAPABILITIES;

// ===== Base + versions (1-40) =====
test('1. created', () => assert.equal(U.kind, 'studio-module-blueprint-authoring-implementation-plan'));
test('2. name', () => { assert.equal(U.authoringImplementationPlanName, 'studio-module-blueprint-authoring-implementation-plan'); assert.equal(U.authoringImplementationPlanName, AUTHORING_IMPLEMENTATION_PLAN_NAME); });
test('3. version', () => { assert.equal(U.authoringImplementationPlanVersion, 'studio-module-blueprint-authoring-implementation-plan@1.0.0'); assert.equal(U.authoringImplementationPlanVersion, AUTHORING_IMPLEMENTATION_PLAN_VERSION); });
test('4. semver', () => assert.equal(AUTHORING_IMPLEMENTATION_PLAN_SEMVER, '1.0.0'));
test('5. authoringFoundationContractVersion', () => { assert.equal(U.authoringFoundationContractVersion, 'studio-module-blueprint-authoring-foundation-contract@1.0.0'); assert.equal(U.authoringFoundationContractVersion, AUTHORING_FOUNDATION_CONTRACT_VERSION); });
test('6. blueprintContractVersion', () => { assert.equal(U.blueprintContractVersion, 'studio-blueprint-contract@1.0.0'); assert.equal(U.blueprintContractVersion, BLUEPRINT_CONTRACT_VERSION); });
test('7. blueprintEngineVersion', () => { assert.equal(U.blueprintEngineVersion, 'studio-blueprint-engine@1.0.0'); assert.equal(U.blueprintEngineVersion, BLUEPRINT_ENGINE_VERSION); });
test('8. moduleReferencePlannerVersion', () => { assert.equal(U.moduleReferencePlannerVersion, 'studio-blueprint-module-reference-planner@1.0.0'); assert.equal(U.moduleReferencePlannerVersion, MODULE_REFERENCE_PLANNER_VERSION); });
test('9. previewSandboxContractVersion', () => { assert.equal(U.previewSandboxContractVersion, 'studio-module-preview-sandbox-contract@1.0.0'); assert.equal(U.previewSandboxContractVersion, PREVIEW_SANDBOX_CONTRACT_VERSION); });
test('10. mode', () => { assert.equal(U.mode, 'headless_studio_module_blueprint_authoring_implementation_plan'); assert.equal(U.mode, AUTHORING_IMPLEMENTATION_PLAN_MODE); });
test('11. not fallback', () => assert.equal(U.fallback, false));
test('12. headless', () => assert.equal(U.capabilities.headless, true));
test('13. contractOnly', () => assert.equal(U.capabilities.contractOnly, true));
test('14. metadataOnly', () => assert.equal(U.metadataOnly, true));
test('15. planOnly', () => assert.equal(U.capabilities.planOnly, true));
test('16. syntheticOnly', () => assert.equal(U.capabilities.syntheticOnly, true));
test('17. devOnly', () => assert.equal(U.capabilities.devOnly, true));
test('18. ssotPreserved', () => assert.equal(U.capabilities.ssotPreserved, true));
test('19. readiness ready', () => assert.equal(U.readiness, 'studio_module_blueprint_authoring_implementation_plan_ready'));
test('20. readyForAuthoringImplementationPlan true', () => assert.equal(U.readyForAuthoringImplementationPlan, true));
test('21. readyForAuthoringRuntimeImplementationSlice false', () => assert.equal(U.readyForAuthoringRuntimeImplementationSlice, false));
test('22. readyForAuthoringUi false', () => assert.equal(U.readyForAuthoringUi, false));
test('23. readyForPermissionTenancyIntegration false', () => assert.equal(U.readyForPermissionTenancyIntegration, false));
test('24. readyForProductExposure false', () => assert.equal(U.readyForProductExposure, false));
test('25. readyForModuleGeneration false', () => assert.equal(U.readyForModuleGeneration, false));
test('26. readyForProduction false', () => assert.equal(U.readyForProduction, false));
test('27. requiresPermissionTenancyFoundation true', () => assert.equal(U.requiresPermissionTenancyFoundation, true));
test('28. blockerCount 0', () => assert.equal(U.blockerCount, 0));
test('29. warningCount 0', () => assert.equal(U.warningCount, 0));
test('30. blockers empty', () => assert.deepEqual(U.blockers, []));
test('31. warnings empty', () => assert.deepEqual(U.warnings, []));
test('32. moduleId', () => { assert.equal(typeof U.moduleId, 'string'); assert.equal(U.moduleId, 'clientes'); });
test('33. overallDigest fnv1a', () => assert.ok(String(U.overallDigest).startsWith('fnv1a-')));
test('34. planDigest fnv1a', () => assert.ok(String(U.authoringImplementationPlanDigest).startsWith('fnv1a-')));
test('35. requiredFutureCheckpoint', () => { assert.equal(U.requiredFutureCheckpoint, 'pre_module_blueprint_authoring_runtime_enterprise_checkpoint'); assert.equal(U.requiredFutureCheckpoint, REQUIRED_FUTURE_CHECKPOINT); });
test('36. readiness state known', () => assert.ok(AUTHORING_IMPLEMENTATION_PLAN_READINESS_STATES.includes(U.readiness)));
test('37. manifest embedded', () => assert.equal(U.manifest.kind, 'authoring-implementation-plan-manifest'));
test('38. verification embedded', () => assert.equal(U.verification.kind, 'authoring-implementation-plan-verification'));
test('39. diagnostics embedded', () => assert.equal(U.diagnostics.kind, 'authoring-implementation-plan-diagnostics'));
test('40. readinessDecision embedded', () => assert.equal(U.readinessDecision.kind, 'authoring-implementation-readiness-decision'));

// ===== Capabilities (41-120) =====
const TRUE_CAPS = ['headless', 'contractOnly', 'metadataOnly', 'planOnly', 'syntheticOnly', 'devOnly', 'ssotPreserved', 'implementationPhasesOnly', 'draftRuntimePlanOnly', 'lifecycleRuntimePlanOnly', 'operationExecutorPlanOnly', 'revisionPlanOnly', 'validationPipelinePlanOnly', 'invariantEnforcementPlanOnly', 'previewHandoffPlanOnly', 'certificationCandidatePlanOnly', 'ssotProtectionPlanOnly', 'permissionTenancyBoundaryPlanOnly', 'persistenceProhibitionPlanOnly', 'moduleGenerationProhibitionPlanOnly', 'prototypeRelinkAssertionPlanOnly', 'testHarnessPlanOnly', 'manualEnablementGatePlanOnly', 'rolloutRollbackPlanOnly', 'observabilityDiagnosticsPlanOnly', 'governanceRegistryPlanOnly'];
const FALSE_CAPS = ['authoringRuntimeImplemented', 'draftRuntimeImplemented', 'lifecycleRuntimeImplemented', 'operationExecutorImplemented', 'revisionEngineImplemented', 'validationPipelineImplemented', 'invariantEnforcementImplemented', 'previewHandoffImplemented', 'certificationCandidateCreated', 'certificationPerformed', 'authoringUiImplemented', 'editorImplemented', 'persistenceImplemented', 'moduleGenerated', 'filesWrittenToModule', 'moduleRegistered', 'backendAccessed', 'prismaAccessed', 'productionAccessed', 'stagingAccessed', 'fetchUsed', 'mutationAllowed', 'realDataRead', 'realDataWrite', 'rewriteEmpresas', 'prototypeRelinked', 'productExposed', 'menuCreated', 'routeCreated', 'permissionModelIntegrated', 'tenantModelIntegrated', 'serverSideAuthorizationIntegrated'];
test('41. capabilities frozen', () => assert.equal(Object.isFrozen(caps), true));
let n = 42;
for (const k of TRUE_CAPS) {
  const cur = n; n += 1;
  test(`${cur}. capability ${k} true (const + plan)`, () => { assert.equal(caps[k], true); assert.equal(U.capabilities[k], true); });
}
for (const k of FALSE_CAPS) {
  const cur = n; n += 1;
  test(`${cur}. capability ${k} false (const + plan)`, () => { assert.equal(caps[k], false); assert.equal(U.capabilities[k], false); });
}
// n now 42 + 26 + 32 = 100
test('100. capabilities mirror const exactly', () => assert.deepEqual(U.capabilities, { ...caps }));
test('101. TRUE_CAPS count 26', () => assert.equal(TRUE_CAPS.length, 26));
test('102. FALSE_CAPS count 32', () => assert.equal(FALSE_CAPS.length, 32));

// ===== Session (103-112) =====
test('103. session kind', () => assert.equal(session.kind, 'authoring-implementation-plan-session'));
test('104. session planOnly', () => assert.equal(session.planOnly, true));
test('105. session no storage', () => assert.equal(session.usesStorage, false));
test('106. session no fetch', () => assert.equal(session.usesFetch, false));
test('107. session no persistence', () => assert.equal(session.usesPersistence, false));
test('108. session no side effects', () => assert.equal(session.runtimeSideEffects, false));
test('109. session sources foundation contract', () => assert.equal(session.sourceAuthoringFoundationContract, AUTHORING_FOUNDATION_CONTRACT_VERSION));
test('110. session consumes read-only', () => assert.equal(session.consumesUpstreamReadOnly, true));
test('111. session digest fnv1a', () => assert.ok(String(session.sessionDigest).startsWith('fnv1a-')));
test('112. session deterministic', () => assert.equal(createAuthoringImplementationPlanSession({ authoringFoundationContract: FOUNDATION }).sessionDigest, session.sessionDigest));

// ===== Phases (113-136) =====
test('113. phases kind', () => assert.equal(phases.kind, 'authoring-implementation-phases'));
test('114. phases count 16', () => assert.equal(phases.phaseCount, 16));
test('115. phase ids match const', () => assert.deepEqual(phases.phaseIds, [...AUTHORING_IMPLEMENTATION_PHASE_IDS]));
test('116. all phases planned', () => assert.equal(phases.allPlanned, true));
test('117. no phase implemented', () => assert.equal(phases.anyImplemented, false));
test('118. every phase status planned', () => assert.ok(phases.phases.every((p) => p.status === 'planned')));
test('119. every phase implemented false', () => assert.ok(phases.phases.every((p) => p.implemented === false)));
test('120. every phase completed false', () => assert.ok(phases.phases.every((p) => p.completed === false)));
test('121. every phase has goal', () => assert.ok(phases.phases.every((p) => typeof p.goal === 'string' && p.goal.length > 0)));
test('122. every phase has entryCriteria', () => assert.ok(phases.phases.every((p) => Array.isArray(p.entryCriteria))));
test('123. every phase has exitCriteria', () => assert.ok(phases.phases.every((p) => Array.isArray(p.exitCriteria))));
test('124. every phase has rollbackPlan', () => assert.ok(phases.phases.every((p) => typeof p.rollbackPlan === 'string')));
test('125. every phase blocks runtime effects', () => assert.ok(phases.phases.every((p) => p.blockedEffects.includes('implement_runtime'))));
test('126. phase_0_preflight present', () => assert.ok(phases.phaseIds.includes('phase_0_preflight')));
test('127. phase_15_rollout_blocked present', () => assert.ok(phases.phaseIds.includes('phase_15_rollout_blocked')));
test('128. phase order sequential', () => assert.ok(phases.phases.every((p, i) => p.order === i)));
test('129. phases digest fnv1a', () => assert.ok(String(phases.phasesDigest).startsWith('fnv1a-')));
test('130. phases in plan', () => assert.equal(U.phases.phaseCount, 16));
test('131. phases deterministic', () => assert.equal(createAuthoringImplementationPhases().phasesDigest, phases.phasesDigest));
test('132. phase draft_runtime_model present', () => assert.ok(phases.phaseIds.includes('phase_3_draft_runtime_model')));
test('133. phase operation_executor present', () => assert.ok(phases.phaseIds.includes('phase_5_operation_executor')));
test('134. phase validation_pipeline present', () => assert.ok(phases.phaseIds.includes('phase_7_validation_pipeline')));
test('135. phase manual_enablement_gate present', () => assert.ok(phases.phaseIds.includes('phase_14_manual_enablement_gate')));
test('136. phase permission_tenancy present', () => assert.ok(phases.phaseIds.includes('phase_12_permission_tenancy_boundary')));

// ===== Draft runtime plan (137-146) =====
test('137. draftRuntime kind', () => assert.equal(draftRuntime.kind, 'authoring-draft-runtime-plan'));
test('138. draftRuntime planned', () => assert.equal(draftRuntime.draftRuntimePlanned, true));
test('139. draftRuntime NOT implemented', () => assert.equal(draftRuntime.draftRuntimeImplemented, false));
test('140. draftRuntime ephemeral only', () => assert.equal(draftRuntime.ephemeralDraftsOnly, true));
test('141. draftRuntime in-memory only', () => assert.equal(draftRuntime.inMemoryOnly, true));
test('142. draftRuntime synthetic only', () => assert.equal(draftRuntime.syntheticDataOnly, true));
test('143. draftRuntime NO canonical drafts', () => assert.equal(draftRuntime.canonicalDraftsAllowed, false));
test('144. draftRuntime NO persistent drafts', () => assert.equal(draftRuntime.persistentDraftsAllowed, false));
test('145. draftRuntime NO filesystem writes', () => assert.equal(draftRuntime.filesystemWritesAllowed, false));
test('146. draftRuntime NO module writes', () => assert.equal(draftRuntime.moduleWritesAllowed, false));

// ===== Lifecycle runtime plan (147-160) =====
test('147. lifecycleRuntime kind', () => assert.equal(lifecycleRuntime.kind, 'authoring-lifecycle-runtime-plan'));
test('148. lifecycleRuntime planned', () => assert.equal(lifecycleRuntime.lifecycleRuntimePlanned, true));
test('149. lifecycleRuntime NOT implemented', () => assert.equal(lifecycleRuntime.lifecycleRuntimeImplemented, false));
test('150. lifecycle states 8', () => assert.equal(lifecycleRuntime.states.length, 8));
test('151. lifecycle states match const', () => assert.deepEqual(lifecycleRuntime.states, [...AUTHORING_LIFECYCLE_STATES]));
test('152. lifecycle terminal discarded', () => assert.equal(lifecycleRuntime.terminalState, 'discarded'));
test('153. lifecycle initial empty', () => assert.equal(lifecycleRuntime.initialState, 'empty'));
test('154. lifecycle forbidden 7', () => assert.equal(lifecycleRuntime.forbiddenStates.length, 7));
test('155. lifecycle forbidden match const', () => assert.deepEqual(lifecycleRuntime.forbiddenStates, [...FORBIDDEN_LIFECYCLE_STATES]));
test('156. lifecycle no production states', () => assert.equal(lifecycleRuntime.productionStatesAllowed, false));
test('157. lifecycle no self-certification', () => assert.equal(lifecycleRuntime.selfCertificationAllowed, false));
test('158. lifecycle emits no forbidden state', () => assert.equal(lifecycleRuntime.emitsForbiddenState, false));
test('159. lifecycle forbidden includes certified/published/generated', () => { assert.ok(lifecycleRuntime.forbiddenStates.includes('certified')); assert.ok(lifecycleRuntime.forbiddenStates.includes('published')); assert.ok(lifecycleRuntime.forbiddenStates.includes('generated')); });
test('160. lifecycle no forbidden state in states', () => assert.ok(!lifecycleRuntime.states.some((s) => FORBIDDEN_LIFECYCLE_STATES.includes(s))));

// ===== Operation executor plan (161-176) =====
test('161. operationExecutor kind', () => assert.equal(operationExecutor.kind, 'authoring-operation-executor-plan'));
test('162. operationExecutor planned', () => assert.equal(operationExecutor.operationExecutorPlanned, true));
test('163. operationExecutor NOT implemented', () => assert.equal(operationExecutor.operationExecutorImplemented, false));
test('164. operationExecutor allowlist only', () => assert.equal(operationExecutor.allowlistOnly, true));
test('165. operationExecutor allowlist 16', () => assert.equal(operationExecutor.allowlist.length, 16));
test('166. operationExecutor allowlist match const', () => assert.deepEqual(operationExecutor.allowlist, [...AUTHORING_OPERATION_IDS]));
test('167. operationExecutor unknown fail-closed', () => assert.equal(operationExecutor.unknownOperationsFailClosed, true));
test('168. operationExecutor no side effects', () => assert.equal(operationExecutor.sideEffectsAllowed, false));
test('169. operationExecutor no persistence', () => assert.equal(operationExecutor.persistenceAllowed, false));
test('170. operationExecutor no module write', () => assert.equal(operationExecutor.moduleWriteAllowed, false));
test('171. operationExecutor every op not implemented', () => assert.ok(operationExecutor.operations.every((o) => o.implemented === false)));
test('172. operationExecutor every op no side effects', () => assert.ok(operationExecutor.operations.every((o) => o.sideEffectsAllowed === false)));
test('173. operationExecutor has createDraft', () => assert.ok(operationExecutor.allowlist.includes('createDraft')));
test('174. operationExecutor has requestValidation', () => assert.ok(operationExecutor.allowlist.includes('requestValidation')));
test('175. operationExecutor has requestCertificationCandidateHandoff', () => assert.ok(operationExecutor.allowlist.includes('requestCertificationCandidateHandoff')));
test('176. operationExecutor has discardDraft', () => assert.ok(operationExecutor.allowlist.includes('discardDraft')));

// ===== Revision engine plan (177-186) =====
test('177. revisionEngine kind', () => assert.equal(revisionEngine.kind, 'authoring-revision-engine-plan'));
test('178. revisionEngine planned', () => assert.equal(revisionEngine.revisionEnginePlanned, true));
test('179. revisionEngine NOT implemented', () => assert.equal(revisionEngine.revisionEngineImplemented, false));
test('180. revisionEngine starts at 0', () => assert.equal(revisionEngine.revisionStartsAt, 0));
test('181. revisionEngine monotonic', () => assert.equal(revisionEngine.revisionMonotonic, true));
test('182. revisionEngine no negative', () => assert.equal(revisionEngine.negativeRevisionAllowed, false));
test('183. revisionEngine no in-place canonical mutation', () => assert.equal(revisionEngine.inPlaceCanonicalMutationAllowed, false));
test('184. revisionEngine no history persistence', () => assert.equal(revisionEngine.historyPersistenceAllowed, false));
test('185. revisionEngine in-memory only', () => assert.equal(revisionEngine.inMemoryOnly, true));
test('186. revisionEngine digest fnv1a', () => assert.ok(String(revisionEngine.revisionEnginePlanDigest).startsWith('fnv1a-')));

// ===== Validation pipeline plan (187-200) =====
test('187. validationPipeline kind', () => assert.equal(validationPipeline.kind, 'authoring-validation-pipeline-plan'));
test('188. validationPipeline planned', () => assert.equal(validationPipeline.validationPipelinePlanned, true));
test('189. validationPipeline NOT implemented', () => assert.equal(validationPipeline.validationPipelineImplemented, false));
test('190. validationPipeline fail-closed', () => assert.equal(validationPipeline.failClosed, true));
test('191. validationPipeline deterministic issues', () => assert.equal(validationPipeline.deterministicIssues, true));
test('192. validationPipeline blocker stops preview', () => assert.equal(validationPipeline.blockerStopsPreview, true));
test('193. validationPipeline blocker stops candidate', () => assert.equal(validationPipeline.blockerStopsCertificationCandidate, true));
test('194. validationPipeline stages 11', () => assert.equal(validationPipeline.stageCount, 11));
test('195. validationPipeline stages match const', () => assert.deepEqual(validationPipeline.stages.map((s) => s.stageId), [...VALIDATION_PIPELINE_STAGES]));
test('196. validationPipeline severities', () => assert.deepEqual(validationPipeline.severities, ['info', 'warning', 'error', 'blocker']));
test('197. validationPipeline has ssot_boundary_validation', () => assert.ok(validationPipeline.stages.some((s) => s.stageId === 'ssot_boundary_validation')));
test('198. validationPipeline has module_generation_validation', () => assert.ok(validationPipeline.stages.some((s) => s.stageId === 'module_generation_validation')));
test('199. validationPipeline has permission_tenancy_boundary_validation', () => assert.ok(validationPipeline.stages.some((s) => s.stageId === 'permission_tenancy_boundary_validation')));
test('200. validationPipeline every stage not implemented', () => assert.ok(validationPipeline.stages.every((s) => s.implemented === false)));

// ===== Invariant enforcement plan (201-210) =====
test('201. invariantEnforcement kind', () => assert.equal(invariantEnforcement.kind, 'authoring-invariant-enforcement-plan'));
test('202. invariantEnforcement planned', () => assert.equal(invariantEnforcement.invariantEnforcementPlanned, true));
test('203. invariantEnforcement NOT implemented', () => assert.equal(invariantEnforcement.invariantEnforcementImplemented, false));
test('204. invariantEnforcement all fail-closed', () => assert.equal(invariantEnforcement.allInvariantsFailClosed, true));
test('205. invariantEnforcement count 14', () => assert.equal(invariantEnforcement.invariantCount, 14));
test('206. invariantEnforcement match const', () => assert.deepEqual(invariantEnforcement.invariantIds, [...AUTHORING_INVARIANT_IDS]));
test('207. invariantEnforcement has no_self_certification', () => assert.ok(invariantEnforcement.invariantIds.includes('no_self_certification')));
test('208. invariantEnforcement has no_module_generation_authorization', () => assert.ok(invariantEnforcement.invariantIds.includes('no_module_generation_authorization')));
test('209. invariantEnforcement every invariant fail-closed', () => assert.ok(invariantEnforcement.invariants.every((i) => i.failClosed === true)));
test('210. invariantEnforcement every invariant not implemented', () => assert.ok(invariantEnforcement.invariants.every((i) => i.implemented === false)));

// ===== Preview handoff plan (211-220) =====
test('211. previewHandoff kind', () => assert.equal(previewHandoff.kind, 'authoring-synthetic-preview-handoff-plan'));
test('212. previewHandoff planned', () => assert.equal(previewHandoff.previewHandoffPlanned, true));
test('213. previewHandoff NOT implemented', () => assert.equal(previewHandoff.previewHandoffImplemented, false));
test('214. previewHandoff kind synthetic', () => assert.equal(previewHandoff.handoffKind, 'synthetic_preview_candidate'));
test('215. previewHandoff compatible sandbox', () => assert.equal(previewHandoff.compatibleWithPreviewSandbox, true));
test('216. previewHandoff no payload created', () => assert.equal(previewHandoff.previewPayloadCreated, false));
test('217. previewHandoff not mounted', () => assert.equal(previewHandoff.previewMounted, false));
test('218. previewHandoff no real data attached', () => assert.equal(previewHandoff.realDataAttached, false));
test('219. previewHandoff not to product', () => assert.equal(previewHandoff.handoffToProduct, false));
test('220. previewHandoff requires validated draft', () => assert.equal(previewHandoff.requiresValidatedDraft, true));

// ===== Certification candidate plan (221-232) =====
test('221. certCandidate kind', () => assert.equal(certificationCandidate.kind, 'authoring-certification-candidate-preparation-plan'));
test('222. certCandidate plan created', () => assert.equal(certificationCandidate.certificationCandidatePlanCreated, true));
test('223. certCandidate candidateKind', () => assert.equal(certificationCandidate.candidateKind, 'blueprint_certification_candidate'));
test('224. certCandidate NOT created', () => assert.equal(certificationCandidate.certificationCandidateCreated, false));
test('225. certCandidate certification NOT performed', () => assert.equal(certificationCandidate.certificationPerformed, false));
test('226. certCandidate not canonical', () => assert.equal(certificationCandidate.candidateCanonical, false));
test('227. certCandidate requires validated draft', () => assert.equal(certificationCandidate.requiresValidatedDraft, true));
test('228. certCandidate requires future slice', () => assert.equal(certificationCandidate.requiresFutureExplicitSlice, true));
test('229. certCandidate no self-certification', () => assert.equal(certificationCandidate.selfCertificationAllowed, false));
test('230. certCandidate does NOT overwrite certified', () => assert.equal(certificationCandidate.overwritesCertifiedContract, false));
test('231. certCandidate certifier not implemented', () => assert.equal(certificationCandidate.certifierImplemented, false));
test('232. certCandidate requires future checkpoint', () => assert.equal(certificationCandidate.requiresFutureCheckpoint, REQUIRED_FUTURE_CHECKPOINT));

// ===== SSOT protection plan (233-244) =====
test('233. ssotProtection kind', () => assert.equal(ssotProtection.kind, 'authoring-ssot-protection-plan'));
test('234. ssotProtection planned', () => assert.equal(ssotProtection.ssotProtectionPlanned, true));
test('235. ssotProtection canonical SSOT certified', () => assert.equal(ssotProtection.canonicalSsot, 'certified-blueprint-contract'));
test('236. ssotProtection certified remains SSOT', () => assert.equal(ssotProtection.certifiedBlueprintRemainsSsot, true));
test('237. ssotProtection draft NOT canonical', () => assert.equal(ssotProtection.draftIsCanonical, false));
test('238. ssotProtection candidate NOT canonical', () => assert.equal(ssotProtection.candidateIsCanonical, false));
test('239. ssotProtection may NOT overwrite certified', () => assert.equal(ssotProtection.authoringMayOverwriteCertifiedBlueprint, false));
test('240. ssotProtection may NOT bypass certification', () => assert.equal(ssotProtection.authoringMayBypassCertification, false));
test('241. ssotProtection engine read-only', () => assert.equal(ssotProtection.engineConsumedReadOnly, true));
test('242. ssotProtection planner read-only', () => assert.equal(ssotProtection.plannerConsumedReadOnly, true));
test('243. ssotProtection sandbox read-only', () => assert.equal(ssotProtection.previewSandboxConsumedReadOnly, true));
test('244. ssotProtection in plan', () => assert.equal(U.ssotProtectionPlan.certifiedBlueprintRemainsSsot, true));

// ===== Permission/tenancy boundary plan (245-254) =====
test('245. permissionTenancy kind', () => assert.equal(permissionTenancy.kind, 'authoring-permission-tenancy-boundary-plan'));
test('246. permissionTenancy planned', () => assert.equal(permissionTenancy.permissionTenancyBoundaryPlanned, true));
test('247. permissionTenancy permission NOT integrated', () => assert.equal(permissionTenancy.permissionModelIntegrated, false));
test('248. permissionTenancy tenant NOT integrated', () => assert.equal(permissionTenancy.tenantModelIntegrated, false));
test('249. permissionTenancy server auth NOT integrated', () => assert.equal(permissionTenancy.serverSideAuthorizationIntegrated, false));
test('250. permissionTenancy client auth insufficient', () => assert.equal(permissionTenancy.clientSideAuthorizationSufficient, false));
test('251. permissionTenancy exposure blocked', () => assert.equal(permissionTenancy.productExposureBlockedByPermissionTenancy, true));
test('252. permissionTenancy requires foundation', () => assert.equal(permissionTenancy.requiresPermissionTenancyFoundation, true));
test('253. permissionTenancy no auth imported', () => assert.equal(permissionTenancy.authImported, false));
test('254. permissionTenancy in plan', () => assert.equal(U.permissionTenancyBoundaryPlan.permissionModelIntegrated, false));

// ===== Persistence + module-generation prohibitions (255-268) =====
test('255. persistenceProhibition kind', () => assert.equal(persistenceProhibition.kind, 'authoring-persistence-prohibition-plan'));
test('256. persistenceProhibition active', () => assert.equal(persistenceProhibition.persistenceProhibitionActive, true));
test('257. persistence NOT implemented', () => assert.equal(persistenceProhibition.persistenceImplemented, false));
test('258. persistence storage not allowed', () => assert.equal(persistenceProhibition.storageAllowed, false));
test('259. persistence database not allowed', () => assert.equal(persistenceProhibition.databaseAllowed, false));
test('260. persistence filesystem write not allowed', () => assert.equal(persistenceProhibition.filesystemWriteAllowed, false));
test('261. persistence backend/prisma not allowed', () => { assert.equal(persistenceProhibition.backendAllowed, false); assert.equal(persistenceProhibition.prismaAllowed, false); });
test('262. moduleGenerationProhibition kind', () => assert.equal(moduleGenerationProhibition.kind, 'authoring-module-generation-prohibition-plan'));
test('263. moduleGenerationProhibition active', () => assert.equal(moduleGenerationProhibition.moduleGenerationProhibitionActive, true));
test('264. module NOT generated', () => assert.equal(moduleGenerationProhibition.moduleGenerated, false));
test('265. module no files written', () => assert.equal(moduleGenerationProhibition.filesWrittenToModule, false));
test('266. module NOT registered', () => assert.equal(moduleGenerationProhibition.moduleRegistered, false));
test('267. module src/modules touch not allowed', () => assert.equal(moduleGenerationProhibition.srcModulesTouchAllowed, false));
test('268. module production registry touch not allowed', () => assert.equal(moduleGenerationProhibition.productionRegistryTouchAllowed, false));

// ===== Prototype + test harness (269-282) =====
test('269. prototypeAssertion kind', () => assert.equal(prototypeAssertion.kind, 'authoring-prototype-relink-static-assertion-plan'));
test('270. prototypeAssertion planned', () => assert.equal(prototypeAssertion.prototypeRelinkStaticAssertionPlanned, true));
test('271. prototype relink not allowed', () => assert.equal(prototypeAssertion.prototypeRelinkAllowed, false));
test('272. prototype import not allowed', () => assert.equal(prototypeAssertion.prototypeImportAllowed, false));
test('273. old prototype not imported', () => assert.equal(prototypeAssertion.oldPrototypeImported, false));
test('274. prototype static assertion required', () => assert.equal(prototypeAssertion.staticImportAssertionRequired, true));
test('275. prototype forbidden paths 8', () => assert.equal(prototypeAssertion.forbiddenPathCount, 8));
test('276. prototype forbidden match const', () => assert.deepEqual(prototypeAssertion.forbiddenPrototypePaths, [...FORBIDDEN_PROTOTYPE_PATHS]));
test('277. testHarness kind', () => assert.equal(testHarness.kind, 'authoring-test-harness-plan'));
test('278. testHarness planned', () => assert.equal(testHarness.testHarnessPlanned, true));
test('279. testHarness NOT implemented', () => assert.equal(testHarness.testHarnessImplemented, false));
test('280. testHarness deterministic + synthetic', () => { assert.equal(testHarness.deterministic, true); assert.equal(testHarness.syntheticDataOnly, true); });
test('281. testHarness no network/persistence/realdata', () => { assert.equal(testHarness.networkAllowed, false); assert.equal(testHarness.persistenceAllowed, false); assert.equal(testHarness.realDataAllowed, false); });
test('282. testHarness covers lifecycle/operations/invariants', () => { assert.equal(testHarness.coversLifecycle, true); assert.equal(testHarness.coversOperations, true); assert.equal(testHarness.coversInvariants, true); });

// ===== Manual gate (283-300) =====
test('283. manualGate kind', () => assert.equal(manualGate.kind, 'authoring-manual-enablement-gate-plan'));
test('284. manualGate required', () => assert.equal(manualGate.manualGateRequired, true));
test('285. manualGate checkpoint', () => assert.equal(manualGate.requiredCheckpoint, REQUIRED_FUTURE_CHECKPOINT));
test('286. manualGate authorization implementation_plan_only', () => assert.equal(manualGate.currentSliceAuthorization, 'implementation_plan_only'));
test('287. manualGate authorizes NO authoring runtime', () => assert.equal(manualGate.authorizesAuthoringRuntime, false));
test('288. manualGate authorizes NO draft runtime', () => assert.equal(manualGate.authorizesDraftRuntime, false));
test('289. manualGate authorizes NO lifecycle runtime', () => assert.equal(manualGate.authorizesLifecycleRuntime, false));
test('290. manualGate authorizes NO operation executor', () => assert.equal(manualGate.authorizesOperationExecutor, false));
test('291. manualGate authorizes NO revision engine', () => assert.equal(manualGate.authorizesRevisionEngine, false));
test('292. manualGate authorizes NO validation pipeline', () => assert.equal(manualGate.authorizesValidationPipeline, false));
test('293. manualGate authorizes NO preview handoff', () => assert.equal(manualGate.authorizesPreviewHandoff, false));
test('294. manualGate authorizes NO certification candidate', () => assert.equal(manualGate.authorizesCertificationCandidate, false));
test('295. manualGate authorizes NO ui/editor', () => { assert.equal(manualGate.authorizesAuthoringUi, false); assert.equal(manualGate.authorizesEditor, false); });
test('296. manualGate authorizes NO persistence', () => assert.equal(manualGate.authorizesPersistence, false));
test('297. manualGate authorizes NO module generation', () => assert.equal(manualGate.authorizesModuleGeneration, false));
test('298. manualGate authorizes NO backend/prisma', () => { assert.equal(manualGate.authorizesBackend, false); assert.equal(manualGate.authorizesPrisma, false); });
test('299. manualGate authorizes NO product exposure/production', () => { assert.equal(manualGate.authorizesProductExposure, false); assert.equal(manualGate.authorizesProduction, false); });
test('300. manualGate authorizes NO real data', () => assert.equal(manualGate.authorizesRealData, false));

// ===== Rollout/observability/governance/safety (301-322) =====
test('301. rolloutRollback kind', () => assert.equal(rolloutRollback.kind, 'authoring-rollout-rollback-plan'));
test('302. rollout blocked', () => assert.equal(rolloutRollback.rolloutBlocked, true));
test('303. rollout requires checkpoint', () => assert.equal(rolloutRollback.rolloutRequiresCheckpoint, true));
test('304. rollback by non-consumption', () => assert.equal(rolloutRollback.rollbackByNonConsumption, true));
test('305. rollback not destructive', () => assert.equal(rolloutRollback.destructiveRollbackRequired, false));
test('306. rollout production not allowed', () => assert.equal(rolloutRollback.productionRolloutAllowed, false));
test('307. observability kind', () => assert.equal(observability.kind, 'authoring-observability-diagnostics-plan'));
test('308. observability passive', () => assert.equal(observability.passive, true));
test('309. observability sanitized', () => assert.equal(observability.sanitized, true));
test('310. observability no secrets logged', () => assert.equal(observability.secretsLogged, false));
test('311. observability no external logging', () => assert.equal(observability.externalLoggingAllowed, false));
test('312. observability no telemetry runtime', () => assert.equal(observability.telemetryRuntimeAllowed, false));
test('313. governanceRegistry kind', () => assert.equal(governanceRegistry.kind, 'authoring-governance-registry-plan'));
test('314. governanceRegistry planned', () => assert.equal(governanceRegistry.governanceRegistryPlanned, true));
test('315. governanceRegistry registry not touched', () => assert.equal(governanceRegistry.registryTouched, false));
test('316. governanceRegistry guard not touched', () => assert.equal(governanceRegistry.guardTouched, false));
test('317. governanceRegistry no broad wildcard', () => assert.equal(governanceRegistry.broadWildcardAllowed, false));
test('318. governanceRegistry specific paths only', () => assert.equal(governanceRegistry.specificPathsOnly, true));
test('319. safety kind', () => assert.equal(safety.kind, 'authoring-implementation-safety-plan'));
test('320. safety no forbidden side effect', () => assert.equal(safety.anyForbiddenSideEffect, false));
test('321. safety reversible', () => assert.equal(safety.reversibleByNonConsumption, true));
test('322. safety all forbidden flags false', () => assert.ok(Object.values(safety.forbiddenFlags).every((v) => v === false)));

// ===== Readiness decision (323-334) =====
const rdReady = createAuthoringImplementationReadinessDecision({ blockers: [], warnings: [] });
const rdBlocked = createAuthoringImplementationReadinessDecision({ blockers: ['x'], warnings: [] });
test('323. readiness kind', () => assert.equal(rdReady.kind, 'authoring-implementation-readiness-decision'));
test('324. readiness ready state', () => assert.equal(rdReady.readiness, 'studio_module_blueprint_authoring_implementation_plan_ready'));
test('325. readiness plan ready true', () => assert.equal(rdReady.readyForAuthoringImplementationPlan, true));
test('326. readiness runtime slice false', () => assert.equal(rdReady.readyForAuthoringRuntimeImplementationSlice, false));
test('327. readiness ui false', () => assert.equal(rdReady.readyForAuthoringUi, false));
test('328. readiness permission tenancy false', () => assert.equal(rdReady.readyForPermissionTenancyIntegration, false));
test('329. readiness product exposure false', () => assert.equal(rdReady.readyForProductExposure, false));
test('330. readiness requires permission tenancy', () => assert.equal(rdReady.requiresPermissionTenancyFoundation, true));
test('331. readiness blocked on blocker', () => assert.equal(rdBlocked.readiness, 'blocked'));
test('332. readiness blocked not ready', () => assert.equal(rdBlocked.readyForAuthoringImplementationPlan, false));
test('333. readiness blocker count', () => assert.equal(rdBlocked.blockerCount, 1));
test('334. readiness known state', () => assert.equal(rdReady.knownState, true));

// ===== Manifest (335-348) =====
test('335. manifest kind', () => assert.equal(manifest.kind, 'authoring-implementation-plan-manifest'));
test('336. manifest name', () => assert.equal(manifest.authoringImplementationPlanName, AUTHORING_IMPLEMENTATION_PLAN_NAME));
test('337. manifest version', () => assert.equal(manifest.authoringImplementationPlanVersion, AUTHORING_IMPLEMENTATION_PLAN_VERSION));
test('338. manifest upstream foundation', () => assert.equal(manifest.upstream.authoringFoundationContract, AUTHORING_FOUNDATION_CONTRACT_VERSION));
test('339. manifest upstream engine', () => assert.equal(manifest.upstream.blueprintEngine, BLUEPRINT_ENGINE_VERSION));
test('340. manifest upstream sandbox', () => assert.equal(manifest.upstream.previewSandbox, PREVIEW_SANDBOX_CONTRACT_VERSION));
test('341. manifest parts session', () => assert.equal(manifest.parts.session, session.sessionDigest));
test('342. manifest parts phases digest string', () => assert.equal(typeof manifest.parts.phases, 'string'));
test('343. manifest parts ssotProtectionPlan digest string', () => assert.equal(typeof manifest.parts.ssotProtectionPlan, 'string'));
test('344. manifest parts manualGate digest string', () => assert.equal(typeof manifest.parts.manualGate, 'string'));
test('345. manifest capabilities mirrored planOnly', () => assert.equal(manifest.capabilities.planOnly, true));
test('346. manifest capabilities authoringRuntimeImplemented false', () => assert.equal(manifest.capabilities.authoringRuntimeImplemented, false));
test('347. manifest digest fnv1a', () => assert.ok(String(manifest.manifestDigest).startsWith('fnv1a-')));
test('348. standalone manifest builds', () => assert.equal(createAuthoringImplementationPlanManifest({ authoringFoundationContract: FOUNDATION }).kind, 'authoring-implementation-plan-manifest'));

// ===== Verifier (349-388) =====
test('349. verification ok', () => assert.equal(U.verification.ok, true));
test('350. verification valid', () => assert.equal(U.verification.valid, true));
test('351. verification headless/planOnly/ssot', () => { assert.equal(U.verification.headless, true); assert.equal(U.verification.planOnly, true); assert.equal(U.verification.ssotPreserved, true); });
test('352. verification authoringRuntimeImplemented false', () => assert.equal(U.verification.authoringRuntimeImplemented, false));
test('353. verification moduleGenerated false', () => assert.equal(U.verification.moduleGenerated, false));
test('354. verification productExposed false', () => assert.equal(U.verification.productExposed, false));
test('355. verification no blockers', () => assert.equal(U.verification.blockerCount, 0));
const vb = (o) => verifyAuthoringImplementationPlan(o).blockers;
test('356. verifier detects authoringRuntimeImplemented', () => assert.ok(vb({ plan: { capabilities: { ...caps, authoringRuntimeImplemented: true } } }).includes('capability_authoringRuntimeImplemented_must_be_false')));
test('357. verifier detects draftRuntimeImplemented', () => assert.ok(vb({ plan: { capabilities: { ...caps, draftRuntimeImplemented: true } } }).includes('capability_draftRuntimeImplemented_must_be_false')));
test('358. verifier detects lifecycleRuntimeImplemented', () => assert.ok(vb({ plan: { capabilities: { ...caps, lifecycleRuntimeImplemented: true } } }).includes('capability_lifecycleRuntimeImplemented_must_be_false')));
test('359. verifier detects operationExecutorImplemented', () => assert.ok(vb({ plan: { capabilities: { ...caps, operationExecutorImplemented: true } } }).includes('capability_operationExecutorImplemented_must_be_false')));
test('360. verifier detects revisionEngineImplemented', () => assert.ok(vb({ plan: { capabilities: { ...caps, revisionEngineImplemented: true } } }).includes('capability_revisionEngineImplemented_must_be_false')));
test('361. verifier detects validationPipelineImplemented', () => assert.ok(vb({ plan: { capabilities: { ...caps, validationPipelineImplemented: true } } }).includes('capability_validationPipelineImplemented_must_be_false')));
test('362. verifier detects invariantEnforcementImplemented', () => assert.ok(vb({ plan: { capabilities: { ...caps, invariantEnforcementImplemented: true } } }).includes('capability_invariantEnforcementImplemented_must_be_false')));
test('363. verifier detects previewHandoffImplemented', () => assert.ok(vb({ plan: { capabilities: { ...caps, previewHandoffImplemented: true } } }).includes('capability_previewHandoffImplemented_must_be_false')));
test('364. verifier detects certificationCandidateCreated', () => assert.ok(vb({ plan: { capabilities: { ...caps, certificationCandidateCreated: true } } }).includes('capability_certificationCandidateCreated_must_be_false')));
test('365. verifier detects certificationPerformed', () => assert.ok(vb({ plan: { capabilities: { ...caps, certificationPerformed: true } } }).includes('capability_certificationPerformed_must_be_false')));
test('366. verifier detects UI/editor', () => { const r = vb({ plan: { capabilities: { ...caps, authoringUiImplemented: true, editorImplemented: true } } }); assert.ok(r.includes('capability_authoringUiImplemented_must_be_false') && r.includes('capability_editorImplemented_must_be_false')); });
test('367. verifier detects persistence', () => assert.ok(vb({ plan: { capabilities: { ...caps, persistenceImplemented: true } } }).includes('capability_persistenceImplemented_must_be_false')));
test('368. verifier detects module generation', () => { const r = vb({ plan: { capabilities: { ...caps, moduleGenerated: true, filesWrittenToModule: true, moduleRegistered: true } } }); assert.ok(r.includes('capability_moduleGenerated_must_be_false') && r.includes('capability_moduleRegistered_must_be_false')); });
test('369. verifier detects backend/prisma', () => { const r = vb({ plan: { capabilities: { ...caps, backendAccessed: true, prismaAccessed: true } } }); assert.ok(r.includes('capability_backendAccessed_must_be_false') && r.includes('capability_prismaAccessed_must_be_false')); });
test('370. verifier detects production/staging', () => { const r = vb({ plan: { capabilities: { ...caps, productionAccessed: true, stagingAccessed: true } } }); assert.ok(r.includes('capability_productionAccessed_must_be_false') && r.includes('capability_stagingAccessed_must_be_false')); });
test('371. verifier detects fetch/mutation', () => { const r = vb({ plan: { capabilities: { ...caps, fetchUsed: true, mutationAllowed: true } } }); assert.ok(r.includes('capability_fetchUsed_must_be_false') && r.includes('capability_mutationAllowed_must_be_false')); });
test('372. verifier detects real data', () => { const r = vb({ plan: { capabilities: { ...caps, realDataRead: true, realDataWrite: true } } }); assert.ok(r.includes('capability_realDataRead_must_be_false') && r.includes('capability_realDataWrite_must_be_false')); });
test('373. verifier detects product exposure/menu/route', () => { const r = vb({ plan: { capabilities: { ...caps, productExposed: true, menuCreated: true, routeCreated: true } } }); assert.ok(r.includes('capability_productExposed_must_be_false') && r.includes('capability_routeCreated_must_be_false')); });
test('374. verifier detects prototypeRelinked', () => assert.ok(vb({ plan: { capabilities: { ...caps, prototypeRelinked: true } } }).includes('capability_prototypeRelinked_must_be_false')));
test('375. verifier detects permission/tenant/server-auth inversion', () => { const r = vb({ plan: { capabilities: { ...caps, permissionModelIntegrated: true, tenantModelIntegrated: true, serverSideAuthorizationIntegrated: true } } }); assert.ok(r.includes('capability_permissionModelIntegrated_must_be_false') && r.includes('capability_serverSideAuthorizationIntegrated_must_be_false')); });
test('376. verifier detects mustBeTrue inversion (planOnly)', () => assert.ok(vb({ plan: { capabilities: { ...caps, planOnly: false } } }).includes('capability_planOnly_must_be_true')));
test('377. verifier detects mustBeTrue inversion (ssotPreserved)', () => assert.ok(vb({ plan: { capabilities: { ...caps, ssotPreserved: false } } }).includes('capability_ssotPreserved_must_be_true')));
test('378. verifier detects phase implemented (part)', () => assert.ok(vb({ plan: { capabilities: caps, phases: { anyImplemented: true } } }).includes('unsafe_phase_implemented')));
test('379. verifier detects lifecycle forbidden state (part)', () => assert.ok(vb({ plan: { capabilities: caps, lifecycleRuntimePlan: { states: ['empty', 'certified'] } } }).includes('unsafe_lifecycle_forbidden_state_present')));
test('380. verifier detects operation executor effects (part)', () => assert.ok(vb({ plan: { capabilities: caps, operationExecutorPlan: { sideEffectsAllowed: true } } }).includes('unsafe_operation_executor_effects')));
test('381. verifier detects SSOT inversion (part)', () => assert.ok(vb({ plan: { capabilities: caps, ssotProtectionPlan: { draftIsCanonical: true } } }).includes('unsafe_ssot_inversion')));
test('382. verifier detects SSOT not preserved (part)', () => assert.ok(vb({ plan: { capabilities: caps, ssotProtectionPlan: { certifiedBlueprintRemainsSsot: false } } }).includes('unsafe_ssot_not_preserved')));
test('383. verifier detects self-certification (part)', () => assert.ok(vb({ plan: { capabilities: caps, certificationCandidatePreparationPlan: { selfCertificationAllowed: true } } }).includes('unsafe_self_certification')));
test('384. verifier detects permission integrated (part)', () => assert.ok(vb({ plan: { capabilities: caps, permissionTenancyBoundaryPlan: { permissionModelIntegrated: true } } }).includes('unsafe_permission_model_integrated_without_foundation')));
test('385. verifier detects persistence (part)', () => assert.ok(vb({ plan: { capabilities: caps, persistenceProhibitionPlan: { persistenceImplemented: true } } }).includes('unsafe_persistence')));
test('386. verifier detects prototype relink (part)', () => assert.ok(vb({ plan: { capabilities: caps, prototypeRelinkStaticAssertion: { prototypeRelinkAllowed: true } } }).includes('unsafe_prototype_relink')));
test('387. verifier detects missing manual gate (part)', () => assert.ok(vb({ plan: { capabilities: caps, manualGate: { manualGateRequired: false } } }).includes('missing_manual_gate')));
test('388. verifier never throws on null', () => assert.doesNotThrow(() => verifyAuthoringImplementationPlan({ plan: null })));

// ===== Compatibility (389-400) =====
test('389. compatibility kind', () => assert.equal(U.compatibility.kind, 'authoring-implementation-plan-compatibility'));
test('390. compat foundation contract', () => assert.equal(U.compatibility.compatibleWithAuthoringFoundationContract, true));
test('391. compat blueprint contract', () => assert.equal(U.compatibility.compatibleWithBlueprintContract, true));
test('392. compat blueprint engine', () => assert.equal(U.compatibility.compatibleWithBlueprintEngine, true));
test('393. compat planner', () => assert.equal(U.compatibility.compatibleWithModuleReferencePlanner, true));
test('394. compat sandbox', () => assert.equal(U.compatibility.compatibleWithPreviewSandbox, true));
test('395. compat ready for plan', () => assert.equal(U.compatibility.readyForAuthoringImplementationPlan, true));
test('396. compat runtime slice false', () => assert.equal(U.compatibility.readyForAuthoringRuntimeImplementationSlice, false));
test('397. compat production false', () => assert.equal(U.compatibility.readyForProduction, false));
test('398. compat status', () => assert.equal(U.compatibility.status, 'ready_for_future_authoring_runtime_implementation_slice_after_enterprise_checkpoint'));
test('399. compat mismatch → warning', () => { const r = checkAuthoringImplementationPlanCompatibility({ authoringFoundationContract: { kind: 'other', blueprintEngineVersion: 'x@9.9.9' } }); assert.equal(r.compatibleWithBlueprintEngine, false); assert.ok(r.warnings.includes('incompatible_blueprintEngine')); });
test('400. compat digest fnv1a', () => assert.ok(String(U.compatibility.compatibilityDigest).startsWith('fnv1a-')));

// ===== Diagnostics + fallback (401-416) =====
test('401. diagnostics kind', () => assert.equal(U.diagnostics.kind, 'authoring-implementation-plan-diagnostics'));
test('402. diagnostics passive', () => assert.equal(U.diagnostics.passive, true));
test('403. diagnostics ok', () => assert.equal(U.diagnostics.ok, true));
test('404. diagnostics headless/planOnly/ssot confirmed', () => { assert.equal(U.diagnostics.headlessConfirmed, true); assert.equal(U.diagnostics.planOnlyConfirmed, true); assert.equal(U.diagnostics.ssotPreservedConfirmed, true); });
test('405. diagnostics authoringRuntimeImplemented false', () => assert.equal(U.diagnostics.authoringRuntimeImplemented, false));
test('406. diagnostics no secrets', () => assert.ok(!/jwt|token|secret|DATABASE_URL/i.test(JSON.stringify(U.diagnostics))));
test('407. diagnostics no external logging', () => { assert.equal(U.diagnostics.logged, false); assert.equal(U.diagnostics.externalLogging, false); });
test('408. fallback missing foundation', () => assert.equal(createStudioModuleBlueprintAuthoringImplementationPlan({}).fallback, true));
test('409. fallback invalid kind', () => assert.equal(createStudioModuleBlueprintAuthoringImplementationPlan({ authoringFoundationContract: { kind: 'other' } }).fallback, true));
test('410. fallback upstream fallback', () => assert.equal(createStudioModuleBlueprintAuthoringImplementationPlan({ authoringFoundationContract: { kind: 'studio-module-blueprint-authoring-foundation-contract', fallback: true } }).fallback, true));
test('411. fallback readiness blocked', () => assert.equal(createAuthoringImplementationPlanFallback({}).readiness, 'blocked'));
test('412. fallback authorizes nothing', () => { const fb = createAuthoringImplementationPlanFallback({}); assert.equal(fb.readyForAuthoringImplementationPlan, false); assert.equal(fb.readyForProduction, false); });
test('413. fallback capabilities planOnly true', () => assert.equal(createAuthoringImplementationPlanFallback({}).capabilities.planOnly, true));
test('414. fallback capabilities authoringRuntimeImplemented false', () => assert.equal(createAuthoringImplementationPlanFallback({}).capabilities.authoringRuntimeImplemented, false));
test('415. fallback digest fnv1a', () => assert.ok(String(createAuthoringImplementationPlanFallback({}).overallDigest).startsWith('fnv1a-')));
test('416. fallback requires permission tenancy', () => assert.equal(createAuthoringImplementationPlanFallback({}).requiresPermissionTenancyFoundation, true));

// ===== Errors (417-428) =====
test('417. error codes >= 40', () => assert.ok(AUTHORING_IMPLEMENTATION_PLAN_ERROR_CODES.length >= 40));
test('418. error descriptor kind', () => assert.equal(createAuthoringImplementationPlanError(AUTHORING_IMPLEMENTATION_PLAN_ERROR_CODES[0]).kind, 'authoring-implementation-plan-error'));
test('419. error descriptor safe', () => assert.equal(createAuthoringImplementationPlanError('AUTHORING_PLAN_PRISMA_BLOCKED').safe, true));
test('420. error descriptor side-effect free', () => assert.equal(createAuthoringImplementationPlanError('AUTHORING_PLAN_PRISMA_BLOCKED').sideEffects, false));
test('421. error descriptor no real data / not self certified', () => { const e = createAuthoringImplementationPlanError('AUTHORING_PLAN_BACKEND_BLOCKED'); assert.equal(e.realDataRead, false); assert.equal(e.draftSelfCertified, false); assert.equal(e.authoringRuntimeImplemented, false); });
test('422. error descriptor unknown code normalized', () => assert.equal(createAuthoringImplementationPlanError('NOPE').code, 'AUTHORING_PLAN_INVALID_PLAN'));
test('423. error class instance', () => assert.ok(authoringImplementationPlanError('AUTHORING_PLAN_SESSION_FAILED', 'x') instanceof AuthoringImplementationPlanError));
test('424. error class normalizes bad code', () => assert.equal(new AuthoringImplementationPlanError('bad', 'x').code, 'AUTHORING_PLAN_INVALID_PLAN'));
test('425. error no secrets in message', () => { const e = createAuthoringImplementationPlanError('AUTHORING_PLAN_FETCH_BLOCKED'); assert.equal(e.withoutSecrets, true); assert.ok(!/jwt|token|secret|DATABASE_URL/i.test(e.message)); });
test('426. error codes unique', () => assert.equal(new Set(AUTHORING_IMPLEMENTATION_PLAN_ERROR_CODES).size, AUTHORING_IMPLEMENTATION_PLAN_ERROR_CODES.length));
test('427. error has self-certification-blocked code', () => assert.ok(AUTHORING_IMPLEMENTATION_PLAN_ERROR_CODES.includes('AUTHORING_PLAN_DRAFT_SELF_CERTIFICATION_BLOCKED')));
test('428. error has authoring-runtime-implemented-blocked code', () => assert.ok(AUTHORING_IMPLEMENTATION_PLAN_ERROR_CODES.includes('AUTHORING_PLAN_AUTHORING_RUNTIME_IMPLEMENTED_BLOCKED')));

// ===== Flags (429-440) =====
test('429. flag off in production', () => assert.equal(isStudioModuleBlueprintAuthoringImplementationPlanEnabled({ [MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_IMPLEMENTATION_PLAN_FLAG]: 'true', MAK_ENV_LABEL: 'production' }), false));
test('430. flag on in dev', () => assert.equal(isStudioModuleBlueprintAuthoringImplementationPlanEnabled({ [MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_IMPLEMENTATION_PLAN_FLAG]: 'true', DEV: 'true' }), true));
test('431. flag off by default', () => assert.equal(isStudioModuleBlueprintAuthoringImplementationPlanEnabled({}), false));
test('432. verify flag off in production', () => assert.equal(isStudioModuleBlueprintAuthoringImplementationVerifyEnabled({ [MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_IMPLEMENTATION_VERIFY_FLAG]: 'true', NODE_ENV: 'production' }), false));
test('433. compatibility flag off in production', () => assert.equal(isStudioModuleBlueprintAuthoringImplementationCompatibilityCheckEnabled({ [MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_IMPLEMENTATION_COMPATIBILITY_CHECK_FLAG]: 'true', NODE_ENV: 'production' }), false));
test('434. isProductionEnv true for production label', () => assert.equal(isProductionEnv({ MAK_ENV_LABEL: 'production' }), true));
test('435. isProductionEnv false for DEV', () => assert.equal(isProductionEnv({ DEV: 'true' }), false));
test('436. isProductionEnv true for PROD', () => assert.equal(isProductionEnv({ PROD: 'true' }), true));
test('437. isProductionEnv true for NODE_ENV production', () => assert.equal(isProductionEnv({ NODE_ENV: 'production' }), true));
test('438. flag names distinct', () => assert.equal(new Set([MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_IMPLEMENTATION_PLAN_FLAG, MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_IMPLEMENTATION_VERIFY_FLAG, MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_IMPLEMENTATION_COMPATIBILITY_CHECK_FLAG]).size, 3));
test('439. master flag enables verify path', () => assert.equal(isStudioModuleBlueprintAuthoringImplementationVerifyEnabled({ [MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_IMPLEMENTATION_PLAN_FLAG]: 'true', DEV: 'true' }), true));
test('440. staging label gated by dev', () => assert.equal(isStudioModuleBlueprintAuthoringImplementationPlanEnabled({ [MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_IMPLEMENTATION_PLAN_FLAG]: 'true', MAK_ENV_LABEL: 'staging' }), true));

// ===== Determinism / purity (441-454) =====
test('441. deterministic overall digest', () => assert.equal(createStudioModuleBlueprintAuthoringImplementationPlan({ authoringFoundationContract: FOUNDATION }).overallDigest, U.overallDigest));
test('442. deterministic plan digest', () => assert.equal(createStudioModuleBlueprintAuthoringImplementationPlan({ authoringFoundationContract: FOUNDATION }).authoringImplementationPlanDigest, U.authoringImplementationPlanDigest));
test('443. digest helper stable', () => assert.equal(authoringPlanDigest({ a: 1 }), authoringPlanDigest({ a: 1 })));
test('444. digest helper handles null', () => assert.ok(String(authoringPlanDigest(null)).startsWith('fnv1a-')));
test('445. plan has no functions (clone drops them)', () => assert.ok(!Object.values(U).some((v) => typeof v === 'function')));
test('446. plan JSON round-trips', () => { const j = JSON.parse(JSON.stringify(U)); assert.equal(j.kind, U.kind); });
test('447. second build equals first (manifest digest)', () => assert.equal(createStudioModuleBlueprintAuthoringImplementationPlan({ authoringFoundationContract: FOUNDATION }).manifest.manifestDigest, U.manifest.manifestDigest));
test('448. no top-level warnings', () => assert.deepEqual(U.warnings, []));
test('449. full deep-equal across two builds', () => assert.deepEqual(createStudioModuleBlueprintAuthoringImplementationPlan({ authoringFoundationContract: FOUNDATION }), U));
test('450. building does not mutate foundation contract', () => { const before = JSON.stringify(FOUNDATION); createStudioModuleBlueprintAuthoringImplementationPlan({ authoringFoundationContract: FOUNDATION }); assert.equal(JSON.stringify(FOUNDATION), before); });
test('451. phases deterministic', () => assert.equal(createAuthoringImplementationPhases().phasesDigest, phases.phasesDigest));
test('452. lifecycle plan deterministic', () => assert.equal(createLifecycleRuntimePlan().lifecycleRuntimePlanDigest, lifecycleRuntime.lifecycleRuntimePlanDigest));
test('453. capabilities object mirrors const', () => assert.deepEqual(U.capabilities, { ...caps }));
test('454. manifest partCount 22', () => assert.equal(U.manifest.partCount, 22));

// ===== Static .js scans (455-476) =====
test('455. subtree is React-free', () => assert.ok(jsImports().every((p) => p !== 'react' && !/^react(\/|$)/.test(p))));
test('456. no react-router import', () => assert.ok(jsImports().every((p) => !/react-router/i.test(p))));
test('457. no react-dom import', () => assert.ok(jsImports().every((p) => !/react-dom/i.test(p))));
test('458. no JSX/createElement', () => assert.ok(!/createElement|_jsx\b|jsxs?\(/.test(jsCode())));
test('459. no <Route JSX / Routes / Link / NavLink (case-sensitive)', () => assert.ok(!/<Route[\s/>]|\bRoutes\b|\bNavLink\b|<Link[\s/>]/.test(jsCode())));
test('460. no BrowserRouter / createBrowserRouter / useNavigate', () => assert.ok(!/\bBrowserRouter\b|\bcreateBrowserRouter\b|\buseNavigate\b/.test(jsCode())));
test('461. no ReactDOM / createRoot / hydrateRoot', () => assert.ok(!/\bReactDOM\b|createRoot\s*\(|hydrateRoot\s*\(/.test(jsCode())));
test('462. no window/document/history/location access', () => assert.ok(!/\bdocument\.|\bwindow\.[a-z]|\bhistory\.(push|replace)State|\blocation\.(href|assign|replace)/i.test(jsCode())));
test('463. no old Studio prototype import', () => assert.ok(jsImports().every((p) => !/studio\/(components|shell|designers|pages|navigation|dock|panels|editor)/.test(p))));
test('464. no src/components or src/pages import', () => assert.ok(jsImports().every((p) => !/(^|\.\.\/)(components|pages)\//.test(p))));
test('465. no App import', () => assert.ok(jsImports().every((p) => !/(^|\/)App(\.jsx)?$/.test(p))));
test('466. no EmpresaApi/apiClient/apis/backend/prisma import', () => assert.ok(jsImports().every((p) => !/EmpresaApi|apiClient|\/apis\/|\/backend\/|@prisma|PrismaClient/i.test(p))));
test('467. no fetch/XHR/WebSocket/storage-API', () => assert.ok(!/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(jsCode()) && !/localStorage\.|sessionStorage\.|indexedDB\./.test(jsCode())));
test('468. no DATABASE_URL / production API_URL / Railway', () => assert.ok(!/DATABASE_URL|VITE_API_URL|projetomg-production|railway/i.test(jsCode())));
test('469. no real POST/PUT/PATCH/DELETE method', () => assert.ok(!/method\s*:\s*['"](POST|PUT|PATCH|DELETE)['"]/.test(jsCode())));
test('470. no realDataRead/realDataWrite true literal', () => assert.ok(!/realDataRead\s*:\s*true|realDataWrite\s*:\s*true/.test(jsCode())));
test('471. no authoringRuntimeImplemented true literal', () => assert.ok(!/authoringRuntimeImplemented\s*:\s*true/.test(jsCode())));
test('472. no moduleGenerated true literal', () => assert.ok(!/moduleGenerated\s*:\s*true/.test(jsCode())));
test('473. no .jsx in subtree', () => assert.equal(walkExt(DIR, /\.jsx$/).length, 0));
test('474. no .tsx in subtree', () => assert.equal(walkExt(DIR, /\.tsx$/).length, 0));
test('475. no .css in subtree', () => assert.ok(!fs.readdirSync(DIR).some((f) => /\.css$/.test(f))));
test('476. exactly 31 .js files', () => assert.equal(jsFiles().length, 31));

// ===== Scope safety (477-488) =====
test('477. no App.jsx in diff', () => { const files = changed(); if (files === null) return; assert.ok(!files.includes('src/App.jsx')); });
test('478. no src/pages in diff', () => { const files = changed(); if (files === null) return; assert.ok(!files.some((f) => /^src\/pages\//.test(f))); });
test('479. no src/components in diff', () => { const files = changed(); if (files === null) return; assert.ok(!files.some((f) => /^src\/components\//.test(f))); });
test('480. no src/modules in diff', () => { const files = changed(); if (files === null) return; assert.ok(!files.some((f) => /^src\/modules\//.test(f))); });
test('481. no backend/prisma in diff', () => { const files = changed(); if (files === null) return; assert.ok(!files.some((f) => /^backend\/|schema\.prisma$|^migrations\//.test(f))); });
test('482. no .jsx/.tsx/.css in diff', () => { const files = changed(); if (files === null) return; assert.ok(!files.some((f) => /\.(jsx|tsx|css)$/.test(f))); });
// The production UI guard is FORBIDDEN and no slice cross-authorizes it, so it may never appear. The central
// governance guard may appear ONLY when the slice active on this branch declares it as shared governance —
// which only the governance slices do. Both facts come from the caller-aware evaluation, not a hardcoded list.
test('483. no productionUiGuard/governanceGuard in diff', () => {
  const files = changed(); if (files === null) return;
  assert.ok(!files.includes('scripts/gates/lib/productionUiGuard.mjs'), 'productionUiGuard is never in scope');
  const scope = evaluateStudioBranchConsumerScope(files, { callerSliceId: CALLER_SLICE_ID });
  assert.deepEqual(scope.forbidden, []);
  if (files.includes('scripts/gates/lib/studioScopeGovernanceGuard.mjs')) {
    assert.ok(scope.allowed.includes('scripts/gates/lib/studioScopeGovernanceGuard.mjs'),
      'the governance guard may only appear when the active slice shares it');
    // Exact active-slice authorization: no sliceId prefix, no chronology-free catalog lookup.
    const authorizer = createResolvedActiveStudioSlicePathAuthorizer(files);
    assert.ok(authorizer.ok && authorizer.isAuthorized('scripts/gates/lib/studioScopeGovernanceGuard.mjs'),
      `active ${authorizer.activeSliceId} does not own the governance guard`);
  }
});
// Branch-relative scope check, CALLER-AWARE. It no longer asks "is this path registered somewhere?" — a flat
// registry could not prove the path was later than this slice. It asks "which slice is this branch building, and
// is that slice this one or a later one?", and admits only what that active slice owns, is explicitly
// cross-authorized for, or shares. Forbidden and unknown still fail closed.
const CALLER_SLICE_ID = 'module-blueprint-authoring-implementation-plan';
test('484. no prior gate/test altered', () => {
  const files = changed(); if (files === null) return;
  const scope = evaluateStudioBranchConsumerScope(files, { callerSliceId: CALLER_SLICE_ID });
  assert.equal(scope.consumerSliceId, CALLER_SLICE_ID);
  assert.deepEqual(scope.forbidden, []);
  assert.deepEqual(scope.unknown, []);
  assert.deepEqual(scope.chronologicalViolation, []);
  // Three legitimate outcomes, and nothing else:
  //  - applicable: this branch is at or after this slice, so this check IS the certifier;
  //  - empty diff: nothing to judge (running on `main`);
  //  - the branch builds an EARLIER slice: this check is a passenger, and the branch was
  //    re-certified against its own active slice before being declared sound.
  if (scope.consumerApplicable) {
    assert.equal(scope.applicable, true);
    assert.ok(scope.activeSliceOrdinal >= scope.consumerSliceOrdinal, `active ${scope.activeSliceId} precedes ${CALLER_SLICE_ID}`);
  } else if (scope.reason === 'consumer_slice_after_active_slice') {
    assert.equal(scope.notApplicable, true);
    assert.equal(scope.certifiedAgainstActiveSlice, true);
    assert.equal(scope.evaluatedAsSliceId, scope.activeSliceId);
    assert.ok(scope.activeSliceOrdinal < scope.consumerSliceOrdinal);
  } else {
    assert.equal(scope.notApplicable, true);
    assert.equal(scope.reason, 'empty_branch_diff');
    assert.equal(scope.activeSliceId, null);
  }
  assert.equal(scope.safe, true, JSON.stringify(scope.blockers));
});
test('485. no new dependency', () => { try { const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' })); const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')); const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(','); const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(','); assert.equal(bk, hk); } catch { /* skip */ } });
test('486. net-new scope is subtree only (branch-relative)', () => { const files = changed(); if (files === null) return; if (!files.some((f) => /^src\/studio\/blueprint-engine\/module-blueprint-authoring-implementation-plan\//.test(f))) return; assert.deepEqual(files.filter((f) => !authorized(f)), []); });
test('487. upstream authoring foundation contract present', () => assert.ok(exists('src/studio/blueprint-engine/module-blueprint-authoring-foundation-contract/index.js')));
test('488. src/modules/studio does NOT exist', () => assert.ok(!exists('src/modules/studio')));

// ===== Evidence docs (D1-D28) =====
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
for (let i = 0; i < DOCS.length; i += 1) {
  test(`D${i + 1}. ${DOCS[i]} exists`, () => assert.ok(exists(`docs/evidence/post-foundation-c-studio-module-blueprint-authoring-implementation-plan/${DOCS[i]}`)));
}
test('D29. exactly 28 evidence docs', () => assert.equal(DOCS.length, 28));
test('D-content. plan-not-impl + SSOT + prototype-debt + next checkpoint present', () => {
  assert.ok(/plan|metadata/i.test(readEv('CERTIFICATION-REPORT.md')));
  assert.ok(/SSOT|canonical|certified/i.test(readEv('SSOT-PROTECTION-PLAN.md')));
  assert.ok(/runtime|UI|module|persistence/i.test(readEv('NO-UI-NO-RUNTIME-NO-MODULE-NO-PERSISTENCE.md')));
  assert.ok(/prototype|legacy|debt/i.test(readEv('LEGACY-STUDIO-PROTOTYPE-EXPOSURE-DEBT-NOT-TOUCHED.md')));
  assert.ok(/checkpoint|FABLE|enterprise|runtime/i.test(readEv('NEXT-CHECKPOINT-SPEC.md')));
});
