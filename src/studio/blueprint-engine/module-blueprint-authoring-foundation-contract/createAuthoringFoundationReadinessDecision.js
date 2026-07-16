import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { AUTHORING_FOUNDATION_READINESS_STATES, authoringFoundationDigest } from './authoringFoundationContractConfig.js';

/**
 * Decides readiness of the authoring foundation contract. Ready ONLY for the foundation contract
 * itself; never for a real authoring implementation plan/runtime/UI, permission/tenancy foundation,
 * product exposure, module generation, or production. Blocked on any blocker. Pure and deterministic.
 *
 * @param {Object} [options]
 * @param {string[]} [options.blockers]
 * @param {string[]} [options.warnings]
 * @returns {Object}
 */
export function createAuthoringFoundationReadinessDecision(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const blockers = Array.isArray(o.blockers) ? o.blockers : [];
  const warnings = Array.isArray(o.warnings) ? o.warnings : [];
  const ready = blockers.length === 0;
  const readiness = ready ? 'studio_module_blueprint_authoring_foundation_contract_ready' : 'blocked';

  const core = {
    kind: 'authoring-foundation-readiness-decision',
    readiness,
    readyForAuthoringFoundationContract: ready,
    readyForAuthoringImplementationPlan: false,
    readyForAuthoringRuntime: false,
    readyForAuthoringUi: false,
    readyForPermissionTenancyIntegration: false,
    readyForProductExposure: false,
    readyForModuleGeneration: false,
    readyForProduction: false,
    requiresPermissionTenancyFoundation: true,
    blockers: [...blockers],
    warnings: [...warnings],
    blockerCount: blockers.length,
    warningCount: warnings.length,
    knownState: AUTHORING_FOUNDATION_READINESS_STATES.includes(readiness),
  };
  return safeCloneGenericModel({ ...core, readinessDigest: authoringFoundationDigest(core) });
}

export default createAuthoringFoundationReadinessDecision;
