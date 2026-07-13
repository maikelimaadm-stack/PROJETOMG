import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

export const STUDIO_HARDENING_FALLBACK_SCENARIOS = [
  'hardening_flag_off', 'invalid_matrix_failure', 'dangerous_blueprint_found', 'unsafe_field_found',
  'unsafe_screen_found', 'unsafe_validation_found', 'permission_bypass_found',
  'route_menu_auto_registration_found', 'unsafe_persistence_transition_found', 'runtime_binding_unsafe',
  'compatibility_breaking_unblocked', 'digest_mismatch', 'verifier_mismatch', 'safety_invariant_failure',
  'performance_anomaly_critical', 'production_attempt', 'backend_attempt', 'prisma_attempt',
  'migration_attempt', 'fetch_attempt', 'mutation_attempt',
];

/**
 * Passive, fail-closed fallback for the blueprint hardening layer. Never any side
 * effect, file write, UI, route/menu, backend/Prisma, or mutation. Readiness is
 * always `blocked`. Rollback = non-consumption.
 *
 * @param {Object} [options]
 * @param {string} [options.scenario]
 * @param {string} [options.reason]
 * @returns {Object} fallback descriptor
 */
export function createStudioBlueprintHardeningFallback(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const scenario = typeof o.scenario === 'string' && STUDIO_HARDENING_FALLBACK_SCENARIOS.includes(o.scenario)
    ? o.scenario
    : 'hardening_flag_off';

  return safeCloneGenericModel({
    kind: 'studio-blueprint-hardening-fallback',
    scenario,
    reason: typeof o.reason === 'string' && o.reason ? o.reason : `studio hardening fallback: ${scenario}`,
    readiness: 'blocked',
    sideEffects: false,
    fileWrites: false,
    uiRendered: false,
    routeRegistered: false,
    menuRegistered: false,
    backendAccessed: false,
    prismaAccessed: false,
    migrationExecuted: false,
    fetchUsed: false,
    productionAccessed: false,
    mutationExecuted: false,
    diagnosticsSanitized: true,
    rollbackPlan: { passive: true, strategy: 'non-consumption' },
  });
}

export default createStudioBlueprintHardeningFallback;
