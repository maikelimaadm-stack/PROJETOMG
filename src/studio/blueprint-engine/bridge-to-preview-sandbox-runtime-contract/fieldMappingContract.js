import { deepFreeze } from './deepFreeze.js';
/**
 * FUTURE field mappings from the bridge target descriptor to the future sandbox descriptor. Declaration only
 * (no executor). Derived from the real descriptor identity/digest/version fields + a metadata envelope.
 */
const M = (mappingId, sourceField, targetField, transformKind, securitySensitive) => Object.freeze({
  mappingId, sourceField, targetField, required: true, transformKind, defaultAllowed: false,
  losslessRequired: true, syntheticOnly: true, deterministic: true, securitySensitive: Boolean(securitySensitive),
});
export const FIELD_MAPPING_CONTRACT = deepFreeze([
  M('m01', 'candidateDraftId', 'candidateDraftId', 'identity', false),
  M('m02', 'candidateDraftRevision', 'candidateDraftRevision', 'identity', false),
  M('m03', 'candidateDraftDigest', 'candidateDraftDigest', 'identity', true),
  M('m04', 'sourceDigest', 'sourceDigest', 'identity', true),
  M('m05', 'sourceRuntimeVersion', 'sourceRuntimeVersion', 'identity', false),
  M('m06', 'sourceHandoffVersion', 'sourceHandoffVersion', 'identity', false),
  M('m07', 'sourceTargetSandboxVersion', 'sourceTargetSandboxVersion', 'identity', false),
  M('m08', 'synthetic', 'synthetic', 'assert_true', true),
  M('m09', 'immutable', 'immutable', 'assert_true', true),
  M('m10', 'validated', 'validated', 'assert_true', true),
  M('m11', 'targetContractVersion', 'sandboxContractVersion', 'identity', false),
  M('m12', 'syntheticPayload', 'previewMetadata', 'envelope_metadata', true),
]);
export default FIELD_MAPPING_CONTRACT;
