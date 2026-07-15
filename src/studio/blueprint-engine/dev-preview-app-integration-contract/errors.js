/**
 * Typed error catalog for the STUDIO DEV PREVIEW APP INTEGRATION CONTRACT.
 *
 * Headless, contract-only, METADATA-ONLY: no App integration, no App/router/menu/sidebar wiring, no
 * router primitives, no runtime UI mount, no deep link, no module, no file write under src/modules,
 * no backend/Prisma/migration/fetch, production/staging, mutation, persistence, real data
 * read/write, Empresas rewrite, or old Studio prototype relink. Descriptors are sanitized and
 * side-effect-free.
 */

export const APP_INTEGRATION_CONTRACT_ERROR_CODES = [
  'APP_INTEGRATION_INVALID_ROUTE_MENU_RUNTIME',
  'APP_INTEGRATION_INVALID_ROUTE_MENU_CONTRACT',
  'APP_INTEGRATION_INVALID_RUNTIME_UI',
  'APP_INTEGRATION_SESSION_FAILED',
  'APP_INTEGRATION_ATTACHMENT_POINT_UNSAFE',
  'APP_INTEGRATION_FEATURE_FLAG_UNSAFE',
  'APP_INTEGRATION_PRODUCT_ISOLATION_UNSAFE',
  'APP_INTEGRATION_BOOTSTRAP_BOUNDARY_UNSAFE',
  'APP_INTEGRATION_ROUTER_ATTACHMENT_UNSAFE',
  'APP_INTEGRATION_ROUTE_EXPOSURE_UNSAFE',
  'APP_INTEGRATION_MENU_EXPOSURE_UNSAFE',
  'APP_INTEGRATION_RUNTIME_UI_MOUNT_ADAPTER_UNSAFE',
  'APP_INTEGRATION_DEPENDENCY_INJECTION_BOUNDARY_UNSAFE',
  'APP_INTEGRATION_LIFECYCLE_CLEANUP_UNSAFE',
  'APP_INTEGRATION_FAILURE_CONTAINMENT_UNSAFE',
  'APP_INTEGRATION_OWNERSHIP_ROLLBACK_UNSAFE',
  'APP_INTEGRATION_PRODUCTION_DENIAL_UNSAFE',
  'APP_INTEGRATION_PROTOTYPE_RELINK_UNSAFE',
  'APP_INTEGRATION_MANUAL_GATE_MISSING',
  'APP_INTEGRATION_SAFETY_UNSAFE',
  'APP_INTEGRATION_DIGEST_MISMATCH',
  'APP_INTEGRATION_VERIFIER_FAILED',
  'APP_INTEGRATION_COMPATIBILITY_BLOCKED',
  'APP_INTEGRATION_APP_TOUCH_BLOCKED',
  'APP_INTEGRATION_APP_WIRING_BLOCKED',
  'APP_INTEGRATION_ROUTER_WIRING_BLOCKED',
  'APP_INTEGRATION_ROUTE_EXPOSURE_BLOCKED',
  'APP_INTEGRATION_MENU_EXPOSURE_BLOCKED',
  'APP_INTEGRATION_SIDEBAR_EXPOSURE_BLOCKED',
  'APP_INTEGRATION_RUNTIME_UI_MOUNT_BLOCKED',
  'APP_INTEGRATION_FEATURE_FLAG_CONNECT_BLOCKED',
  'APP_INTEGRATION_ROUTE_PRIMITIVE_BLOCKED',
  'APP_INTEGRATION_NAVLINK_BLOCKED',
  'APP_INTEGRATION_LINK_BLOCKED',
  'APP_INTEGRATION_BROWSER_ROUTER_BLOCKED',
  'APP_INTEGRATION_USE_NAVIGATE_BLOCKED',
  'APP_INTEGRATION_REACT_DOM_BLOCKED',
  'APP_INTEGRATION_CREATE_ROOT_BLOCKED',
  'APP_INTEGRATION_WINDOW_BLOCKED',
  'APP_INTEGRATION_DOCUMENT_BLOCKED',
  'APP_INTEGRATION_DEEP_LINK_BLOCKED',
  'APP_INTEGRATION_MODULE_GENERATION_BLOCKED',
  'APP_INTEGRATION_MODULE_REGISTRATION_BLOCKED',
  'APP_INTEGRATION_BACKEND_BLOCKED',
  'APP_INTEGRATION_PRISMA_BLOCKED',
  'APP_INTEGRATION_MIGRATION_BLOCKED',
  'APP_INTEGRATION_PRODUCTION_BLOCKED',
  'APP_INTEGRATION_STAGING_BLOCKED',
  'APP_INTEGRATION_FETCH_BLOCKED',
  'APP_INTEGRATION_STORAGE_BLOCKED',
  'APP_INTEGRATION_MUTATION_BLOCKED',
  'APP_INTEGRATION_PERSISTENCE_BLOCKED',
  'APP_INTEGRATION_REAL_DATA_READ_BLOCKED',
  'APP_INTEGRATION_REAL_DATA_WRITE_BLOCKED',
  'APP_INTEGRATION_REWRITE_EMPRESAS_BLOCKED',
];

/** Typed error for the App integration contract layer. */
export class AppIntegrationContractError extends Error {
  /**
   * @param {string} code one of APP_INTEGRATION_CONTRACT_ERROR_CODES
   * @param {string} message sanitized message (no secrets)
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'AppIntegrationContractError';
    this.code = APP_INTEGRATION_CONTRACT_ERROR_CODES.includes(code) ? code : 'APP_INTEGRATION_INVALID_ROUTE_MENU_RUNTIME';
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
export function createAppIntegrationContractError(code, options = {}) {
  const o = options && typeof options === 'object' ? options : {};
  const known = APP_INTEGRATION_CONTRACT_ERROR_CODES.includes(code);
  return {
    kind: 'app-integration-contract-error',
    code: known ? code : 'APP_INTEGRATION_INVALID_ROUTE_MENU_RUNTIME',
    type: typeof o.type === 'string' ? o.type : 'app-integration-contract',
    message: typeof o.message === 'string' && o.message.length > 0 ? o.message : `App integration contract error: ${code}`,
    safe: true,
    sideEffects: false,
    noStackLeak: true,
    withoutSecrets: true,
    appIntegrated: false,
    appTouched: false,
    appWiringCreated: false,
    routerWiringCreated: false,
    routeExposedToProduct: false,
    menuExposedToProduct: false,
    runtimeUiMountedInApp: false,
    featureFlagConnectedToApp: false,
    reactDomUsed: false,
    createRootUsed: false,
    windowUsed: false,
    documentUsed: false,
    deepLinkCreated: false,
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
export function appIntegrationContractError(code, message, meta) {
  return new AppIntegrationContractError(code, message, meta);
}

export default AppIntegrationContractError;
