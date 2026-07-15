/**
 * Typed error catalog for the STUDIO DEV PREVIEW ROUTE/MENU (isolated dev-only runtime).
 *
 * Dev-only, isolated, default-off, fail-closed, synthetic-data-only. Real React/JSX only within the
 * authorized subtree. No App/product-router/product-menu/sidebar wiring; no browser route; no
 * public URL/deep link; no react-router; no window/document/history/location; no ReactDOM/internal
 * createRoot; no module; no backend/Prisma/migration/fetch; production/staging; mutation;
 * persistence; real data read/write; Empresas rewrite; or old Studio prototype relink. Descriptors
 * are sanitized and side-effect-free.
 */

export const ROUTE_MENU_ERROR_CODES = [
  'ROUTE_MENU_INVALID_ROUTE_MENU_CONTRACT',
  'ROUTE_MENU_INVALID_IMPLEMENTATION_PLAN',
  'ROUTE_MENU_INVALID_RUNTIME_UI',
  'ROUTE_MENU_INVALID_VIRTUAL_FRAME',
  'ROUTE_MENU_PREFLIGHT_FAILED',
  'ROUTE_MENU_CHECKPOINT_MISSING',
  'ROUTE_MENU_FEATURE_GATE_CLOSED',
  'ROUTE_MENU_SESSION_FAILED',
  'ROUTE_MENU_ROUTE_REGISTRY_UNSAFE',
  'ROUTE_MENU_ROUTE_RESOLVER_UNSAFE',
  'ROUTE_MENU_MENU_REGISTRY_UNSAFE',
  'ROUTE_MENU_NAVIGATION_CONTROLLER_UNSAFE',
  'ROUTE_MENU_ROUTE_GUARD_UNSAFE',
  'ROUTE_MENU_MENU_VISIBILITY_UNSAFE',
  'ROUTE_MENU_MOUNT_ADAPTER_UNSAFE',
  'ROUTE_MENU_MOUNT_REQUEST_UNSAFE',
  'ROUTE_MENU_ISOLATION_BOUNDARY_UNSAFE',
  'ROUTE_MENU_DIGEST_MISMATCH',
  'ROUTE_MENU_VERIFIER_FAILED',
  'ROUTE_MENU_COMPATIBILITY_BLOCKED',
  'ROUTE_MENU_APP_WIRING_BLOCKED',
  'ROUTE_MENU_PRODUCT_ROUTER_BLOCKED',
  'ROUTE_MENU_PRODUCT_MENU_BLOCKED',
  'ROUTE_MENU_PRODUCT_SIDEBAR_BLOCKED',
  'ROUTE_MENU_BROWSER_ROUTE_BLOCKED',
  'ROUTE_MENU_PUBLIC_URL_BLOCKED',
  'ROUTE_MENU_DEEP_LINK_BLOCKED',
  'ROUTE_MENU_REACT_ROUTER_BLOCKED',
  'ROUTE_MENU_BROWSER_ROUTER_BLOCKED',
  'ROUTE_MENU_USE_NAVIGATE_BLOCKED',
  'ROUTE_MENU_NAVLINK_BLOCKED',
  'ROUTE_MENU_LINK_BLOCKED',
  'ROUTE_MENU_WINDOW_BLOCKED',
  'ROUTE_MENU_DOCUMENT_BLOCKED',
  'ROUTE_MENU_HISTORY_BLOCKED',
  'ROUTE_MENU_LOCATION_BLOCKED',
  'ROUTE_MENU_REACT_DOM_BLOCKED',
  'ROUTE_MENU_CREATE_ROOT_BLOCKED',
  'ROUTE_MENU_AUTO_MOUNT_BLOCKED',
  'ROUTE_MENU_ROOT_FACTORY_MISSING',
  'ROUTE_MENU_MOUNT_NODE_MISSING',
  'ROUTE_MENU_MODULE_GENERATION_BLOCKED',
  'ROUTE_MENU_MODULE_REGISTRATION_BLOCKED',
  'ROUTE_MENU_BACKEND_BLOCKED',
  'ROUTE_MENU_PRISMA_BLOCKED',
  'ROUTE_MENU_MIGRATION_BLOCKED',
  'ROUTE_MENU_PRODUCTION_BLOCKED',
  'ROUTE_MENU_STAGING_BLOCKED',
  'ROUTE_MENU_FETCH_BLOCKED',
  'ROUTE_MENU_STORAGE_BLOCKED',
  'ROUTE_MENU_MUTATION_BLOCKED',
  'ROUTE_MENU_PERSISTENCE_BLOCKED',
  'ROUTE_MENU_REAL_DATA_READ_BLOCKED',
  'ROUTE_MENU_REAL_DATA_WRITE_BLOCKED',
  'ROUTE_MENU_REWRITE_EMPRESAS_BLOCKED',
  'ROUTE_MENU_PROTOTYPE_RELINK_BLOCKED',
];

/** Typed error for the isolated route/menu runtime layer. */
export class RouteMenuError extends Error {
  /**
   * @param {string} code one of ROUTE_MENU_ERROR_CODES
   * @param {string} message sanitized message (no secrets)
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'RouteMenuError';
    this.code = ROUTE_MENU_ERROR_CODES.includes(code) ? code : 'ROUTE_MENU_INVALID_ROUTE_MENU_CONTRACT';
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
export function createRouteMenuError(code, options = {}) {
  const o = options && typeof options === 'object' ? options : {};
  const known = ROUTE_MENU_ERROR_CODES.includes(code);
  return {
    kind: 'route-menu-error',
    code: known ? code : 'ROUTE_MENU_INVALID_ROUTE_MENU_CONTRACT',
    type: typeof o.type === 'string' ? o.type : 'route-menu',
    message: typeof o.message === 'string' && o.message.length > 0 ? o.message : `Route/menu error: ${code}`,
    safe: true,
    sideEffects: false,
    noStackLeak: true,
    withoutSecrets: true,
    appWiringImplemented: false,
    productRouterWiringImplemented: false,
    productMenuRegistered: false,
    productSidebarRegistered: false,
    browserRouteRegistered: false,
    publicUrlCreated: false,
    deepLinkImplemented: false,
    globalRuntimeUiMounted: false,
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
    prototypeRelinked: false,
  };
}

/**
 * @param {string} code
 * @param {string} message
 * @param {Object} [meta]
 */
export function routeMenuError(code, message, meta) {
  return new RouteMenuError(code, message, meta);
}

export default RouteMenuError;
