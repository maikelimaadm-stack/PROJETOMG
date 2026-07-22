import { REAL_BRIDGE_DECISION_FIELDS, ENVELOPE_FIELDS } from './envelopeContractConfig.js';
import { deepFreeze } from './deepFreeze.js';
import { isPlainObject } from './normalizeEnvelopeInput.js';

/**
 * Fail-closed verifier for the produced envelope identity contract. Detects missing digest/target coverage,
 * invented decision/envelope fields, identity synthesis/alias/fallback allowances, permissive versions,
 * allowed source/descriptor mutation, any UI/App/mount/persistence/backend/Prisma/real-data/module/
 * certification/product capability, SSOT inversion, prototype relink, a missing manual gate, and any premature
 * runtime (implementation flags must all be false). Pure — never throws, never mutates, never does I/O.
 * @param {Object} [options] @param {Object} [options.contract] @returns {Object}
 */
export function verifyBridgeDecisionEnvelopeIdentityContract(options = {}) {
  const o = isPlainObject(options) ? options : {};
  const c = isPlainObject(o.contract) ? o.contract : {};
  const blockers = [];

  const caps = isPlainObject(c.capabilities) ? c.capabilities : {};
  const mustBeTrue = [
    'headless', 'devOnly', 'syntheticOnly', 'inMemoryOnly', 'ephemeralOnly', 'deterministic', 'immutable', 'failClosed',
    'sideEffectFree', 'metadataOnly', 'contractOnly', 'realBridgeDecisionShapeCaptured', 'realTargetDescriptorShapeCaptured',
    'decisionDigestCoversTargetDescriptor', 'ssotPreserved', 'sourceConsumedReadOnly', 'upstreamsConsumedReadOnly',
  ];
  for (const k of mustBeTrue) { if (caps[k] !== true) blockers.push(`capability_${k}_must_be_true`); }
  const mustBeFalse = [
    'envelopeBuilderImplemented', 'identityVerificationImplemented', 'validationExecuted', 'consumerRuntimeImplemented',
    'sourceDecisionConsumed', 'targetDescriptorConsumed', 'previewPayloadCreated', 'previewMounted', 'appTouched',
    'routeCreated', 'menuCreated', 'sidebarCreated', 'persistenceImplemented', 'filesystemWritesUsed', 'backendAccessed',
    'prismaAccessed', 'fetchUsed', 'networkUsed', 'realDataRead', 'realDataWrite', 'moduleGenerated', 'moduleRegistered',
    'certificationPerformed', 'envelopeCanonical', 'productExposed', 'productionAccessed', 'stagingAccessed',
    'prototypeRelinked', 'permissionModelIntegrated', 'tenantModelIntegrated', 'serverSideAuthorizationIntegrated',
  ];
  for (const k of mustBeFalse) { if (caps[k] === true) blockers.push(`capability_${k}_must_be_false`); }

  // Source decision — no invented fields.
  const sd = isPlainObject(c.sourceDecision) ? c.sourceDecision : {};
  if (Array.isArray(sd.realDecisionFields)) {
    for (const f of sd.realDecisionFields) { if (!REAL_BRIDGE_DECISION_FIELDS.includes(f)) blockers.push(`invented_decision_field_${f}`); }
  }
  // Envelope shape — no invented fields.
  const es = isPlainObject(c.envelopeShape) ? c.envelopeShape : {};
  if (Array.isArray(es.fields)) {
    for (const f of es.fields) { if (!ENVELOPE_FIELDS.includes(f)) blockers.push(`invented_envelope_field_${f}`); }
  }

  // Digest coverage — the whole point: the decision digest MUST cover the target descriptor.
  const dc = isPlainObject(c.digestCoverage) ? c.digestCoverage : {};
  if (dc.targetDescriptorCoveredByDigest !== true) blockers.push('digest_does_not_cover_target');
  if (dc.cryptographicIntegrityProvided === true) blockers.push('digest_claimed_cryptographic');
  if (dc.bIdentityRemainsOpen === true) blockers.push('b_identity_remains_open');

  // Identity binding.
  const ib = isPlainObject(c.identityBinding) ? c.identityBinding : {};
  if (ib.digestAndDescriptorMustComeFromSameDecision === false) blockers.push('digest_descriptor_not_same_decision');
  if (ib.identityVerificationMode !== undefined && ib.identityVerificationMode !== 'recompute_and_compare') blockers.push('identity_wrong_verification_mode');
  if (ib.identitySynthesisAllowed === true) blockers.push('identity_synthesis_allowed');
  if (ib.identityAliasAllowed === true) blockers.push('identity_alias_allowed');
  if (ib.identityFallbackAllowed === true) blockers.push('identity_fallback_allowed');

  // Provenance.
  const pv = isPlainObject(c.provenance) ? c.provenance : {};
  if (pv.crossDecisionDescriptorMixingAllowed === true) blockers.push('cross_decision_mix_allowed');
  if (pv.descriptorReplacementAllowed === true || pv.digestReplacementAllowed === true) blockers.push('replacement_allowed');
  if (pv.sourceDecisionAndDescriptorAtomicPairRequired === false) blockers.push('atomic_pair_not_required');

  // Versions.
  const vt = isPlainObject(c.versionContract) ? c.versionContract : {};
  const vp = isPlainObject(vt.policy) ? vt.policy : {};
  if (vp.exactVersionMatchRequired === false) blockers.push('version_not_exact');
  if (vp.unknownVersionFailsClosed === false) blockers.push('version_unknown_accepted');
  if (vp.aggregatedVersionObjectAsSourceAliasAllowed === true) blockers.push('version_aggregate_alias_allowed');
  if (vp.silentVersionCoercionAllowed === true) blockers.push('version_silent_coercion_allowed');

  // Read-only.
  const ro = isPlainObject(c.readOnly) ? c.readOnly : {};
  if (ro.sourceDecisionMutationAllowed === true || ro.targetDescriptorMutationAllowed === true) blockers.push('mutation_allowed');
  if (ro.sourceReferenceRetentionAllowed === true || ro.targetReferenceRetentionAllowed === true) blockers.push('reference_retention_allowed');

  // Failure containment.
  const fc = isPlainObject(c.failureContainment) ? c.failureContainment : {};
  if (fc.partialEnvelopeAllowed === true) blockers.push('partial_envelope_allowed');
  if (fc.unexpectedExceptionsMustFailClosed === false) blockers.push('exceptions_may_escape');
  if (fc.stackLeakAllowed === true || fc.internalErrorMessageLeakAllowed === true || fc.secretLeakAllowed === true) blockers.push('failure_leak_allowed');

  // SSOT.
  const ss = isPlainObject(c.ssotBoundary) ? c.ssotBoundary : {};
  if (ss.certifiedBlueprintRemainsSsot === false) blockers.push('ssot_not_preserved');
  if (ss.bridgeDecisionIsCanonical === true || ss.targetDescriptorIsCanonical === true || ss.envelopeIsCanonical === true) blockers.push('ssot_inversion');
  if (ss.envelopeMayCertify === true || ss.envelopeMayGenerateModule === true || ss.envelopeMayExposeProduct === true) blockers.push('ssot_envelope_privilege');

  // Permission/tenancy.
  const pt = isPlainObject(c.permissionTenancyBoundary) ? c.permissionTenancyBoundary : {};
  if (pt.permissionModelIntegrated === true || pt.tenantModelIntegrated === true) blockers.push('permission_integrated');
  if (pt.requiresPermissionTenancyFoundationBeforeExposure === false) blockers.push('permission_foundation_not_required');

  // Security.
  const sec = isPlainObject(c.securityContract) ? c.securityContract : {};
  if (sec.anyForbiddenSideEffect === true) blockers.push('security_real_side_effect');

  // Prototype.
  const pr = isPlainObject(c.prototypeProhibition) ? c.prototypeProhibition : {};
  if (pr.prototypeRelinkAllowed === true || pr.oldPrototypeImported === true) blockers.push('prototype_relink');

  // Manual gate.
  const mg = isPlainObject(c.manualCheckpoint) ? c.manualCheckpoint : {};
  if (mg.manualGateRequired !== true) blockers.push('manual_gate_missing');
  if (mg.authorizesConsumerRuntime === true || mg.authorizesEnvelopeBuilder === true || mg.authorizesImplementationPlan === true
    || mg.authorizesPreviewMount === true || mg.authorizesModuleGeneration === true || mg.authorizesCertification === true
    || mg.authorizesProductExposure === true) blockers.push('manual_gate_authorizes_real');

  // Premature runtime / readiness.
  if (c.readyForRuntimeImplementation === true) blockers.push('premature_runtime');
  if (c.readyForImplementationPlan === true) blockers.push('premature_implementation_plan');
  if (c.readyForPreviewMount === true) blockers.push('premature_preview_mount');
  if (c.readyForProductExposure === true) blockers.push('premature_product_exposure');

  // Static nondeterminism scan.
  let serialized = '';
  try { serialized = JSON.stringify(c) || ''; } catch { serialized = ''; }
  if (/Date\.now|new Date\(|Math\.random|crypto\.randomUUID|\brandomUUID\b|performance\.now|toLocaleString|localeCompare/.test(serialized)) blockers.push('nondeterministic_source');

  const ok = blockers.length === 0;
  return deepFreeze({
    kind: 'envelope-contract-verification',
    ok, valid: ok,
    contractOnly: caps.contractOnly === true,
    envelopeBuilderImplemented: caps.envelopeBuilderImplemented === true,
    consumerRuntimeImplemented: caps.consumerRuntimeImplemented === true,
    previewMounted: caps.previewMounted === true,
    productExposed: caps.productExposed === true,
    bIdentityClosedByContract: dc.bIdentityClosedByContract === true && dc.targetDescriptorCoveredByDigest === true && ok,
    blockers, blockerCount: blockers.length,
    checkedCapabilities: mustBeTrue.length + mustBeFalse.length,
  });
}

export default verifyBridgeDecisionEnvelopeIdentityContract;
