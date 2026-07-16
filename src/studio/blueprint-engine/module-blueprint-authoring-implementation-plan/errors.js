/**
 * Typed error catalog for the STUDIO MODULE BLUEPRINT AUTHORING IMPLEMENTATION PLAN.
 *
 * Minimal, headless, plan-only, fail-closed: no authoring runtime, no UI, no editor, no persistence,
 * no module generation, no product exposure, no backend/Prisma/fetch/mutation/real data, no
 * self-certification, no prototype relink. Descriptors are sanitized and side-effect-free.
 */

export const AUTHORING_IMPLEMENTATION_PLAN_ERROR_CODES = [
  'AUTHORING_PLAN_INVALID_FOUNDATION_CONTRACT',
  'AUTHORING_PLAN_INVALID_PLAN',
  'AUTHORING_PLAN_SESSION_FAILED',
  'AUTHORING_PLAN_FEATURE_GATE_CLOSED',
  'AUTHORING_PLAN_CHECKPOINT_MISSING',
  'AUTHORING_PLAN_CHECKPOINT_INVALID',
  'AUTHORING_PLAN_PHASE_UNSAFE',
  'AUTHORING_PLAN_PHASE_IMPLEMENTED_BLOCKED',
  'AUTHORING_PLAN_DRAFT_RUNTIME_UNSAFE',
  'AUTHORING_PLAN_LIFECYCLE_RUNTIME_UNSAFE',
  'AUTHORING_PLAN_OPERATION_EXECUTOR_UNSAFE',
  'AUTHORING_PLAN_REVISION_ENGINE_UNSAFE',
  'AUTHORING_PLAN_VALIDATION_PIPELINE_UNSAFE',
  'AUTHORING_PLAN_INVARIANT_ENFORCEMENT_UNSAFE',
  'AUTHORING_PLAN_PREVIEW_HANDOFF_UNSAFE',
  'AUTHORING_PLAN_CERTIFICATION_CANDIDATE_UNSAFE',
  'AUTHORING_PLAN_SSOT_PROTECTION_UNSAFE',
  'AUTHORING_PLAN_PERMISSION_TENANCY_UNSAFE',
  'AUTHORING_PLAN_MANUAL_GATE_MISSING',
  'AUTHORING_PLAN_SAFETY_UNSAFE',
  'AUTHORING_PLAN_DRAFT_SELF_CERTIFICATION_BLOCKED',
  'AUTHORING_PLAN_DRAFT_OVERWRITE_CERTIFIED_BLOCKED',
  'AUTHORING_PLAN_AUTHORING_RUNTIME_IMPLEMENTED_BLOCKED',
  'AUTHORING_PLAN_AUTHORING_UI_IMPLEMENTED_BLOCKED',
  'AUTHORING_PLAN_EDITOR_IMPLEMENTED_BLOCKED',
  'AUTHORING_PLAN_MODULE_GENERATION_BLOCKED',
  'AUTHORING_PLAN_MODULE_REGISTRATION_BLOCKED',
  'AUTHORING_PLAN_FILE_WRITE_BLOCKED',
  'AUTHORING_PLAN_PUBLISH_BLOCKED',
  'AUTHORING_PLAN_PRODUCT_EXPOSURE_BLOCKED',
  'AUTHORING_PLAN_MENU_EXPOSURE_BLOCKED',
  'AUTHORING_PLAN_ROUTE_EXPOSURE_BLOCKED',
  'AUTHORING_PLAN_APP_TOUCHED_BLOCKED',
  'AUTHORING_PLAN_PERSISTENCE_BLOCKED',
  'AUTHORING_PLAN_BACKEND_BLOCKED',
  'AUTHORING_PLAN_PRISMA_BLOCKED',
  'AUTHORING_PLAN_MIGRATION_BLOCKED',
  'AUTHORING_PLAN_FETCH_BLOCKED',
  'AUTHORING_PLAN_STORAGE_BLOCKED',
  'AUTHORING_PLAN_MUTATION_BLOCKED',
  'AUTHORING_PLAN_REAL_DATA_READ_BLOCKED',
  'AUTHORING_PLAN_REAL_DATA_WRITE_BLOCKED',
  'AUTHORING_PLAN_REWRITE_EMPRESAS_BLOCKED',
  'AUTHORING_PLAN_PROTOTYPE_RELINK_BLOCKED',
  'AUTHORING_PLAN_PRODUCTION_BLOCKED',
  'AUTHORING_PLAN_STAGING_BLOCKED',
  'AUTHORING_PLAN_FORBIDDEN_LIFECYCLE_STATE',
  'AUTHORING_PLAN_PERMISSION_MODEL_INTEGRATED_BLOCKED',
  'AUTHORING_PLAN_TENANT_MODEL_INTEGRATED_BLOCKED',
  'AUTHORING_PLAN_DIGEST_MISMATCH',
  'AUTHORING_PLAN_VERIFIER_FAILED',
  'AUTHORING_PLAN_COMPATIBILITY_BLOCKED',
];

/** Typed error for the authoring implementation plan layer. */
export class AuthoringImplementationPlanError extends Error {
  /**
   * @param {string} code one of AUTHORING_IMPLEMENTATION_PLAN_ERROR_CODES
   * @param {string} message sanitized message (no secrets)
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'AuthoringImplementationPlanError';
    this.code = AUTHORING_IMPLEMENTATION_PLAN_ERROR_CODES.includes(code) ? code : 'AUTHORING_PLAN_INVALID_PLAN';
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
export function createAuthoringImplementationPlanError(code, options = {}) {
  const o = options && typeof options === 'object' ? options : {};
  const known = AUTHORING_IMPLEMENTATION_PLAN_ERROR_CODES.includes(code);
  return {
    kind: 'authoring-implementation-plan-error',
    code: known ? code : 'AUTHORING_PLAN_INVALID_PLAN',
    type: typeof o.type === 'string' ? o.type : 'authoring-implementation-plan',
    message: typeof o.message === 'string' && o.message.length > 0 ? o.message : `Authoring implementation plan error: ${code}`,
    safe: true,
    sideEffects: false,
    noStackLeak: true,
    withoutSecrets: true,
    authoringRuntimeImplemented: false,
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
export function authoringImplementationPlanError(code, message, meta) {
  return new AuthoringImplementationPlanError(code, message, meta);
}

export default AuthoringImplementationPlanError;
