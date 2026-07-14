/**
 * Typed error catalog for the STUDIO DEV PREVIEW ISOLATED RUNTIME IMPLEMENTATION PLAN.
 *
 * Headless and contract-only: no runtime implemented, no React component, no JSX/TSX, no DOM,
 * no runtime CSS, no UI, no route/menu, no module generation, no file write under src/modules,
 * no backend/Prisma/migration/fetch, production/staging, mutation, persistence, or rewrite of
 * Empresas. Descriptors are sanitized and side-effect-free.
 */

export const IMPLEMENTATION_PLAN_ERROR_CODES = [
  'IMPLEMENTATION_PLAN_INVALID_RUNTIME_SHELL_CONTRACT',
  'IMPLEMENTATION_PLAN_INVALID_VISUAL_CONTRACT',
  'IMPLEMENTATION_PLAN_INVALID_BRIDGE',
  'IMPLEMENTATION_PLAN_INVALID_SANDBOX',
  'IMPLEMENTATION_PLAN_INVALID_ENGINE',
  'IMPLEMENTATION_PLAN_SESSION_FAILED',
  'IMPLEMENTATION_PLAN_PHASES_UNSAFE',
  'IMPLEMENTATION_PLAN_ISOLATION_UNSAFE',
  'IMPLEMENTATION_PLAN_EXECUTION_POLICY_UNSAFE',
  'IMPLEMENTATION_PLAN_ADAPTER_UNSAFE',
  'IMPLEMENTATION_PLAN_RENDER_PIPELINE_UNSAFE',
  'IMPLEMENTATION_PLAN_LIFECYCLE_UNSAFE',
  'IMPLEMENTATION_PLAN_EVENT_UNSAFE',
  'IMPLEMENTATION_PLAN_DATA_ACCESS_UNSAFE',
  'IMPLEMENTATION_PLAN_PERMISSION_UNSAFE',
  'IMPLEMENTATION_PLAN_TEST_HARNESS_UNSAFE',
  'IMPLEMENTATION_PLAN_ROLLOUT_UNSAFE',
  'IMPLEMENTATION_PLAN_OBSERVABILITY_UNSAFE',
  'IMPLEMENTATION_PLAN_ROUTE_MENU_EXPOSED',
  'IMPLEMENTATION_PLAN_SAFETY_UNSAFE',
  'IMPLEMENTATION_PLAN_DIGEST_MISMATCH',
  'IMPLEMENTATION_PLAN_VERIFIER_FAILED',
  'IMPLEMENTATION_PLAN_COMPATIBILITY_BLOCKED',
  'IMPLEMENTATION_PLAN_RUNTIME_IMPLEMENTED_BLOCKED',
  'IMPLEMENTATION_PLAN_REACT_COMPONENT_BLOCKED',
  'IMPLEMENTATION_PLAN_JSX_BLOCKED',
  'IMPLEMENTATION_PLAN_TSX_BLOCKED',
  'IMPLEMENTATION_PLAN_DOM_BLOCKED',
  'IMPLEMENTATION_PLAN_CSS_RUNTIME_BLOCKED',
  'IMPLEMENTATION_PLAN_UI_BLOCKED',
  'IMPLEMENTATION_PLAN_MODULE_GENERATION_BLOCKED',
  'IMPLEMENTATION_PLAN_FILE_WRITE_BLOCKED',
  'IMPLEMENTATION_PLAN_ROUTE_BLOCKED',
  'IMPLEMENTATION_PLAN_MENU_BLOCKED',
  'IMPLEMENTATION_PLAN_MODULE_REGISTRATION_BLOCKED',
  'IMPLEMENTATION_PLAN_BACKEND_BLOCKED',
  'IMPLEMENTATION_PLAN_PRISMA_BLOCKED',
  'IMPLEMENTATION_PLAN_MIGRATION_BLOCKED',
  'IMPLEMENTATION_PLAN_PRODUCTION_BLOCKED',
  'IMPLEMENTATION_PLAN_STAGING_BLOCKED',
  'IMPLEMENTATION_PLAN_FETCH_BLOCKED',
  'IMPLEMENTATION_PLAN_MUTATION_BLOCKED',
  'IMPLEMENTATION_PLAN_PERSISTENCE_BLOCKED',
  'IMPLEMENTATION_PLAN_REAL_DATA_READ_BLOCKED',
  'IMPLEMENTATION_PLAN_REAL_DATA_WRITE_BLOCKED',
  'IMPLEMENTATION_PLAN_ROLLOUT_ALLOWED_BLOCKED',
  'IMPLEMENTATION_PLAN_MANUAL_GATE_MISSING',
  'IMPLEMENTATION_PLAN_REWRITE_EMPRESAS_BLOCKED',
];

/** Typed error for the isolated runtime implementation plan layer. */
export class IsolatedRuntimeImplementationPlanError extends Error {
  /**
   * @param {string} code one of IMPLEMENTATION_PLAN_ERROR_CODES
   * @param {string} message sanitized message (no secrets)
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'IsolatedRuntimeImplementationPlanError';
    this.code = IMPLEMENTATION_PLAN_ERROR_CODES.includes(code) ? code : 'IMPLEMENTATION_PLAN_INVALID_RUNTIME_SHELL_CONTRACT';
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
export function createIsolatedRuntimeImplementationPlanError(code, options = {}) {
  const o = options && typeof options === 'object' ? options : {};
  const known = IMPLEMENTATION_PLAN_ERROR_CODES.includes(code);
  return {
    kind: 'isolated-runtime-implementation-plan-error',
    code: known ? code : 'IMPLEMENTATION_PLAN_INVALID_RUNTIME_SHELL_CONTRACT',
    type: typeof o.type === 'string' ? o.type : 'isolated-runtime-implementation-plan',
    message: typeof o.message === 'string' && o.message.length > 0 ? o.message : `Isolated runtime implementation plan error: ${code}`,
    safe: true,
    sideEffects: false,
    noSecrets: true,
    noStackLeak: true,
    runtimeImplemented: false,
    reactComponentCreated: false,
    jsxCreated: false,
    tsxCreated: false,
    domCreated: false,
    cssCreated: false,
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
    realDataRead: false,
    realDataWrite: false,
    rewriteEmpresas: false,
  };
}

/**
 * @param {string} code
 * @param {string} message
 * @param {Object} [meta]
 */
export function isolatedRuntimeImplementationPlanError(code, message, meta) {
  return new IsolatedRuntimeImplementationPlanError(code, message, meta);
}

export default IsolatedRuntimeImplementationPlanError;
