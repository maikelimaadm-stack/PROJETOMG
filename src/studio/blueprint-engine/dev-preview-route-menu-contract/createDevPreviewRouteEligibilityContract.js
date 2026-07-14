import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { routeMenuDigest } from './routeMenuContractConfig.js';

/**
 * Route eligibility CONTRACT — eligible for a FUTURE implementation only; never for current
 * wiring. Pure and deterministic.
 * @returns {Object}
 */
export function createDevPreviewRouteEligibilityContract() {
  const core = {
    kind: 'dev-preview-route-eligibility-contract',
    eligibleForFutureImplementation: true,
    eligibleForCurrentWiring: false,
    requiresExplicitFutureSlice: true,
    requiresManualGate: true,
    requiresDevOnly: true,
    requiresRuntimeUiReady: true,
    requiresSyntheticDataOnly: true,
  };
  return safeCloneGenericModel({ ...core, routeEligibilityDigest: routeMenuDigest(core) });
}

export default createDevPreviewRouteEligibilityContract;
