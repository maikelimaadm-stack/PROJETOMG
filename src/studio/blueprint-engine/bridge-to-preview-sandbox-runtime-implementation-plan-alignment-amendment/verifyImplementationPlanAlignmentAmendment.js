import { REPLACEMENT_ARCHITECTURE, SUPERSEDED_ARCHITECTURE } from './amendmentConfig.js';
import { deepFreeze } from './deepFreeze.js';
import { isPlainObject } from './amendmentInput.js';

/**
 * Fail-closed verifier for the alignment amendment. Detects Option A still selected, Core Envelope v2 absent, v1
 * runtime input allowed, a reintroduced preimage gap, missing/extra core ignored, a false bRecomputeInputResolved
 * ByPlan, an ignored B-CORE-ENVELOPE-BUILDER, premature runtime, builder implemented, modified source-plan/upstream
 * files, divergent phase order, wrong mapping source, a created digest mapping, any UI/App/mount/storage/backend/
 * module/product, and a missing manual gate. Pure — never throws, mutates or does I/O.
 * @param {Object} [options] @param {Object} [options.amendment] @returns {Object}
 */
export function verifyImplementationPlanAlignmentAmendment(options = {}) {
  const o = isPlainObject(options) ? options : {};
  const c = isPlainObject(o.amendment) ? o.amendment : {};
  const blockers = [];

  const caps = isPlainObject(c.capabilities) ? c.capabilities : {};
  const mustBeTrue = [
    'headless', 'devOnly', 'syntheticOnly', 'inMemoryOnly', 'ephemeralOnly', 'deterministic', 'immutable', 'failClosed',
    'sideEffectFree', 'metadataOnly', 'amendmentOnly', 'reflectsRealUpstreamShapes', 'upstreamsConsumedReadOnly',
    'historicalPlanRemainsImmutable', 'bIdentityClosedByContract', 'bRecomputeInputClosedByContract',
    'bRecomputeInputResolvedByPlan', 'implementationPlanAlignedToCoreEnvelopeV2',
  ];
  for (const k of mustBeTrue) { if (caps[k] !== true) blockers.push(`capability_${k}_must_be_true`); }
  const mustBeFalse = [
    'sourcePlanFilesModified', 'coreEnvelopeContractFilesModified', 'runtimeImplemented', 'runtimeFactoryImplemented',
    'executeImplemented', 'coreEnvelopeBuilderImplemented', 'coreExtractorImplemented', 'identityVerificationImplemented',
    'digestRecomputeImplemented', 'mappingExecutorImplemented', 'sandboxDescriptorBuilderImplemented',
    'consumerDecisionImplemented', 'validationExecuted', 'previewMounted', 'appTouched', 'routeCreated', 'menuCreated',
    'sidebarCreated', 'persistenceImplemented', 'filesystemWritesUsed', 'backendAccessed', 'prismaAccessed', 'fetchUsed',
    'networkUsed', 'realDataRead', 'realDataWrite', 'moduleGenerated', 'moduleRegistered', 'certificationPerformed',
    'productExposed', 'productionAccessed', 'stagingAccessed', 'prototypeRelinked', 'permissionModelIntegrated',
    'tenantModelIntegrated', 'serverSideAuthorizationIntegrated',
  ];
  for (const k of mustBeFalse) { if (caps[k] === true) blockers.push(`capability_${k}_must_be_false`); }

  // Supersession — Option A superseded, Option B selected; historical plan immutable; upstreams unmodified.
  const su = isPlainObject(c.supersession) ? c.supersession : {};
  if (su.supersedesSelectedArchitecture !== SUPERSEDED_ARCHITECTURE) blockers.push('option_a_not_superseded');
  if (su.replacementArchitecture !== REPLACEMENT_ARCHITECTURE) blockers.push('option_b_not_selected');
  if (su.historicalPlanRemainsImmutable !== true) blockers.push('historical_plan_mutable');
  if (su.sourcePlanFilesModified === true) blockers.push('source_plan_files_modified');
  if (su.coreEnvelopeContractFilesModified === true) blockers.push('core_contract_files_modified');
  if (c.selectedArchitecture !== REPLACEMENT_ARCHITECTURE) blockers.push('amendment_not_option_b');

  // Core traceability — v2 present, closure real.
  const ct = isPlainObject(c.coreEnvelopeContractTraceability) ? c.coreEnvelopeContractTraceability : {};
  if (ct.coreEnvelopeVersionTag !== 'v2') blockers.push('core_envelope_v2_absent');
  if (ct.bRecomputeClosureState !== 'CLOSED_BY_CONTRACT') blockers.push('core_closure_not_by_contract');
  if (ct.missingPreimageFieldCount !== 0 || ct.extraPreimageFieldCount !== 0) blockers.push('core_gap_nonzero');

  // Source envelope alignment — v1 runtime input rejected.
  const se = isPlainObject(c.sourceEnvelopeAlignment) ? c.sourceEnvelopeAlignment : {};
  const sreq = isPlainObject(se.requirements) ? se.requirements : {};
  if (sreq.v1RuntimeInputAllowed === true) blockers.push('v1_runtime_input_allowed');
  if (sreq.implicitV1ToV2UpgradeAllowed === true) blockers.push('implicit_upgrade_allowed');
  if (sreq.bridgeDecisionCoreRequired !== true || sreq.fullPreimageRequired !== true) blockers.push('core_not_required');

  // Digest recomputation alignment — no reintroduced gap; resolved only if lists identical.
  const dr = isPlainObject(c.digestRecomputationAlignment) ? c.digestRecomputationAlignment : {};
  if (dr.missingPreimageFieldCount !== 0) blockers.push('preimage_gap_reintroduced');
  if (dr.extraPreimageFieldCount !== 0) blockers.push('preimage_extra_reintroduced');
  if (dr.bRecomputeInputResolvedByPlan !== true) blockers.push('recompute_not_resolved');
  if (dr.noLocalDuplicatedPreimageList !== true) blockers.push('local_preimage_list');

  // B-RECOMPUTE transition.
  const tr = isPlainObject(c.bRecomputeInputTransition) ? c.bRecomputeInputTransition : {};
  if (tr.currentState !== 'RESOLVED_AT_PLAN_LEVEL') blockers.push('transition_not_resolved');
  if (tr.runtimeImplementationStillFalse !== true) blockers.push('transition_authorizes_runtime');

  // Phase alignment — 18 phases, all planned, no side effects, no 29-field reconstruction.
  const pa = isPlainObject(c.phaseAlignment) ? c.phaseAlignment : {};
  if (pa.originalPhaseCount !== 18) blockers.push('phase_count_not_18');
  if (pa.allPhasesRemainPlanned !== true || pa.allPhasesSideEffectsFalse !== true) blockers.push('phases_not_planned');
  if (pa.reconstructionOf29MissingFieldsRemoved !== true) blockers.push('reconstruction_not_removed');

  // Pipeline alignment — preflight precedes 17-stage, no duplication.
  const pl = isPlainObject(c.pipelineAlignment) ? c.pipelineAlignment : {};
  if (pl.preflightPrecedesConsumerPipeline !== true) blockers.push('preflight_not_preceding');
  if (pl.consumerPipelineStageCount !== 17) blockers.push('consumer_pipeline_not_17');
  if (pl.noDuplicationNoAmbiguity !== true) blockers.push('pipeline_ambiguous');

  // Mapping alignment — 12, source is core.targetDescriptor, no digest mapping.
  const ma = isPlainObject(c.mappingAlignment) ? c.mappingAlignment : {};
  if (ma.mappingCount !== 12) blockers.push('mapping_count_not_12');
  if (ma.mappingSource !== 'bridgeDecisionCore.targetDescriptor') blockers.push('mapping_source_incorrect');
  if (ma.noDigestMapping !== true) blockers.push('digest_mapping_created');

  // B-CORE-ENVELOPE-BUILDER — must be declared open and block runtime.
  const bb = isPlainObject(c.coreEnvelopeBuilderRequirement) ? c.coreEnvelopeBuilderRequirement : {};
  if (bb.blockerId !== 'B-CORE-ENVELOPE-BUILDER') blockers.push('builder_blocker_not_declared');
  if (bb.bCoreEnvelopeBuilderOpen !== true) blockers.push('builder_blocker_not_open');
  if (bb.coreEnvelopeBuilderContractRequiredBeforeRuntime !== true) blockers.push('builder_contract_not_required');
  if (bb.readyForRuntimeImplementation === true) blockers.push('builder_authorizes_runtime');

  // Manual gate — CHECKPOINT_02 blocked, authorizes only alignment.
  const mg = isPlainObject(c.manualCheckpoint) ? c.manualCheckpoint : {};
  if (mg.manualGateRequired !== true) blockers.push('manual_gate_missing');
  if (mg.authorizesPlanAlignment !== true) blockers.push('alignment_not_authorized');
  if (mg.authorizesBuilderContract === true || mg.authorizesRuntimeImplementation === true || mg.authorizesPreviewMount === true
    || mg.authorizesProductExposure === true) blockers.push('manual_gate_authorizes_real');

  // Premature readiness.
  if (c.readyForCoreEnvelopeBuilderContract === true) blockers.push('premature_builder_contract');
  if (c.readyForRuntimeImplementation === true) blockers.push('premature_runtime');
  if (c.readyForPreviewMount === true) blockers.push('premature_preview_mount');
  if (c.readyForProductExposure === true) blockers.push('premature_product_exposure');

  // Static nondeterminism scan.
  let serialized = '';
  try { serialized = JSON.stringify(c) || ''; } catch { serialized = ''; }
  if (/Date\.now\(|new Date\(|Math\.random|crypto\.randomUUID|performance\.now|toLocaleString|localeCompare/.test(serialized)) blockers.push('nondeterministic_source');

  const ok = blockers.length === 0;
  return deepFreeze({
    kind: 'amendment-verification',
    ok, valid: ok,
    amendmentOnly: caps.amendmentOnly === true,
    runtimeImplemented: caps.runtimeImplemented === true,
    builderImplemented: caps.coreEnvelopeBuilderImplemented === true,
    bRecomputeInputResolvedByPlan: dr.bRecomputeInputResolvedByPlan === true && ok,
    bCoreEnvelopeBuilderOpen: bb.bCoreEnvelopeBuilderOpen === true,
    readyForRuntimeImplementation: c.readyForRuntimeImplementation === true,
    blockers, blockerCount: blockers.length,
    checkedCapabilities: mustBeTrue.length + mustBeFalse.length,
  });
}

export default verifyImplementationPlanAlignmentAmendment;
