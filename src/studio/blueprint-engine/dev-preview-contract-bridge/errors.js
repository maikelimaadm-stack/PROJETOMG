/**
 * Typed error catalog for the STUDIO DEV PREVIEW CONTRACT BRIDGE.
 *
 * Headless and contract-only: no React component, no JSX/TSX, no UI, no route/menu, no
 * module generation, no file write under src/modules, no backend/Prisma/migration/fetch,
 * production/staging, mutation, persistence, or rewrite of Empresas. Descriptors are
 * sanitized and side-effect-free.
 */

export const DEV_PREVIEW_BRIDGE_ERROR_CODES = [
  'DEV_PREVIEW_BRIDGE_INVALID_SANDBOX',
  'DEV_PREVIEW_BRIDGE_INVALID_PLANNER',
  'DEV_PREVIEW_BRIDGE_INVALID_ENGINE',
  'DEV_PREVIEW_BRIDGE_INVALID_BLUEPRINT_CONTRACT',
  'DEV_PREVIEW_BRIDGE_SESSION_FAILED',
  'DEV_PREVIEW_BRIDGE_RENDER_SCHEMA_UNSAFE',
  'DEV_PREVIEW_BRIDGE_LAYOUT_SCHEMA_UNSAFE',
  'DEV_PREVIEW_BRIDGE_SCREEN_SCHEMA_UNSAFE',
  'DEV_PREVIEW_BRIDGE_TABLE_SCHEMA_UNSAFE',
  'DEV_PREVIEW_BRIDGE_FORM_SCHEMA_UNSAFE',
  'DEV_PREVIEW_BRIDGE_DETAIL_SCHEMA_UNSAFE',
  'DEV_PREVIEW_BRIDGE_FIELD_SCHEMA_UNSAFE',
  'DEV_PREVIEW_BRIDGE_ACTION_SCHEMA_UNSAFE',
  'DEV_PREVIEW_BRIDGE_PERMISSION_SCHEMA_UNSAFE',
  'DEV_PREVIEW_BRIDGE_UNKNOWN_COMPONENT',
  'DEV_PREVIEW_BRIDGE_BLOCKED_COMPONENT',
  'DEV_PREVIEW_BRIDGE_VISUAL_ADAPTER_UNSAFE',
  'DEV_PREVIEW_BRIDGE_ROUTE_MENU_EXPOSED',
  'DEV_PREVIEW_BRIDGE_RUNTIME_SAFETY_UNSAFE',
  'DEV_PREVIEW_BRIDGE_DIGEST_MISMATCH',
  'DEV_PREVIEW_BRIDGE_VERIFIER_FAILED',
  'DEV_PREVIEW_BRIDGE_COMPATIBILITY_BLOCKED',
  'DEV_PREVIEW_BRIDGE_REACT_COMPONENT_BLOCKED',
  'DEV_PREVIEW_BRIDGE_JSX_BLOCKED',
  'DEV_PREVIEW_BRIDGE_TSX_BLOCKED',
  'DEV_PREVIEW_BRIDGE_UI_BLOCKED',
  'DEV_PREVIEW_BRIDGE_MODULE_GENERATION_BLOCKED',
  'DEV_PREVIEW_BRIDGE_FILE_WRITE_BLOCKED',
  'DEV_PREVIEW_BRIDGE_ROUTE_BLOCKED',
  'DEV_PREVIEW_BRIDGE_MENU_BLOCKED',
  'DEV_PREVIEW_BRIDGE_MODULE_REGISTRATION_BLOCKED',
  'DEV_PREVIEW_BRIDGE_BACKEND_BLOCKED',
  'DEV_PREVIEW_BRIDGE_PRISMA_BLOCKED',
  'DEV_PREVIEW_BRIDGE_MIGRATION_BLOCKED',
  'DEV_PREVIEW_BRIDGE_PRODUCTION_BLOCKED',
  'DEV_PREVIEW_BRIDGE_STAGING_BLOCKED',
  'DEV_PREVIEW_BRIDGE_FETCH_BLOCKED',
  'DEV_PREVIEW_BRIDGE_MUTATION_BLOCKED',
  'DEV_PREVIEW_BRIDGE_PERSISTENCE_BLOCKED',
  'DEV_PREVIEW_BRIDGE_REWRITE_EMPRESAS_BLOCKED',
];

/** Typed error for the dev preview contract bridge layer. */
export class DevPreviewBridgeError extends Error {
  /**
   * @param {string} code one of DEV_PREVIEW_BRIDGE_ERROR_CODES
   * @param {string} message sanitized message (no secrets)
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'DevPreviewBridgeError';
    this.code = DEV_PREVIEW_BRIDGE_ERROR_CODES.includes(code) ? code : 'DEV_PREVIEW_BRIDGE_INVALID_SANDBOX';
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
export function createDevPreviewBridgeError(code, options = {}) {
  const o = options && typeof options === 'object' ? options : {};
  const known = DEV_PREVIEW_BRIDGE_ERROR_CODES.includes(code);
  return {
    kind: 'dev-preview-bridge-error',
    code: known ? code : 'DEV_PREVIEW_BRIDGE_INVALID_SANDBOX',
    type: typeof o.type === 'string' ? o.type : 'dev-preview-bridge',
    message: typeof o.message === 'string' && o.message.length > 0 ? o.message : `Dev preview bridge error: ${code}`,
    safe: true,
    sideEffects: false,
    reactComponentCreated: false,
    jsxCreated: false,
    tsxCreated: false,
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
export function devPreviewBridgeError(code, message, meta) {
  return new DevPreviewBridgeError(code, message, meta);
}

export default DevPreviewBridgeError;
