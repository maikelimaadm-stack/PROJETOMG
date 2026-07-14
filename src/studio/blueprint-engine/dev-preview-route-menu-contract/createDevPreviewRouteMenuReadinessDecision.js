import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { ROUTE_MENU_CONTRACT_READINESS_STATES, routeMenuDigest } from './routeMenuContractConfig.js';

/**
 * Decides readiness of the contract. Ready ONLY for the contract itself; never for a real route/
 * menu implementation, App integration, real module generation, or production. Blocked on any
 * blocker. Pure and deterministic.
 *
 * @param {Object} [options]
 * @param {string[]} [options.blockers]
 * @param {string[]} [options.warnings]
 * @returns {Object}
 */
export function createDevPreviewRouteMenuReadinessDecision(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const blockers = Array.isArray(o.blockers) ? o.blockers : [];
  const warnings = Array.isArray(o.warnings) ? o.warnings : [];
  const ready = blockers.length === 0;

  const core = {
    kind: 'dev-preview-route-menu-readiness-decision',
    readiness: ready ? 'studio_dev_preview_route_menu_contract_ready' : 'blocked',
    readyForRouteMenuContract: ready,
    readyForRouteMenuImplementation: false,
    readyForAppIntegration: false,
    readyForRealModuleGeneration: false,
    readyForProduction: false,
    blockers: [...blockers],
    warnings: [...warnings],
    blockerCount: blockers.length,
    warningCount: warnings.length,
    knownState: ROUTE_MENU_CONTRACT_READINESS_STATES.includes(ready ? 'studio_dev_preview_route_menu_contract_ready' : 'blocked'),
  };
  return safeCloneGenericModel({ ...core, readinessDigest: routeMenuDigest(core) });
}

export default createDevPreviewRouteMenuReadinessDecision;
