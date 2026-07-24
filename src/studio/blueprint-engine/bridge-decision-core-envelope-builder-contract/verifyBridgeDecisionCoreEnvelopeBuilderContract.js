import {
  REAL_SOURCE_BRIDGE_DECISION_FIELDS, DIGEST_PREIMAGE_ALLOWLIST, OUTPUT_CORE_ENVELOPE_FIELDS, SOURCE_DECISION_SUCCESS_STATUS,
} from './contractConfig.js';
import { deepFreeze } from './deepFreeze.js';
import { isPlainObject } from './builderInput.js';

/**
 * Fail-closed verifier for the produced builder contract. Detects invented source fields, permissive success
 * eligibility, divergent allowlist, missing/extra core, digest inside core, target/digest duplication, digest
 * recompute disabled, cross-decision mixing, partial envelope, source mutation, side effects, and any builder/
 * runtime implementation flag true. It also enforces the CORRECTED identity-verification classification: the state
 * must be NOT_A_BLOCKER, identityVerified must be consumer-owned, no amendment may be required, the immutable
 * envelope invariant must stay false, builder verification must be carried outside the envelope, the consumer must
 * verify independently, the builder blocker must be closed by contract, and the contract must be ready for the
 * Builder Implementation Plan — while the manual gate must NOT authorize executing that plan or any Core Envelope
 * amendment, and builder implementation/runtime/preview/product stay blocked. Rejects SSOT inversion and a missing
 * manual gate. Pure — never throws, mutates or does I/O.
 * @param {Object} [options] @param {Object} [options.contract] @returns {Object}
 */
