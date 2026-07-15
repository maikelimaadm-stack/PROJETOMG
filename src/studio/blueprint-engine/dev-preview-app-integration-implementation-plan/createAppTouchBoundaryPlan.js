import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { appIntegrationPlanDigest } from './appIntegrationImplementationPlanConfig.js';

/**
 * App touch boundary PLAN — asserts App.jsx stays untouched and no App wiring is implemented in a
 * future slice without the manual gate. Pure and deterministic.
 * @returns {Object}
 */
export function createAppTouchBoundaryPlan() {
  const core = {
    kind: 'app-integration-app-touch-boundary-plan',
    appTouched: false,
    appWiringImplemented: false,
    appJsxAllowed: false,
    requiresExplicitFutureSlice: true,
    requiresManualGate: true,
  };
  return safeCloneGenericModel({ ...core, appTouchBoundaryPlanDigest: appIntegrationPlanDigest(core) });
}

export default createAppTouchBoundaryPlan;
