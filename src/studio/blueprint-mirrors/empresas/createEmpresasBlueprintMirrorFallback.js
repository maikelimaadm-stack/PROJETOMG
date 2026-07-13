import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

export const EMPRESAS_MIRROR_FALLBACK_SCENARIOS = [
  'mirror_flag_off', 'invalid_source_contract', 'invalid_studio_blueprint_contract', 'field_mapping_failure',
  'screen_mapping_failure', 'permission_mapping_unsafe', 'tenant_mapping_unsafe', 'persistence_boundary_unsafe',
  'runtime_binding_unsafe', 'digest_mismatch', 'verifier_failure', 'compatibility_blocked', 'ui_attempt',
  'route_attempt', 'menu_attempt', 'module_registration_attempt', 'backend_attempt', 'prisma_attempt',
  'migration_attempt', 'production_attempt', 'staging_attempt', 'fetch_attempt', 'mutation_attempt',
  'rewrite_empresas_attempt',
];

/**
 * Passive, fail-closed fallback for the Empresas blueprint mirror. Never any side
 * effect, file write, UI, route/menu, backend/Prisma, mutation, or rewrite of
 * Empresas. safeToUseAsMirrorReference is always false. Rollback = non-consumption.
 *
 * @param {Object} [options]
 * @param {string} [options.scenario]
 * @param {string} [options.reason]
 * @returns {Object} fallback descriptor
 */
export function createEmpresasBlueprintMirrorFallback(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const scenario = typeof o.scenario === 'string' && EMPRESAS_MIRROR_FALLBACK_SCENARIOS.includes(o.scenario)
    ? o.scenario
    : 'mirror_flag_off';

  return safeCloneGenericModel({
    kind: 'empresas-blueprint-mirror-fallback',
    scenario,
    reason: typeof o.reason === 'string' && o.reason ? o.reason : `empresas mirror fallback: ${scenario}`,
    safeToUseAsMirrorReference: false,
    readiness: 'blocked',
    sideEffects: false,
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

export default createEmpresasBlueprintMirrorFallback;
