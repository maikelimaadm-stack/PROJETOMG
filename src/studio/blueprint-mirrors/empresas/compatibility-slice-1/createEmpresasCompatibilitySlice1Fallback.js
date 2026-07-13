import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../../runtime/generic-model/index.js';

export const EMPRESAS_COMPAT_SLICE1_FALLBACK_SCENARIOS = [
  'flag_off', 'invalid_mirror', 'invalid_studio_blueprint_contract', 'invalid_empresas_read_contract',
  'gap_registry_failure', 'untracked_critical_gap', 'detail_plan_failure', 'state_coverage_failure',
  'write_capability_unsafe', 'persistence_bridge_unsafe', 'backend_prisma_readiness_unsafe',
  'preference_layout_unsafe', 'digest_mismatch', 'verifier_failure', 'compatibility_blocked',
  'empresas_code_change_attempt', 'ui_attempt', 'route_attempt', 'menu_attempt',
  'module_registration_attempt', 'backend_attempt', 'prisma_attempt', 'migration_attempt',
  'production_attempt', 'staging_attempt', 'fetch_attempt', 'mutation_attempt', 'rewrite_empresas_attempt',
];

/**
 * Passive, fail-closed fallback for compatibility slice 1. Never any side effect, file
 * write, Empresas code change, UI, route/menu, backend/Prisma, mutation, or rewrite of
 * Empresas. safeToUseAsCompatibilityReference is always false. Rollback = non-consumption.
 *
 * @param {Object} [options]
 * @param {string} [options.scenario]
 * @param {string} [options.reason]
 * @returns {Object} fallback descriptor
 */
export function createEmpresasCompatibilitySlice1Fallback(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const scenario = typeof o.scenario === 'string' && EMPRESAS_COMPAT_SLICE1_FALLBACK_SCENARIOS.includes(o.scenario)
    ? o.scenario
    : 'flag_off';

  return safeCloneGenericModel({
    kind: 'empresas-compatibility-slice1-fallback',
    scenario,
    reason: typeof o.reason === 'string' && o.reason ? o.reason : `empresas compat slice1 fallback: ${scenario}`,
    safeToUseAsCompatibilityReference: false,
    readiness: 'blocked',
    sideEffects: false,
    empresasCodeChanged: false,
    uiCreated: false,
    routeCreated: false,
    menuCreated: false,
    moduleRegistered: false,
    backendAccessed: false,
    prismaAccessed: false,
    migrationExecuted: false,
    productionAccessed: false,
    stagingAccessed: false,
    fetchUsed: false,
    mutationAllowed: false,
    rewriteEmpresas: false,
    diagnosticsSanitized: true,
    rollbackPlan: { passive: true, strategy: 'non-consumption' },
  });
}

export default createEmpresasCompatibilitySlice1Fallback;
