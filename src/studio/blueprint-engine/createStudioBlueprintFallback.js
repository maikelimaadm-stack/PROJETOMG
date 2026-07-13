import { isGenericModelPlainObject, safeCloneGenericModel } from '../../runtime/generic-model/index.js';

export const STUDIO_BLUEPRINT_ENGINE_FALLBACK_SCENARIOS = [
  'flag_off', 'invalid_draft', 'invalid_module', 'invalid_field', 'invalid_field_type',
  'duplicate_field', 'invalid_screen', 'invalid_permission', 'invalid_persistence',
  'invalid_runtime_binding', 'normalize_failure', 'validation_failure', 'safety_violation',
  'hardening_violation', 'digest_mismatch', 'manifest_failure', 'verifier_failure',
  'compatibility_breaking', 'compare_failure', 'ui_attempt', 'route_attempt', 'menu_attempt',
  'module_registration_attempt', 'backend_attempt', 'prisma_attempt', 'migration_attempt',
  'production_attempt', 'staging_attempt', 'fetch_attempt', 'mutation_attempt',
  'persistence_attempt', 'generated_module_attempt', 'rewrite_empresas_attempt',
];

/**
 * Passive, fail-closed fallback for the engine. Never any side effect, file write, UI,
 * route/menu, backend/Prisma, mutation, persistence, module generation, or rewrite of
 * Empresas. `safeToEmit` is always false. Rollback = non-consumption.
 *
 * @param {Object} [options]
 * @param {string} [options.scenario]
 * @param {string} [options.reason]
 * @returns {Object} fallback descriptor
 */
export function createStudioBlueprintFallback(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const scenario = typeof o.scenario === 'string' && STUDIO_BLUEPRINT_ENGINE_FALLBACK_SCENARIOS.includes(o.scenario)
    ? o.scenario
    : 'flag_off';

  return safeCloneGenericModel({
    kind: 'studio-blueprint-engine-fallback',
    scenario,
    reason: typeof o.reason === 'string' && o.reason ? o.reason : `studio blueprint engine fallback: ${scenario}`,
    safeToEmit: false,
    readiness: 'blocked',
    sideEffects: false,
    uiEnabled: false,
    routeEnabled: false,
    menuEnabled: false,
    moduleRegistrationEnabled: false,
    backendEnabled: false,
    prismaEnabled: false,
    migrationEnabled: false,
    productionEnabled: false,
    stagingEnabled: false,
    fetchUsed: false,
    mutationAllowed: false,
    persistenceEnabled: false,
    generatedModuleAllowed: false,
    rewriteEmpresas: false,
    diagnosticsSanitized: true,
    rollbackPlan: { passive: true, strategy: 'non-consumption' },
  });
}

export default createStudioBlueprintFallback;
