/**
 * Typed error catalog for the STUDIO DEV PREVIEW ISOLATED RUNTIME.
 *
 * Dev-only, headless, isolated: no UI, no React component, no JSX/TSX, no DOM, no runtime CSS,
 * no route/menu, no module generation, no file write under src/modules, no backend/Prisma/
 * migration/fetch, production/staging, mutation, persistence, real data read/write, or rewrite
 * of Empresas. Descriptors are sanitized and side-effect-free.
 */

export const ISOLATED_RUNTIME_ERROR_CODES = [
  'ISOLATED_RUNTIME_INVALID_IMPLEMENTATION_PLAN',
  'ISOLATED_RUNTIME_INVALID_RUNTIME_SHELL_CONTRACT',
  'ISOLATED_RUNTIME_INVALID_VISUAL_CONTRACT',
  'ISOLATED_RUNTIME_INVALID_BRIDGE',
  'ISOLATED_RUNTIME_INVALID_SANDBOX',
  'ISOLATED_RUNTIME_SESSION_FAILED',
  'ISOLATED_RUNTIME_PREFLIGHT_FAILED',
  'ISOLATED_RUNTIME_MANUAL_GATE_MISSING',
  'ISOLATED_RUNTIME_CONTRACT_LOADER_UNSAFE',
  'ISOLATED_RUNTIME_SYNTHETIC_DATA_UNSAFE',
  'ISOLATED_RUNTIME_VIRTUAL_FRAME_UNSAFE',
  'ISOLATED_RUNTIME_PLACEHOLDER_UNSAFE',
  'ISOLATED_RUNTIME_LIFECYCLE_UNSAFE',
  'ISOLATED_RUNTIME_EVENT_UNSAFE',
  'ISOLATED_RUNTIME_RENDER_REQUEST_UNSAFE',
  'ISOLATED_RUNTIME_STATE_UNSAFE',
  'ISOLATED_RUNTIME_PERMISSION_UNSAFE',
  'ISOLATED_RUNTIME_DATA_BOUNDARY_UNSAFE',
  'ISOLATED_RUNTIME_ISOLATION_UNSAFE',
  'ISOLATED_RUNTIME_SAFETY_UNSAFE',
  'ISOLATED_RUNTIME_DIGEST_MISMATCH',
  'ISOLATED_RUNTIME_VERIFIER_FAILED',
  'ISOLATED_RUNTIME_COMPATIBILITY_BLOCKED',
  'ISOLATED_RUNTIME_REACT_BLOCKED',
  'ISOLATED_RUNTIME_JSX_BLOCKED',
  'ISOLATED_RUNTIME_TSX_BLOCKED',
  'ISOLATED_RUNTIME_DOM_BLOCKED',
  'ISOLATED_RUNTIME_CSS_RUNTIME_BLOCKED',
  'ISOLATED_RUNTIME_UI_BLOCKED',
  'ISOLATED_RUNTIME_ROUTE_BLOCKED',
  'ISOLATED_RUNTIME_MENU_BLOCKED',
  'ISOLATED_RUNTIME_MODULE_GENERATION_BLOCKED',
  'ISOLATED_RUNTIME_MODULE_REGISTRATION_BLOCKED',
  'ISOLATED_RUNTIME_BACKEND_BLOCKED',
  'ISOLATED_RUNTIME_PRISMA_BLOCKED',
  'ISOLATED_RUNTIME_MIGRATION_BLOCKED',
  'ISOLATED_RUNTIME_PRODUCTION_BLOCKED',
  'ISOLATED_RUNTIME_STAGING_BLOCKED',
  'ISOLATED_RUNTIME_FETCH_BLOCKED',
  'ISOLATED_RUNTIME_MUTATION_BLOCKED',
  'ISOLATED_RUNTIME_PERSISTENCE_BLOCKED',
  'ISOLATED_RUNTIME_REAL_DATA_READ_BLOCKED',
  'ISOLATED_RUNTIME_REAL_DATA_WRITE_BLOCKED',
  'ISOLATED_RUNTIME_RENDER_ALLOWED_BLOCKED',
  'ISOLATED_RUNTIME_REWRITE_EMPRESAS_BLOCKED',
];

/** Typed error for the isolated runtime layer. */
export class IsolatedRuntimeError extends Error {
  /**
   * @param {string} code one of ISOLATED_RUNTIME_ERROR_CODES
   * @param {string} message sanitized message (no secrets)
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'IsolatedRuntimeError';
    this.code = ISOLATED_RUNTIME_ERROR_CODES.includes(code) ? code : 'ISOLATED_RUNTIME_INVALID_IMPLEMENTATION_PLAN';
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
export function createIsolatedRuntimeError(code, options = {}) {
  const o = options && typeof options === 'object' ? options : {};
  const known = ISOLATED_RUNTIME_ERROR_CODES.includes(code);
  return {
    kind: 'isolated-runtime-error',
    code: known ? code : 'ISOLATED_RUNTIME_INVALID_IMPLEMENTATION_PLAN',
    type: typeof o.type === 'string' ? o.type : 'isolated-runtime',
    message: typeof o.message === 'string' && o.message.length > 0 ? o.message : `Isolated runtime error: ${code}`,
    safe: true,
    sideEffects: false,
    noSecrets: true,
    noStackLeak: true,
    reactComponentCreated: false,
    jsxCreated: false,
    tsxCreated: false,
    domCreated: false,
    cssCreated: false,
    uiCreated: false,
    routeCreated: false,
    menuCreated: false,
    moduleGenerated: false,
    filesWrittenToModule: false,
    moduleRegistered: false,
    visualRuntimeImplemented: false,
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
export function isolatedRuntimeError(code, message, meta) {
  return new IsolatedRuntimeError(code, message, meta);
}

export default IsolatedRuntimeError;
