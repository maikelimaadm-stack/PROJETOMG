import { BRIDGE_CAPABILITIES } from './bridgeRuntimeConfig.js';
import { deepFreeze } from './deepFreeze.js';
import { isPlainObject } from './normalizeBridgeInput.js';

/**
 * Fail-closed verifier for a produced bridge. Detects capability leaks, boundary inversions, weakened draft
 * identity, permissive versions/digest, mapping problems, extension overrides, resource-dimension issues,
 * partial target, source mutation, SSOT inversion, prototype relink, missing manual gate, and embedded
 * nondeterminism markers. Pure — returns a report; never throws, never mutates, never does I/O.
 * @param {Object} [options] @param {Object} [options.bridge] @returns {Object}
 */
export function verifyAuthoringRuntimeToPreviewBridge(options = {}) {
  const o = isPlainObject(options) ? options : {};
  const bridge = isPlainObject(o.bridge) ? o.bridge : {};
  const caps = isPlainObject(bridge.capabilities) ? bridge.capabilities : BRIDGE_CAPABILITIES;
  const blockers = [];

  const mustBeTrue = [
    'headless', 'devOnly', 'syntheticOnly', 'inMemoryOnly', 'ephemeralOnly', 'deterministic', 'immutable',
    'failClosed', 'sideEffectFree', 'ssotPreserved', 'sourceConsumedReadOnly', 'contractConsumedReadOnly',
    'runtimeSerializerReusedReadOnly', 'bridgeImplemented', 'sourceValidationImplemented',
    'draftIdentityEnforcementImplemented', 'sourceVersionValidationImplemented', 'sourceDigestValidationImplemented',
    'sourceBoundaryValidationImplemented', 'mappingExecutorImplemented', 'targetDescriptorBuilderImplemented',
    'targetVersionValidationImplemented', 'canonicalizationValidationImplemented', 'extensibilityEnforcementImplemented',
    'validationPipelineImplemented', 'replayIdempotencyImplemented', 'resourceLimitsImplemented', 'failureContainmentImplemented',
  ];
  for (const k of mustBeTrue) { if (caps[k] !== true) blockers.push(`capability_${k}_must_be_true`); }

  const mustBeFalse = [
    'previewPayloadCreated', 'previewMounted', 'appTouched', 'routeCreated', 'menuCreated', 'sidebarCreated',
    'persistenceImplemented', 'filesystemWritesUsed', 'backendAccessed', 'prismaAccessed', 'fetchUsed',
    'networkUsed', 'realDataRead', 'realDataWrite', 'moduleGenerated', 'moduleRegistered', 'certificationPerformed',
    'candidateCanonical', 'productExposed', 'productionAccessed', 'stagingAccessed', 'prototypeRelinked',
    'permissionModelIntegrated', 'tenantModelIntegrated', 'serverSideAuthorizationIntegrated',
  ];
  for (const k of mustBeFalse) { if (caps[k] === true) blockers.push(`capability_${k}_must_be_false`); }

  // Draft identity.
  const di = isPlainObject(bridge.draftIdentityPolicy) ? bridge.draftIdentityPolicy : {};
  if (di.explicitDraftIdRequired === false) blockers.push('unsafe_draft_identity_non_strict');
  if (di.singleDraftFallbackAllowed === true) blockers.push('unsafe_single_draft_fallback');
  if (di.bridgeImplementationMustNeverCallFindDraftWithoutExplicitId === false) blockers.push('unsafe_find_draft_without_id');

  // Digest semantics.
  const dg = isPlainObject(bridge.digestSemantics) ? bridge.digestSemantics : {};
  if (dg.sourceDigestField !== undefined && dg.sourceDigestField !== 'handoffDigest') blockers.push('unsafe_digest_wrong_source_field');
  if (dg.digestValidationMode !== undefined && dg.digestValidationMode !== 'recompute_and_compare') blockers.push('unsafe_digest_wrong_validation_mode');
  if (dg.alternativeSerializerAllowed === true) blockers.push('unsafe_digest_alternative_serializer');
  if (dg.cryptographicIntegrityProvided === true) blockers.push('unsafe_digest_claimed_cryptographic');

  // Version tuple.
  const vt = isPlainObject(bridge.versionPolicy) ? bridge.versionPolicy : {};
  if (vt.exactVersionMatchRequired === false) blockers.push('unsafe_version_not_exact');
  if (vt.aggregatedUpstreamVersionsFieldRequired === true) blockers.push('unsafe_version_upstreamVersions_required');
  if (vt.unknownVersionFailsClosed === false) blockers.push('unsafe_version_unknown_accepted');

  // Resource limits.
  const rl = isPlainObject(bridge.resourceLimitsPolicy) ? bridge.resourceLimitsPolicy : {};
  if (rl.unknownResourceDimensionRejected === false) blockers.push('unsafe_unknown_resource_dimension');
  if (rl.silentTruncationAllowed === true) blockers.push('unsafe_silent_truncation');
  if (rl.partialTargetDescriptorAllowed === true) blockers.push('unsafe_partial_target');

  // Failure containment.
  const fc = isPlainObject(bridge.failureContainment) ? bridge.failureContainment : {};
  if (fc.partialTargetAllowed === true || fc.partialDecisionAllowed === true) blockers.push('unsafe_partial_state');
  if (fc.sourceMutationAllowed === true) blockers.push('unsafe_source_mutation');

  // Replay.
  const rp = isPlainObject(bridge.replayContract) ? bridge.replayContract : {};
  if (rp.replaySideEffectsAllowed === true) blockers.push('unsafe_replay_side_effects');

  // SSOT.
  const ss = isPlainObject(bridge.ssotBoundary) ? bridge.ssotBoundary : {};
  if (ss.certifiedBlueprintRemainsSsot === false) blockers.push('unsafe_ssot_not_preserved');
  if (ss.draftIsCanonical === true || ss.candidateIsCanonical === true) blockers.push('unsafe_ssot_inversion');
  if (ss.bridgeMayCertify === true || ss.bridgeMayGenerateModule === true || ss.bridgeMayWriteCertifiedBlueprint === true) blockers.push('unsafe_ssot_bridge_privilege');

  // Permission/tenancy.
  const pt = isPlainObject(bridge.permissionTenancyBoundary) ? bridge.permissionTenancyBoundary : {};
  if (pt.permissionModelIntegrated === true || pt.tenantModelIntegrated === true) blockers.push('unsafe_permission_integrated');

  // Security.
  const sec = isPlainObject(bridge.securitySafety) ? bridge.securitySafety : {};
  if (sec.anyForbiddenSideEffect === true) blockers.push('unsafe_security_real_allowed');

  // Prototype.
  const pr = isPlainObject(bridge.prototypeRelinkProhibition) ? bridge.prototypeRelinkProhibition : {};
  if (pr.prototypeRelinkAllowed === true || pr.oldPrototypeImported === true) blockers.push('unsafe_prototype_relink');

  // Manual gate.
  const mg = isPlainObject(bridge.manualGate) ? bridge.manualGate : {};
  if (mg.manualGateRequired !== true) blockers.push('missing_manual_gate');
  if (mg.authorizesPreviewMount === true || mg.authorizesAuthoringUi === true || mg.authorizesModuleGeneration === true
    || mg.authorizesCertification === true || mg.authorizesProductExposure === true || mg.authorizesProduction === true) blockers.push('unsafe_manual_gate_authorizes_real');

  // Readiness.
  if (bridge.readyForPreviewMount === true) blockers.push('unsafe_ready_for_preview_mount');
  if (bridge.readyForProductExposure === true) blockers.push('unsafe_ready_for_product_exposure');
  if (bridge.readyForProduction === true) blockers.push('unsafe_ready_for_production');

  // Static nondeterminism scan over any embedded source string.
  let serialized = '';
  try { serialized = JSON.stringify(bridge) || ''; } catch { serialized = ''; }
  if (/Date\.now|new Date\(|Math\.random|crypto\.randomUUID|\brandomUUID\b|performance\.now|toLocaleString|localeCompare/.test(serialized)) blockers.push('unsafe_nondeterministic_source');

  const ok = blockers.length === 0;
  const core = {
    kind: 'bridge-verification',
    ok,
    valid: ok,
    headless: caps.headless === true,
    deterministic: caps.deterministic === true,
    immutable: caps.immutable === true,
    failClosed: caps.failClosed === true,
    ssotPreserved: caps.ssotPreserved === true,
    bridgeImplemented: caps.bridgeImplemented === true,
    previewMounted: caps.previewMounted === true,
    appTouched: caps.appTouched === true,
    certificationPerformed: caps.certificationPerformed === true,
    productExposed: caps.productExposed === true,
    permissionModelIntegrated: caps.permissionModelIntegrated === true,
    blockers,
    blockerCount: blockers.length,
    checkedCapabilities: mustBeTrue.length + mustBeFalse.length,
  };
  return deepFreeze(core);
}

export default verifyAuthoringRuntimeToPreviewBridge;
