import {
  REAL_BRIDGE_TARGET_DESCRIPTOR_FIELDS, BRIDGE_MAPPED_TARGET_FIELDS, FORBIDDEN_PROTOTYPE_PATHS,
} from './contractRuntimeConfig.js';
import { deepFreeze } from './deepFreeze.js';
import { isPlainObject } from './normalizeContractInput.js';

/**
 * Fail-closed verifier for the produced contract. Detects invented source/sandbox fields or aliases, invented
 * mappings, permissive versions/digests, allowed source mutation, any UI/App/mount/persistence/backend/Prisma/
 * real-data/module/certification/product capability, SSOT inversion, prototype relink, a missing manual gate
 * and any premature runtime (implementation flags must all be false). Pure — returns a report; never throws,
 * never mutates, never does I/O. @param {Object} [options] @param {Object} [options.contract] @returns {Object}
 */
export function verifyBridgeToPreviewSandboxRuntimeContract(options = {}) {
  const o = isPlainObject(options) ? options : {};
  const c = isPlainObject(o.contract) ? o.contract : {};
  const blockers = [];

  // Capabilities — contract-definition true, every runtime/consumer capability false.
  const caps = isPlainObject(c.capabilities) ? c.capabilities : {};
  const mustBeTrue = [
    'headless', 'devOnly', 'syntheticOnly', 'inMemoryOnly', 'ephemeralOnly', 'deterministic', 'immutable', 'failClosed',
    'sideEffectFree', 'metadataOnly', 'contractOnly', 'realBridgeDescriptorShapeCaptured',
    'realSandboxContractShapeCaptured', 'ssotPreserved', 'sourceConsumedReadOnly', 'upstreamsConsumedReadOnly',
  ];
  for (const k of mustBeTrue) { if (caps[k] !== true) blockers.push(`capability_${k}_must_be_true`); }
  const mustBeFalse = [
    'consumerImplemented', 'candidateConsumed', 'sandboxDescriptorCreated', 'sourceValidationImplemented',
    'mappingExecutorImplemented', 'sandboxDescriptorBuilderImplemented', 'validationPipelineExecuted',
    'previewPayloadCreated', 'previewMounted', 'appTouched', 'routeCreated', 'menuCreated', 'sidebarCreated',
    'persistenceImplemented', 'filesystemWritesUsed', 'backendAccessed', 'prismaAccessed', 'fetchUsed', 'networkUsed',
    'realDataRead', 'realDataWrite', 'moduleGenerated', 'moduleRegistered', 'certificationPerformed', 'candidateCanonical',
    'productExposed', 'productionAccessed', 'stagingAccessed', 'prototypeRelinked', 'permissionModelIntegrated',
    'tenantModelIntegrated', 'serverSideAuthorizationIntegrated',
  ];
  for (const k of mustBeFalse) { if (caps[k] === true) blockers.push(`capability_${k}_must_be_false`); }

  // Source descriptor — no invented fields.
  const sd = isPlainObject(c.sourceDescriptor) ? c.sourceDescriptor : {};
  if (Array.isArray(sd.realFields)) {
    for (const f of sd.realFields) { if (!REAL_BRIDGE_TARGET_DESCRIPTOR_FIELDS.includes(f)) blockers.push(`invented_source_field_${f}`); }
  }

  // Mappings — source real, target within the declared target set, no duplicates, no unknown transform, no default.
  const mappings = Array.isArray(c.fieldMappings) ? c.fieldMappings : [];
  const seenS = new Set(); const seenT = new Set();
  const allowedTransforms = ['identity', 'assert_true', 'assert_false', 'clone_synthetic', 'envelope_metadata'];
  const sandboxTargets = isPlainObject(c.sandboxDescriptor) && Array.isArray(c.sandboxDescriptor.futureFields) ? c.sandboxDescriptor.futureFields : [];
  for (const m of mappings) {
    if (!REAL_BRIDGE_TARGET_DESCRIPTOR_FIELDS.includes(m.sourceField) && !BRIDGE_MAPPED_TARGET_FIELDS.includes(m.sourceField)) blockers.push(`invented_mapping_source_${m.sourceField}`);
    if (sandboxTargets.length && !sandboxTargets.includes(m.targetField)) blockers.push(`invented_mapping_target_${m.targetField}`);
    if (!allowedTransforms.includes(m.transformKind)) blockers.push(`unknown_mapping_transform_${m.transformKind}`);
    if (m.defaultAllowed === true) blockers.push(`mapping_default_forbidden_${m.mappingId}`);
    if (seenS.has(m.sourceField)) blockers.push(`duplicate_mapping_source_${m.sourceField}`);
    if (seenT.has(m.targetField)) blockers.push(`duplicate_mapping_target_${m.targetField}`);
    seenS.add(m.sourceField); seenT.add(m.targetField);
  }

  // Versions.
  const vt = isPlainObject(c.versionContract) ? c.versionContract : {};
  const vp = isPlainObject(vt.policy) ? vt.policy : {};
  if (vp.exactVersionMatchRequired === false) blockers.push('version_not_exact');
  if (vp.unknownVersionFailsClosed === false) blockers.push('version_unknown_accepted');
  if (vp.aggregatedVersionObjectAsSourceAliasAllowed === true) blockers.push('version_aggregate_alias_allowed');
  if (vp.silentVersionCoercionAllowed === true) blockers.push('version_silent_coercion_allowed');

  // Digest.
  const dg = isPlainObject(c.digestContract) ? c.digestContract : {};
  if (dg.digestValidationMode !== undefined && dg.digestValidationMode !== 'recompute_and_compare') blockers.push('digest_wrong_validation_mode');
  if (dg.alternativeSerializerAllowed === true) blockers.push('digest_alternative_serializer');
  if (dg.cryptographicIntegrityProvided === true) blockers.push('digest_claimed_cryptographic');
  if (dg.futureConsumerMustNotInventIt === false) blockers.push('digest_invention_allowed');

  // Read-only.
  const ro = isPlainObject(c.readOnlyPolicy) ? c.readOnlyPolicy : {};
  if (ro.sourceMutationAllowed === true) blockers.push('source_mutation_allowed');
  if (ro.sourceReferenceRetentionAllowed === true) blockers.push('source_reference_retention_allowed');
  if (ro.consumerMayMount === true || ro.consumerMayUseReact === true || ro.consumerMayPersist === true
    || ro.consumerMayReadRealData === true || ro.consumerMayCreateRouteMenu === true || ro.consumerMayGenerateModule === true
    || ro.consumerMayCertify === true || ro.consumerMayExposeProduct === true) blockers.push('read_only_policy_permits_real_effect');

  // Failure containment.
  const fc = isPlainObject(c.failureContainment) ? c.failureContainment : {};
  if (fc.partialSandboxDescriptorAllowed === true) blockers.push('partial_sandbox_descriptor_allowed');
  if (fc.unexpectedExceptionsMustFailClosed === false) blockers.push('exceptions_may_escape');
  if (fc.stackLeakAllowed === true || fc.internalErrorMessageLeakAllowed === true || fc.secretLeakAllowed === true) blockers.push('failure_leak_allowed');

  // SSOT.
  const ss = isPlainObject(c.ssotBoundary) ? c.ssotBoundary : {};
  if (ss.certifiedBlueprintRemainsSsot === false) blockers.push('ssot_not_preserved');
  if (ss.bridgeDescriptorIsCanonical === true || ss.sandboxDescriptorIsCanonical === true) blockers.push('ssot_inversion');
  if (ss.consumerMayCertify === true || ss.consumerMayGenerateModule === true || ss.consumerMayWriteCertifiedBlueprint === true) blockers.push('ssot_consumer_privilege');

  // Permission/tenancy.
  const pt = isPlainObject(c.permissionTenancyBoundary) ? c.permissionTenancyBoundary : {};
  if (pt.permissionModelIntegrated === true || pt.tenantModelIntegrated === true) blockers.push('permission_integrated');
  if (pt.requiresPermissionTenancyFoundationBeforeExposure === false) blockers.push('permission_foundation_not_required');

  // Security.
  const sec = isPlainObject(c.securityContract) ? c.securityContract : {};
  if (sec.anyForbiddenSideEffect === true) blockers.push('security_real_side_effect');

  // Prototype relink.
  const pr = isPlainObject(c.prototypeProhibition) ? c.prototypeProhibition : {};
  if (pr.prototypeRelinkAllowed === true || pr.oldPrototypeImported === true) blockers.push('prototype_relink');

  // Manual gate.
  const mg = isPlainObject(c.manualCheckpoint) ? c.manualCheckpoint : {};
  if (mg.manualGateRequired !== true) blockers.push('manual_gate_missing');
  if (mg.authorizesRuntimeImplementation === true || mg.authorizesPreviewMount === true || mg.authorizesUi === true
    || mg.authorizesModuleGeneration === true || mg.authorizesCertification === true || mg.authorizesProductExposure === true) blockers.push('manual_gate_authorizes_real');

  // Premature runtime / readiness.
  if (c.readyForRuntimeImplementation === true) blockers.push('premature_runtime');
  if (c.readyForPreviewMount === true) blockers.push('premature_preview_mount');
  if (c.readyForProductExposure === true) blockers.push('premature_product_exposure');

  // Static nondeterminism / prototype scan over any embedded string.
  let serialized = '';
  try { serialized = JSON.stringify(c) || ''; } catch { serialized = ''; }
  if (/Date\.now|new Date\(|Math\.random|crypto\.randomUUID|\brandomUUID\b|performance\.now|toLocaleString|localeCompare/.test(serialized)) blockers.push('nondeterministic_source');
  if (FORBIDDEN_PROTOTYPE_PATHS.some((p) => serialized.includes(p) && !/forbiddenPrototypePaths/.test(serialized.slice(Math.max(0, serialized.indexOf(p) - 40), serialized.indexOf(p))))) {
    // prototype paths only allowed inside the declared prohibition list — otherwise a relink leak.
    if (!isPlainObject(c.prototypeProhibition)) blockers.push('prototype_reference_leak');
  }

  const ok = blockers.length === 0;
  return deepFreeze({
    kind: 'bridge-to-sandbox-contract-verification',
    ok, valid: ok,
    contractOnly: caps.contractOnly === true,
    consumerImplemented: caps.consumerImplemented === true,
    previewMounted: caps.previewMounted === true,
    productExposed: caps.productExposed === true,
    blockers, blockerCount: blockers.length,
    checkedCapabilities: mustBeTrue.length + mustBeFalse.length,
  });
}

export default verifyBridgeToPreviewSandboxRuntimeContract;
