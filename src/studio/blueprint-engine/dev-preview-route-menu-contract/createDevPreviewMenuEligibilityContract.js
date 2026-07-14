import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { routeMenuDigest } from './routeMenuContractConfig.js';

/**
 * Menu eligibility CONTRACT — eligible for a FUTURE implementation only; never for current wiring.
 * Pure and deterministic.
 * @returns {Object}
 */
export function createDevPreviewMenuEligibilityContract() {
  const core = {
    kind: 'dev-preview-menu-eligibility-contract',
    eligibleForFutureImplementation: true,
    eligibleForCurrentWiring: false,
    requiresExplicitFutureSlice: true,
    requiresManualGate: true,
  };
  return safeCloneGenericModel({ ...core, menuEligibilityDigest: routeMenuDigest(core) });
}

export default createDevPreviewMenuEligibilityContract;
