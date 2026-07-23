import { REAL_SOURCE_BRIDGE_DECISION_FIELDS, CORE_FIELD_COUNT_REF, OUTPUT_TARGET_DESCRIPTOR_FIELDS } from './contractConfig.js';
import { deepFreeze } from './deepFreeze.js';
/** Resource limits derived from real upstream shapes. No silent truncation / partial output. */
const D = (dimension, sourceLimit, builderLimit, coreEnvelopeLimit, reason) => deepFreeze({
  dimension, sourceLimit, builderLimit, coreEnvelopeLimit, reason, issueCode: 'BUILDER_LIMIT_EXCEEDED',
  boundaryTestsRequired: true, silentTruncationAllowed: false, partialOutputAllowed: false,
});
export const RESOURCE_LIMITS_CONTRACT = deepFreeze({
  kind: 'builder-resource-limits-contract',
  unknownDimensionRejected: true, silentTruncationAllowed: false, partialOutputAllowed: false,
  dimensions: [
    D('maxSourceDecisionBytes', 524288, 524288, 524288, 'source decision byte ceiling; fail-closed'),
    D('maxSourceDecisionFields', REAL_SOURCE_BRIDGE_DECISION_FIELDS.length, REAL_SOURCE_BRIDGE_DECISION_FIELDS.length, REAL_SOURCE_BRIDGE_DECISION_FIELDS.length, 'exact real decision field count (33)'),
    D('maxCoreBytes', 262144, 262144, 262144, 'core byte ceiling'),
    D('maxCoreFields', CORE_FIELD_COUNT_REF, CORE_FIELD_COUNT_REF, CORE_FIELD_COUNT_REF, 'exact real preimage field count (32)'),
    D('maxTargetDescriptorFields', OUTPUT_TARGET_DESCRIPTOR_FIELDS.length, OUTPUT_TARGET_DESCRIPTOR_FIELDS.length, OUTPUT_TARGET_DESCRIPTOR_FIELDS.length, 'exact real target descriptor field count (23)'),
    D('maxEnvelopeBytes', 524288, 524288, 524288, 'envelope byte ceiling'),
    D('maxIssues', 512, 512, 512, 'issue ceiling'),
    D('maxStringLength', 4096, 4096, 4096, 'string length ceiling'),
    D('maxStructureDepth', 64, 64, 64, 'structural depth ceiling'),
  ],
});
export const RESOURCE_DIMENSION_NAMES = deepFreeze(RESOURCE_LIMITS_CONTRACT.dimensions.map((d) => d.dimension));
export default RESOURCE_LIMITS_CONTRACT;
