import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { APP_INTEGRATION_CONTRACT_READINESS_STATES, appIntegrationDigest } from './appIntegrationContractConfig.js';

/**
 * Decides readiness of the contract. Ready ONLY for the contract itself; never for a real
 * implementation plan/slice, App integration, real module generation, or production. Blocked on any
 * blocker. Pure and deterministic.
 *
 * @param {Object} [options]
 * @param {string[]} [options.blockers]
 * @param {string[]} [options.warnings]
 * @returns {Object}
 */
export function createAppIntegrationReadinessDecision(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const blockers = Array.isArray(o.blockers) ? o.blockers : [];
  const warnings = Array.isArray(o.warnings) ? o.warnings : [];
  const ready = blockers.length === 0;

  const core = {
    kind: 'app-integration-readiness-decision',
    readiness: ready ? 'studio_dev_preview_app_integration_contract_ready' : 'blocked',
    readyForAppIntegrationContract: ready,
    readyForAppIntegrationImplementationPlan: false,
    readyForAppIntegrationImplementationSlice: false,
    readyForRealModuleGeneration: false,
    readyForProduction: false,
    blockers: [...blockers],
    warnings: [...warnings],
    blockerCount: blockers.length,
    warningCount: warnings.length,
    knownState: APP_INTEGRATION_CONTRACT_READINESS_STATES.includes(ready ? 'studio_dev_preview_app_integration_contract_ready' : 'blocked'),
  };
  return safeCloneGenericModel({ ...core, readinessDigest: appIntegrationDigest(core) });
}

export default createAppIntegrationReadinessDecision;
