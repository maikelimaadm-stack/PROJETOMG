/**
 * Typed error catalog for the STUDIO DEV PREVIEW APP INTEGRATION IMPLEMENTATION PLAN.
 *
 * Headless, contract-only, PLAN-ONLY: no App integration, no App/router/menu/sidebar wiring, no
 * productionUiGuard extension, no router primitives, no runtime UI mount, no deep link, no module,
 * no file write under src/modules, no backend/Prisma/migration/fetch, production/staging, mutation,
 * persistence, real data read/write, Empresas rewrite, or old Studio prototype relink. Descriptors
 * are sanitized and side-effect-free.
 */

export const APP_INTEGRATION_IMPLEMENTATION_PLAN_ERROR_CODES = [
  'APP_INTEGRATION_PLAN_INVALID_APP_INTEGRATION_CONTRACT',
  'APP_INTEGRATION_PLAN_INVALID_ROUTE_MENU_RUNTIME',
  'APP_INTEGRATION_PLAN_INVALID_RUNTIME_UI',
  'APP_INTEGRATION_PLAN_SESSION_FAILED',
  'APP_INTEGRATION_PLAN_PHASE_UNSAFE',
  'APP_INTEGRATION_PLAN_APP_TOUCH_BOUNDARY_UNSAFE',
  'APP_INTEGRATION_PLAN_PRODUCTION_UI_GUARD_EXTENSION_UNSAFE',
  'APP_INTEGRATION_PLAN_FEATURE_FLAG_UNSAFE',
  'APP_INTEGRATION_PLAN_APP_ATTACHMENT_UNSAFE',
  'APP_INTEGRATION_PLAN_ROUTER_EXPOSURE_UNSAFE',
  'APP_INTEGRATION_PLAN_MENU_SIDEBAR_EXPOSURE_UNSAFE',
  'APP_INTEGRATION_PLAN_RUNTIME_UI_MOUNT_UNSAFE',
  'APP_INTEGRATION_PLAN_DEPENDENCY_INJECTION_UNSAFE',
  'APP_INTEGRATION_PLAN_LIFECYCLE_CLEANUP_UNSAFE',
  'APP_INTEGRATION_PLAN_FAILURE_CONTAINMENT_UNSAFE',
  'APP_INTEGRATION_PLAN_PRODUCTION_STAGING_UNSAFE',
  'APP_INTEGRATION_PLAN_PROTOTYPE_RELINK_UNSAFE',
  'APP_INTEGRATION_PLAN_TEST_HARNESS_UNSAFE',
  'APP_INTEGRATION_PLAN_MANUAL_GATE_MISSING',
  'APP_INTEGRATION_PLAN_ROLLOUT_UNSAFE',
  'APP_INTEGRATION_PLAN_OBSERVABILITY_UNSAFE',
  'APP_INTEGRATION_PLAN_GOVERNANCE_REGISTRY_UNSAFE',
  'APP_INTEGRATION_PLAN_SAFETY_UNSAFE',
  'APP_INTEGRATION_PLAN_DIGEST_MISMATCH',
  'APP_INTEGRATION_PLAN_VERIFIER_FAILED',
  'APP_INTEGRATION_PLAN_COMPATIBILITY_BLOCKED',
  'APP_INTEGRATION_PLAN_APP_TOUCH_BLOCKED',
  'APP_INTEGRATION_PLAN_APP_WIRING_BLOCKED',
  'APP_INTEGRATION_PLAN_PRODUCTION_UI_GUARD_BLOCKED',
  'APP_INTEGRATION_PLAN_ROUTER_WIRING_BLOCKED',
  'APP_INTEGRATION_PLAN_ROUTE_EXPOSURE_BLOCKED',
  'APP_INTEGRATION_PLAN_MENU_EXPOSURE_BLOCKED',
  'APP_INTEGRATION_PLAN_SIDEBAR_EXPOSURE_BLOCKED',
  'APP_INTEGRATION_PLAN_RUNTIME_UI_MOUNT_BLOCKED',
  'APP_INTEGRATION_PLAN_FEATURE_FLAG_CONNECT_BLOCKED',
  'APP_INTEGRATION_PLAN_ROUTE_PRIMITIVE_BLOCKED',
  'APP_INTEGRATION_PLAN_NAVLINK_BLOCKED',
  'APP_INTEGRATION_PLAN_LINK_BLOCKED',
  'APP_INTEGRATION_PLAN_BROWSER_ROUTER_BLOCKED',
  'APP_INTEGRATION_PLAN_USE_NAVIGATE_BLOCKED',
  'APP_INTEGRATION_PLAN_REACT_DOM_BLOCKED',
  'APP_INTEGRATION_PLAN_CREATE_ROOT_BLOCKED',
  'APP_INTEGRATION_PLAN_WINDOW_BLOCKED',
  'APP_INTEGRATION_PLAN_DOCUMENT_BLOCKED',
  'APP_INTEGRATION_PLAN_DEEP_LINK_BLOCKED',
  'APP_INTEGRATION_PLAN_MODULE_GENERATION_BLOCKED',
  'APP_INTEGRATION_PLAN_MODULE_REGISTRATION_BLOCKED',
  'APP_INTEGRATION_PLAN_BACKEND_BLOCKED',
  'APP_INTEGRATION_PLAN_PRISMA_BLOCKED',
  'APP_INTEGRATION_PLAN_MIGRATION_BLOCKED',
  'APP_INTEGRATION_PLAN_PRODUCTION_BLOCKED',
  'APP_INTEGRATION_PLAN_STAGING_BLOCKED',
  'APP_INTEGRATION_PLAN_FETCH_BLOCKED',
  'APP_INTEGRATION_PLAN_STORAGE_BLOCKED',
  'APP_INTEGRATION_PLAN_MUTATION_BLOCKED',
  'APP_INTEGRATION_PLAN_PERSISTENCE_BLOCKED',
  'APP_INTEGRATION_PLAN_REAL_DATA_READ_BLOCKED',
  'APP_INTEGRATION_PLAN_REAL_DATA_WRITE_BLOCKED',
  'APP_INTEGRATION_PLAN_REWRITE_EMPRESAS_BLOCKED',
];