export function verifyBridgeDecisionCoreEnvelopeBuilderContract(options = {}) {
  const o = isPlainObject(options) ? options : {};
  const c = isPlainObject(o.contract) ? o.contract : {};
  const blockers = [];

  const caps = isPlainObject(c.capabilities) ? c.capabilities : {};
  const mustBeTrue = [
    'headless', 'devOnly', 'syntheticOnly', 'inMemoryOnly', 'ephemeralOnly', 'deterministic', 'immutable', 'failClosed',
    'sideEffectFree', 'metadataOnly', 'contractOnly', 'realSourceBridgeDecisionShapeCaptured',
    'realCorePreimageAllowlistCaptured', 'realOutputEnvelopeCaptured', 'ssotPreserved', 'sourceConsumedReadOnly',
    'upstreamsConsumedReadOnly', 'bIdentityClosedByContract', 'bRecomputeInputClosedByContract', 'bRecomputeInputResolvedByPlan',
  ];
  for (const k of mustBeTrue) { if (caps[k] !== true) blockers.push(`capability_${k}_must_be_true`); }
  const mustBeFalse = [
    'builderFactoryImplemented', 'buildImplemented', 'coreExtractionImplemented', 'digestRecomputeImplemented',
    'identityVerificationImplemented', 'envelopeConstructionImplemented', 'consumerRuntimeImplemented',
    'validationExecuted', 'builderExecuted', 'sourceDecisionConsumed', 'coreExtracted', 'coreEnvelopeCreated',
    'previewPayloadCreated', 'previewMounted', 'appTouched', 'routeCreated', 'menuCreated', 'sidebarCreated',
    'persistenceImplemented', 'filesystemWritesUsed', 'backendAccessed', 'prismaAccessed', 'fetchUsed', 'networkUsed',
    'realDataRead', 'realDataWrite', 'moduleGenerated', 'moduleRegistered', 'certificationPerformed', 'envelopeCanonical',
    'productExposed', 'productionAccessed', 'stagingAccessed', 'prototypeRelinked', 'permissionModelIntegrated',
    'tenantModelIntegrated', 'serverSideAuthorizationIntegrated',
  ];
  for (const k of mustBeFalse) { if (caps[k] === true) blockers.push(`capability_${k}_must_be_false`); }

  // Source shape — no invented fields; input is complete decision.
  const ss = isPlainObject(c.realSourceBridgeDecisionShape) ? c.realSourceBridgeDecisionShape : {};
  if (Array.isArray(ss.fields)) {
    for (const f of ss.fields) { if (!REAL_SOURCE_BRIDGE_DECISION_FIELDS.includes(f)) blockers.push(`source_invented_field_${f}`); }
  }
  if (ss.inputIsCompleteDecision !== true) blockers.push('input_not_complete_decision');

  // Eligibility — must be strict.
  const el = isPlainObject(c.sourceEligibility) ? c.sourceEligibility : {};
  if (el.sourceDecisionOkRequired !== true) blockers.push('eligibility_ok_not_required');
  if (el.sourceDecisionStatusRequired !== SOURCE_DECISION_SUCCESS_STATUS) blockers.push('eligibility_status_wrong');
  if (el.targetDescriptorRequired !== true || el.bridgeDecisionDigestRequired !== true) blockers.push('eligibility_target_or_digest_not_required');

  // Core extraction — exact allowlist, no alias/default/coercion/partial, unknown rejected.
  const ce = isPlainObject(c.coreExtraction) ? c.coreExtraction : {};
  if (Array.isArray(ce.coreFieldAllowlist)) {
    if (JSON.stringify([...ce.coreFieldAllowlist].sort()) !== JSON.stringify([...DIGEST_PREIMAGE_ALLOWLIST].sort())) blockers.push('allowlist_divergent');
  } else blockers.push('allowlist_missing');
  if (ce.unknownSourceFieldsRejected !== true) blockers.push('unknown_source_fields_not_rejected');
  if (ce.unknownSourceFieldsSilentlyIgnored === true) blockers.push('unknown_source_fields_silently_ignored');
  if (ce.coreAliasesAllowed === true || ce.coreDefaultsAllowed === true || ce.coreCoercionAllowed === true) blockers.push('core_alias_default_coercion');
  if (ce.partialCoreAllowed === true) blockers.push('partial_core_allowed');
  if (ce.digestInsideCore === true) blockers.push('digest_inside_core');
  if (ce.targetDescriptorInsideCore !== true) blockers.push('target_not_inside_core');
  if (ce.versionDriftFailsClosed !== true) blockers.push('version_drift_not_fail_closed');

  // Digest recompute — required before emission, exact compare, no synthesis.
  const dg = isPlainObject(c.digestRecompute) ? c.digestRecompute : {};
  if (dg.recomputeRequiredBeforeEmission !== true) blockers.push('recompute_not_required');
  if (dg.exactDigestComparisonRequired !== true) blockers.push('digest_compare_not_exact');
  if (dg.digestSynthesisAllowed === true || dg.digestFallbackAllowed === true || dg.digestAliasAllowed === true) blockers.push('digest_synthesis_or_fallback');
  if (dg.cryptographicIntegrityProvided === true) blockers.push('digest_claimed_cryptographic');
  if (dg.digestRecomputeImplemented === true) blockers.push('digest_recompute_implemented');

  // Atomicity.
  const at = isPlainObject(c.sameDecisionAtomicity) ? c.sameDecisionAtomicity : {};
  if (at.sourceDecisionIsAtomicInput !== true) blockers.push('source_not_atomic');
  if (at.crossDecisionMixingAllowed === true) blockers.push('cross_decision_mix_allowed');
  if (at.coreReplacementAllowed === true || at.digestReplacementAllowed === true) blockers.push('replacement_allowed');

  // Output envelope — no invented fields, digest/core once, target only inside core.
  const oe = isPlainObject(c.outputEnvelope) ? c.outputEnvelope : {};
  if (Array.isArray(oe.fields)) {
    for (const f of oe.fields) { if (!OUTPUT_CORE_ENVELOPE_FIELDS.includes(f)) blockers.push(`envelope_invented_field_${f}`); }
  }
  if (oe.bridgeDecisionDigestAppearsOnce !== true || oe.bridgeDecisionCoreAppearsOnce !== true) blockers.push('envelope_duplication');
  if (oe.targetDescriptorOnlyInsideCore !== true) blockers.push('target_duplicated_in_envelope');
  if (oe.coreEnvelopeCreated === true || oe.builderExecuted === true) blockers.push('envelope_built');

  // Identity verification state — corrected classification (NOT_A_BLOCKER; consumer-owned; ARCHITECTURE 1 final).
  const iv = isPlainObject(c.identityVerificationState) ? c.identityVerificationState : {};
  if (iv.silentOverrideAllowed === true) blockers.push('identity_silent_override');
  if (iv.verificationStateClassification !== 'NOT_A_BLOCKER') blockers.push('verification_state_not_classified_not_a_blocker');
  if (iv.identityVerifiedSemanticOwner !== 'consumer_runtime') blockers.push('identity_owner_not_consumer_runtime');
  if (iv.bCoreEnvelopeVerificationStateOpen === true) blockers.push('verification_state_falsely_open');
  if (iv.coreEnvelopeVerificationStateAmendmentRequired === true) blockers.push('amendment_falsely_required');
  if (iv.requiredAmendment !== null && iv.requiredAmendment !== undefined) blockers.push('required_amendment_not_null');
  if (iv.builderResultCarriesVerifiedOutsideEnvelope !== true) blockers.push('builder_verified_not_outside_envelope');
  if (iv.consumerPerformsIndependentVerification !== true) blockers.push('consumer_independent_verification_missing');
  // The envelope's identityVerified invariant MUST remain false (a builder-emitted verified envelope is rejected).
  if (iv.coreEnvelopeCurrentInvariantIdentityVerified !== false) blockers.push('envelope_identity_verified_expected_false');
  if (iv.envelopeIdentityVerifiedRemainsFalse !== true) blockers.push('envelope_identity_state_inconsistent');
  if (iv.identityVerificationImplemented === true) blockers.push('identity_verification_implemented');

  // Builder blocker closure — CLOSED by contract because the verification-state is not a blocker.
  const bc = isPlainObject(c.builderBlockerClosure) ? c.builderBlockerClosure : {};
  if (bc.bCoreEnvelopeVerificationStateOpen === true) blockers.push('closure_verification_state_open');
  if (bc.bCoreEnvelopeBuilderClosedByContract !== true) blockers.push('builder_not_closed_by_contract');
  if (Array.isArray(bc.remainingBuilderContractBlockers) && bc.remainingBuilderContractBlockers.length > 0) blockers.push('builder_has_remaining_blockers');
  if (bc.builderImplementationPlanRequired !== true) blockers.push('builder_plan_not_required');
  if (bc.readyForBuilderImplementation === true || bc.readyForRuntimeImplementation === true) blockers.push('builder_closure_authorizes_impl');

  // Failure containment.
  const fc = isPlainObject(c.failureContainment) ? c.failureContainment : {};
  if (fc.partialCoreAllowed === true || fc.partialEnvelopeAllowed === true) blockers.push('partial_allowed');
  if (fc.unexpectedExceptionsMustFailClosed === false) blockers.push('exceptions_may_escape');
  if (fc.secretLeakAllowed === true || fc.stackLeakAllowed === true) blockers.push('failure_leak_allowed');

  // SSOT / permission.
  const so = isPlainObject(c.ssotSecurityPermission) ? c.ssotSecurityPermission : {};
  if (so.certifiedBlueprintRemainsSsot === false) blockers.push('ssot_not_preserved');
  if (so.coreEnvelopeIsCanonical === true || so.bridgeDecisionCoreIsCanonical === true) blockers.push('ssot_inversion');
  if (so.permissionModelIntegrated === true || so.tenantModelIntegrated === true) blockers.push('permission_integrated');

  // Prototype.
  const pr = isPlainObject(c.prototypeRelinkProhibition) ? c.prototypeRelinkProhibition : {};
  if (pr.prototypeRelinkAllowed === true || pr.oldPrototypeImported === true) blockers.push('prototype_relink');

  // Manual gate — authorizes the contract/correction ONLY; must NOT authorize the plan's execution or an amendment.
  const mg = isPlainObject(c.manualEnablementGate) ? c.manualEnablementGate : {};
  if (mg.manualGateRequired !== true) blockers.push('manual_gate_missing');
  if (mg.authorizesBuilderContract !== true) blockers.push('builder_contract_not_authorized');
  if (mg.authorizesBuilderImplementationPlan === true) blockers.push('manual_gate_authorizes_plan');
  if (mg.authorizesCoreEnvelopeAmendment === true) blockers.push('manual_gate_authorizes_amendment');
  if (mg.authorizesBuilderImplementation === true || mg.authorizesRuntimeImplementation === true
    || mg.authorizesPreviewMount === true || mg.authorizesProductExposure === true) blockers.push('manual_gate_authorizes_real');

  // Readiness — corrected: the contract is TECHNICALLY ready for the Builder Implementation Plan audit, but builder
  // implementation, runtime, preview mount and product exposure remain blocked.
  if (c.readyForBuilderImplementationPlan !== true) blockers.push('not_ready_for_builder_plan');
  if (c.readyForBuilderImplementation === true) blockers.push('premature_builder_impl');
  if (c.readyForRuntimeImplementation === true) blockers.push('premature_runtime');
  if (c.readyForPreviewMount === true) blockers.push('premature_preview_mount');
  if (c.readyForProductExposure === true) blockers.push('premature_product_exposure');

  // Static nondeterminism scan.
  let serialized = '';
  try { serialized = JSON.stringify(c) || ''; } catch { serialized = ''; }
  if (/Date\.now\(|new Date\(|Math\.random|crypto\.randomUUID|performance\.now|toLocaleString|localeCompare/.test(serialized)) blockers.push('nondeterministic_source');

  const ok = blockers.length === 0;
  return deepFreeze({
    kind: 'builder-contract-verification',
    ok, valid: ok,
    contractOnly: caps.contractOnly === true,
    builderImplemented: caps.buildImplemented === true || caps.builderFactoryImplemented === true,
    previewMounted: caps.previewMounted === true,
    productExposed: caps.productExposed === true,
    bCoreEnvelopeVerificationStateOpen: iv.bCoreEnvelopeVerificationStateOpen === true,
    bCoreEnvelopeBuilderClosedByContract: bc.bCoreEnvelopeBuilderClosedByContract === true && ok,
    readyForBuilderImplementationPlan: c.readyForBuilderImplementationPlan === true,
    readyForRuntimeImplementation: c.readyForRuntimeImplementation === true,
    blockers, blockerCount: blockers.length,
    checkedCapabilities: mustBeTrue.length + mustBeFalse.length,
  });
}

export default verifyBridgeDecisionCoreEnvelopeBuilderContract;
