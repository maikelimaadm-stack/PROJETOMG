import { deepFreeze } from './deepFreeze.js';
import { isPlainObject } from './planInput.js';
/**
 * Fail-closed verifier for the produced implementation PLAN. Rejects a runtime/build already implemented, a created
 * future subtree, a created Core Envelope Verification State Amendment, wrong identity owner, a non-final ARCHITECTURE
 * 1, an envelope advertising verification, disabled consumer reverification, local lists that diverge from the real
 * upstream, count/order divergence, a manual gate that over-authorizes, readyForBuilderImplementation true, any
 * UI/App/storage/backend/module/product capability, SSOT inversion and nondeterminism. Pure — never throws or does I/O.
 */
export function verifyBuilderImplementationPlan(options = {}) {
  const o = isPlainObject(options) ? options : {};
  const c = isPlainObject(o.plan) ? o.plan : {};
  const blockers = [];

  const caps = isPlainObject(c.capabilities) ? c.capabilities : {};
  const mustBeTrue = [
    'headless', 'devOnly', 'syntheticOnly', 'inMemoryOnly', 'ephemeralOnly', 'deterministic', 'immutable', 'failClosed',
    'sideEffectFree', 'metadataOnly', 'planOnly', 'upstreamsConsumedReadOnly', 'ssotPreserved', 'architectureOneFinal',
  ];
  for (const k of mustBeTrue) { if (caps[k] !== true) blockers.push(`capability_${k}_must_be_true`); }
  const mustBeFalse = [
    'builderFactoryImplemented', 'buildImplemented', 'coreExtractionImplemented', 'digestRecomputeImplemented',
    'identityVerificationImplemented', 'envelopeConstructionImplemented', 'consumerRuntimeImplemented',
    'futureRuntimeSubtreeCreated', 'coreEnvelopeVerificationStateAmendmentCreated', 'validationExecuted',
    'builderExecuted', 'previewMounted', 'appTouched', 'routeCreated', 'menuCreated', 'persistenceImplemented',
    'backendAccessed', 'prismaAccessed', 'networkUsed', 'realDataRead', 'moduleGenerated', 'certificationPerformed',
    'productExposed', 'productionAccessed', 'permissionModelIntegrated', 'tenantModelIntegrated',
  ];
  for (const k of mustBeFalse) { if (caps[k] === true) blockers.push(`capability_${k}_must_be_false`); }

  // Source traceability — no divergent local lists; real counts.
  const tr = isPlainObject(c.sourceTraceability) ? c.sourceTraceability : {};
  if (tr.sourceFieldCount !== 33) blockers.push('source_field_count_not_33');
  if (tr.coreAllowlistFieldCount !== 32) blockers.push('core_allowlist_not_32');
  if (tr.envelopeFieldCount !== 12) blockers.push('envelope_field_count_not_12');
  if (tr.pipelineStageCount !== 23) blockers.push('pipeline_stage_count_not_23');
  if (tr.identityVerifiedSemanticOwner !== 'consumer_runtime') blockers.push('owner_not_consumer_runtime');
  if (tr.verificationStateClassification !== 'NOT_A_BLOCKER') blockers.push('classification_not_not_a_blocker');
  if (tr.coreEnvelopeVerificationStateAmendmentRequired === true) blockers.push('amendment_falsely_required');
  if (tr.bCoreEnvelopeBuilderClosedByContract !== true) blockers.push('builder_not_closed_by_contract');
  if (tr.bCoreEnvelopeVerificationStateOpen === true) blockers.push('verification_state_open');
  if (tr.envelopeInvariantIdentityVerified !== false) blockers.push('envelope_invariant_not_false');

  // Extraction allowlist must match upstream.
  const ce = isPlainObject(c.coreExtraction) ? c.coreExtraction : {};
  if (ce.allowlistMatchesUpstream !== true) blockers.push('allowlist_diverges_from_upstream');

  // Identity lifecycle (ARCHITECTURE 1).
  const il = isPlainObject(c.identityLifecycle) ? c.identityLifecycle : {};
  if (il.identityVerifiedSemanticOwner !== 'consumer_runtime') blockers.push('lifecycle_owner_not_consumer');
  if (il.architectureOneFinal !== true) blockers.push('architecture_one_not_final');
  if (il.coreEnvelopeIdentityVerifiedAlwaysFalse !== true) blockers.push('envelope_identity_not_always_false');
  if (il.consumerDecisionIdentityVerifiedTrueOnlyAfterIndependentReverification !== true) blockers.push('consumer_reverification_disabled');
  if (il.consumerDoesNotMutateEnvelope !== true) blockers.push('consumer_mutates_envelope');
  if (il.doubleVerificationRequired !== true) blockers.push('double_verification_not_required');
  if (il.coreEnvelopeVerificationStateAmendmentRequired === true) blockers.push('lifecycle_amendment_required');

  // Future runtime subtree must NOT be created.
  const fs = isPlainObject(c.futureRuntimeSubtree) ? c.futureRuntimeSubtree : {};
  if (fs.subtreeCreated === true) blockers.push('future_subtree_created');

  // Phases — exactly 22 in order.
  const phases = Array.isArray(c.implementationPhases) ? c.implementationPhases : [];
  if (phases.length !== 22) blockers.push('phase_count_not_22');
  phases.forEach((p, i) => { if (isPlainObject(p) && p.order !== i + 1) blockers.push(`phase_order_wrong_${i + 1}`); if (isPlainObject(p) && p.implementationStatus !== 'planned') blockers.push(`phase_not_planned_${i + 1}`); if (isPlainObject(p) && p.sideEffectsAllowed === true) blockers.push(`phase_side_effects_${i + 1}`); });

  // Manual gate — authorizes only the plan.
  const mg = isPlainObject(c.manualEnablementGate) ? c.manualEnablementGate : {};
  if (mg.manualGateRequired !== true) blockers.push('manual_gate_missing');
  if (mg.authorizesBuilderImplementationPlan !== true) blockers.push('plan_not_authorized');
  if (mg.authorizesBuilderImplementation === true) blockers.push('manual_gate_authorizes_implementation');
  if (mg.authorizesConsumerRuntime === true) blockers.push('manual_gate_authorizes_consumer_runtime');
  if (mg.authorizesCoreEnvelopeAmendment === true) blockers.push('manual_gate_authorizes_amendment');
  if (mg.authorizesPreviewMount === true || mg.authorizesProductExposure === true || mg.authorizesUi === true) blockers.push('manual_gate_authorizes_real');

  // Readiness.
  if (c.readyForBuilderImplementation === true) blockers.push('premature_builder_implementation');
  if (c.readyForConsumerRuntimeImplementation === true) blockers.push('premature_consumer_runtime');
  if (c.readyForEnterprisePlanAudit !== true) blockers.push('not_ready_for_plan_audit');

  // SSOT.
  if (c.ssotPreserved === false) blockers.push('ssot_not_preserved');

  // Static nondeterminism scan.
  let serialized = '';
  try { serialized = JSON.stringify(c) || ''; } catch { serialized = ''; }
  if (/Date\.now\(|new Date\(|Math\.random|crypto\.randomUUID|performance\.now|toLocaleString|localeCompare/.test(serialized)) blockers.push('nondeterministic_source');

  const ok = blockers.length === 0;
  return deepFreeze({
    kind: 'builder-implementation-plan-verification',
    ok, valid: ok,
    planOnly: caps.planOnly === true,
    builderImplemented: caps.buildImplemented === true || caps.builderFactoryImplemented === true,
    futureRuntimeSubtreeCreated: fs.subtreeCreated === true,
    readyForEnterprisePlanAudit: c.readyForEnterprisePlanAudit === true,
    readyForBuilderImplementation: c.readyForBuilderImplementation === true,
    blockers, blockerCount: blockers.length,
    checkedCapabilities: mustBeTrue.length + mustBeFalse.length,
  });
}
export default verifyBuilderImplementationPlan;
