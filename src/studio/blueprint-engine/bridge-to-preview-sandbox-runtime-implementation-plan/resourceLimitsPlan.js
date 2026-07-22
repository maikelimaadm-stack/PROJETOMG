import {
  REAL_RESOURCE_LIMIT_CONTRACT, REAL_DECISION_FIELDS, REAL_TARGET_DESCRIPTOR_FIELDS_REF, REAL_ENVELOPE_FIELDS,
} from './planConfig.js';
import { deepFreeze } from './deepFreeze.js';

/**
 * RESOURCE LIMIT PLAN — every real resource dimension across bridge output, future runtime and sandbox. The
 * descriptor/payload/layout/relationship/extension/string/issue/depth dimensions are reflected READ-ONLY from the
 * merged contract's RESOURCE_LIMIT_CONTRACT; the envelope/decision/target-descriptor field-count dimensions are
 * derived from the real field arrays. Declaration only — nothing is enforced here. No silent truncation, no
 * partial descriptor.
 */
const D = (dimension, sourceLimit, runtimeLimit, sandboxLimit, reason) => deepFreeze({
  dimension, sourceLimit, runtimeLimit, sandboxLimit, reason,
  issueCode: 'RUNTIME_LIMIT_EXCEEDED',
  boundaryTests: Object.freeze([`${dimension} == limit passes`, `${dimension} == limit + 1 blocks`]),
  silentTruncationAllowed: false,
  partialDescriptorAllowed: false,
  stricterRuntimeLimitIntentional: runtimeLimit <= sourceLimit,
});

// Field-count dimensions derived from the real merged shapes.
const decisionFieldCount = REAL_DECISION_FIELDS.length;          // 33
const targetDescriptorFieldCount = REAL_TARGET_DESCRIPTOR_FIELDS_REF.length; // 23
const envelopeFieldCount = REAL_ENVELOPE_FIELDS.length;          // 17

// Reflected contract dimensions (bytes/fields/sections/etc.) — build a lookup by dimension name.
const contractDims = {};
for (const d of REAL_RESOURCE_LIMIT_CONTRACT.dimensions) contractDims[d.dimension] = d;
const R = (name) => {
  const d = contractDims[name];
  return D(name, d.sourceLimit, d.consumerLimit, d.sandboxLimit, d.reason);
};

export const RESOURCE_LIMITS_PLAN = deepFreeze({
  kind: 'bridge-to-preview-sandbox-runtime-resource-limits-plan',
  unknownDimensionRejected: true,
  silentTruncationAllowed: false,
  partialDescriptorAllowed: false,
  dimensions: deepFreeze([
    D('maxEnvelopeBytes', 262144, 262144, 262144, 'envelope byte ceiling matches descriptor byte ceiling; fail-closed'),
    D('maxDecisionFields', decisionFieldCount, decisionFieldCount, decisionFieldCount, 'exact real decision field count (33); no extra fields'),
    D('maxTargetDescriptorFields', targetDescriptorFieldCount, targetDescriptorFieldCount, targetDescriptorFieldCount, 'exact real target descriptor field count (23)'),
    R('maxDescriptorBytes'),
    R('maxDescriptorFields'),
    R('maxPayloadFields'),
    R('maxLayoutSections'),
    R('maxRelationships'),
    R('maxExtensions'),
    R('maxStringLength'),
    R('maxValidationIssues'),
    R('maxStructureDepth'),
  ]),
  envelopeFieldCount,
  resourceLimitsImplemented: false,
});

export const RESOURCE_DIMENSION_NAMES = deepFreeze(RESOURCE_LIMITS_PLAN.dimensions.map((d) => d.dimension));
export default RESOURCE_LIMITS_PLAN;
