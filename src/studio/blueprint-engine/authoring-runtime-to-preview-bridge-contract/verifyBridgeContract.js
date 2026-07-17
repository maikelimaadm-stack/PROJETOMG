import { BRIDGE_CONTRACT_CAPABILITIES, bridgeDigest } from './bridgeContractConfig.js';
import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/**
 * Fail-closed verifier for a produced bridge contract. Detects any capability leak, any real-effect
 * claim, any SSOT/certification inversion, any permissive source/version/mapping rule, any extension
 * override of a protected field, any digest-as-cryptographic claim, any missing manual gate, and any
 * embedded nondeterminism marker. Pure — returns a report; never throws, never mutates, never does I/O.
 * Any violated invariant is a blocker.
 *
 * @param {Object} [options] @param {Object} [options.contract] @returns {Object}
 */
export function verifyBridgeContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const contract = isGenericModelPlainObject(o.contract) ? o.contract : {};
  const caps = isGenericModelPlainObject(contract.capabilities) ? contract.capabilities : BRIDGE_CONTRACT_CAPABILITIES;

  const blockers = [];

  // Capability flags that must be TRUE (headless / contract-only invariants).
  const mustBeTrue = [
    'headless', 'contractOnly', 'metadataOnly', 'syntheticOnly', 'devOnly', 'deterministic',
    'failClosed', 'ssotPreserved', 'sourceConsumedReadOnly', 'targetContractConsumedReadOnly',
  ];
  for (const k of mustBeTrue) {
    if (caps[k] !== true) blockers.push(`capability_${k}_must_be_true`);
  }

  // Capability flags that must be FALSE (nothing real implemented / touched).
  const mustBeFalse = [
    'bridgeImplemented', 'adapterImplemented', 'sourceValidationImplemented', 'targetPayloadCreated',
    'previewPayloadCreated', 'previewMounted', 'authoringUiImplemented', 'editorImplemented', 'appTouched',
    'routeCreated', 'menuCreated', 'sidebarCreated', 'persistenceImplemented', 'storageUsed',
    'filesystemWritesUsed', 'backendAccessed', 'prismaAccessed', 'fetchUsed', 'networkUsed', 'realDataRead',
    'realDataWrite', 'moduleGenerated', 'moduleRegistered', 'certificationPerformed', 'candidateCanonical',
    'productExposed', 'productionAccessed', 'stagingAccessed', 'prototypeRelinked', 'permissionModelIntegrated',
    'tenantModelIntegrated', 'serverSideAuthorizationIntegrated',
  ];
  for (const k of mustBeFalse) {
    if (caps[k] === true) blockers.push(`capability_${k}_must_be_false`);
  }

  // Source handoff contract: strict draft identity, no single-draft fallback, fail-closed unknown ids.
  const src = isGenericModelPlainObject(contract.sourceHandoff) ? contract.sourceHandoff : {};
  if (src.strictDraftIdentityRequired === false) blockers.push('unsafe_source_non_strict_draft_identity');
  if (src.singleDraftFallbackAllowed === true) blockers.push('unsafe_source_single_draft_fallback');
  if (src.missingDraftIdFailsClosed === false) blockers.push('unsafe_source_missing_draft_id_not_fail_closed');
  if (src.unknownDraftIdFailsClosed === false) blockers.push('unsafe_source_unknown_draft_id_not_fail_closed');

  // Target preview sandbox contract: metadata only, no mount / route / menu / module / real payload.
  const tgt = isGenericModelPlainObject(contract.targetPreviewSandbox) ? contract.targetPreviewSandbox : {};
  if (tgt.previewMounted === true || tgt.realPayloadCreated === true || tgt.productExposed === true
    || tgt.routeCreated === true || tgt.menuCreated === true || tgt.moduleGenerated === true
    || tgt.persistenceAllowed === true) blockers.push('unsafe_target_real_effect');

  // Field mapping contract: no unknown transform, no critical default, no lossy critical, all critical mapped.
  const fm = isGenericModelPlainObject(contract.fieldMapping) ? contract.fieldMapping : {};
  if (fm.anyUnknownTransform === true) blockers.push('unsafe_mapping_unknown_transform');
  if (fm.anyCriticalDefault === true) blockers.push('unsafe_mapping_critical_default');
  if (fm.anyLossyCritical === true) blockers.push('unsafe_mapping_lossy_critical');
  if (fm.everyCriticalMapped === false) blockers.push('unsafe_mapping_missing_critical');

  // Version compatibility contract: exact versions, unknown fails closed, no downgrade, upgrade not assumed.
  const vc = isGenericModelPlainObject(contract.versionCompatibility) ? contract.versionCompatibility : {};
  if (vc.exactSourceRuntimeVersionRequired === false || vc.exactTargetSandboxVersionRequired === false) blockers.push('unsafe_version_not_exact');
  if (vc.unknownVersionFailsClosed === false) blockers.push('unsafe_version_unknown_not_fail_closed');
  if (vc.versionDowngradeAllowed === true) blockers.push('unsafe_version_downgrade_allowed');
  if (vc.versionUpgradeAssumedCompatible === true) blockers.push('unsafe_version_upgrade_assumed');

  // Digest semantics: FNV internal-only; never cryptographic; may authorize nothing real.
  const ds = isGenericModelPlainObject(contract.digestSemantics) ? contract.digestSemantics : {};
  if (ds.cryptographicIntegrityProvided === true) blockers.push('unsafe_digest_claimed_cryptographic');
  if (ds.digestMayAuthorizeCertification === true || ds.digestMayAuthorizeModuleGeneration === true
    || ds.digestMayAuthorizeProduction === true) blockers.push('unsafe_digest_authorizes_real');

  // Validation pipeline: fail-closed, no auto-correction, no permissive fallback, not yet implemented.
  const vp = isGenericModelPlainObject(contract.validationPipeline) ? contract.validationPipeline : {};
  if (vp.failClosed === false) blockers.push('unsafe_validation_not_fail_closed');
  if (vp.autoCorrectionAllowed === true) blockers.push('unsafe_validation_auto_correction');
  if (vp.permissiveFallbackAllowed === true) blockers.push('unsafe_validation_permissive_fallback');

  // Extensibility policy: unknown critical fields rejected, protected fields cannot be overridden.
  const ext = isGenericModelPlainObject(contract.extensibility) ? contract.extensibility : {};
  if (ext.unknownCriticalFieldsRejected === false) blockers.push('unsafe_extensibility_unknown_critical_accepted');
  if (ext.extensionCannotOverrideCriticalFields === false) blockers.push('unsafe_extensibility_override_protected');

  // Replay/idempotency: deterministic, no replay side effects.
  const rp = isGenericModelPlainObject(contract.replayIdempotency) ? contract.replayIdempotency : {};
  if (rp.replaySideEffectsAllowed === true) blockers.push('unsafe_replay_side_effects');
  if (rp.bridgeDecisionDigestDeterministic === false) blockers.push('unsafe_replay_nondeterministic');

  // SSOT boundary: certified blueprint remains SSOT; nothing may invert it.
  const ss = isGenericModelPlainObject(contract.ssotBoundary) ? contract.ssotBoundary : {};
  if (ss.certifiedBlueprintRemainsSsot === false) blockers.push('unsafe_ssot_not_preserved');
  if (ss.draftIsCanonical === true || ss.candidateIsCanonical === true) blockers.push('unsafe_ssot_inversion');
  if (ss.bridgeMayCertify === true || ss.bridgeMayWriteCertifiedBlueprint === true
    || ss.bridgeMayBypassCertification === true || ss.bridgeMayGenerateModule === true) blockers.push('unsafe_ssot_bridge_privilege');
  if (ss.secondSsotCreated === true) blockers.push('unsafe_second_ssot');

  // Certification boundary: never certifies / self-certifies; candidate inert.
  const cb = isGenericModelPlainObject(contract.certificationBoundary) ? contract.certificationBoundary : {};
  if (cb.certificationPerformed === true) blockers.push('unsafe_certification_performed');
  if (cb.selfCertificationAllowed === true) blockers.push('unsafe_self_certification');
  if (cb.candidateCanonical === true || cb.candidateCertified === true) blockers.push('unsafe_candidate_canonical');

  // Permission/tenancy boundary: NOT integrated; exposure blocked.
  const pt = isGenericModelPlainObject(contract.permissionTenancy) ? contract.permissionTenancy : {};
  if (pt.permissionModelIntegrated === true) blockers.push('unsafe_permission_model_integrated');
  if (pt.tenantModelIntegrated === true) blockers.push('unsafe_tenant_model_integrated');
  if (pt.serverSideAuthorizationIntegrated === true) blockers.push('unsafe_server_side_authorization_integrated');
  if (pt.requiresPermissionTenancyFoundationBeforeExposure === false) blockers.push('unsafe_permission_exposure_not_blocked');

  // Security/safety: nothing real allowed.
  const sec = isGenericModelPlainObject(contract.securitySafety) ? contract.securitySafety : {};
  if (sec.anyRealAllowed === true) blockers.push('unsafe_security_real_allowed');

  // Prototype relink prohibition: forbids relink/import of the old prototype.
  const pr = isGenericModelPlainObject(contract.prototypeRelinkProhibition) ? contract.prototypeRelinkProhibition : {};
  if (pr.prototypeRelinkAllowed === true || pr.prototypeImportAllowed === true || pr.oldPrototypeImported === true) blockers.push('unsafe_prototype_relink');

  // Manual gate: required; authorizes contract + plan only, nothing real.
  const mg = isGenericModelPlainObject(contract.manualGate) ? contract.manualGate : {};
  if (mg.manualGateRequired !== true) blockers.push('missing_manual_gate');
  if (mg.authorizesBridgeImplementation === true || mg.authorizesPreviewMount === true
    || mg.authorizesAuthoringUi === true || mg.authorizesModuleGeneration === true
    || mg.authorizesCertification === true || mg.authorizesProductExposure === true
    || mg.authorizesProduction === true) blockers.push('unsafe_manual_gate_authorizes_real');

  // Readiness: contract + plan ready only; never a real implementation/exposure state.
  if (contract.readyForBridgeImplementationSlice === true) blockers.push('unsafe_ready_for_implementation_slice');
  if (contract.readyForPreviewMount === true) blockers.push('unsafe_ready_for_preview_mount');
  if (contract.readyForProductExposure === true) blockers.push('unsafe_ready_for_product_exposure');
  if (contract.readyForModuleGeneration === true) blockers.push('unsafe_ready_for_module_generation');
  if (contract.readyForProduction === true) blockers.push('unsafe_ready_for_production');

  // Static nondeterminism scan over any embedded source string (defensive; the gate is authoritative).
  let serialized = '';
  try {
    serialized = JSON.stringify(contract) || '';
  } catch {
    serialized = '';
  }
  if (/Date\.now|new Date\(|Math\.random|crypto\.randomUUID|\brandomUUID\b/.test(serialized)) blockers.push('unsafe_nondeterministic_source');

  const ok = blockers.length === 0;
  const core = {
    kind: 'bridge-contract-verification',
    ok,
    valid: ok,
    headless: caps.headless === true,
    contractOnly: caps.contractOnly === true,
    deterministic: caps.deterministic === true,
    failClosed: caps.failClosed === true,
    ssotPreserved: caps.ssotPreserved === true,
    bridgeImplemented: caps.bridgeImplemented === true,
    previewMounted: caps.previewMounted === true,
    certificationPerformed: caps.certificationPerformed === true,
    productExposed: caps.productExposed === true,
    permissionModelIntegrated: caps.permissionModelIntegrated === true,
    blockers,
    blockerCount: blockers.length,
    checkedCapabilities: mustBeTrue.length + mustBeFalse.length,
  };
  return safeCloneGenericModel({ ...core, verificationDigest: bridgeDigest(core) });
}

export default verifyBridgeContract;
