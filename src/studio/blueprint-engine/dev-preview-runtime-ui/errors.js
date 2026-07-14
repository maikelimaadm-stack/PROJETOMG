/**
 * Typed error catalog for the STUDIO DEV PREVIEW RUNTIME UI.
 *
 * Dev-only, isolated, synthetic-data-only. Real React/JSX only within the authorized subtree. No
 * App/route/menu wiring, no real DOM mount, no module, no backend/Prisma/migration/fetch,
 * production/staging, mutation, persistence, real data read/write, Empresas rewrite, or old
 * Studio prototype import. Descriptors are sanitized and side-effect-free.
 */

export const RUNTIME_UI_ERROR_CODES = [
  'RUNTIME_UI_INVALID_RUNTIME_UI_CONTRACT',
  'RUNTIME_UI_INVALID_ISOLATED_RUNTIME',
  'RUNTIME_UI_INVALID_IMPLEMENTATION_PLAN',
  'RUNTIME_UI_INVALID_VIRTUAL_FRAME',
  'RUNTIME_UI_PREFLIGHT_FAILED',
  'RUNTIME_UI_MANUAL_GATE_NOT_SATISFIED',
  'RUNTIME_UI_SESSION_FAILED',
  'RUNTIME_UI_COMPONENT_REGISTRY_UNSAFE',
  'RUNTIME_UI_INTERACTION_UNSAFE',
  'RUNTIME_UI_STATE_PROJECTION_UNSAFE',
  'RUNTIME_UI_ACCESSIBILITY_PROJECTION_UNSAFE',
  'RUNTIME_UI_THEME_PROJECTION_UNSAFE',
  'RUNTIME_UI_BLOCKED_ACTION_UNSAFE',
  'RUNTIME_UI_ISOLATION_BOUNDARY_UNSAFE',
  'RUNTIME_UI_DEV_FLAG_GATE_UNSAFE',
  'RUNTIME_UI_DIGEST_MISMATCH',
  'RUNTIME_UI_VERIFIER_FAILED',
  'RUNTIME_UI_COMPATIBILITY_BLOCKED',
  'RUNTIME_UI_OLD_PROTOTYPE_IMPORT_BLOCKED',
  'RUNTIME_UI_APP_IMPORT_BLOCKED',
  'RUNTIME_UI_PAGES_IMPORT_BLOCKED',
  'RUNTIME_UI_COMPONENTS_IMPORT_BLOCKED',
  'RUNTIME_UI_TSX_BLOCKED',
  'RUNTIME_UI_CSS_BLOCKED',
  'RUNTIME_UI_REACT_DOM_BLOCKED',
  'RUNTIME_UI_CREATE_ROOT_BLOCKED',
  'RUNTIME_UI_WINDOW_BLOCKED',
  'RUNTIME_UI_DOCUMENT_BLOCKED',
  'RUNTIME_UI_ROUTE_BLOCKED',
  'RUNTIME_UI_MENU_BLOCKED',
  'RUNTIME_UI_MODULE_GENERATION_BLOCKED',
  'RUNTIME_UI_MODULE_REGISTRATION_BLOCKED',
  'RUNTIME_UI_BACKEND_BLOCKED',
  'RUNTIME_UI_PRISMA_BLOCKED',
  'RUNTIME_UI_MIGRATION_BLOCKED',
  'RUNTIME_UI_PRODUCTION_BLOCKED',
  'RUNTIME_UI_STAGING_BLOCKED',
  'RUNTIME_UI_FETCH_BLOCKED',
  'RUNTIME_UI_STORAGE_BLOCKED',
  'RUNTIME_UI_MUTATION_BLOCKED',
  'RUNTIME_UI_NAVIGATION_BLOCKED',
  'RUNTIME_UI_PERSISTENCE_BLOCKED',
  'RUNTIME_UI_REAL_DATA_READ_BLOCKED',
  'RUNTIME_UI_REAL_DATA_WRITE_BLOCKED',
  'RUNTIME_UI_REWRITE_EMPRESAS_BLOCKED',
];

/** Typed error for the runtime UI layer. */
export class RuntimeUiError extends Error {
  /**
   * @param {string} code one of RUNTIME_UI_ERROR_CODES
   * @param {string} message sanitized message (no secrets)
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'RuntimeUiError';
    this.code = RUNTIME_UI_ERROR_CODES.includes(code) ? code : 'RUNTIME_UI_INVALID_RUNTIME_UI_CONTRACT';
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
export function createRuntimeUiError(code, options = {}) {
  const o = options && typeof options === 'object' ? options : {};
  const known = RUNTIME_UI_ERROR_CODES.includes(code);
  return {
    kind: 'runtime-ui-error',
    code: known ? code : 'RUNTIME_UI_INVALID_RUNTIME_UI_CONTRACT',
    type: typeof o.type === 'string' ? o.type : 'runtime-ui',
    message: typeof o.message === 'string' && o.message.length > 0 ? o.message : `Runtime UI error: ${code}`,
    safe: true,
    sideEffects: false,
    noStackLeak: true,
    withoutSecrets: true,
    oldPrototypeImported: false,
    appWired: false,
    tsxCreated: false,
    cssCreated: false,
    domRuntimeCreated: false,
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
  };
}

/**
 * @param {string} code
 * @param {string} message
 * @param {Object} [meta]
 */
export function runtimeUiError(code, message, meta) {
  return new RuntimeUiError(code, message, meta);
}

export default RuntimeUiError;
