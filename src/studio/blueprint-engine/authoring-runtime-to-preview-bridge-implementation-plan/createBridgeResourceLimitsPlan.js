import { BRIDGE_RESOURCE_LIMIT_DIMENSIONS, DEFAULT_BRIDGE_RESOURCE_LIMITS, bridgePlanDigest } from './bridgeImplementationPlanConfig.js';
import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/**
 * The REAL Authoring Runtime default resource limits (read-only reference; mirrored from
 * `DEFAULT_AUTHORING_RESOURCE_LIMITS` in the runtime config — the runtime is NOT imported or altered).
 */
const RUNTIME_LIMITS = Object.freeze({
  maxFieldsPerDraft: 250,
  maxLayoutSectionsPerDraft: 100,
  maxRelationshipsPerDraft: 250,
  maxValidationIssuesPerRun: 1000,
  maxStringLength: 10000,
  maxSerializedSnapshotBytes: 2000000,
});

/**
 * Per-dimension coherence between the runtime source limit and the (stricter, intentional) bridge limit.
 * A stricter bridge limit MAY reject a runtime-valid handoff — that is intentional and never silent; it
 * produces a deterministic blocker with an explicit issueCode. @returns {Object[]}
 */
function coherenceRows() {
  return [
    { dimension: 'maxSourcePayloadBytes', sourceLimit: RUNTIME_LIMITS.maxSerializedSnapshotBytes, bridgeLimit: DEFAULT_BRIDGE_RESOURCE_LIMITS.maxSourcePayloadBytes, reason: 'bridge caps synthetic payload size well below runtime snapshot cap', issueCode: 'BRIDGE_SOURCE_PAYLOAD_TOO_LARGE' },
    { dimension: 'maxSourceFields', sourceLimit: RUNTIME_LIMITS.maxFieldsPerDraft, bridgeLimit: DEFAULT_BRIDGE_RESOURCE_LIMITS.maxSourceFields, reason: 'bridge caps field count below runtime max fields per draft', issueCode: 'BRIDGE_SOURCE_FIELDS_TOO_MANY' },
    { dimension: 'maxSourceLayoutSections', sourceLimit: RUNTIME_LIMITS.maxLayoutSectionsPerDraft, bridgeLimit: DEFAULT_BRIDGE_RESOURCE_LIMITS.maxSourceLayoutSections, reason: 'bridge caps layout sections below runtime max', issueCode: 'BRIDGE_SOURCE_LAYOUT_SECTIONS_TOO_MANY' },
    { dimension: 'maxSourceRelationships', sourceLimit: RUNTIME_LIMITS.maxRelationshipsPerDraft, bridgeLimit: DEFAULT_BRIDGE_RESOURCE_LIMITS.maxSourceRelationships, reason: 'bridge caps relationships below runtime max', issueCode: 'BRIDGE_SOURCE_RELATIONSHIPS_TOO_MANY' },
    { dimension: 'maxValidationIssues', sourceLimit: RUNTIME_LIMITS.maxValidationIssuesPerRun, bridgeLimit: DEFAULT_BRIDGE_RESOURCE_LIMITS.maxValidationIssues, reason: 'bridge caps issue count below runtime per-run max', issueCode: 'BRIDGE_VALIDATION_ISSUES_TOO_MANY' },
    { dimension: 'maxExtensions', sourceLimit: null, bridgeLimit: DEFAULT_BRIDGE_RESOURCE_LIMITS.maxExtensions, reason: 'runtime declares no extension limit; bridge introduces an explicit one', issueCode: 'BRIDGE_EXTENSIONS_TOO_MANY' },
    { dimension: 'maxStringLength', sourceLimit: RUNTIME_LIMITS.maxStringLength, bridgeLimit: DEFAULT_BRIDGE_RESOURCE_LIMITS.maxStringLength, reason: 'bridge caps string length below runtime max', issueCode: 'BRIDGE_STRING_TOO_LONG' },
  ];
}

/**
 * RESOURCE LIMITS PLAN — plans bounded resource limits for the future bridge with explicit coherence
 * against the real runtime limits. Bridge limits may be stricter (intentional, non-silent); unknown
 * dimensions rejected; no silent truncation; limit-exceeded fails closed with a deterministic blocker; no
 * partial target descriptor. Metadata only. @returns {Object}
 */
export function createBridgeResourceLimitsPlan() {
  const coherence = coherenceRows();
  const core = {
    kind: 'bridge-resource-limits-plan',
    resourceLimitsPlanned: true,
    resourceLimitsImplemented: false,
    dimensions: [...BRIDGE_RESOURCE_LIMIT_DIMENSIONS],
    dimensionCount: BRIDGE_RESOURCE_LIMIT_DIMENSIONS.length,
    plannedDefaults: { ...DEFAULT_BRIDGE_RESOURCE_LIMITS },
    runtimeReferenceLimits: { ...RUNTIME_LIMITS },
    coherence,
    coherenceRowCount: coherence.length,
    bridgeLimitsMayRejectRuntimeValidHandoff: true,
    stricterBridgeLimitsAreIntentional: true,
    sourceAcceptanceDoesNotGuaranteeBridgeAcceptance: true,
    limitMismatchIsNotSilent: true,
    limitExceededProducesDeterministicBlocker: true,
    partialTargetDescriptorAllowed: false,
    unknownResourceDimensionRejected: true,
    silentTruncationAllowed: false,
    limitExceededFailsClosed: true,
    everyBridgeLimitStricterOrEqualWhereComparable: coherence.every((r) => r.sourceLimit === null || r.bridgeLimit <= r.sourceLimit),
  };
  return safeCloneGenericModel({ ...core, resourceLimitsPlanDigest: bridgePlanDigest(core) });
}

export default createBridgeResourceLimitsPlan;
