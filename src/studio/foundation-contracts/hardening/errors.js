/**
 * Typed error catalog for the MAK Studio BLUEPRINT CONTRACT HARDENING layer.
 *
 * Headless and contract-only: no UI, route, menu, module registration, backend/
 * Prisma/migration/fetch, production/staging, mutation, real storage, or new
 * dependency. Descriptors are sanitized and side-effect-free.
 */

export const STUDIO_HARDENING_ERROR_CODES = [
  'STUDIO_HARDENING_INVALID_BLUEPRINT',
  'STUDIO_HARDENING_DANGEROUS_BLUEPRINT',
  'STUDIO_HARDENING_UNSAFE_FIELD',
  'STUDIO_HARDENING_UNSAFE_SCREEN',
  'STUDIO_HARDENING_UNSAFE_VALIDATION',
  'STUDIO_HARDENING_PERMISSION_BYPASS',
  'STUDIO_HARDENING_ROUTE_MENU_AUTO_REGISTRATION',
  'STUDIO_HARDENING_UNSAFE_PERSISTENCE_TRANSITION',
  'STUDIO_HARDENING_UNSAFE_RUNTIME_BINDING',
  'STUDIO_HARDENING_COMPATIBILITY_BREAKING',
  'STUDIO_HARDENING_DIGEST_MISMATCH',
  'STUDIO_HARDENING_VERIFIER_MISMATCH',
  'STUDIO_HARDENING_SAFETY_INVARIANT_FAILED',
  'STUDIO_HARDENING_PERFORMANCE_ANOMALY',
  'STUDIO_HARDENING_PRODUCTION_BLOCKED',
  'STUDIO_HARDENING_BACKEND_BLOCKED',
  'STUDIO_HARDENING_PRISMA_BLOCKED',
  'STUDIO_HARDENING_MIGRATION_BLOCKED',
  'STUDIO_HARDENING_FETCH_BLOCKED',
  'STUDIO_HARDENING_MUTATION_BLOCKED',
];

/** Typed error for the Studio blueprint hardening layer. */
export class StudioBlueprintHardeningError extends Error {
  /**
   * @param {string} code one of STUDIO_HARDENING_ERROR_CODES
   * @param {string} message sanitized message (no secrets)
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'StudioBlueprintHardeningError';
    this.code = STUDIO_HARDENING_ERROR_CODES.includes(code) ? code : 'STUDIO_HARDENING_INVALID_BLUEPRINT';
    if (meta) this.meta = meta;
  }
}

/**
 * Builds a sanitized, side-effect-free error descriptor. Never contains secrets,
 * JWT, DATABASE_URL, API_URL, stack, or personal data.
 * @param {string} code
 * @param {Object} [options]
 * @returns {Object}
 */
export function createStudioHardeningError(code, options = {}) {
  const o = options && typeof options === 'object' ? options : {};
  const known = STUDIO_HARDENING_ERROR_CODES.includes(code);
  return {
    kind: 'studio-blueprint-hardening-error',
    code: known ? code : 'STUDIO_HARDENING_INVALID_BLUEPRINT',
    type: typeof o.type === 'string' ? o.type : 'hardening',
    message: typeof o.message === 'string' && o.message.length > 0 ? o.message : `Studio hardening error: ${code}`,
    safe: true,
    sideEffects: false,
    uiCreated: false,
    routeCreated: false,
    menuCreated: false,
    moduleRegistered: false,
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
export function studioBlueprintHardeningError(code, message, meta) {
  return new StudioBlueprintHardeningError(code, message, meta);
}

export default StudioBlueprintHardeningError;
