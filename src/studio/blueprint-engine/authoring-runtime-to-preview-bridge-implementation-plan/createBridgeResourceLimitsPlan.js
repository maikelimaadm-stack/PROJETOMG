import { BRIDGE_RESOURCE_LIMIT_DIMENSIONS, DEFAULT_BRIDGE_RESOURCE_LIMITS, bridgePlanDigest } from './bridgeImplementationPlanConfig.js';
import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/**
 * RESOURCE LIMITS PLAN — plans bounded resource limits for the future bridge. Concrete default values are
 * PLANNED, not executed. Unknown dimensions rejected; no silent truncation; limit-exceeded fails closed.
 * Metadata only. @returns {Object}
 */
export function createBridgeResourceLimitsPlan() {
  const core = {
    kind: 'bridge-resource-limits-plan',
    resourceLimitsPlanned: true,
    resourceLimitsImplemented: false,
    dimensions: [...BRIDGE_RESOURCE_LIMIT_DIMENSIONS],
    dimensionCount: BRIDGE_RESOURCE_LIMIT_DIMENSIONS.length,
    plannedDefaults: { ...DEFAULT_BRIDGE_RESOURCE_LIMITS },
    unknownResourceDimensionRejected: true,
    silentTruncationAllowed: false,
    limitExceededFailsClosed: true,
  };
  return safeCloneGenericModel({ ...core, resourceLimitsPlanDigest: bridgePlanDigest(core) });
}

export default createBridgeResourceLimitsPlan;
