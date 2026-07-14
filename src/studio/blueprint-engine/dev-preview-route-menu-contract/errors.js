/**
 * Typed error catalog for the STUDIO DEV PREVIEW ROUTE/MENU CONTRACT.
 *
 * Headless and contract-only: no real route/menu, no router, no App/router/navigation/sidebar
 * wiring, no Route/Routes/NavLink/Link/BrowserRouter/createBrowserRouter/useNavigate, no deep
 * link, no module, no file write under src/modules, no backend/Prisma/migration/fetch,
 * production/staging, mutation, persistence, real data read/write, Empresas rewrite, or old Studio
 * prototype relink. Descriptors are sanitized and side-effect-free.
 */

export const ROUTE_MENU_CONTRACT_ERROR_CODES = [
  'ROUTE_MENU_CONTRACT_INVALID_RUNTIME_UI',
  'ROUTE_MENU_CONTRACT_INVALID_RUNTIME_UI_CONTRACT',
  'ROUTE_MENU_CONTRACT_INVALID_ISOLATED_RUNTIME',
  'ROUTE_MENU_CONTRACT_SESSION_FAILED',
  'ROUTE_MENU_CONTRACT_ROUTE_DESCRIPTOR_UNSAFE',
  'ROUTE_MENU_CONTRACT_ROUTE_ELIGIBILITY_UNSAFE',
  'ROUTE_MENU_CONTRACT_ROUTE_GUARD_UNSAFE',
  'ROUTE_MENU_CONTRACT_ROUTE_ISOLATION_UNSAFE',
  'ROUTE_MENU_CONTRACT_ROUTE_VISIBILITY_UNSAFE',
  'ROUTE_MENU_CONTRACT_ROUTE_ACCESS_UNSAFE',
  'ROUTE_MENU_CONTRACT_MENU_PLACEMENT_UNSAFE',
  'ROUTE_MENU_CONTRACT_MENU_VISIBILITY_UNSAFE',
  'ROUTE_MENU_CONTRACT_MENU_ELIGIBILITY_UNSAFE',
  'ROUTE_MENU_CONTRACT_NAVIGATION_BOUNDARY_UNSAFE',
  'ROUTE_MENU_CONTRACT_DEEP_LINK_UNSAFE',
  'ROUTE_MENU_CONTRACT_APP_WIRING_UNSAFE',
  'ROUTE_MENU_CONTRACT_MANUAL_GATE_MISSING',
  'ROUTE_MENU_CONTRACT_ROLLOUT_UNSAFE',
  'ROUTE_MENU_CONTRACT_SAFETY_UNSAFE',
  'ROUTE_MENU_CONTRACT_DIGEST_MISMATCH',
  'ROUTE_MENU_CONTRACT_VERIFIER_FAILED',
  'ROUTE_MENU_CONTRACT_COMPATIBILITY_BLOCKED',
  'ROUTE_MENU_CONTRACT_ROUTE_BLOCKED',
  'ROUTE_MENU_CONTRACT_MENU_BLOCKED',
  'ROUTE_MENU_CONTRACT_ROUTER_BLOCKED',
  'ROUTE_MENU_CONTRACT_NAVLINK_BLOCKED',
  'ROUTE_MENU_CONTRACT_LINK_BLOCKED',
  'ROUTE_MENU_CONTRACT_BROWSER_ROUTER_BLOCKED',
  'ROUTE_MENU_CONTRACT_USE_NAVIGATE_BLOCKED',
  'ROUTE_MENU_CONTRACT_APP_WIRING_BLOCKED',
  'ROUTE_MENU_CONTRACT_SIDEBAR_WIRING_BLOCKED',
  'ROUTE_MENU_CONTRACT_MODULE_GENERATION_BLOCKED',
  'ROUTE_MENU_CONTRACT_MODULE_REGISTRATION_BLOCKED',
  'ROUTE_MENU_CONTRACT_BACKEND_BLOCKED',
  'ROUTE_MENU_CONTRACT_PRISMA_BLOCKED',
  'ROUTE_MENU_CONTRACT_MIGRATION_BLOCKED',
  'ROUTE_MENU_CONTRACT_PRODUCTION_BLOCKED',
  'ROUTE_MENU_CONTRACT_STAGING_BLOCKED',
  'ROUTE_MENU_CONTRACT_FETCH_BLOCKED',
  'ROUTE_MENU_CONTRACT_STORAGE_BLOCKED',
  'ROUTE_MENU_CONTRACT_MUTATION_BLOCKED',
  'ROUTE_MENU_CONTRACT_PERSISTENCE_BLOCKED',
  'ROUTE_MENU_CONTRACT_REAL_DATA_READ_BLOCKED',
  'ROUTE_MENU_CONTRACT_REAL_DATA_WRITE_BLOCKED',
  'ROUTE_MENU_CONTRACT_REWRITE_EMPRESAS_BLOCKED',
  'ROUTE_MENU_CONTRACT_OLD_PROTOTYPE_RELINK_BLOCKED',
];

/** Typed error for the route/menu contract layer. */
export class RouteMenuContractError extends Error {
  /**
   * @param {string} code one of ROUTE_MENU_CONTRACT_ERROR_CODES
   * @param {string} message sanitized message (no secrets)
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'RouteMenuContractError';
    this.code = ROUTE_MENU_CONTRACT_ERROR_CODES.includes(code) ? code : 'ROUTE_MENU_CONTRACT_INVALID_RUNTIME_UI';
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
export function createRouteMenuContractError(code, options = {}) {
  const o = options && typeof options === 'object' ? options : {};
  const known = ROUTE_MENU_CONTRACT_ERROR_CODES.includes(code);
  return {
    kind: 'route-menu-contract-error',
    code: known ? code : 'ROUTE_MENU_CONTRACT_INVALID_RUNTIME_UI',
    type: typeof o.type === 'string' ? o.type : 'route-menu-contract',
    message: typeof o.message === 'string' && o.message.length > 0 ? o.message : `Route/menu contract error: ${code}`,
    safe: true,
    sideEffects: false,
    noStackLeak: true,
    withoutSecrets: true,
    routeCreated: false,
    menuCreated: false,
    appWiringCreated: false,
    routerWiringCreated: false,
    navigationWiringCreated: false,
    sidebarWiringCreated: false,
    deepLinkCreated: false,
    linkCreated: false,
    navLinkCreated: false,
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
export function routeMenuContractError(code, message, meta) {
  return new RouteMenuContractError(code, message, meta);
}

export default RouteMenuContractError;
