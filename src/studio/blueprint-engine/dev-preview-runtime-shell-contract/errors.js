/**
 * Typed error catalog for the STUDIO DEV PREVIEW RUNTIME SHELL CONTRACT.
 *
 * Headless and contract-only: no React component, no JSX/TSX, no DOM, no runtime CSS, no UI,
 * no route/menu, no module generation, no mount, no file write under src/modules, no backend/
 * Prisma/migration/fetch, production/staging, mutation, persistence, or rewrite of Empresas.
 * Descriptors are sanitized and side-effect-free.
 */

export const RUNTIME_SHELL_ERROR_CODES = [
  'RUNTIME_SHELL_INVALID_VISUAL_CONTRACT',
  'RUNTIME_SHELL_INVALID_BRIDGE',
  'RUNTIME_SHELL_INVALID_SANDBOX',
  'RUNTIME_SHELL_INVALID_ENGINE',
  'RUNTIME_SHELL_SESSION_FAILED',
  'RUNTIME_SHELL_LIFECYCLE_UNSAFE',
  'RUNTIME_SHELL_MOUNT_BOUNDARY_UNSAFE',
  'RUNTIME_SHELL_EVENT_UNSAFE',
  'RUNTIME_SHELL_RENDER_REQUEST_UNSAFE',
  'RUNTIME_SHELL_STATE_BOUNDARY_UNSAFE',
  'RUNTIME_SHELL_ERROR_BOUNDARY_UNSAFE',
  'RUNTIME_SHELL_PERMISSION_BOUNDARY_UNSAFE',
  'RUNTIME_SHELL_DATA_BOUNDARY_UNSAFE',
  'RUNTIME_SHELL_ISOLATION_UNSAFE',
  'RUNTIME_SHELL_POLICY_UNSAFE',
  'RUNTIME_SHELL_ROUTE_MENU_EXPOSED',
  'RUNTIME_SHELL_RUNTIME_SAFETY_UNSAFE',
  'RUNTIME_SHELL_DIGEST_MISMATCH',
  'RUNTIME_SHELL_VERIFIER_FAILED',
  'RUNTIME_SHELL_COMPATIBILITY_BLOCKED',
  'RUNTIME_SHELL_REACT_COMPONENT_BLOCKED',
  'RUNTIME_SHELL_JSX_BLOCKED',
  'RUNTIME_SHELL_TSX_BLOCKED',
  'RUNTIME_SHELL_DOM_BLOCKED',
  'RUNTIME_SHELL_CSS_RUNTIME_BLOCKED',
  'RUNTIME_SHELL_UI_BLOCKED',
  'RUNTIME_SHELL_MOUNT_BLOCKED',
  'RUNTIME_SHELL_MODULE_GENERATION_BLOCKED',
  'RUNTIME_SHELL_FILE_WRITE_BLOCKED',
  'RUNTIME_SHELL_ROUTE_BLOCKED',
  'RUNTIME_SHELL_MENU_BLOCKED',
  'RUNTIME_SHELL_MODULE_REGISTRATION_BLOCKED',
  'RUNTIME_SHELL_BACKEND_BLOCKED',
  'RUNTIME_SHELL_PRISMA_BLOCKED',
  'RUNTIME_SHELL_MIGRATION_BLOCKED',
  'RUNTIME_SHELL_PRODUCTION_BLOCKED',
  'RUNTIME_SHELL_STAGING_BLOCKED',
  'RUNTIME_SHELL_FETCH_BLOCKED',
  'RUNTIME_SHELL_MUTATION_BLOCKED',
  'RUNTIME_SHELL_PERSISTENCE_BLOCKED',
  'RUNTIME_SHELL_REAL_DATA_READ_BLOCKED',
  'RUNTIME_SHELL_REAL_DATA_WRITE_BLOCKED',
  'RUNTIME_SHELL_REWRITE_EMPRESAS_BLOCKED',
];

/** Typed error for the dev preview runtime shell contract layer. */
export class DevPreviewRuntimeShellContractError extends Error {
  /**
   * @param {string} code one of RUNTIME_SHELL_ERROR_CODES
   * @param {string} message sanitized message (no secrets)
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'DevPreviewRuntimeShellContractError';
    this.code = RUNTIME_SHELL_ERROR_CODES.includes(code) ? code : 'RUNTIME_SHELL_INVALID_VISUAL_CONTRACT';
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
export function createDevPreviewRuntimeShellContractError(code, options = {}) {
  const o = options && typeof options === 'object' ? options : {};
  const known = RUNTIME_SHELL_ERROR_CODES.includes(code);
  return {
    kind: 'dev-preview-runtime-shell-contract-error',
    code: known ? code : 'RUNTIME_SHELL_INVALID_VISUAL_CONTRACT',
    type: typeof o.type === 'string' ? o.type : 'dev-preview-runtime-shell-contract',
    message: typeof o.message === 'string' && o.message.length > 0 ? o.message : `Dev preview runtime shell contract error: ${code}`,
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
    mountCreated: false,
    routeCreated: false,
    menuCreated: false,
    moduleGenerated: false,
    filesWrittenToModule: false,
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
export function devPreviewRuntimeShellContractError(code, message, meta) {
  return new DevPreviewRuntimeShellContractError(code, message, meta);
}

export default DevPreviewRuntimeShellContractError;
