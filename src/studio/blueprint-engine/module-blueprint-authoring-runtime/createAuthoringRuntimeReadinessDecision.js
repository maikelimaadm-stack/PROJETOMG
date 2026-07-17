import { AUTHORING_RUNTIME_READINESS_STATES } from './authoringRuntimeConfig.js';
import { isPlainObject } from './normalizeAuthoringInput.js';
import { createDeterministicDigest } from './createDeterministicDigest.js';

/**
 * Decides runtime readiness. Ready for headless synthetic authoring ONLY; never for UI, permission/
 * tenancy integration, product exposure, module generation, or production. Blocked on any blocker.
 * @param {Object} [options] @returns {Object}
 */
export function createAuthoringRuntimeReadinessDecision(options = {}) {
  const o = isPlainObject(options) ? options : {};
  const blockers = Array.isArray(o.blockers) ? o.blockers : [];
  const warnings = Array.isArray(o.warnings) ? o.warnings : [];
  const ready = blockers.length === 0;
  const readiness = ready ? 'studio_module_blueprint_authoring_runtime_ready' : 'blocked';
  const core = {
    kind: 'authoring-runtime-readiness-decision',
    readiness,
    readyForAuthoringRuntime: ready,
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
    knownState: AUTHORING_RUNTIME_READINESS_STATES.includes(readiness),
  };
  return Object.freeze({ ...core, readinessDigest: createDeterministicDigest(core) });
}

export default createAuthoringRuntimeReadinessDecision;
