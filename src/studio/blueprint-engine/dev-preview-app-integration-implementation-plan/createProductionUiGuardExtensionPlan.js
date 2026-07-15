import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { appIntegrationPlanDigest } from './appIntegrationImplementationPlanConfig.js';

/**
 * productionUiGuard extension PLAN — metadata describing how a future slice would extend the
 * production UI guard. It extends NOTHING and touches the guard NOT AT ALL. Pure and deterministic.
 * @returns {Object}
 */
export function createProductionUiGuardExtensionPlan() {
  const core = {
    kind: 'app-integration-production-ui-guard-extension-plan',
    productionUiGuardExtended: false,
    productionUiGuardTouched: false,
    extensionImplemented: false,
    futureExtensionKind: 'dev_only_allowlist_entry_behind_manual_gate',
    requiresExplicitFutureSlice: true,
    requiresManualGate: true,
  };
  return safeCloneGenericModel({ ...core, productionUiGuardExtensionPlanDigest: appIntegrationPlanDigest(core) });
}

export default createProductionUiGuardExtensionPlan;
