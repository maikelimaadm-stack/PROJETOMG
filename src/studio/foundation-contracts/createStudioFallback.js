import { isGenericModelPlainObject, safeCloneGenericModel } from '../../runtime/generic-model/index.js';

export const STUDIO_FALLBACK_SCENARIOS = [
  'flag_off', 'invalid_metamodel', 'invalid_blueprint', 'unsafe_field', 'unsafe_validation',
  'permission_bypass', 'tenant_bypass', 'route_auto_registration_attempt', 'menu_auto_registration_attempt',
  'backend_attempt', 'prisma_attempt', 'migration_attempt', 'fetch_attempt', 'production_attempt',
  'mutation_attempt', 'marketplace_publication_attempt',
];

/**
 * Passive, fail-closed fallback for the Studio foundation contracts. Never any side
 * effect, file write, UI, route/menu, backend/Prisma, mutation. Readiness is always
 * `blocked`. Rollback = non-consumption.
 *
 * @param {Object} [options]
 * @param {string} [options.scenario]
 * @param {string} [options.reason]
 * @returns {Object} fallback descriptor
 */
export function createStudioFallback(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const scenario = typeof o.scenario === 'string' && STUDIO_FALLBACK_SCENARIOS.includes(o.scenario)
    ? o.scenario
    : 'flag_off';

  return safeCloneGenericModel({
    kind: 'studio-fallback',
    scenario,
    reason: typeof o.reason === 'string' && o.reason ? o.reason : `studio foundation fallback: ${scenario}`,
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
    rollbackPlan: { passive: true, strategy: 'non-consumption' },
  });
}

export default createStudioFallback;
