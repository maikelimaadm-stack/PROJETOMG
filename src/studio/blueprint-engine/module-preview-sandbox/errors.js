/**
 * Typed error catalog for the STUDIO MODULE PREVIEW SANDBOX CONTRACT.
 *
 * Headless and preview-metadata-only: no React component, no UI, no route/menu, no module
 * generation, no file write under src/modules, no backend/Prisma/migration/fetch,
 * production/staging, mutation, persistence, or rewrite of Empresas. Descriptors are
 * sanitized and side-effect-free.
 */

export const MODULE_PREVIEW_SANDBOX_ERROR_CODES = [
  'MODULE_PREVIEW_SANDBOX_INVALID_PLANNER',
  'MODULE_PREVIEW_SANDBOX_INVALID_ENGINE_OUTPUT',
  'MODULE_PREVIEW_SANDBOX_INVALID_BLUEPRINT_CONTRACT',
  'MODULE_PREVIEW_SANDBOX_INVALID_SOURCE_BLUEPRINT',
  'MODULE_PREVIEW_SANDBOX_INVALID_SOURCE_PLANNER',
  'MODULE_PREVIEW_SANDBOX_SESSION_FAILED',
  'MODULE_PREVIEW_SANDBOX_TABLE_UNSAFE',
  'MODULE_PREVIEW_SANDBOX_FORM_UNSAFE',
  'MODULE_PREVIEW_SANDBOX_DETAIL_UNSAFE',
  'MODULE_PREVIEW_SANDBOX_FIELD_UNSAFE',
  'MODULE_PREVIEW_SANDBOX_ACTION_UNSAFE',
  'MODULE_PREVIEW_SANDBOX_PERMISSION_UNSAFE',
  'MODULE_PREVIEW_SANDBOX_TENANT_UNSAFE',
  'MODULE_PREVIEW_SANDBOX_ROUTE_MENU_EXPOSED',
  'MODULE_PREVIEW_SANDBOX_PERSISTENCE_UNSAFE',
  'MODULE_PREVIEW_SANDBOX_RUNTIME_BINDING_UNSAFE',
  'MODULE_PREVIEW_SANDBOX_DIGEST_MISMATCH',
  'MODULE_PREVIEW_SANDBOX_VERIFIER_FAILED',
  'MODULE_PREVIEW_SANDBOX_COMPATIBILITY_BLOCKED',
  'MODULE_PREVIEW_SANDBOX_REACT_COMPONENT_BLOCKED',
  'MODULE_PREVIEW_SANDBOX_UI_BLOCKED',
  'MODULE_PREVIEW_SANDBOX_MODULE_GENERATION_BLOCKED',
  'MODULE_PREVIEW_SANDBOX_FILE_WRITE_BLOCKED',
  'MODULE_PREVIEW_SANDBOX_ROUTE_BLOCKED',
  'MODULE_PREVIEW_SANDBOX_MENU_BLOCKED',
  'MODULE_PREVIEW_SANDBOX_MODULE_REGISTRATION_BLOCKED',
  'MODULE_PREVIEW_SANDBOX_BACKEND_BLOCKED',
  'MODULE_PREVIEW_SANDBOX_PRISMA_BLOCKED',
  'MODULE_PREVIEW_SANDBOX_MIGRATION_BLOCKED',
  'MODULE_PREVIEW_SANDBOX_PRODUCTION_BLOCKED',
  'MODULE_PREVIEW_SANDBOX_STAGING_BLOCKED',
  'MODULE_PREVIEW_SANDBOX_FETCH_BLOCKED',
  'MODULE_PREVIEW_SANDBOX_MUTATION_BLOCKED',
  'MODULE_PREVIEW_SANDBOX_PERSISTENCE_CREATION_BLOCKED',
  'MODULE_PREVIEW_SANDBOX_REWRITE_EMPRESAS_BLOCKED',
];

/** Typed error for the module preview sandbox contract layer. */
export class ModulePreviewSandboxError extends Error {
  /**
   * @param {string} code one of MODULE_PREVIEW_SANDBOX_ERROR_CODES
   * @param {string} message sanitized message (no secrets)
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'ModulePreviewSandboxError';
    this.code = MODULE_PREVIEW_SANDBOX_ERROR_CODES.includes(code) ? code : 'MODULE_PREVIEW_SANDBOX_INVALID_PLANNER';
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
export function createModulePreviewSandboxError(code, options = {}) {
  const o = options && typeof options === 'object' ? options : {};
  const known = MODULE_PREVIEW_SANDBOX_ERROR_CODES.includes(code);
  return {
    kind: 'module-preview-sandbox-error',
    code: known ? code : 'MODULE_PREVIEW_SANDBOX_INVALID_PLANNER',
    type: typeof o.type === 'string' ? o.type : 'preview-sandbox',
    message: typeof o.message === 'string' && o.message.length > 0 ? o.message : `Module preview sandbox error: ${code}`,
    safe: true,
    sideEffects: false,
    previewMetadataOnly: true,
    reactComponentCreated: false,
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
export function modulePreviewSandboxError(code, message, meta) {
  return new ModulePreviewSandboxError(code, message, meta);
}

export default ModulePreviewSandboxError;
