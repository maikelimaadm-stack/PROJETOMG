import { CORE_FIELD_COUNT, REAL_TARGET_DESCRIPTOR_FIELDS_REF } from './coreEnvelopeConfig.js';
import { deepFreeze } from './deepFreeze.js';
/** Resource limits (declared). maxCoreFields DERIVED from the real preimage. No silent truncation / partial core. */
const D = (dimension, sourceLimit, consumerLimit, sandboxLimit) => deepFreeze({
  dimension, sourceLimit, consumerLimit, sandboxLimit, issueCode: 'CORE_ENVELOPE_LIMIT_EXCEEDED',
  boundaryTests: Object.freeze([`${dimension} == limit passes`, `${dimension} == limit + 1 blocks`]),
  silentTruncationAllowed: false, partialCoreAllowed: false,
});
export const RESOURCE_LIMIT_CONTRACT = deepFreeze({
  kind: 'core-envelope-resource-limit-contract',
  unknownDimensionRejected: true, silentTruncationAllowed: false, partialCoreAllowed: false,
  maxCoreFieldsDerived: true,
  dimensions: [
    D('maxEnvelopeBytes', 524288, 524288, 524288),
    D('maxCoreBytes', 262144, 262144, 262144),
    D('maxCoreFields', CORE_FIELD_COUNT, CORE_FIELD_COUNT, CORE_FIELD_COUNT),
    D('maxTargetDescriptorFields', REAL_TARGET_DESCRIPTOR_FIELDS_REF.length, REAL_TARGET_DESCRIPTOR_FIELDS_REF.length, REAL_TARGET_DESCRIPTOR_FIELDS_REF.length),
    D('maxIssues', 512, 512, 512),
    D('maxStringLength', 4096, 4096, 4096),
    D('maxStructureDepth', 64, 64, 64),
  ],
});
export const RESOURCE_DIMENSION_NAMES = deepFreeze(RESOURCE_LIMIT_CONTRACT.dimensions.map((d) => d.dimension));
export default RESOURCE_LIMIT_CONTRACT;
