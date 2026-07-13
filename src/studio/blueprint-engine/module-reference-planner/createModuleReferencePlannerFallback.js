import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

export const MODULE_REFERENCE_PLANNER_FALLBACK_SCENARIOS = [
  'flag_off', 'invalid_engine_output', 'invalid_blueprint_contract', 'invalid_source_blueprint',
  'identity_plan_failure', 'file_plan_unsafe', 'screen_plan_unsafe', 'field_form_unsafe',
  'permission_unsafe', 'tenant_unsafe', 'route_menu_exposed', 'persistence_unsafe',
  'runtime_binding_unsafe', 'test_gate_plan_failure', 'evidence_plan_failure', 'risk_plan_failure',
  'digest_mismatch', 'verifier_failure', 'compatibility_blocked', 'module_generation_attempt',
  'file_write_attempt', 'route_attempt', 'menu_attempt', 'module_registration_attempt',
  'backend_attempt', 'prisma_attempt', 'migration_attempt', 'production_attempt', 'staging_attempt',
  'fetch_attempt', 'mutation_attempt', 'rewrite_empresas_attempt',
];

/**
 * Passive, fail-closed fallback for the planner. Never any side effect, file write,
 * module generation, route/menu, backend/Prisma, mutation, persistence, or rewrite of
 * Empresas. `safeToUseAsModuleReferencePlan` is always false. Rollback = non-consumption.
 *
 * @param {Object} [options]
 * @param {string} [options.scenario]
 * @param {string} [options.reason]
 * @returns {Object} fallback descriptor
 */
export function createModuleReferencePlannerFallback(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const scenario = typeof o.scenario === 'string' && MODULE_REFERENCE_PLANNER_FALLBACK_SCENARIOS.includes(o.scenario)
    ? o.scenario
    : 'flag_off';

  return safeCloneGenericModel({
    kind: 'module-reference-planner-fallback',
    scenario,
    reason: typeof o.reason === 'string' && o.reason ? o.reason : `module reference planner fallback: ${scenario}`,
    safeToUseAsModuleReferencePlan: false,
    readiness: 'blocked',
    sideEffects: false,
    moduleGenerated: false,
    filesWrittenToModule: false,
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
    persistenceCreated: false,
    rewriteEmpresas: false,
    readyForRealModuleGeneration: false,
    diagnosticsSanitized: true,
    rollbackPlan: { passive: true, strategy: 'non-consumption' },
  });
}

export default createModuleReferencePlannerFallback;
