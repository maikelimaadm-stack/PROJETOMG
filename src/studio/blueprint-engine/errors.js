/**
 * Typed error catalog for the MAK Studio BLUEPRINT ENGINE FOUNDATION.
 *
 * Headless and contract-only: no UI, route, menu, module registration, backend/Prisma/
 * migration/fetch, production/staging, mutation, persistence, or rewrite of Empresas.
 * Descriptors are sanitized and side-effect-free.
 */

export const STUDIO_BLUEPRINT_ENGINE_ERROR_CODES = [
  'STUDIO_BLUEPRINT_ENGINE_INVALID_DRAFT',
  'STUDIO_BLUEPRINT_ENGINE_INVALID_MODULE',
  'STUDIO_BLUEPRINT_ENGINE_INVALID_FIELD',
  'STUDIO_BLUEPRINT_ENGINE_INVALID_FIELD_TYPE',
  'STUDIO_BLUEPRINT_ENGINE_DUPLICATE_FIELD',
  'STUDIO_BLUEPRINT_ENGINE_INVALID_SCREEN',
  'STUDIO_BLUEPRINT_ENGINE_INVALID_PERMISSION',
  'STUDIO_BLUEPRINT_ENGINE_INVALID_PERSISTENCE',
  'STUDIO_BLUEPRINT_ENGINE_INVALID_RUNTIME_BINDING',
  'STUDIO_BLUEPRINT_ENGINE_NORMALIZE_FAILED',
  'STUDIO_BLUEPRINT_ENGINE_VALIDATION_FAILED',
  'STUDIO_BLUEPRINT_ENGINE_SAFETY_VIOLATION',
  'STUDIO_BLUEPRINT_ENGINE_HARDENING_VIOLATION',
  'STUDIO_BLUEPRINT_ENGINE_DIGEST_MISMATCH',
  'STUDIO_BLUEPRINT_ENGINE_MANIFEST_FAILED',
  'STUDIO_BLUEPRINT_ENGINE_VERIFIER_FAILED',
  'STUDIO_BLUEPRINT_ENGINE_COMPATIBILITY_BREAKING',
  'STUDIO_BLUEPRINT_ENGINE_COMPARE_FAILED',
  'STUDIO_BLUEPRINT_ENGINE_UI_BLOCKED',
  'STUDIO_BLUEPRINT_ENGINE_ROUTE_BLOCKED',
  'STUDIO_BLUEPRINT_ENGINE_MENU_BLOCKED',
  'STUDIO_BLUEPRINT_ENGINE_MODULE_REGISTRATION_BLOCKED',
  'STUDIO_BLUEPRINT_ENGINE_BACKEND_BLOCKED',
  'STUDIO_BLUEPRINT_ENGINE_PRISMA_BLOCKED',
  'STUDIO_BLUEPRINT_ENGINE_MIGRATION_BLOCKED',
  'STUDIO_BLUEPRINT_ENGINE_PRODUCTION_BLOCKED',
  'STUDIO_BLUEPRINT_ENGINE_STAGING_BLOCKED',
  'STUDIO_BLUEPRINT_ENGINE_FETCH_BLOCKED',
  'STUDIO_BLUEPRINT_ENGINE_MUTATION_BLOCKED',
  'STUDIO_BLUEPRINT_ENGINE_PERSISTENCE_BLOCKED',
  'STUDIO_BLUEPRINT_ENGINE_GENERATED_MODULE_BLOCKED',
  'STUDIO_BLUEPRINT_ENGINE_REWRITE_EMPRESAS_BLOCKED',
];

/** Typed error for the Studio blueprint engine layer. */
export class StudioBlueprintEngineError extends Error {
  /**
   * @param {string} code one of STUDIO_BLUEPRINT_ENGINE_ERROR_CODES
   * @param {string} message sanitized message (no secrets)
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'StudioBlueprintEngineError';
    this.code = STUDIO_BLUEPRINT_ENGINE_ERROR_CODES.includes(code) ? code : 'STUDIO_BLUEPRINT_ENGINE_INVALID_DRAFT';
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
export function createStudioBlueprintEngineError(code, options = {}) {
  const o = options && typeof options === 'object' ? options : {};
  const known = STUDIO_BLUEPRINT_ENGINE_ERROR_CODES.includes(code);
  return {
    kind: 'studio-blueprint-engine-error',
    code: known ? code : 'STUDIO_BLUEPRINT_ENGINE_INVALID_DRAFT',
    type: typeof o.type === 'string' ? o.type : 'engine',
    message: typeof o.message === 'string' && o.message.length > 0 ? o.message : `Studio blueprint engine error: ${code}`,
    safe: true,
    sideEffects: false,
    uiEnabled: false,
    routeEnabled: false,
    menuEnabled: false,
    moduleRegistrationEnabled: false,
    backendEnabled: false,
    prismaEnabled: false,
    migrationEnabled: false,
    productionEnabled: false,
    stagingEnabled: false,
    fetchUsed: false,
    mutationAllowed: false,
    persistenceEnabled: false,
    generatedModuleAllowed: false,
    rewriteEmpresas: false,
  };
}

/**
 * @param {string} code
 * @param {string} message
 * @param {Object} [meta]
 */
export function studioBlueprintEngineError(code, message, meta) {
  return new StudioBlueprintEngineError(code, message, meta);
}

export default StudioBlueprintEngineError;
