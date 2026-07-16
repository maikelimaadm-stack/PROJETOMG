/**
 * Typed error catalog for the STUDIO MODULE BLUEPRINT AUTHORING FOUNDATION CONTRACT.
 *
 * Minimal, headless, contract-only, metadata-only, fail-closed: no authoring runtime, no UI, no
 * editor, no persistence, no module generation, no product exposure, no backend/Prisma/fetch/
 * mutation/real data, no self-certification, no prototype relink. Descriptors are sanitized and
 * side-effect-free.
 */

export const AUTHORING_FOUNDATION_ERROR_CODES = [
  'AUTHORING_FOUNDATION_INVALID_UPSTREAM',
  'AUTHORING_FOUNDATION_INVALID_CONTRACT',
  'AUTHORING_FOUNDATION_SESSION_FAILED',
  'AUTHORING_FOUNDATION_FEATURE_GATE_CLOSED',
  'AUTHORING_FOUNDATION_CHECKPOINT_MISSING',
  'AUTHORING_FOUNDATION_CHECKPOINT_INVALID',
  'AUTHORING_FOUNDATION_DRAFT_DESCRIPTOR_UNSAFE',
  'AUTHORING_FOUNDATION_FIELD_DESCRIPTOR_UNSAFE',
  'AUTHORING_FOUNDATION_LAYOUT_DESCRIPTOR_UNSAFE',
  'AUTHORING_FOUNDATION_RELATIONSHIP_DESCRIPTOR_UNSAFE',
  'AUTHORING_FOUNDATION_VALIDATION_ISSUE_UNSAFE',
  'AUTHORING_FOUNDATION_LIFECYCLE_UNSAFE',
  'AUTHORING_FOUNDATION_OPERATION_CATALOG_UNSAFE',
  'AUTHORING_FOUNDATION_INVARIANT_CATALOG_UNSAFE',
  'AUTHORING_FOUNDATION_PREVIEW_HANDOFF_UNSAFE',
  'AUTHORING_FOUNDATION_CERTIFICATION_CANDIDATE_UNSAFE',
  'AUTHORING_FOUNDATION_SSOT_BOUNDARY_UNSAFE',
  'AUTHORING_FOUNDATION_PERMISSION_TENANCY_UNSAFE',
  'AUTHORING_FOUNDATION_MANUAL_GATE_MISSING',
  'AUTHORING_FOUNDATION_SAFETY_UNSAFE',
  'AUTHORING_FOUNDATION_DRAFT_SELF_CERTIFICATION_BLOCKED',
  'AUTHORING_FOUNDATION_DRAFT_OVERWRITE_CERTIFIED_BLOCKED',
  'AUTHORING_FOUNDATION_MODULE_GENERATION_BLOCKED',
  'AUTHORING_FOUNDATION_MODULE_REGISTRATION_BLOCKED',
  'AUTHORING_FOUNDATION_FILE_WRITE_BLOCKED',
  'AUTHORING_FOUNDATION_PUBLISH_BLOCKED',
  'AUTHORING_FOUNDATION_PRODUCT_EXPOSURE_BLOCKED',
  'AUTHORING_FOUNDATION_MENU_EXPOSURE_BLOCKED',
  'AUTHORING_FOUNDATION_ROUTE_EXPOSURE_BLOCKED',
  'AUTHORING_FOUNDATION_APP_TOUCHED_BLOCKED',
  'AUTHORING_FOUNDATION_RUNTIME_IMPLEMENTED_BLOCKED',
  'AUTHORING_FOUNDATION_UI_IMPLEMENTED_BLOCKED',
  'AUTHORING_FOUNDATION_EDITOR_IMPLEMENTED_BLOCKED',
  'AUTHORING_FOUNDATION_PERSISTENCE_BLOCKED',
  'AUTHORING_FOUNDATION_BACKEND_BLOCKED',
  'AUTHORING_FOUNDATION_PRISMA_BLOCKED',
  'AUTHORING_FOUNDATION_MIGRATION_BLOCKED',
  'AUTHORING_FOUNDATION_FETCH_BLOCKED',
  'AUTHORING_FOUNDATION_STORAGE_BLOCKED',
  'AUTHORING_FOUNDATION_MUTATION_BLOCKED',
  'AUTHORING_FOUNDATION_REAL_DATA_READ_BLOCKED',
  'AUTHORING_FOUNDATION_REAL_DATA_WRITE_BLOCKED',
  'AUTHORING_FOUNDATION_REWRITE_EMPRESAS_BLOCKED',
  'AUTHORING_FOUNDATION_PROTOTYPE_RELINK_BLOCKED',
  'AUTHORING_FOUNDATION_PRODUCTION_BLOCKED',
  'AUTHORING_FOUNDATION_STAGING_BLOCKED',
  'AUTHORING_FOUNDATION_FORBIDDEN_LIFECYCLE_STATE',
  'AUTHORING_FOUNDATION_DIGEST_MISMATCH',
  'AUTHORING_FOUNDATION_VERIFIER_FAILED',
  'AUTHORING_FOUNDATION_COMPATIBILITY_BLOCKED',
];

/** Typed error for the authoring foundation contract layer. */
export class AuthoringFoundationError extends Error {
  /**
   * @param {string} code one of AUTHORING_FOUNDATION_ERROR_CODES
   * @param {string} message sanitized message (no secrets)
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'AuthoringFoundationError';
    this.code = AUTHORING_FOUNDATION_ERROR_CODES.includes(code) ? code : 'AUTHORING_FOUNDATION_INVALID_CONTRACT';
    if (meta) this.meta = meta;
  }
}

/**
 * Builds a sanitized, side-effect-free error descriptor. Never contains secrets, JWT, DATABASE_URL,
 * API_URL, stack, or personal data.
 * @param {string} code
 * @param {Object} [options]
 * @returns {Object}
 */
export function createAuthoringFoundationError(code, options = {}) {
  const o = options && typeof options === 'object' ? options : {};
  const known = AUTHORING_FOUNDATION_ERROR_CODES.includes(code);
  return {
    kind: 'authoring-foundation-error',
    code: known ? code : 'AUTHORING_FOUNDATION_INVALID_CONTRACT',
    type: typeof o.type === 'string' ? o.type : 'authoring-foundation',
    message: typeof o.message === 'string' && o.message.length > 0 ? o.message : `Authoring foundation error: ${code}`,
    safe: true,
    sideEffects: false,
    noStackLeak: true,
    withoutSecrets: true,
    draftSelfCertified: false,
    certifiedContractOverwritten: false,
    moduleGenerated: false,
    moduleRegistered: false,
    filesWritten: false,
    published: false,
    productExposed: false,
    backendAccessed: false,
    prismaAccessed: false,
    fetchUsed: false,
    realDataRead: false,
    realDataWrite: false,
    rewriteEmpresas: false,
    prototypeRelinked: false,
  };
}

/**
 * @param {string} code
 * @param {string} message
 * @param {Object} [meta]
 */
export function authoringFoundationError(code, message, meta) {
  return new AuthoringFoundationError(code, message, meta);
}

export default AuthoringFoundationError;
