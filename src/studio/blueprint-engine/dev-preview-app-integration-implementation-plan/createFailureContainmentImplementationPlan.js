import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { appIntegrationPlanDigest } from './appIntegrationImplementationPlanConfig.js';

/**
 * Failure containment implementation PLAN — fail-closed; a dev-preview failure never propagates to
 * the product App/router/menu. Pure and deterministic.
 * @returns {Object}
 */
export function createFailureContainmentImplementationPlan() {
  const core = {
    kind: 'app-integration-failure-containment-implementation-plan',
    failClosed: true,
    failureContained: true,
    productAppFailurePropagationAllowed: false,
    productRouterFailurePropagationAllowed: false,
    productMenuFailurePropagationAllowed: false,
    requiresManualGate: true,
  };
  return safeCloneGenericModel({ ...core, failureContainmentImplementationPlanDigest: appIntegrationPlanDigest(core) });
}

export default createFailureContainmentImplementationPlan;
