/**
 * Typed error catalog for the STUDIO DEV PREVIEW RUNTIME UI IMPLEMENTATION PLAN.
 *
 * Headless, contract-only and PLAN-ONLY: no UI, no React component, no JSX/TSX, no DOM, no
 * runtime CSS, no route/placement, no module generation, no file write under src/modules, no
 * backend/Prisma/migration/fetch, production/staging, mutation, persistence, real data
 * read/write, or rewrite of Empresas. Descriptors are sanitized and side-effect-free.
 */

export const RUNTIME_UI_IMPLEMENTATION_PLAN_ERROR_CODES = [
  'RUNTIME_UI_IMPLEMENTATION_PLAN_INVALID_RUNTIME_UI_CONTRACT',
  'RUNTIME_UI_IMPLEMENTATION_PLAN_INVALID_ISOLATED_RUNTIME',
  'RUNTIME_UI_IMPLEMENTATION_PLAN_INVALID_VIRTUAL_FRAME',
  'RUNTIME_UI_IMPLEMENTATION_PLAN_SESSION_FAILED',
  'RUNTIME_UI_IMPLEMENTATION_PLAN_PHASE_UNSAFE',
  'RUNTIME_UI_IMPLEMENTATION_PLAN_BOUNDARY_UNSAFE',
  'RUNTIME_UI_IMPLEMENTATION_PLAN_DEV_ONLY_POLICY_UNSAFE',
  'RUNTIME_UI_IMPLEMENTATION_PLAN_PIPELINE_UNSAFE',
  'RUNTIME_UI_IMPLEMENTATION_PLAN_RENDERER_ADAPTER_UNSAFE',
  'RUNTIME_UI_IMPLEMENTATION_PLAN_COMPONENT_ADAPTER_UNSAFE',
  'RUNTIME_UI_IMPLEMENTATION_PLAN_INTERACTION_ADAPTER_UNSAFE',
  'RUNTIME_UI_IMPLEMENTATION_PLAN_STATE_ADAPTER_UNSAFE',
  'RUNTIME_UI_IMPLEMENTATION_PLAN_THEME_ADAPTER_UNSAFE',
  'RUNTIME_UI_IMPLEMENTATION_PLAN_ACCESSIBILITY_ADAPTER_UNSAFE',
  'RUNTIME_UI_IMPLEMENTATION_PLAN_BLOCKED_ACTION_UNSAFE',
  'RUNTIME_UI_IMPLEMENTATION_PLAN_TEST_HARNESS_UNSAFE',
  'RUNTIME_UI_IMPLEMENTATION_PLAN_MANUAL_GATE_MISSING',
  'RUNTIME_UI_IMPLEMENTATION_PLAN_ROLLOUT_UNSAFE',
  'RUNTIME_UI_IMPLEMENTATION_PLAN_OBSERVABILITY_UNSAFE',
  'RUNTIME_UI_IMPLEMENTATION_PLAN_SAFETY_UNSAFE',
  'RUNTIME_UI_IMPLEMENTATION_PLAN_DIGEST_MISMATCH',
  'RUNTIME_UI_IMPLEMENTATION_PLAN_VERIFIER_FAILED',
  'RUNTIME_UI_IMPLEMENTATION_PLAN_COMPATIBILITY_BLOCKED',
  'RUNTIME_UI_IMPLEMENTATION_PLAN_REACT_BLOCKED',
  'RUNTIME_UI_IMPLEMENTATION_PLAN_JSX_BLOCKED',
  'RUNTIME_UI_IMPLEMENTATION_PLAN_TSX_BLOCKED',
  'RUNTIME_UI_IMPLEMENTATION_PLAN_DOM_BLOCKED',
  'RUNTIME_UI_IMPLEMENTATION_PLAN_CSS_RUNTIME_BLOCKED',
  'RUNTIME_UI_IMPLEMENTATION_PLAN_UI_BLOCKED',
  'RUNTIME_UI_IMPLEMENTATION_PLAN_ROUTE_BLOCKED',
  'RUNTIME_UI_IMPLEMENTATION_PLAN_PLACEMENT_BLOCKED',
  'RUNTIME_UI_IMPLEMENTATION_PLAN_MODULE_GENERATION_BLOCKED',
  'RUNTIME_UI_IMPLEMENTATION_PLAN_MODULE_REGISTRATION_BLOCKED',
  'RUNTIME_UI_IMPLEMENTATION_PLAN_RUNTIME_UI_IMPLEMENTED_BLOCKED',
  'RUNTIME_UI_IMPLEMENTATION_PLAN_BACKEND_BLOCKED',
  'RUNTIME_UI_IMPLEMENTATION_PLAN_PRISMA_BLOCKED',
  'RUNTIME_UI_IMPLEMENTATION_PLAN_MIGRATION_BLOCKED',
  'RUNTIME_UI_IMPLEMENTATION_PLAN_PRODUCTION_BLOCKED',
  'RUNTIME_UI_IMPLEMENTATION_PLAN_STAGING_BLOCKED',
  'RUNTIME_UI_IMPLEMENTATION_PLAN_FETCH_BLOCKED',
  'RUNTIME_UI_IMPLEMENTATION_PLAN_MUTATION_BLOCKED',
  'RUNTIME_UI_IMPLEMENTATION_PLAN_PERSISTENCE_BLOCKED',
  'RUNTIME_UI_IMPLEMENTATION_PLAN_REAL_DATA_READ_BLOCKED',
  'RUNTIME_UI_IMPLEMENTATION_PLAN_REAL_DATA_WRITE_BLOCKED',
  'RUNTIME_UI_IMPLEMENTATION_PLAN_REWRITE_EMPRESAS_BLOCKED',
];

/** Typed error for the runtime UI implementation plan layer. */
export class RuntimeUiImplementationPlanError extends Error {
  /**
   * @param {string} code one of RUNTIME_UI_IMPLEMENTATION_PLAN_ERROR_CODES
   * @param {string} message sanitized message (no secrets)
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'RuntimeUiImplementationPlanError';
    this.code = RUNTIME_UI_IMPLEMENTATION_PLAN_ERROR_CODES.includes(code) ? code : 'RUNTIME_UI_IMPLEMENTATION_PLAN_INVALID_RUNTIME_UI_CONTRACT';
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
export function createRuntimeUiImplementationPlanError(code, options = {}) {
  const o = options && typeof options === 'object' ? options : {};
  const known = RUNTIME_UI_IMPLEMENTATION_PLAN_ERROR_CODES.includes(code);
  return {
    kind: 'runtime-ui-implementation-plan-error',
    code: known ? code : 'RUNTIME_UI_IMPLEMENTATION_PLAN_INVALID_RUNTIME_UI_CONTRACT',
    type: typeof o.type === 'string' ? o.type : 'runtime-ui-implementation-plan',
    message: typeof o.message === 'string' && o.message.length > 0 ? o.message : `Runtime UI implementation plan error: ${code}`,
    safe: true,
    sideEffects: false,
    noStackLeak: true,
    withoutSecrets: true,
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
    runtimeUiImplemented: false,
    visualRuntimeImplemented: false,
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
export function runtimeUiImplementationPlanError(code, message, meta) {
  return new RuntimeUiImplementationPlanError(code, message, meta);
}

export default RuntimeUiImplementationPlanError;
