import { PHASE_IDS } from './phaseDefinitions.js';
import { FUTURE_FILE_NAMES } from './futureFileMap.js';
import { TRANSFORM_KINDS } from './planConfig.js';
import { deepFreeze } from './deepFreeze.js';
import { isPlainObject } from './planInput.js';

/**
 * Fail-closed verifier for the produced implementation PLAN. Detects any executable runtime, any premature
 * runtime authorization, missing/reordered phases, missing future files, identity-plan incompleteness, an
 * ignored B-RECOMPUTE-INPUT, digest synthesis/fallback, cross-decision mixing, permissive versions, mapping
 * drift, partial descriptor, side effects, any UI/App/mount/storage/backend/module/product capability, SSOT
 * inversion, a missing manual gate, and a runtime authorized while B-RECOMPUTE-INPUT is open. Pure — never
 * throws, never mutates, never does I/O. @param {Object} [options] @param {Object} [options.plan] @returns {Object}
 */
export function verifyBridgeToPreviewSandboxRuntimeImplementationPlan(options = {}) {
  const o = isPlainObject(options) ? options : {};
  const c = isPlainObject(o.plan) ? o.plan : {};
  const blockers = [];

  const caps = isPlainObject(c.capabilities) ? c.capabilities : {};
  const mustBeTrue = [
    'headless', 'devOnly', 'syntheticOnly', 'inMemoryOnly', 'ephemeralOnly', 'deterministic', 'immutable',
    'failClosed', 'sideEffectFree', 'metadataOnly', 'planOnly', 'reflectsRealUpstreamShapes',
    'upstreamsConsumedReadOnly', 'bIdentityClosedByContract',
  ];
  for (const k of mustBeTrue) { if (caps[k] !== true) blockers.push(`capability_${k}_must_be_true`); }
  const mustBeFalse = [
    'runtimeImplemented', 'runtimeFactoryImplemented', 'executeImplemented', 'envelopeBuilderImplemented',
    'identityVerificationImplemented', 'pipelineImplemented', 'mappingExecutorImplemented',
    'sandboxDescriptorBuilderImplemented', 'consumerDecisionImplemented', 'validationExecuted',
    'sourceDecisionConsumed', 'targetDescriptorConsumed', 'previewPayloadCreated', 'previewMounted', 'appTouched',
    'routeCreated', 'menuCreated', 'sidebarCreated', 'persistenceImplemented', 'filesystemWritesUsed',
    'backendAccessed', 'prismaAccessed', 'fetchUsed', 'networkUsed', 'realDataRead', 'realDataWrite',
    'moduleGenerated', 'moduleRegistered', 'certificationPerformed', 'productExposed', 'productionAccessed',
    'stagingAccessed', 'prototypeRelinked', 'permissionModelIntegrated', 'tenantModelIntegrated',
    'serverSideAuthorizationIntegrated',
  ];
  for (const k of mustBeFalse) { if (caps[k] === true) blockers.push(`capability_${k}_must_be_false`); }

  // Phases present, ordered, complete.
  const phases = Array.isArray(c.phases) ? c.phases : [];
  if (phases.length < 18) blockers.push('phases_incomplete');
  for (let i = 0; i < PHASE_IDS.length; i += 1) {
    const p = phases[i];
    if (!p || p.phaseId !== PHASE_IDS[i]) blockers.push(`phase_missing_or_reordered_${PHASE_IDS[i]}`);
    if (p && p.order !== i + 1) blockers.push(`phase_wrong_order_${PHASE_IDS[i]}`);
    if (p && p.sideEffectsAllowed === true) blockers.push(`phase_side_effect_allowed_${PHASE_IDS[i]}`);
    if (p && p.implementationStatus !== 'planned') blockers.push(`phase_not_planned_${PHASE_IDS[i]}`);
  }

  // Future files present in the map (they must NOT exist on disk — that is a gate concern; here we check the map).
  const fileMap = Array.isArray(c.futureFileMap) ? c.futureFileMap : [];
  const mappedNames = fileMap.map((f) => f && f.file);
  for (const name of FUTURE_FILE_NAMES) { if (!mappedNames.includes(name)) blockers.push(`future_file_missing_${name}`); }
  for (const f of fileMap) { if (f && f.createdInThisSlice === true) blockers.push(`future_file_created_prematurely_${f.file}`); }

  // Future public API — nothing implemented.
  const api = isPlainObject(c.futurePublicApi) ? c.futurePublicApi : {};
  if (api.publicApiImplemented === true) blockers.push('public_api_implemented');
  if (api.executeImplemented === true) blockers.push('execute_implemented');
  if (api.runtimeFactoryImplemented === true) blockers.push('runtime_factory_implemented');

  // Identity plan complete + recompute mode + B-RECOMPUTE-INPUT handled explicitly (not ignored).
  const idp = isPlainObject(c.identityVerificationPlan) ? c.identityVerificationPlan : {};
  if (idp.identityVerificationMode !== 'recompute_and_compare') blockers.push('identity_wrong_mode');
  if (idp.identitySynthesisAllowed === true) blockers.push('identity_synthesis_allowed');
  if (idp.identityAliasAllowed === true) blockers.push('identity_alias_allowed');
  if (idp.identityFallbackAllowed === true) blockers.push('identity_fallback_allowed');
  if (idp.implementationCannotProceedUntilDigestRecomputationInputsAreComplete !== true) blockers.push('recompute_precondition_missing');
  const br = isPlainObject(idp.bRecomputeInput) ? idp.bRecomputeInput : {};
  if (br.blockerId !== 'B-RECOMPUTE-INPUT') blockers.push('b_recompute_input_not_declared');
  if (!Array.isArray(br.options) || br.options.length < 3) blockers.push('b_recompute_input_options_missing');
  if (typeof br.selectedOption !== 'string' || br.selectedOption.length === 0) blockers.push('b_recompute_input_no_selection');
  // If the envelope is insufficient but the plan claims resolved, that is a silent-solution defect.
  if (br.envelopeFieldsSufficientForRecompute === false && br.resolvedByPlan === true) blockers.push('b_recompute_input_falsely_resolved');
  // Runtime must NOT be authorized while B-RECOMPUTE-INPUT is unresolved.
  if (br.resolvedByPlan !== true && c.readyForRuntimeImplementation === true) blockers.push('runtime_authorized_with_open_blocker');

  // Digest recomputation input plan — the gap must be honest (no synthesis/fallback).
  const drp = isPlainObject(c.digestRecomputationInputPlan) ? c.digestRecomputationInputPlan : {};
  if (drp.implementationCannotProceedUntilDigestRecomputationInputsAreComplete !== true) blockers.push('digest_recompute_precondition_missing');

  // Provenance — no cross-decision mixing / replacement.
  const prov = isPlainObject(c.sameDecisionProvenancePlan) ? c.sameDecisionProvenancePlan : {};
  if (prov.crossDecisionMixingAllowed === true) blockers.push('cross_decision_mix_allowed');
  if (prov.descriptorReplacementAllowed === true || prov.digestReplacementAllowed === true) blockers.push('replacement_allowed');
  if (prov.atomicPairRequired === false) blockers.push('atomic_pair_not_required');

  // Versions — no permissive policy in the pipeline plan.
  const pipe = isPlainObject(c.validationPipelinePlan) ? c.validationPipelinePlan : {};
  if (pipe.stageCount !== 17) blockers.push('pipeline_not_17_stages');
  if (pipe.blockerStopsSandboxDescriptor === false) blockers.push('pipeline_blocker_not_stopping');
  if (pipe.pipelineImplemented === true || pipe.validationExecuted === true) blockers.push('pipeline_implemented');

  // Mapping — exactly 12, allowlist transforms, no default/lossy/duplicate.
  const map = isPlainObject(c.mappingExecutionPlan) ? c.mappingExecutionPlan : {};
  if (map.mappingCount !== 12) blockers.push('mapping_count_not_12');
  if (Array.isArray(map.mappings)) {
    for (const m of map.mappings) {
      if (!TRANSFORM_KINDS.includes(m.transformKind)) blockers.push(`mapping_unknown_transform_${m.mappingId}`);
      if (m.defaultAllowed === true) blockers.push(`mapping_default_allowed_${m.mappingId}`);
      if (m.losslessRequired === false) blockers.push(`mapping_lossy_${m.mappingId}`);
    }
    const ids = map.mappings.map((m) => m.mappingId);
    if (new Set(ids).size !== ids.length) blockers.push('mapping_duplicate');
  }
  if (map.mappingExecutorImplemented === true) blockers.push('mapping_executor_implemented');

  // Sandbox descriptor — no partial, builder not implemented.
  const sd = isPlainObject(c.sandboxDescriptorBuildPlan) ? c.sandboxDescriptorBuildPlan : {};
  if (sd.noPartialDescriptorOnBlocker === false) blockers.push('partial_descriptor_allowed');
  if (sd.sandboxDescriptorBuilderImplemented === true || sd.sandboxDescriptorCreated === true) blockers.push('descriptor_built');

  // Failure containment.
  const fc = isPlainObject(c.failureContainmentPlan) ? c.failureContainmentPlan : {};
  if (fc.partialSandboxDescriptorAllowed === true) blockers.push('failure_partial_allowed');
  if (fc.unexpectedExceptionFailsClosed === false) blockers.push('exceptions_may_escape');
  if (fc.stackLeakAllowed === true || fc.secretLeakAllowed === true || fc.messageLeakAllowed === true) blockers.push('failure_leak_allowed');

  // Security / SSOT / permission.
  const sec = isPlainObject(c.securitySsotPermissionPlan) ? c.securitySsotPermissionPlan : {};
  if (sec.certifiedBlueprintRemainsSsot === false) blockers.push('ssot_not_preserved');
  if (sec.runtimeMayCertify === true || sec.runtimeMayGenerateModule === true || sec.runtimeMayExposeProduct === true) blockers.push('ssot_inversion');
  if (sec.permissionModelIntegrated === true || sec.tenantModelIntegrated === true) blockers.push('permission_integrated');

  // Extensibility.
  const ext = isPlainObject(c.extensibilityPlan) ? c.extensibilityPlan : {};
  if (ext.overrideForbidden === false) blockers.push('extension_override_allowed');

  // Replay determinism.
  const rep = isPlainObject(c.replayIdempotencyPlan) ? c.replayIdempotencyPlan : {};
  if (rep.randomnessAllowed === true || rep.ambientClockAllowed === true) blockers.push('nondeterminism_allowed');

  // Manual checkpoints.
  const mcp = isPlainObject(c.manualCheckpointPlan) ? c.manualCheckpointPlan : {};
  if (!Array.isArray(mcp.checkpoints) || mcp.checkpoints.length < 4) blockers.push('manual_checkpoints_missing');
  if (mcp.onlyCheckpoint01Authorized !== true) blockers.push('manual_gate_over_authorized');
  if (mcp.authorizesConsumerRuntime === true || mcp.authorizesPreviewMount === true || mcp.authorizesProductExposure === true) blockers.push('manual_gate_authorizes_real');

  // Premature readiness.
  if (c.readyForRuntimeImplementation === true) blockers.push('premature_runtime');
  if (c.readyForPreviewMount === true) blockers.push('premature_preview_mount');
  if (c.readyForProductExposure === true) blockers.push('premature_product_exposure');

  // Static nondeterminism scan over the serialized plan.
  let serialized = '';
  try { serialized = JSON.stringify(c) || ''; } catch { serialized = ''; }
  if (/Date\.now\(|new Date\(|Math\.random|crypto\.randomUUID|performance\.now|toLocaleString|localeCompare/.test(serialized)) {
    blockers.push('nondeterministic_source');
  }

  const ok = blockers.length === 0;
  return deepFreeze({
    kind: 'bridge-to-preview-sandbox-runtime-implementation-plan-verification',
    ok, valid: ok,
    planOnly: caps.planOnly === true,
    runtimeImplemented: caps.runtimeImplemented === true,
    executeImplemented: caps.executeImplemented === true || api.executeImplemented === true,
    previewMounted: caps.previewMounted === true,
    productExposed: caps.productExposed === true,
    bIdentityClosedByContract: caps.bIdentityClosedByContract === true,
    bRecomputeInputResolvedByPlan: br.resolvedByPlan === true,
    readyForRuntimeImplementation: c.readyForRuntimeImplementation === true,
    blockers, blockerCount: blockers.length,
    checkedCapabilities: mustBeTrue.length + mustBeFalse.length,
  });
}

export default verifyBridgeToPreviewSandboxRuntimeImplementationPlan;
