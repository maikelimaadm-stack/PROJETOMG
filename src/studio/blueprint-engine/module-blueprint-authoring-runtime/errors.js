/**
 * Typed error catalog for the STUDIO MODULE BLUEPRINT AUTHORING RUNTIME.
 *
 * Minimal, headless, in-memory, fail-closed: no persistence, no filesystem, no backend/Prisma/fetch,
 * no module generation, no product exposure, no self-certification. Descriptors are sanitized and
 * side-effect-free.
 */

export const AUTHORING_RUNTIME_ERROR_CODES = [
  'AUTHORING_RUNTIME_INVALID_UPSTREAM',
  'AUTHORING_RUNTIME_INVALID_CONFIG',
  'AUTHORING_RUNTIME_SESSION_FAILED',
  'AUTHORING_RUNTIME_UNKNOWN_OPERATION',
  'AUTHORING_RUNTIME_INVALID_OPERATION_INPUT',
  'AUTHORING_RUNTIME_INVALID_LIFECYCLE_TRANSITION',
  'AUTHORING_RUNTIME_FORBIDDEN_LIFECYCLE_STATE',
  'AUTHORING_RUNTIME_DRAFT_NOT_FOUND',
  'AUTHORING_RUNTIME_DRAFT_DISCARDED',
  'AUTHORING_RUNTIME_LIMIT_MAX_DRAFTS',
  'AUTHORING_RUNTIME_LIMIT_MAX_OPERATIONS',
  'AUTHORING_RUNTIME_LIMIT_MAX_REVISIONS',
  'AUTHORING_RUNTIME_LIMIT_MAX_FIELDS',
  'AUTHORING_RUNTIME_LIMIT_MAX_LAYOUT_SECTIONS',
  'AUTHORING_RUNTIME_LIMIT_MAX_RELATIONSHIPS',
  'AUTHORING_RUNTIME_LIMIT_MAX_VALIDATION_ISSUES',
  'AUTHORING_RUNTIME_LIMIT_MAX_STRING_LENGTH',
  'AUTHORING_RUNTIME_LIMIT_MAX_SERIALIZED_SNAPSHOT_BYTES',
  'AUTHORING_RUNTIME_VALIDATION_BLOCKED',
  'AUTHORING_RUNTIME_PREVIEW_REQUIRES_VALIDATED_DRAFT',
  'AUTHORING_RUNTIME_CANDIDATE_REQUIRES_VALIDATED_DRAFT',
  'AUTHORING_RUNTIME_SELF_CERTIFICATION_BLOCKED',
  'AUTHORING_RUNTIME_OVERWRITE_CERTIFIED_BLOCKED',
  'AUTHORING_RUNTIME_MODULE_GENERATION_BLOCKED',
  'AUTHORING_RUNTIME_MODULE_REGISTRATION_BLOCKED',
  'AUTHORING_RUNTIME_FILE_WRITE_BLOCKED',
  'AUTHORING_RUNTIME_PUBLISH_BLOCKED',
  'AUTHORING_RUNTIME_PRODUCT_EXPOSURE_BLOCKED',
  'AUTHORING_RUNTIME_PERSISTENCE_BLOCKED',
  'AUTHORING_RUNTIME_STORAGE_BLOCKED',
  'AUTHORING_RUNTIME_BACKEND_BLOCKED',
  'AUTHORING_RUNTIME_PRISMA_BLOCKED',
  'AUTHORING_RUNTIME_FETCH_BLOCKED',
  'AUTHORING_RUNTIME_NETWORK_BLOCKED',
  'AUTHORING_RUNTIME_MUTATION_BLOCKED',
  'AUTHORING_RUNTIME_REAL_DATA_READ_BLOCKED',
  'AUTHORING_RUNTIME_REAL_DATA_WRITE_BLOCKED',
  'AUTHORING_RUNTIME_REWRITE_EMPRESAS_BLOCKED',
  'AUTHORING_RUNTIME_PROTOTYPE_RELINK_BLOCKED',
  'AUTHORING_RUNTIME_PRODUCTION_BLOCKED',
  'AUTHORING_RUNTIME_STAGING_BLOCKED',
  'AUTHORING_RUNTIME_PERMISSION_MODEL_INTEGRATED_BLOCKED',
  'AUTHORING_RUNTIME_TENANT_MODEL_INTEGRATED_BLOCKED',
  'AUTHORING_RUNTIME_NONDETERMINISM_BLOCKED',
  'AUTHORING_RUNTIME_INPUT_MUTATION_BLOCKED',
  'AUTHORING_RUNTIME_REVISION_REGRESSION_BLOCKED',
  'AUTHORING_RUNTIME_DIGEST_MISMATCH',
  'AUTHORING_RUNTIME_VERIFIER_FAILED',
  'AUTHORING_RUNTIME_COMPATIBILITY_BLOCKED',
];

/** Typed error for the authoring runtime layer. */
export class AuthoringRuntimeError extends Error {
  /**
   * @param {string} code one of AUTHORING_RUNTIME_ERROR_CODES
   * @param {string} message sanitized message (no secrets)
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'AuthoringRuntimeError';
    this.code = AUTHORING_RUNTIME_ERROR_CODES.includes(code) ? code : 'AUTHORING_RUNTIME_INVALID_CONFIG';
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
export function createAuthoringRuntimeError(code, options = {}) {
  const o = options && typeof options === 'object' ? options : {};
  const known = AUTHORING_RUNTIME_ERROR_CODES.includes(code);
  return {
    kind: 'authoring-runtime-error',
    code: known ? code : 'AUTHORING_RUNTIME_INVALID_CONFIG',
    type: typeof o.type === 'string' ? o.type : 'authoring-runtime',
    message: typeof o.message === 'string' && o.message.length > 0 ? o.message : `Authoring runtime error: ${code}`,
    safe: true,
    sideEffects: false,
    noStackLeak: true,
    withoutSecrets: true,
    certificationPerformed: false,
    certifiedContractOverwritten: false,
    moduleGenerated: false,
    filesWritten: false,
    published: false,
    productExposed: false,
    persistenceUsed: false,
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
export function authoringRuntimeError(code, message, meta) {
  return new AuthoringRuntimeError(code, message, meta);
}

export default AuthoringRuntimeError;
