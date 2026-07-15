/**
 * Typed error catalog for the STUDIO DEV PREVIEW ROUTE/MENU IMPLEMENTATION PLAN.
 *
 * Headless, contract-only, PLAN-ONLY: no real route/menu, no router, no App/router/navigation/
 * sidebar wiring, no router primitives, no runtime UI mount, no deep link, no module, no file
 * write under src/modules, no backend/Prisma/migration/fetch, production/staging, mutation,
 * persistence, real data read/write, Empresas rewrite, or old Studio prototype relink. Descriptors
 * are sanitized and side-effect-free.
 */

export const ROUTE_MENU_IMPLEMENTATION_PLAN_ERROR_CODES = [
  'ROUTE_MENU_PLAN_INVALID_ROUTE_MENU_CONTRACT',
  'ROUTE_MENU_PLAN_INVALID_RUNTIME_UI',
  'ROUTE_MENU_PLAN_INVALID_ISOLATED_RUNTIME',
  'ROUTE_MENU_PLAN_SESSION_FAILED',
  'ROUTE_MENU_PLAN_PHASE_UNSAFE',
  'ROUTE_MENU_PLAN_APP_WIRING_BOUNDARY_UNSAFE',
  'ROUTE_MENU_PLAN_ROUTER_WIRING_BOUNDARY_UNSAFE',
  'ROUTE_MENU_PLAN_ROUTE_REGISTRATION_UNSAFE',
  'ROUTE_MENU_PLAN_MENU_REGISTRATION_UNSAFE',
  'ROUTE_MENU_PLAN_SIDEBAR_NAVIGATION_UNSAFE',
  'ROUTE_MENU_PLAN_DEV_ONLY_ACCESS_UNSAFE',
  'ROUTE_MENU_PLAN_ROUTE_GUARD_UNSAFE',
  'ROUTE_MENU_PLAN_MENU_VISIBILITY_UNSAFE',
  'ROUTE_MENU_PLAN_DEEP_LINK_UNSAFE',
  'ROUTE_MENU_PLAN_RUNTIME_UI_MOUNT_UNSAFE',
  'ROUTE_MENU_PLAN_BLOCKED_NAVIGATION_UNSAFE',
  'ROUTE_MENU_PLAN_TEST_HARNESS_UNSAFE',
  'ROUTE_MENU_PLAN_MANUAL_GATE_MISSING',
  'ROUTE_MENU_PLAN_ROLLOUT_UNSAFE',
  'ROUTE_MENU_PLAN_OBSERVABILITY_UNSAFE',
  'ROUTE_MENU_PLAN_PROTOTYPE_RELINK_UNSAFE',
  'ROUTE_MENU_PLAN_SAFETY_UNSAFE',
  'ROUTE_MENU_PLAN_DIGEST_MISMATCH',
  'ROUTE_MENU_PLAN_VERIFIER_FAILED',
  'ROUTE_MENU_PLAN_COMPATIBILITY_BLOCKED',
  'ROUTE_MENU_PLAN_ROUTE_BLOCKED',
  'ROUTE_MENU_PLAN_MENU_BLOCKED',
  'ROUTE_MENU_PLAN_ROUTER_PRIMITIVE_BLOCKED',
  'ROUTE_MENU_PLAN_NAVLINK_BLOCKED',
  'ROUTE_MENU_PLAN_LINK_BLOCKED',
  'ROUTE_MENU_PLAN_BROWSER_ROUTER_BLOCKED',
  'ROUTE_MENU_PLAN_USE_NAVIGATE_BLOCKED',
  'ROUTE_MENU_PLAN_REACT_DOM_BLOCKED',
  'ROUTE_MENU_PLAN_CREATE_ROOT_BLOCKED',
  'ROUTE_MENU_PLAN_WINDOW_BLOCKED',
  'ROUTE_MENU_PLAN_DOCUMENT_BLOCKED',
  'ROUTE_MENU_PLAN_APP_WIRING_BLOCKED',
  'ROUTE_MENU_PLAN_MODULE_GENERATION_BLOCKED',
  'ROUTE_MENU_PLAN_MODULE_REGISTRATION_BLOCKED',
  'ROUTE_MENU_PLAN_BACKEND_BLOCKED',
  'ROUTE_MENU_PLAN_PRISMA_BLOCKED',
  'ROUTE_MENU_PLAN_MIGRATION_BLOCKED',
  'ROUTE_MENU_PLAN_PRODUCTION_BLOCKED',
  'ROUTE_MENU_PLAN_STAGING_BLOCKED',
  'ROUTE_MENU_PLAN_FETCH_BLOCKED',
  'ROUTE_MENU_PLAN_STORAGE_BLOCKED',
  'ROUTE_MENU_PLAN_MUTATION_BLOCKED',
  'ROUTE_MENU_PLAN_PERSISTENCE_BLOCKED',
  'ROUTE_MENU_PLAN_REAL_DATA_READ_BLOCKED',
  'ROUTE_MENU_PLAN_REAL_DATA_WRITE_BLOCKED',
  'ROUTE_MENU_PLAN_REWRITE_EMPRESAS_BLOCKED',
];

/** Typed error for the route/menu implementation plan layer. */
export class RouteMenuImplementationPlanError extends Error {
  /**
   * @param {string} code one of ROUTE_MENU_IMPLEMENTATION_PLAN_ERROR_CODES
   * @param {string} message sanitized message (no secrets)
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'RouteMenuImplementationPlanError';
    this.code = ROUTE_MENU_IMPLEMENTATION_PLAN_ERROR_CODES.includes(code) ? code : 'ROUTE_MENU_PLAN_INVALID_ROUTE_MENU_CONTRACT';
    if (meta) this.meta = meta;
  }
}

/**
 * Builds a sanitized, side-effect-free error descriptor. Never contains secrets, JWT,
 * DATABASE_URL, API_URL, stack, or personal data.
 * @param {string} code
 * @param {Object} [options]
 * @returns {Object}
 */
export function createRouteMenuImplementationPlanError(code, options = {}) {
  const o = options && typeof options === 'object' ? options : {};
  const known = ROUTE_MENU_IMPLEMENTATION_PLAN_ERROR_CODES.includes(code);
  return {
    kind: 'route-menu-implementation-plan-error',
    code: known ? code : 'ROUTE_MENU_PLAN_INVALID_ROUTE_MENU_CONTRACT',
    type: typeof o.type === 'string' ? o.type : 'route-menu-implementation-plan',
    message: typeof o.message === 'string' && o.message.length > 0 ? o.message : `Route/menu implementation plan error: ${code}`,
    safe: true,
    sideEffects: false,
    noStackLeak: true,
    withoutSecrets: true,
    routeImplemented: false,
    menuImplemented: false,
    appWiringImplemented: false,
    routerWiringImplemented: false,
    runtimeUiMounted: false,
    deepLinkImplemented: false,
    routeCreated: false,
    menuCreated: false,
    moduleGenerated: false,
    moduleRegistered: false,
    backendAccessed: false,
    prismaAccessed: false,
    migrationExecuted: false,
    productionAccessed: false,
    stagingAccessed: false,
    mutationExecuted: false,
    fetchUsed: false,
    persistenceCreated: false,
    realDataRead: false,
    realDataWrite: false,
    rewriteEmpresas: false,
    oldPrototypeImported: false,
  };
}

/**
 * @param {string} code
 * @param {string} message
 * @param {Object} [meta]
 */
export function routeMenuImplementationPlanError(code, message, meta) {
  return new RouteMenuImplementationPlanError(code, message, meta);
}

export default RouteMenuImplementationPlanError;
