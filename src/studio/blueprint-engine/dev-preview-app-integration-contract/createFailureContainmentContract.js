import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { appIntegrationDigest } from './appIntegrationContractConfig.js';

/**
 * Failure containment contract — fail-closed; a dev-preview failure never propagates to the product
 * App/router/menu. Pure and deterministic.
 * @returns {Object}
 */
export function createFailureContainmentContract() {
  const core = {
    kind: 'app-integration-failure-containment-contract',
    failClosed: true,
    failureContained: true,
    productAppFailurePropagationAllowed: false,
    productRouterFailurePropagationAllowed: false,
    productMenuFailurePropagationAllowed: false,
  };
  return safeCloneGenericModel({ ...core, failureContainmentDigest: appIntegrationDigest(core) });
}

export default createFailureContainmentContract;