/** Typed error for the App integration implementation plan layer. */
export class AppIntegrationImplementationPlanError extends Error {
  /**
   * @param {string} code one of APP_INTEGRATION_IMPLEMENTATION_PLAN_ERROR_CODES
   * @param {string} message sanitized message (no secrets)
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'AppIntegrationImplementationPlanError';
    this.code = APP_INTEGRATION_IMPLEMENTATION_PLAN_ERROR_CODES.includes(code) ? code : 'APP_INTEGRATION_PLAN_INVALID_APP_INTEGRATION_CONTRACT';
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
export function createAppIntegrationImplementationPlanError(code, options = {}) {
  const o = options && typeof options === 'object' ? options : {};
  const known = APP_INTEGRATION_IMPLEMENTATION_PLAN_ERROR_CODES.includes(code);
  return {
    kind: 'app-integration-implementation-plan-error',
    code: known ? code : 'APP_INTEGRATION_PLAN_INVALID_APP_INTEGRATION_CONTRACT',
    type: typeof o.type === 'string' ? o.type : 'app-integration-implementation-plan',
    message: typeof o.message === 'string' && o.message.length > 0 ? o.message : `App integration implementation plan error: ${code}`,
    safe: true,
    sideEffects: false,
    noStackLeak: true,
    withoutSecrets: true,
    appIntegrated: false,
    appTouched: false,
    appWiringImplemented: false,
    productionUiGuardExtended: false,
    featureFlagImplemented: false,
    routerWiringImplemented: false,
    routeExposedToProduct: false,
    menuExposedToProduct: false,
    runtimeUiMountedInApp: false,
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
export function appIntegrationImplementationPlanError(code, message, meta) {
  return new AppIntegrationImplementationPlanError(code, message, meta);
}

export default AppIntegrationImplementationPlanError;
