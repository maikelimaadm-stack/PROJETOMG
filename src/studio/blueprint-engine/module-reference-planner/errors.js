/**
 * Typed error catalog for the STUDIO BLUEPRINT MODULE REFERENCE PLANNER.
 *
 * Headless and contract-only: no module generation, no file write under src/modules, no
 * UI, route, menu, module registration, backend/Prisma/migration/fetch, production/
 * staging, mutation, persistence, or rewrite of Empresas. Descriptors are sanitized and
 * side-effect-free.
 */

export const MODULE_REFERENCE_PLANNER_ERROR_CODES = [
  'MODULE_REFERENCE_PLANNER_INVALID_ENGINE_OUTPUT',
  'MODULE_REFERENCE_PLANNER_INVALID_BLUEPRINT_CONTRACT',
  'MODULE_REFERENCE_PLANNER_INVALID_SOURCE_BLUEPRINT',
  'MODULE_REFERENCE_PLANNER_IDENTITY_FAILED',
  'MODULE_REFERENCE_PLANNER_FILE_PLAN_UNSAFE',
  'MODULE_REFERENCE_PLANNER_SCREEN_PLAN_UNSAFE',
  'MODULE_REFERENCE_PLANNER_FIELD_FORM_UNSAFE',
  'MODULE_REFERENCE_PLANNER_PERMISSION_UNSAFE',
  'MODULE_REFERENCE_PLANNER_TENANT_UNSAFE',
  'MODULE_REFERENCE_PLANNER_ROUTE_MENU_EXPOSED',
  'MODULE_REFERENCE_PLANNER_PERSISTENCE_UNSAFE',
  'MODULE_REFERENCE_PLANNER_RUNTIME_BINDING_UNSAFE',
  'MODULE_REFERENCE_PLANNER_TEST_GATE_PLAN_FAILED',
  'MODULE_REFERENCE_PLANNER_EVIDENCE_PLAN_FAILED',
  'MODULE_REFERENCE_PLANNER_RISK_PLAN_FAILED',
  'MODULE_REFERENCE_PLANNER_DIGEST_MISMATCH',
  'MODULE_REFERENCE_PLANNER_VERIFIER_FAILED',
  'MODULE_REFERENCE_PLANNER_COMPATIBILITY_BLOCKED',
  'MODULE_REFERENCE_PLANNER_MODULE_GENERATION_BLOCKED',
  'MODULE_REFERENCE_PLANNER_FILE_WRITE_BLOCKED',
  'MODULE_REFERENCE_PLANNER_ROUTE_BLOCKED',
  'MODULE_REFERENCE_PLANNER_MENU_BLOCKED',
  'MODULE_REFERENCE_PLANNER_MODULE_REGISTRATION_BLOCKED',
  'MODULE_REFERENCE_PLANNER_BACKEND_BLOCKED',
  'MODULE_REFERENCE_PLANNER_PRISMA_BLOCKED',
  'MODULE_REFERENCE_PLANNER_MIGRATION_BLOCKED',
  'MODULE_REFERENCE_PLANNER_PRODUCTION_BLOCKED',
  'MODULE_REFERENCE_PLANNER_STAGING_BLOCKED',
  'MODULE_REFERENCE_PLANNER_FETCH_BLOCKED',
  'MODULE_REFERENCE_PLANNER_MUTATION_BLOCKED',
  'MODULE_REFERENCE_PLANNER_REWRITE_EMPRESAS_BLOCKED',
];

/** Typed error for the module reference planner layer. */
export class ModuleReferencePlannerError extends Error {
  /**
   * @param {string} code one of MODULE_REFERENCE_PLANNER_ERROR_CODES
   * @param {string} message sanitized message (no secrets)
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'ModuleReferencePlannerError';
    this.code = MODULE_REFERENCE_PLANNER_ERROR_CODES.includes(code) ? code : 'MODULE_REFERENCE_PLANNER_INVALID_ENGINE_OUTPUT';
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
export function createModuleReferencePlannerError(code, options = {}) {
  const o = options && typeof options === 'object' ? options : {};
  const known = MODULE_REFERENCE_PLANNER_ERROR_CODES.includes(code);
  return {
    kind: 'module-reference-planner-error',
    code: known ? code : 'MODULE_REFERENCE_PLANNER_INVALID_ENGINE_OUTPUT',
    type: typeof o.type === 'string' ? o.type : 'planner',
    message: typeof o.message === 'string' && o.message.length > 0 ? o.message : `Module reference planner error: ${code}`,
    safe: true,
    sideEffects: false,
    moduleGenerated: false,
    filesWrittenToModule: false,
    routeCreated: false,
    menuCreated: false,
    moduleRegistered: false,
    backendAccessed: false,
    prismaAccessed: false,
    migrationExecuted: false,
    productionAccessed: false,
    stagingAccessed: false,
    mutationExecuted: false,
    fetchUsed: false,
    rewriteEmpresas: false,
  };
}

/**
 * @param {string} code
 * @param {string} message
 * @param {Object} [meta]
 */
export function moduleReferencePlannerError(code, message, meta) {
  return new ModuleReferencePlannerError(code, message, meta);
}

export default ModuleReferencePlannerError;
