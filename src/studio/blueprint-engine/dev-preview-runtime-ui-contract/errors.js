/**
 * Typed error catalog for the STUDIO DEV PREVIEW RUNTIME UI CONTRACT.
 *
 * Headless and contract-only: no UI, no React component, no JSX/TSX, no DOM, no runtime CSS, no
 * route/menu, no module generation, no file write under src/modules, no backend/Prisma/
 * migration/fetch, production/staging, mutation, persistence, real data read/write, or rewrite
 * of Empresas. Descriptors are sanitized and side-effect-free.
 */

export const RUNTIME_UI_CONTRACT_ERROR_CODES = [
  'RUNTIME_UI_CONTRACT_INVALID_ISOLATED_RUNTIME',
  'RUNTIME_UI_CONTRACT_INVALID_IMPLEMENTATION_PLAN',
  'RUNTIME_UI_CONTRACT_INVALID_VIRTUAL_FRAME',
  'RUNTIME_UI_CONTRACT_INVALID_VISUAL_CONTRACT',
  'RUNTIME_UI_CONTRACT_SESSION_FAILED',
  'RUNTIME_UI_CONTRACT_FRAME_MAPPING_UNSAFE',
  'RUNTIME_UI_CONTRACT_NODE_UNSAFE',
  'RUNTIME_UI_CONTRACT_LAYOUT_UNSAFE',
  'RUNTIME_UI_CONTRACT_COMPONENT_BINDING_UNSAFE',
  'RUNTIME_UI_CONTRACT_INTERACTION_BINDING_UNSAFE',
  'RUNTIME_UI_CONTRACT_RENDER_BOUNDARY_UNSAFE',
  'RUNTIME_UI_CONTRACT_STATE_PROJECTION_UNSAFE',
  'RUNTIME_UI_CONTRACT_ACCESSIBILITY_PROJECTION_UNSAFE',
  'RUNTIME_UI_CONTRACT_THEME_PROJECTION_UNSAFE',
  'RUNTIME_UI_CONTRACT_BLOCKED_ACTION_UNSAFE',
  'RUNTIME_UI_CONTRACT_SAFETY_UNSAFE',
  'RUNTIME_UI_CONTRACT_DIGEST_MISMATCH',
  'RUNTIME_UI_CONTRACT_VERIFIER_FAILED',
  'RUNTIME_UI_CONTRACT_COMPATIBILITY_BLOCKED',
  'RUNTIME_UI_CONTRACT_REACT_BLOCKED',
  'RUNTIME_UI_CONTRACT_JSX_BLOCKED',
  'RUNTIME_UI_CONTRACT_TSX_BLOCKED',
  'RUNTIME_UI_CONTRACT_DOM_BLOCKED',
  'RUNTIME_UI_CONTRACT_CSS_RUNTIME_BLOCKED',
  'RUNTIME_UI_CONTRACT_UI_BLOCKED',
  'RUNTIME_UI_CONTRACT_ROUTE_BLOCKED',
  'RUNTIME_UI_CONTRACT_MENU_BLOCKED',
  'RUNTIME_UI_CONTRACT_MODULE_GENERATION_BLOCKED',
  'RUNTIME_UI_CONTRACT_MODULE_REGISTRATION_BLOCKED',
  'RUNTIME_UI_CONTRACT_BACKEND_BLOCKED',
  'RUNTIME_UI_CONTRACT_PRISMA_BLOCKED',
  'RUNTIME_UI_CONTRACT_MIGRATION_BLOCKED',
  'RUNTIME_UI_CONTRACT_PRODUCTION_BLOCKED',
  'RUNTIME_UI_CONTRACT_STAGING_BLOCKED',
  'RUNTIME_UI_CONTRACT_FETCH_BLOCKED',
  'RUNTIME_UI_CONTRACT_MUTATION_BLOCKED',
  'RUNTIME_UI_CONTRACT_PERSISTENCE_BLOCKED',
  'RUNTIME_UI_CONTRACT_REAL_DATA_READ_BLOCKED',
  'RUNTIME_UI_CONTRACT_REAL_DATA_WRITE_BLOCKED',
  'RUNTIME_UI_CONTRACT_RENDER_ALLOWED_BLOCKED',
  'RUNTIME_UI_CONTRACT_BINDING_ALLOWED_BLOCKED',
  'RUNTIME_UI_CONTRACT_HANDLER_CREATED_BLOCKED',
  'RUNTIME_UI_CONTRACT_REWRITE_EMPRESAS_BLOCKED',
];

/** Typed error for the runtime UI contract layer. */
export class RuntimeUiContractError extends Error {
  /**
   * @param {string} code one of RUNTIME_UI_CONTRACT_ERROR_CODES
   * @param {string} message sanitized message (no secrets)
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'RuntimeUiContractError';
    this.code = RUNTIME_UI_CONTRACT_ERROR_CODES.includes(code) ? code : 'RUNTIME_UI_CONTRACT_INVALID_ISOLATED_RUNTIME';
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
export function createRuntimeUiContractError(code, options = {}) {
  const o = options && typeof options === 'object' ? options : {};
  const known = RUNTIME_UI_CONTRACT_ERROR_CODES.includes(code);
  return {
    kind: 'runtime-ui-contract-error',
    code: known ? code : 'RUNTIME_UI_CONTRACT_INVALID_ISOLATED_RUNTIME',
    type: typeof o.type === 'string' ? o.type : 'runtime-ui-contract',
    message: typeof o.message === 'string' && o.message.length > 0 ? o.message : `Runtime UI contract error: ${code}`,
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
export function runtimeUiContractError(code, message, meta) {
  return new RuntimeUiContractError(code, message, meta);
}

export default RuntimeUiContractError;
