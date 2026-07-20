import { BRIDGE_IMPLEMENTATION_PLAN_CAPABILITIES, bridgePlanDigest } from './bridgeImplementationPlanConfig.js';
import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/**
 * Fail-closed verifier for a produced bridge implementation plan. Detects any implemented/completed phase,
 * any real-effect capability leak, any permissive source/version/mapping/extension/digest rule, any SSOT
 * inversion, missing manual gate, and any embedded nondeterminism marker. Pure — returns a report; never
 * throws, never mutates, never does I/O. Any violated invariant is a blocker.
 *
 * @param {Object} [options] @param {Object} [options.plan] @returns {Object}
 */
export function verifyBridgeImplementationPlan(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const plan = isGenericModelPlainObject(o.plan) ? o.plan : {};
  const caps = isGenericModelPlainObject(plan.capabilities) ? plan.capabilities : BRIDGE_IMPLEMENTATION_PLAN_CAPABILITIES;

  const blockers = [];

  // Capability flags that must be TRUE (plan-only invariants).
  const mustBeTrue = [
    'headless', 'contractOnly', 'metadataOnly', 'planOnly', 'syntheticOnly', 'devOnly', 'deterministic',
    'failClosed', 'ssotPreserved', 'implementationPhasesOnly',
  ];
  for (const k of mustBeTrue) {
    if (caps[k] !== true) blockers.push(`capability_${k}_must_be_true`);
  }

  // Capability flags that must be FALSE (nothing real implemented / touched).
  const mustBeFalse = [
    'bridgeImplemented', 'adapterImplemented', 'sourceValidationImplemented', 'draftIdentityEnforcementImplemented',
    'sourceVersionValidationImplemented', 'sourceDigestValidationImplemented', 'sourceBoundaryValidationImplemented',
    'mappingExecutorImplemented', 'targetDescriptorBuilderImplemented', 'targetVersionValidationImplemented',
    'canonicalizationValidationImplemented', 'extensibilityEnforcementImplemented', 'validationPipelineImplemented',
    'replayIdempotencyImplemented', 'resourceLimitsImplemented', 'failureContainmentImplemented',
    'targetPayloadCreated', 'previewPayloadCreated', 'previewMounted', 'appTouched', 'routeCreated', 'menuCreated',
    'sidebarCreated', 'persistenceImplemented', 'filesystemWritesUsed', 'backendAccessed', 'prismaAccessed',
    'fetchUsed', 'networkUsed', 'realDataRead', 'realDataWrite', 'moduleGenerated', 'moduleRegistered',
    'certificationPerformed', 'candidateCanonical', 'productExposed', 'productionAccessed', 'stagingAccessed',
    'prototypeRelinked', 'permissionModelIntegrated', 'tenantModelIntegrated', 'serverSideAuthorizationIntegrated',
  ];
  for (const k of mustBeFalse) {
    if (caps[k] === true) blockers.push(`capability_${k}_must_be_false`);
  }

  // Phases: every phase planned, none implemented/completed.
  const ph = isGenericModelPlainObject(plan.phases) ? plan.phases : {};
  if (ph.anyImplemented === true) blockers.push('unsafe_phase_implemented');
  if (Array.isArray(ph.phases) && ph.phases.some((p) => isGenericModelPlainObject(p) && (p.implemented === true || p.completed === true))) blockers.push('unsafe_phase_completed');
  if (ph.allPlanned === false) blockers.push('unsafe_phase_not_all_planned');

  // Source validation plan.
  const sv = isGenericModelPlainObject(plan.sourceValidationPlan) ? plan.sourceValidationPlan : {};
  if (sv.sourceValidationImplemented === true) blockers.push('unsafe_source_validation_implemented');
  if (sv.unknownCriticalFieldsRejected === false) blockers.push('unsafe_source_unknown_critical_accepted');
  if (sv.missingCriticalFieldsFailClosed === false) blockers.push('unsafe_source_missing_not_fail_closed');
  // Source-shape alignment.
  const svReq = Array.isArray(sv.requiredFields) ? sv.requiredFields : [];
  const svCrit = Array.isArray(sv.criticalFields) ? sv.criticalFields : [];
  if (svReq.includes('upstreamVersions') || svCrit.includes('upstreamVersions') || sv.upstreamVersionsSourceFieldAllowed === true) blockers.push('unsafe_source_upstreamVersions_field');
  if (svReq.includes('digest') || svCrit.includes('digest') || sv.genericDigestSourceFieldAllowed === true) blockers.push('unsafe_source_generic_digest_field');
  if (sv.realSourceFieldNamesRequired === false) blockers.push('unsafe_source_real_field_names_not_required');
  if (sv.legacyInventedSourceFieldAliasesAllowed === true) blockers.push('unsafe_source_legacy_alias_allowed');
  if (sv.everyRequiredFieldExistsInRealHandoff === false) blockers.push('unsafe_source_required_field_not_in_real_handoff');

  // Draft identity enforcement plan.
  const di = isGenericModelPlainObject(plan.draftIdentityEnforcementPlan) ? plan.draftIdentityEnforcementPlan : {};
  if (di.strictDraftIdentityEnforcementImplemented === true) blockers.push('unsafe_draft_identity_implemented');
  if (di.explicitDraftIdRequired === false) blockers.push('unsafe_draft_identity_non_strict');
  if (di.singleDraftFallbackAllowed === true) blockers.push('unsafe_single_draft_fallback');
  if (di.missingDraftIdFailsClosed === false || di.unknownDraftIdFailsClosed === false) blockers.push('unsafe_draft_id_not_fail_closed');

  // Version validation plans.
  const svv = isGenericModelPlainObject(plan.sourceVersionValidationPlan) ? plan.sourceVersionValidationPlan : {};
  if (svv.exactSourceRuntimeVersionRequired === false) blockers.push('unsafe_source_version_not_exact');
  if (svv.unknownVersionFailsClosed === false) blockers.push('unsafe_source_version_unknown_accepted');
  if (svv.versionDowngradeAllowed === true) blockers.push('unsafe_source_version_downgrade');
  if (svv.versionUpgradeAssumedCompatible === true) blockers.push('unsafe_source_version_upgrade_assumed');
  const tvv = isGenericModelPlainObject(plan.targetVersionValidationPlan) ? plan.targetVersionValidationPlan : {};
  if (tvv.exactTargetSandboxVersionRequired === false) blockers.push('unsafe_target_version_not_exact');
  if (tvv.unknownVersionFailsClosed === false) blockers.push('unsafe_target_version_unknown_accepted');

  // Digest validation plan: FNV internal-only; never cryptographic; authorizes nothing real; aligned.
  const dg = isGenericModelPlainObject(plan.sourceDigestValidationPlan) ? plan.sourceDigestValidationPlan : {};
  if (dg.cryptographicIntegrityProvided === true) blockers.push('unsafe_digest_claimed_cryptographic');
  if (dg.digestMayAuthorizeCertification === true || dg.digestMayAuthorizeModuleGeneration === true
    || dg.digestMayAuthorizeProduction === true) blockers.push('unsafe_digest_authorizes_real');
  if (dg.sourceDigestField !== undefined && dg.sourceDigestField !== 'handoffDigest') blockers.push('unsafe_digest_wrong_source_field');
  if (dg.digestValidationMode !== undefined && dg.digestValidationMode !== 'recompute_and_compare') blockers.push('unsafe_digest_wrong_validation_mode');
  if (dg.alternativeSerializerAllowed === true) blockers.push('unsafe_digest_alternative_serializer');
  if (dg.canonicalSerializer !== undefined && (typeof dg.canonicalSerializer !== 'string' || dg.canonicalSerializer.length === 0)) blockers.push('unsafe_digest_serializer_undeclared');
  if (dg.digestHelper !== undefined && (typeof dg.digestHelper !== 'string' || dg.digestHelper.length === 0)) blockers.push('unsafe_digest_helper_undeclared');
  if (dg.handoffDigestExcludedFromOwnPreimage === false) blockers.push('unsafe_digest_preimage_includes_self');

  // Source version validation: explicit tuple, no aggregated upstreamVersions.
  const svvAlign = isGenericModelPlainObject(plan.sourceVersionValidationPlan) ? plan.sourceVersionValidationPlan : {};
  if (svvAlign.aggregatedUpstreamVersionsFieldRequired === true) blockers.push('unsafe_version_upstreamVersions_required');
  if (svvAlign.explicitVersionTupleRequired === false) blockers.push('unsafe_version_no_explicit_tuple');
  if (Array.isArray(svvAlign.versionTupleFields) && svvAlign.versionTupleFields.includes('upstreamVersions')) blockers.push('unsafe_version_tuple_has_upstreamVersions');

  // Resource-limit coherence: mismatch never silent; stricter is intentional; no partial descriptor.
  const rlc = isGenericModelPlainObject(plan.resourceLimitsPlan) ? plan.resourceLimitsPlan : {};
  if (rlc.limitMismatchIsNotSilent === false) blockers.push('unsafe_limit_mismatch_silent');
  if (rlc.limitExceededProducesDeterministicBlocker === false) blockers.push('unsafe_limit_not_deterministic_blocker');
  if (rlc.partialTargetDescriptorAllowed === true) blockers.push('unsafe_limit_partial_descriptor');

  // Field mapping alignment: real source fields only, no invented alias / duplicate.
  const fma = isGenericModelPlainObject(plan.fieldMappingExecutionPlan) ? plan.fieldMappingExecutionPlan : {};
  if (fma.anyInventedSourceField === true || fma.everyMappingSourceExistsInRealHandoff === false) blockers.push('unsafe_mapping_invented_source_field');
  if (fma.anyLegacyAliasSourceField === true) blockers.push('unsafe_mapping_legacy_alias');
  if (fma.noDuplicateSourceField === false || fma.noDuplicateTargetField === false) blockers.push('unsafe_mapping_duplicate');

  // Field mapping execution plan.
  const fm = isGenericModelPlainObject(plan.fieldMappingExecutionPlan) ? plan.fieldMappingExecutionPlan : {};
  if (fm.mappingExecutorImplemented === true || fm.anyImplemented === true) blockers.push('unsafe_mapping_executor_implemented');
  if (fm.anyUnknownTransform === true) blockers.push('unsafe_mapping_unknown_transform');
  if (fm.anyCriticalDefault === true) blockers.push('unsafe_mapping_critical_default');
  if (fm.anyLossyCritical === true) blockers.push('unsafe_mapping_lossy_critical');
  if (fm.everyCriticalMapped === false) blockers.push('unsafe_mapping_missing_critical');

  // Target descriptor plan.
  const td = isGenericModelPlainObject(plan.targetDescriptorConstructionPlan) ? plan.targetDescriptorConstructionPlan : {};
  if (td.targetDescriptorBuilderImplemented === true || td.targetPayloadCreated === true
    || td.previewMounted === true || td.productExposed === true || td.moduleGenerated === true) blockers.push('unsafe_target_descriptor_real');

  // Canonicalization + extensibility plans.
  const cn = isGenericModelPlainObject(plan.canonicalizationValidationPlan) ? plan.canonicalizationValidationPlan : {};
  if (cn.ambientClockForbidden === false || cn.randomnessForbidden === false) blockers.push('unsafe_canonicalization_permissive');
  const ext = isGenericModelPlainObject(plan.extensibilityEnforcementPlan) ? plan.extensibilityEnforcementPlan : {};
  if (ext.unknownCriticalFieldsRejected === false) blockers.push('unsafe_extensibility_unknown_critical_accepted');
  if (ext.extensionCannotOverrideCriticalFields === false) blockers.push('unsafe_extension_override');

  // Validation pipeline plan.
  const vp = isGenericModelPlainObject(plan.validationPipelinePlan) ? plan.validationPipelinePlan : {};
  if (vp.validationPipelineImplemented === true) blockers.push('unsafe_validation_pipeline_implemented');
  if (vp.silentAutoCorrectionAllowed === true) blockers.push('unsafe_validation_auto_correction');
  if (vp.permissiveFallbackAllowed === true) blockers.push('unsafe_validation_permissive_fallback');

  // Replay + resource limits.
  const rp = isGenericModelPlainObject(plan.replayIdempotencyPlan) ? plan.replayIdempotencyPlan : {};
  if (rp.replaySideEffectsAllowed === true) blockers.push('unsafe_replay_side_effects');
  const rl = isGenericModelPlainObject(plan.resourceLimitsPlan) ? plan.resourceLimitsPlan : {};
  if (rl.unknownResourceDimensionRejected === false) blockers.push('unsafe_unknown_resource_dimension');
  if (rl.silentTruncationAllowed === true) blockers.push('unsafe_silent_truncation');
  if (rl.limitExceededFailsClosed === false) blockers.push('unsafe_limit_not_fail_closed');

  // Failure containment.
  const fc = isGenericModelPlainObject(plan.failureContainmentPlan) ? plan.failureContainmentPlan : {};
  if (fc.partialTargetDescriptorAllowed === true || fc.partialBridgeDecisionAllowed === true) blockers.push('unsafe_partial_state');
  if (fc.sourceMutationAllowed === true || fc.targetMutationAllowed === true) blockers.push('unsafe_mutation');

  // SSOT protection.
  const ss = isGenericModelPlainObject(plan.ssotProtectionPlan) ? plan.ssotProtectionPlan : {};
  if (ss.certifiedBlueprintRemainsSsot === false) blockers.push('unsafe_ssot_not_preserved');
  if (ss.draftIsCanonical === true || ss.candidateIsCanonical === true) blockers.push('unsafe_ssot_inversion');
  if (ss.bridgeMayCertify === true || ss.bridgeMayWriteCertifiedBlueprint === true
    || ss.bridgeMayBypassCertification === true || ss.bridgeMayGenerateModule === true) blockers.push('unsafe_ssot_bridge_privilege');

  // Certification boundary.
  const cb = isGenericModelPlainObject(plan.certificationBoundaryPlan) ? plan.certificationBoundaryPlan : {};
  if (cb.certificationPerformed === true) blockers.push('unsafe_certification_performed');
  if (cb.selfCertificationAllowed === true) blockers.push('unsafe_self_certification');

  // Permission/tenancy.
  const pt = isGenericModelPlainObject(plan.permissionTenancyBoundaryPlan) ? plan.permissionTenancyBoundaryPlan : {};
  if (pt.permissionModelIntegrated === true) blockers.push('unsafe_permission_model_integrated');
  if (pt.tenantModelIntegrated === true) blockers.push('unsafe_tenant_model_integrated');
  if (pt.requiresPermissionTenancyFoundationBeforeExposure === false) blockers.push('unsafe_permission_exposure_not_blocked');

  // Security/safety.
  const sec = isGenericModelPlainObject(plan.securitySafetyPlan) ? plan.securitySafetyPlan : {};
  if (sec.anyForbiddenSideEffect === true || sec.anyRealAllowed === true) blockers.push('unsafe_security_real_allowed');

  // Prototype relink assertion.
  const pr = isGenericModelPlainObject(plan.prototypeRelinkAssertionPlan) ? plan.prototypeRelinkAssertionPlan : {};
  if (pr.prototypeRelinkAllowed === true || pr.oldPrototypeImported === true) blockers.push('unsafe_prototype_relink');

  // Rollout blocked.
  const ro = isGenericModelPlainObject(plan.rolloutRollbackPlan) ? plan.rolloutRollbackPlan : {};
  if (ro.rolloutBlocked === false) blockers.push('unsafe_rollout_not_blocked');
  if (ro.productionRolloutAllowed === true || ro.stagingRolloutAllowed === true || ro.productExposureAllowed === true) blockers.push('unsafe_rollout_real');

  // Manual gate.
  const mg = isGenericModelPlainObject(plan.manualGate) ? plan.manualGate : {};
  if (mg.manualGateRequired !== true) blockers.push('missing_manual_gate');
  if (mg.authorizesBridgeImplementation === true || mg.authorizesPreviewMount === true
    || mg.authorizesModuleGeneration === true || mg.authorizesCertification === true
    || mg.authorizesProductExposure === true || mg.authorizesProduction === true) blockers.push('unsafe_manual_gate_authorizes_real');

  // Readiness: never a real implementation/exposure state.
  if (plan.readyForBridgeImplementationSlice === true) blockers.push('unsafe_ready_for_implementation_slice');
  if (plan.readyForPreviewMount === true) blockers.push('unsafe_ready_for_preview_mount');
  if (plan.readyForProductExposure === true) blockers.push('unsafe_ready_for_product_exposure');
  if (plan.readyForModuleGeneration === true) blockers.push('unsafe_ready_for_module_generation');
  if (plan.readyForProduction === true) blockers.push('unsafe_ready_for_production');

  // Static nondeterminism scan over any embedded source string (defensive; the gate is authoritative).
  let serialized = '';
  try {
    serialized = JSON.stringify(plan) || '';
  } catch {
    serialized = '';
  }
  if (/Date\.now|new Date\(|Math\.random|crypto\.randomUUID|\brandomUUID\b/.test(serialized)) blockers.push('unsafe_nondeterministic_source');

  const ok = blockers.length === 0;
  const core = {
    kind: 'bridge-implementation-plan-verification',
    ok,
    valid: ok,
    headless: caps.headless === true,
    planOnly: caps.planOnly === true,
    deterministic: caps.deterministic === true,
    failClosed: caps.failClosed === true,
    ssotPreserved: caps.ssotPreserved === true,
    anyPhaseImplemented: ph.anyImplemented === true,
    bridgeImplemented: caps.bridgeImplemented === true,
    previewMounted: caps.previewMounted === true,
    certificationPerformed: caps.certificationPerformed === true,
    productExposed: caps.productExposed === true,
    permissionModelIntegrated: caps.permissionModelIntegrated === true,
    blockers,
    blockerCount: blockers.length,
    checkedCapabilities: mustBeTrue.length + mustBeFalse.length,
  };
  return safeCloneGenericModel({ ...core, verificationDigest: bridgePlanDigest(core) });
}

export default verifyBridgeImplementationPlan;
