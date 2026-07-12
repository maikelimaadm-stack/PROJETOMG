/**
 * Typed error catalog for the MAK Studio FOUNDATION CONTRACTS layer.
 *
 * This layer is HEADLESS and CONTRACT-ONLY: no UI, no route, no menu, no module
 * registration, no backend/Prisma/migration/fetch, no production/staging, no
 * mutation, no real storage, no new dependency. It never auto-consumes into the
 * app. Reversible by non-consumption.
 */

export const STUDIO_ERROR_CODES = [
  'STUDIO_INVALID_CONTRACT',
  'STUDIO_INVALID_METAMODEL',
  'STUDIO_INVALID_BLUEPRINT',
  'STUDIO_UNSAFE_FIELD',
  'STUDIO_UNSAFE_VALIDATION',
  'STUDIO_PERMISSION_BYPASS',
  'STUDIO_TENANT_BYPASS',
  'STUDIO_ROUTE_AUTO_REGISTRATION_BLOCKED',
  'STUDIO_MENU_AUTO_REGISTRATION_BLOCKED',
  'STUDIO_BACKEND_BLOCKED',
  'STUDIO_PRISMA_BLOCKED',
  'STUDIO_MIGRATION_BLOCKED',
  'STUDIO_FETCH_BLOCKED',
  'STUDIO_PRODUCTION_BLOCKED',
  'STUDIO_STAGING_BLOCKED',
  'STUDIO_MUTATION_BLOCKED',
  'STUDIO_MODULE_REGISTRATION_BLOCKED',
  'STUDIO_MARKETPLACE_PUBLICATION_BLOCKED',
  'STUDIO_COMPATIBILITY_BREAKING_CHANGE',
  'STUDIO_MANIFEST_INVALID',
];

/** Typed error for the Studio foundation contracts layer. */
export class StudioFoundationContractError extends Error {
  /**
   * @param {string} code one of STUDIO_ERROR_CODES
   * @param {string} message sanitized message (no secrets)
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'StudioFoundationContractError';
    this.code = STUDIO_ERROR_CODES.includes(code) ? code : 'STUDIO_INVALID_CONTRACT';
    if (meta) this.meta = meta;
  }
}

/**
 * Builds a sanitized, side-effect-free error descriptor. Never contains secrets,
 * JWT, DATABASE_URL, API_URL, stack, personal data.
 * @param {string} code
 * @param {Object} [options]
 * @returns {Object}
 */
export function createStudioError(code, options = {}) {
  const o = options && typeof options === 'object' ? options : {};
  const known = STUDIO_ERROR_CODES.includes(code);
  return {
    kind: 'studio-foundation-contract-error',
    code: known ? code : 'STUDIO_INVALID_CONTRACT',
    type: typeof o.type === 'string' ? o.type : 'contract',
    message: typeof o.message === 'string' && o.message.length > 0 ? o.message : `Studio contract error: ${code}`,
    safe: true,
    sideEffects: false,
    productionAccessed: false,
    backendAccessed: false,
    prismaAccessed: false,
    migrationExecuted: false,
    mutationExecuted: false,
    fetchUsed: false,
  };
}

/**
 * @param {string} code
 * @param {string} message
 * @param {Object} [meta]
 */
export function studioFoundationContractError(code, message, meta) {
  return new StudioFoundationContractError(code, message, meta);
}

export default StudioFoundationContractError;
