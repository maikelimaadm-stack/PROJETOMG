import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { AUTHORING_IMPLEMENTATION_PLAN_CAPABILITIES, authoringPlanDigest } from './authoringImplementationPlanConfig.js';

/**
 * Verifies a produced authoring implementation plan for headless / plan-only safety invariants. Pure —
 * returns a report; never throws, never mutates, never performs I/O. Any violated invariant is a
 * blocker.
 *
 * Detects: any authoring-runtime/draft-runtime/lifecycle/executor/revision/validation/invariant/
 * preview/certification/UI/editor/persistence implementation, module generation/file writes/module
 * registration, backend/Prisma, production/staging, fetch/mutation, real data, product exposure/menu/
 * route, prototype relink, permission/tenant/server-auth integration without a foundation, forbidden
 * lifecycle state, SSOT inversion, self-certification, phase implemented, missing manual gate, and
 * capability-flag inversion.
 *
 * @param {Object} [options]
 * @param {Object} [options.plan]
 * @returns {Object}
 */
export function verifyAuthoringImplementationPlan(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const plan = isGenericModelPlainObject(o.plan) ? o.plan : {};
  const caps = isGenericModelPlainObject(plan.capabilities) ? plan.capabilities : AUTHORING_IMPLEMENTATION_PLAN_CAPABILITIES;

  const blockers = [];
  const mustBeFalse = [
    'authoringRuntimeImplemented', 'draftRuntimeImplemented', 'lifecycleRuntimeImplemented',
    'operationExecutorImplemented', 'revisionEngineImplemented', 'validationPipelineImplemented',
    'invariantEnforcementImplemented', 'previewHandoffImplemented', 'certificationCandidateCreated',
    'certificationPerformed', 'authoringUiImplemented', 'editorImplemented', 'persistenceImplemented',
    'moduleGenerated', 'filesWrittenToModule', 'moduleRegistered', 'backendAccessed', 'prismaAccessed',
    'productionAccessed', 'stagingAccessed', 'fetchUsed', 'mutationAllowed', 'realDataRead',
    'realDataWrite', 'rewriteEmpresas', 'prototypeRelinked', 'productExposed', 'menuCreated',
    'routeCreated', 'permissionModelIntegrated', 'tenantModelIntegrated', 'serverSideAuthorizationIntegrated',
  ];
  for (const k of mustBeFalse) {
    if (caps[k] === true) blockers.push(`capability_${k}_must_be_false`);
  }
  const mustBeTrue = ['headless', 'contractOnly', 'metadataOnly', 'planOnly', 'ssotPreserved'];
  for (const k of mustBeTrue) {
    if (caps[k] !== true) blockers.push(`capability_${k}_must_be_true`);
  }
  if (plan.metadataOnly === false) blockers.push('plan_must_be_metadata_only');

  // Phases — every phase planned, none implemented.
  const ph = isGenericModelPlainObject(plan.phases) ? plan.phases : {};
  if (ph.anyImplemented === true) blockers.push('unsafe_phase_implemented');
  if (Array.isArray(ph.phases) && ph.phases.some((p) => p && (p.implemented === true || p.completed === true))) blockers.push('unsafe_phase_completed');

  // Draft runtime plan.
  const dr = isGenericModelPlainObject(plan.draftRuntimePlan) ? plan.draftRuntimePlan : {};
  if (dr.draftRuntimeImplemented === true) blockers.push('unsafe_draft_runtime_implemented');
  if (dr.canonicalDraftsAllowed === true || dr.persistentDraftsAllowed === true) blockers.push('unsafe_draft_runtime_canonical_or_persistent');

  // Lifecycle runtime plan.
  const lr = isGenericModelPlainObject(plan.lifecycleRuntimePlan) ? plan.lifecycleRuntimePlan : {};
  if (lr.lifecycleRuntimeImplemented === true) blockers.push('unsafe_lifecycle_runtime_implemented');
  if (lr.productionStatesAllowed === true || lr.selfCertificationAllowed === true) blockers.push('unsafe_lifecycle_production_or_self_cert');
  const FORBIDDEN_LC = ['published', 'production', 'registered', 'generated', 'deployed', 'persisted', 'certified'];
  if (Array.isArray(lr.states) && lr.states.some((s) => FORBIDDEN_LC.includes(s))) blockers.push('unsafe_lifecycle_forbidden_state_present');

  // Operation executor plan.
  const oe = isGenericModelPlainObject(plan.operationExecutorPlan) ? plan.operationExecutorPlan : {};
  if (oe.operationExecutorImplemented === true) blockers.push('unsafe_operation_executor_implemented');
  if (oe.allowlistOnly === false || oe.unknownOperationsFailClosed === false) blockers.push('unsafe_operation_executor_allowlist');
  if (oe.sideEffectsAllowed === true || oe.persistenceAllowed === true || oe.moduleWriteAllowed === true) blockers.push('unsafe_operation_executor_effects');

  // Revision engine plan.
  const rv = isGenericModelPlainObject(plan.revisionEnginePlan) ? plan.revisionEnginePlan : {};
  if (rv.revisionEngineImplemented === true) blockers.push('unsafe_revision_engine_implemented');
  if (rv.historyPersistenceAllowed === true || rv.inPlaceCanonicalMutationAllowed === true) blockers.push('unsafe_revision_engine_persistence');

  // Validation pipeline plan.
  const vp = isGenericModelPlainObject(plan.validationPipelinePlan) ? plan.validationPipelinePlan : {};
  if (vp.validationPipelineImplemented === true) blockers.push('unsafe_validation_pipeline_implemented');
  if (vp.failClosed === false) blockers.push('unsafe_validation_pipeline_not_fail_closed');

  // Invariant enforcement plan.
  const ie = isGenericModelPlainObject(plan.invariantEnforcementPlan) ? plan.invariantEnforcementPlan : {};
  if (ie.invariantEnforcementImplemented === true) blockers.push('unsafe_invariant_enforcement_implemented');

  // Preview handoff plan.
  const pv = isGenericModelPlainObject(plan.syntheticPreviewHandoffPlan) ? plan.syntheticPreviewHandoffPlan : {};
  if (pv.previewHandoffImplemented === true || pv.handoffToProduct === true || pv.realDataAttached === true) blockers.push('unsafe_preview_handoff');

  // Certification candidate plan.
  const cc = isGenericModelPlainObject(plan.certificationCandidatePreparationPlan) ? plan.certificationCandidatePreparationPlan : {};
  if (cc.certificationCandidateCreated === true || cc.certificationPerformed === true) blockers.push('unsafe_certification_candidate_created');
  if (cc.selfCertificationAllowed === true || cc.overwritesCertifiedContract === true) blockers.push('unsafe_self_certification');

  // SSOT protection plan.
  const ss = isGenericModelPlainObject(plan.ssotProtectionPlan) ? plan.ssotProtectionPlan : {};
  if (ss.draftIsCanonical === true || ss.candidateIsCanonical === true) blockers.push('unsafe_ssot_inversion');
  if (ss.certifiedBlueprintRemainsSsot === false) blockers.push('unsafe_ssot_not_preserved');
  if (ss.authoringMayOverwriteCertifiedBlueprint === true || ss.authoringMayBypassCertification === true) blockers.push('unsafe_ssot_overwrite');

  // Permission/tenancy boundary plan.
  const pt = isGenericModelPlainObject(plan.permissionTenancyBoundaryPlan) ? plan.permissionTenancyBoundaryPlan : {};
  if (pt.permissionModelIntegrated === true) blockers.push('unsafe_permission_model_integrated_without_foundation');
  if (pt.tenantModelIntegrated === true) blockers.push('unsafe_tenant_model_integrated_without_foundation');
  if (pt.serverSideAuthorizationIntegrated === true) blockers.push('unsafe_server_side_authorization_integrated');

  // Persistence + module-generation prohibition plans.
  const pp = isGenericModelPlainObject(plan.persistenceProhibitionPlan) ? plan.persistenceProhibitionPlan : {};
  if (pp.persistenceImplemented === true || pp.storageAllowed === true || pp.databaseAllowed === true) blockers.push('unsafe_persistence');
  const mp = isGenericModelPlainObject(plan.moduleGenerationProhibitionPlan) ? plan.moduleGenerationProhibitionPlan : {};
  if (mp.moduleGenerated === true || mp.filesWrittenToModule === true || mp.moduleRegistered === true) blockers.push('unsafe_module_generation');

  // Prototype relink static assertion.
  const pr = isGenericModelPlainObject(plan.prototypeRelinkStaticAssertion) ? plan.prototypeRelinkStaticAssertion : {};
  if (pr.prototypeRelinkAllowed === true || pr.oldPrototypeImported === true) blockers.push('unsafe_prototype_relink');

  // Governance registry plan.
  const gr = isGenericModelPlainObject(plan.governanceRegistry) ? plan.governanceRegistry : {};
  if (gr.registryTouched === true || gr.guardTouched === true || gr.broadWildcardAllowed === true) blockers.push('unsafe_governance_registry');

  // Manual gate must be present and authorize nothing real.
  const mg = isGenericModelPlainObject(plan.manualGate) ? plan.manualGate : {};
  if (mg.manualGateRequired !== true) blockers.push('missing_manual_gate');
  if (mg.authorizesAuthoringRuntime === true || mg.authorizesModuleGeneration === true || mg.authorizesProductExposure === true) {
    blockers.push('unsafe_manual_gate_authorizes_real');
  }

  // Safety.
  const sc = isGenericModelPlainObject(plan.safety) ? plan.safety : {};
  if (sc.anyForbiddenSideEffect === true) blockers.push('unsafe_safety_side_effect');

  const ok = blockers.length === 0;
  const core = {
    kind: 'authoring-implementation-plan-verification',
    ok,
    valid: ok,
    headless: caps.headless === true,
    planOnly: caps.planOnly === true,
    ssotPreserved: caps.ssotPreserved === true,
    authoringRuntimeImplemented: caps.authoringRuntimeImplemented === true,
    moduleGenerated: caps.moduleGenerated === true,
    productExposed: caps.productExposed === true,
    blockers,
    blockerCount: blockers.length,
    checkedCapabilities: mustBeFalse.length + mustBeTrue.length,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, verificationDigest: authoringPlanDigest(core) });
}

export default verifyAuthoringImplementationPlan;
