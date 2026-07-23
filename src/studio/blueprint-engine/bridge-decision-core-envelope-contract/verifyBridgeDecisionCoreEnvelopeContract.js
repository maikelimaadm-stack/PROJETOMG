import { REAL_DECISION_DIGEST_PREIMAGE_FIELDS, CORE_ENVELOPE_FIELDS } from './coreEnvelopeConfig.js';
import { deepFreeze } from './deepFreeze.js';
import { isPlainObject } from './normalizeCoreEnvelopeInput.js';

/**
 * Fail-closed verifier for the produced v2 core envelope contract. Detects preimage missing/extra, alias/default,
 * partial core, digest-inside-core, target duplicated/outside-core, digest without full coverage, same-decision
 * false, cross-decision allowed, v1 implicit upgrade / v1 runtime acceptance, permissive versions, core mutation,
 * any runtime flag true, plan alignment falsely complete, UI/App/mount/storage/backend/module/product, SSOT
 * inversion, a missing manual gate, and premature runtime. Pure — never throws, mutates or does I/O.
 * @param {Object} [options] @param {Object} [options.contract] @returns {Object}
 */
export function verifyBridgeDecisionCoreEnvelopeContract(options = {}) {
  const o = isPlainObject(options) ? options : {};
  const c = isPlainObject(o.contract) ? o.contract : {};
  const blockers = [];

  const caps = isPlainObject(c.capabilities) ? c.capabilities : {};
  const mustBeTrue = [
    'headless', 'devOnly', 'syntheticOnly', 'inMemoryOnly', 'ephemeralOnly', 'deterministic', 'immutable', 'failClosed',
    'sideEffectFree', 'metadataOnly', 'contractOnly', 'realDecisionPreimageCaptured', 'realCoreShapeCaptured',
    'coreEqualsRealPreimage', 'fullDigestRecomputationPossibleByContract', 'bIdentityClosedByContract',
    'bRecomputeInputClosedByContract', 'v1ContractPreserved', 'ssotPreserved', 'sourceConsumedReadOnly', 'upstreamsConsumedReadOnly',
  ];
  for (const k of mustBeTrue) { if (caps[k] !== true) blockers.push(`capability_${k}_must_be_true`); }
  const mustBeFalse = [
    'coreEnvelopeBuilderImplemented', 'identityVerificationImplemented', 'digestRecomputeExecuted', 'validationExecuted',
    'consumerRuntimeImplemented', 'coreConsumed', 'sourceDecisionConsumed', 'implementationPlanAligned',
    'previewPayloadCreated', 'previewMounted', 'appTouched', 'routeCreated', 'menuCreated', 'sidebarCreated',
    'persistenceImplemented', 'filesystemWritesUsed', 'backendAccessed', 'prismaAccessed', 'fetchUsed', 'networkUsed',
    'realDataRead', 'realDataWrite', 'moduleGenerated', 'moduleRegistered', 'certificationPerformed', 'envelopeCanonical',
    'productExposed', 'productionAccessed', 'stagingAccessed', 'prototypeRelinked', 'permissionModelIntegrated',
    'tenantModelIntegrated', 'serverSideAuthorizationIntegrated',
  ];
  for (const k of mustBeFalse) { if (caps[k] === true) blockers.push(`capability_${k}_must_be_false`); }

  // Real preimage — declared must equal real, no missing/extra.
  const rp = isPlainObject(c.realPreimage) ? c.realPreimage : {};
  if (Array.isArray(rp.realPreimageFields)) {
    for (const f of rp.realPreimageFields) { if (!REAL_DECISION_DIGEST_PREIMAGE_FIELDS.includes(f)) blockers.push(`preimage_extra_field_${f}`); }
    for (const f of REAL_DECISION_DIGEST_PREIMAGE_FIELDS) { if (!rp.realPreimageFields.includes(f)) blockers.push(`preimage_missing_field_${f}`); }
  } else blockers.push('preimage_fields_missing');
  if (rp.fieldCountHardcoded === true) blockers.push('preimage_count_hardcoded');
  if (rp.aliasesUsed === true) blockers.push('preimage_alias_used');

  // Core — exact preimage, digest not inside, target inside, no extra/missing/alias/default/coercion.
  const core = isPlainObject(c.bridgeDecisionCore) ? c.bridgeDecisionCore : {};
  if (core.digestFieldInsideCore === true) blockers.push('digest_inside_core');
  if (core.targetDescriptorInsideCore !== true) blockers.push('target_not_inside_core');
  if (core.coreExtraFieldsAllowed === true) blockers.push('core_extra_allowed');
  if (core.coreMissingFieldsAllowed === true) blockers.push('core_missing_allowed');
  if (core.coreAliasesAllowed === true) blockers.push('core_alias_allowed');
  if (core.coreDefaultsAllowed === true) blockers.push('core_default_allowed');
  if (core.coreFieldCoercionAllowed === true) blockers.push('core_coercion_allowed');
  if (core.coreIsExactRealPreimage !== true) blockers.push('core_not_exact_preimage');

  // Envelope v2 shape — no invented fields, digest only in envelope.
  const env = isPlainObject(c.coreEnvelope) ? c.coreEnvelope : {};
  if (Array.isArray(env.fields)) {
    for (const f of env.fields) { if (!CORE_ENVELOPE_FIELDS.includes(f)) blockers.push(`envelope_invented_field_${f}`); }
  }
  if (env.digestOnlyInEnvelopeNotCore !== true) blockers.push('digest_not_envelope_only');
  if (env.coreEnvelopeBuilderImplemented === true || env.coreEnvelopeCreated === true) blockers.push('envelope_built');

  // Digest semantics — recompute mode, no crypto claim.
  const ds = isPlainObject(c.digestSemantics) ? c.digestSemantics : {};
  if (ds.recomputeMode !== undefined && ds.recomputeMode !== 'recompute_and_compare') blockers.push('digest_wrong_mode');
  if (ds.cryptographicIntegrityProvided === true) blockers.push('digest_claimed_cryptographic');
  if (ds.digestRecomputeExecuted === true) blockers.push('digest_recompute_executed');

  // Atomicity — no cross-decision mix / replacement / partial.
  const at = isPlainObject(c.sameDecisionAtomicity) ? c.sameDecisionAtomicity : {};
  if (at.digestAndCoreMustComeFromSameDecision === false) blockers.push('atomicity_not_required');
  if (at.crossDecisionMixingAllowed === true) blockers.push('cross_decision_mix_allowed');
  if (at.coreReplacementAllowed === true || at.digestReplacementAllowed === true) blockers.push('replacement_allowed');
  if (at.partialCoreAllowed === true) blockers.push('partial_core_allowed');

  // v1/v2 compatibility — no implicit upgrade / v1 runtime acceptance.
  const cc = isPlainObject(c.v1V2Compatibility) ? c.v1V2Compatibility : {};
  if (cc.v1EnvelopeContractStillValid === false) blockers.push('v1_invalidated');
  if (cc.implicitV1ToV2UpgradeAllowed === true) blockers.push('v1_implicit_upgrade');
  if (cc.automaticCoreSynthesisFromV1Allowed === true) blockers.push('v1_core_synthesis');
  if (cc.v1RuntimeAcceptanceAllowed === true) blockers.push('v1_runtime_acceptance');
  if (cc.unknownEnvelopeVersionFailsClosed === false) blockers.push('unknown_version_accepted');

  // Versions — exact, no alias/coercion/downgrade/implicit upgrade.
  const vt = isPlainObject(c.versionContract) ? c.versionContract : {};
  const vp = isPlainObject(vt.policy) ? vt.policy : {};
  if (vp.exactVersionMatchRequired === false) blockers.push('version_not_exact');
  if (vp.aggregatedVersionObjectAsSourceAliasAllowed === true) blockers.push('version_aggregate_alias');
  if (vp.silentVersionCoercionAllowed === true) blockers.push('version_coercion');
  if (vp.downgradeAllowed === true || vp.implicitUpgradeAllowed === true) blockers.push('version_downgrade_or_upgrade');

  // Read-only.
  const ro = isPlainObject(c.readOnly) ? c.readOnly : {};
  if (ro.sourceDecisionMutationAllowed === true || ro.coreMutationAllowed === true || ro.targetDescriptorMutationAllowed === true) blockers.push('mutation_allowed');
  if (ro.referenceRetentionAllowed === true) blockers.push('reference_retention_allowed');

  // Failure containment.
  const fc = isPlainObject(c.failureContainment) ? c.failureContainment : {};
  if (fc.partialCoreAllowed === true || fc.partialEnvelopeAllowed === true) blockers.push('partial_allowed');
  if (fc.unexpectedExceptionsMustFailClosed === false) blockers.push('exceptions_may_escape');
  if (fc.stackLeakAllowed === true || fc.secretLeakAllowed === true || fc.internalErrorMessageLeakAllowed === true) blockers.push('failure_leak_allowed');

  // SSOT.
  const ss = isPlainObject(c.ssotBoundary) ? c.ssotBoundary : {};
  if (ss.certifiedBlueprintRemainsSsot === false) blockers.push('ssot_not_preserved');
  if (ss.bridgeDecisionIsCanonical === true || ss.coreIsCanonical === true || ss.envelopeIsCanonical === true) blockers.push('ssot_inversion');

  // Permission/tenancy.
  const pt = isPlainObject(c.permissionTenancyBoundary) ? c.permissionTenancyBoundary : {};
  if (pt.permissionModelIntegrated === true || pt.tenantModelIntegrated === true) blockers.push('permission_integrated');

  // Prototype.
  const pr = isPlainObject(c.prototypeProhibition) ? c.prototypeProhibition : {};
  if (pr.prototypeRelinkAllowed === true || pr.oldPrototypeImported === true) blockers.push('prototype_relink');

  // Blocker closure — must not be falsely resolved.
  const bc = isPlainObject(c.blockerClosure) ? c.blockerClosure : {};
  if (bc.missingPreimageFieldCount !== 0 && bc.bRecomputeInputClosedByContract === true) blockers.push('closure_falsely_claimed_missing');
  if (bc.extraPreimageFieldCount !== 0 && bc.bRecomputeInputClosedByContract === true) blockers.push('closure_falsely_claimed_extra');
  if (bc.implementationPlanAlignmentRequired !== true) blockers.push('plan_alignment_not_required');
  if (bc.readyForRuntimeImplementation === true) blockers.push('closure_authorizes_runtime');

  // Plan alignment must NOT be falsely complete.
  if (c.readyForImplementationPlanAlignment === true) blockers.push('plan_alignment_falsely_complete');
  if (caps.implementationPlanAligned === true) blockers.push('plan_alignment_falsely_complete');

  // Manual gate.
  const mg = isPlainObject(c.manualCheckpoint) ? c.manualCheckpoint : {};
  if (mg.manualGateRequired !== true) blockers.push('manual_gate_missing');
  if (mg.authorizesCoreEnvelopeBuilder === true || mg.authorizesConsumerRuntime === true || mg.authorizesImplementationPlanAlignment === true
    || mg.authorizesPreviewMount === true || mg.authorizesModuleGeneration === true || mg.authorizesCertification === true
    || mg.authorizesProductExposure === true) blockers.push('manual_gate_authorizes_real');

  // Premature runtime / readiness.
  if (c.readyForRuntimeImplementation === true) blockers.push('premature_runtime');
  if (c.readyForPreviewMount === true) blockers.push('premature_preview_mount');
  if (c.readyForProductExposure === true) blockers.push('premature_product_exposure');

  // Static nondeterminism scan.
  let serialized = '';
  try { serialized = JSON.stringify(c) || ''; } catch { serialized = ''; }
  if (/Date\.now\(|new Date\(|Math\.random|crypto\.randomUUID|performance\.now|toLocaleString|localeCompare/.test(serialized)) blockers.push('nondeterministic_source');

  const ok = blockers.length === 0;
  return deepFreeze({
    kind: 'core-envelope-contract-verification',
    ok, valid: ok,
    contractOnly: caps.contractOnly === true,
    coreEnvelopeBuilderImplemented: caps.coreEnvelopeBuilderImplemented === true,
    consumerRuntimeImplemented: caps.consumerRuntimeImplemented === true,
    previewMounted: caps.previewMounted === true,
    productExposed: caps.productExposed === true,
    bIdentityClosedByContract: caps.bIdentityClosedByContract === true,
    bRecomputeInputClosedByContract: bc.bRecomputeInputClosedByContract === true && bc.missingPreimageFieldCount === 0 && bc.extraPreimageFieldCount === 0 && ok,
    readyForRuntimeImplementation: c.readyForRuntimeImplementation === true,
    blockers, blockerCount: blockers.length,
    checkedCapabilities: mustBeTrue.length + mustBeFalse.length,
  });
}

export default verifyBridgeDecisionCoreEnvelopeContract;
