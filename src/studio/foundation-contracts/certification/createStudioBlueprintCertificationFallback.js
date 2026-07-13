import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

export const STUDIO_CERTIFICATION_FALLBACK_SCENARIOS = [
  'certification_flag_off', 'invalid_manifest', 'unknown_contract_version', 'metamodel_digest_mismatch',
  'blueprint_contract_mismatch', 'module_blueprint_mismatch', 'field_contract_mismatch',
  'screen_contract_mismatch', 'validation_contract_mismatch', 'permission_contract_mismatch',
  'route_menu_mismatch', 'persistence_mismatch', 'runtime_binding_mismatch', 'safety_invariant_mismatch',
  'error_catalog_mismatch', 'compatibility_mismatch', 'hardening_baseline_mismatch', 'exact_safety_false',
  'blockers_not_empty', 'ui_attempt', 'route_attempt', 'menu_attempt', 'module_registration_attempt',
  'backend_attempt', 'prisma_attempt', 'migration_attempt', 'production_attempt', 'staging_attempt',
  'fetch_attempt', 'mutation_attempt',
];

/**
 * Passive, fail-closed fallback for the blueprint certification layer. Never any side
 * effect, file write, UI, route/menu, backend/Prisma, or mutation. Certified is always
 * false and readiness `blocked`. Rollback = non-consumption.
 *
 * @param {Object} [options]
 * @param {string} [options.scenario]
 * @param {string} [options.reason]
 * @returns {Object} fallback descriptor
 */
export function createStudioBlueprintCertificationFallback(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const scenario = typeof o.scenario === 'string' && STUDIO_CERTIFICATION_FALLBACK_SCENARIOS.includes(o.scenario)
    ? o.scenario
    : 'certification_flag_off';

  return safeCloneGenericModel({
    kind: 'studio-blueprint-certification-fallback',
    scenario,
    reason: typeof o.reason === 'string' && o.reason ? o.reason : `studio certification fallback: ${scenario}`,
    certified: false,
    safeToUseAsBlueprintReference: false,
    readiness: 'blocked',
    sideEffects: false,
    uiCreated: false,
    routeCreated: false,
    menuCreated: false,
    moduleRegistered: false,
    productionAccessed: false,
    backendAccessed: false,
    prismaAccessed: false,
    migrationExecuted: false,
    mutationExecuted: false,
    fetchUsed: false,
    diagnosticsSanitized: true,
    rollbackPlan: { passive: true, strategy: 'non-consumption' },
  });
}

export default createStudioBlueprintCertificationFallback;
