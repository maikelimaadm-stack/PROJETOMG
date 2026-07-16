/**
 * Typed error catalog for the STUDIO DEV PREVIEW APP INTEGRATION.
 *
 * Minimal, dev-only, isolated, fail-closed: no product exposure, no eager import, no production
 * bundle, no ReactDOM/createRoot/window/document, no backend/Prisma/fetch/storage/mutation/real
 * data, no prototype relink. Descriptors are sanitized and side-effect-free.
 */

export const APP_INTEGRATION_ERROR_CODES = [
  'APP_INTEGRATION_INVALID_ROUTE_MENU_RUNTIME',
  'APP_INTEGRATION_INVALID_CONTRACT',
  'APP_INTEGRATION_SESSION_FAILED',
  'APP_INTEGRATION_FEATURE_GATE_CLOSED',
  'APP_INTEGRATION_CHECKPOINT_MISSING',
  'APP_INTEGRATION_CHECKPOINT_INVALID',
  'APP_INTEGRATION_PREFLIGHT_FAILED',
  'APP_INTEGRATION_ATTACHMENT_UNSAFE',
  'APP_INTEGRATION_LAZY_LOADER_UNSAFE',
  'APP_INTEGRATION_EAGER_IMPORT_BLOCKED',
  'APP_INTEGRATION_MOUNT_REQUEST_UNSAFE',
  'APP_INTEGRATION_FAILURE_CONTAINMENT_UNSAFE',
  'APP_INTEGRATION_ROLLBACK_UNSAFE',
  'APP_INTEGRATION_PRODUCTION_BLOCKED',
  'APP_INTEGRATION_STAGING_BLOCKED',
  'APP_INTEGRATION_PRODUCTION_BUNDLE_CONTAINS_PREVIEW',
  'APP_INTEGRATION_ROUTE_EXPOSED_TO_PRODUCT_BLOCKED',
  'APP_INTEGRATION_MENU_EXPOSED_BLOCKED',
  'APP_INTEGRATION_SIDEBAR_EXPOSED_BLOCKED',
  'APP_INTEGRATION_PUBLIC_DEEP_LINK_BLOCKED',
  'APP_INTEGRATION_NEW_ROUTER_BLOCKED',
  'APP_INTEGRATION_REACT_DOM_BLOCKED',
  'APP_INTEGRATION_CREATE_ROOT_BLOCKED',
  'APP_INTEGRATION_WINDOW_BLOCKED',
  'APP_INTEGRATION_DOCUMENT_BLOCKED',
  'APP_INTEGRATION_MODULE_GENERATION_BLOCKED',
  'APP_INTEGRATION_BACKEND_BLOCKED',
  'APP_INTEGRATION_PRISMA_BLOCKED',
  'APP_INTEGRATION_MIGRATION_BLOCKED',
  'APP_INTEGRATION_FETCH_BLOCKED',
  'APP_INTEGRATION_STORAGE_BLOCKED',
  'APP_INTEGRATION_MUTATION_BLOCKED',
  'APP_INTEGRATION_PERSISTENCE_BLOCKED',
  'APP_INTEGRATION_REAL_DATA_READ_BLOCKED',
  'APP_INTEGRATION_REAL_DATA_WRITE_BLOCKED',
  'APP_INTEGRATION_REWRITE_EMPRESAS_BLOCKED',
  'APP_INTEGRATION_PROTOTYPE_RELINK_BLOCKED',
  'APP_INTEGRATION_APP_JSX_NON_ADDITIVE_BLOCKED',
  'APP_INTEGRATION_PRODUCTION_UI_GUARD_WEAKENED_BLOCKED',
  'APP_INTEGRATION_DIGEST_MISMATCH',
  'APP_INTEGRATION_VERIFIER_FAILED',
  'APP_INTEGRATION_COMPATIBILITY_BLOCKED',
];

/** Typed error for the App integration layer. */
export class AppIntegrationError extends Error {
  /**
   * @param {string} code one of APP_INTEGRATION_ERROR_CODES
   * @param {string} message sanitized message (no secrets)
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'AppIntegrationError';
    this.code = APP_INTEGRATION_ERROR_CODES.includes(code) ? code : 'APP_INTEGRATION_INVALID_ROUTE_MENU_RUNTIME';
    if (meta) this.meta = meta;
  }
}

/**
 * Builds a sanitized, side-effect-free error descriptor. Never contains secrets, JWT, DATABASE_URL,
 * API_URL, stack, or personal data.
 * @param {string} code
 * @param {Object} [options]
 * @returns {Object}
 */
export function createAppIntegrationError(code, options = {}) {
  const o = options && typeof options === 'object' ? options : {};
  const known = APP_INTEGRATION_ERROR_CODES.includes(code);
  return {
    kind: 'app-integration-error',
    code: known ? code : 'APP_INTEGRATION_INVALID_ROUTE_MENU_RUNTIME',
    type: typeof o.type === 'string' ? o.type : 'app-integration',
    message: typeof o.message === 'string' && o.message.length > 0 ? o.message : `App integration error: ${code}`,
    safe: true,
    sideEffects: false,
    noStackLeak: true,
    withoutSecrets: true,
    routeExposedToProduct: false,
    menuExposedToProduct: false,
    productionBundleContainsPreview: false,
    reactDomUsed: false,
    createRootUsed: false,
    windowUsed: false,
    documentUsed: false,
    backendAccessed: false,
    prismaAccessed: false,
    fetchUsed: false,
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
export function appIntegrationError(code, message, meta) {
  return new AppIntegrationError(code, message, meta);
}

export default AppIntegrationError;
