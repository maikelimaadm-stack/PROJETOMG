/**
 * Typed error catalog for the MAK Studio BLUEPRINT CONTRACT CERTIFICATION layer.
 *
 * Headless and contract-only: no UI, route, menu, module registration, backend/
 * Prisma/migration/fetch, production/staging, mutation, real storage, or new
 * dependency. Descriptors are sanitized and side-effect-free.
 */

export const STUDIO_CERTIFICATION_ERROR_CODES = [
  'STUDIO_CERTIFICATION_INVALID',
  'STUDIO_CERTIFICATION_DIGEST_MISMATCH',
  'STUDIO_CERTIFICATION_UNSAFE',
  'STUDIO_CERTIFICATION_COMPATIBILITY_BLOCKED',
  'STUDIO_CERTIFICATION_HARDENING_BASELINE_REGRESSED',
  'STUDIO_CERTIFICATION_MANIFEST_INVALID',
];

/** Typed error for the Studio blueprint certification layer. */
export class StudioBlueprintCertificationError extends Error {
  /**
   * @param {string} code one of STUDIO_CERTIFICATION_ERROR_CODES
   * @param {string} message sanitized message (no secrets)
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'StudioBlueprintCertificationError';
    this.code = STUDIO_CERTIFICATION_ERROR_CODES.includes(code) ? code : 'STUDIO_CERTIFICATION_INVALID';
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
export function createStudioCertificationError(code, options = {}) {
  const o = options && typeof options === 'object' ? options : {};
  const known = STUDIO_CERTIFICATION_ERROR_CODES.includes(code);
  return {
    kind: 'studio-blueprint-certification-error',
    code: known ? code : 'STUDIO_CERTIFICATION_INVALID',
    type: typeof o.type === 'string' ? o.type : 'certification',
    message: typeof o.message === 'string' && o.message.length > 0 ? o.message : `Studio certification error: ${code}`,
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
export function studioBlueprintCertificationError(code, message, meta) {
  return new StudioBlueprintCertificationError(code, message, meta);
}

export default StudioBlueprintCertificationError;
