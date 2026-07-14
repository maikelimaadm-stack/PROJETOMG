/**
 * Typed error catalog for the STUDIO DEV PREVIEW VISUAL CONTRACT.
 *
 * Headless and contract-only: no React component, no JSX/TSX, no DOM, no runtime CSS, no UI,
 * no route/menu, no module generation, no file write under src/modules, no backend/Prisma/
 * migration/fetch, production/staging, mutation, persistence, or rewrite of Empresas.
 * Descriptors are sanitized and side-effect-free.
 */

export const VISUAL_CONTRACT_ERROR_CODES = [
  'VISUAL_CONTRACT_INVALID_BRIDGE',
  'VISUAL_CONTRACT_INVALID_SANDBOX',
  'VISUAL_CONTRACT_INVALID_PLANNER',
  'VISUAL_CONTRACT_INVALID_ENGINE',
  'VISUAL_CONTRACT_SESSION_FAILED',
  'VISUAL_CONTRACT_TREE_UNSAFE',
  'VISUAL_CONTRACT_SCREEN_UNSAFE',
  'VISUAL_CONTRACT_SECTION_UNSAFE',
  'VISUAL_CONTRACT_PLACEHOLDER_UNKNOWN',
  'VISUAL_CONTRACT_PLACEHOLDER_BLOCKED',
  'VISUAL_CONTRACT_STATE_UNSAFE',
  'VISUAL_CONTRACT_INTERACTION_UNSAFE',
  'VISUAL_CONTRACT_THEME_UNSAFE',
  'VISUAL_CONTRACT_ACCESSIBILITY_UNSAFE',
  'VISUAL_CONTRACT_VALIDATION_UNSAFE',
  'VISUAL_CONTRACT_ROUTE_MENU_EXPOSED',
  'VISUAL_CONTRACT_RUNTIME_SAFETY_UNSAFE',
  'VISUAL_CONTRACT_DIGEST_MISMATCH',
  'VISUAL_CONTRACT_VERIFIER_FAILED',
  'VISUAL_CONTRACT_COMPATIBILITY_BLOCKED',
  'VISUAL_CONTRACT_REACT_COMPONENT_BLOCKED',
  'VISUAL_CONTRACT_JSX_BLOCKED',
  'VISUAL_CONTRACT_TSX_BLOCKED',
  'VISUAL_CONTRACT_DOM_BLOCKED',
  'VISUAL_CONTRACT_CSS_RUNTIME_BLOCKED',
  'VISUAL_CONTRACT_UI_BLOCKED',
  'VISUAL_CONTRACT_MODULE_GENERATION_BLOCKED',
  'VISUAL_CONTRACT_FILE_WRITE_BLOCKED',
  'VISUAL_CONTRACT_ROUTE_BLOCKED',
  'VISUAL_CONTRACT_MENU_BLOCKED',
  'VISUAL_CONTRACT_MODULE_REGISTRATION_BLOCKED',
  'VISUAL_CONTRACT_BACKEND_BLOCKED',
  'VISUAL_CONTRACT_PRISMA_BLOCKED',
  'VISUAL_CONTRACT_MIGRATION_BLOCKED',
  'VISUAL_CONTRACT_PRODUCTION_BLOCKED',
  'VISUAL_CONTRACT_STAGING_BLOCKED',
  'VISUAL_CONTRACT_FETCH_BLOCKED',
  'VISUAL_CONTRACT_MUTATION_BLOCKED',
  'VISUAL_CONTRACT_PERSISTENCE_BLOCKED',
  'VISUAL_CONTRACT_REWRITE_EMPRESAS_BLOCKED',
];

/** Typed error for the dev preview visual contract layer. */
export class DevPreviewVisualContractError extends Error {
  /**
   * @param {string} code one of VISUAL_CONTRACT_ERROR_CODES
   * @param {string} message sanitized message (no secrets)
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'DevPreviewVisualContractError';
    this.code = VISUAL_CONTRACT_ERROR_CODES.includes(code) ? code : 'VISUAL_CONTRACT_INVALID_BRIDGE';
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
export function createDevPreviewVisualContractError(code, options = {}) {
  const o = options && typeof options === 'object' ? options : {};
  const known = VISUAL_CONTRACT_ERROR_CODES.includes(code);
  return {
    kind: 'dev-preview-visual-contract-error',
    code: known ? code : 'VISUAL_CONTRACT_INVALID_BRIDGE',
    type: typeof o.type === 'string' ? o.type : 'dev-preview-visual-contract',
    message: typeof o.message === 'string' && o.message.length > 0 ? o.message : `Dev preview visual contract error: ${code}`,
    safe: true,
    sideEffects: false,
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
    backendAccessed: false,
    prismaAccessed: false,
    migrationExecuted: false,
    productionAccessed: false,
    stagingAccessed: false,
    mutationExecuted: false,
    fetchUsed: false,
    persistenceCreated: false,
    rewriteEmpresas: false,
  };
}

/**
 * @param {string} code
 * @param {string} message
 * @param {Object} [meta]
 */
export function devPreviewVisualContractError(code, message, meta) {
  return new DevPreviewVisualContractError(code, message, meta);
}

export default DevPreviewVisualContractError;
