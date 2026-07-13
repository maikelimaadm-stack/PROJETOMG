/**
 * Typed error catalog for EMPRESAS STUDIO COMPATIBILITY SLICE 1 — CONTRACT-ONLY.
 *
 * Headless and contract-only: no Empresas code change, no UI, route, menu, module
 * registration, backend/Prisma/migration/fetch, production/staging, mutation, or
 * rewrite of Empresas. Descriptors are sanitized and side-effect-free.
 */

export const EMPRESAS_COMPAT_SLICE1_ERROR_CODES = [
  'EMPRESAS_COMPAT_SLICE1_INVALID_MIRROR',
  'EMPRESAS_COMPAT_SLICE1_INVALID_STUDIO_CONTRACT',
  'EMPRESAS_COMPAT_SLICE1_INVALID_EMPRESAS_CONTRACT',
  'EMPRESAS_COMPAT_SLICE1_GAP_REGISTRY_FAILED',
  'EMPRESAS_COMPAT_SLICE1_UNTRACKED_CRITICAL_GAP',
  'EMPRESAS_COMPAT_SLICE1_DETAIL_PLAN_FAILED',
  'EMPRESAS_COMPAT_SLICE1_STATE_PLAN_FAILED',
  'EMPRESAS_COMPAT_SLICE1_WRITE_CAPABILITY_UNSAFE',
  'EMPRESAS_COMPAT_SLICE1_PERSISTENCE_BRIDGE_UNSAFE',
  'EMPRESAS_COMPAT_SLICE1_BACKEND_PRISMA_UNSAFE',
  'EMPRESAS_COMPAT_SLICE1_PREFERENCES_LAYOUT_UNSAFE',
  'EMPRESAS_COMPAT_SLICE1_DIGEST_MISMATCH',
  'EMPRESAS_COMPAT_SLICE1_VERIFIER_FAILED',
  'EMPRESAS_COMPAT_SLICE1_COMPATIBILITY_BLOCKED',
  'EMPRESAS_COMPAT_SLICE1_EMPRESAS_CODE_CHANGE_BLOCKED',
  'EMPRESAS_COMPAT_SLICE1_UI_BLOCKED',
  'EMPRESAS_COMPAT_SLICE1_ROUTE_BLOCKED',
  'EMPRESAS_COMPAT_SLICE1_MENU_BLOCKED',
  'EMPRESAS_COMPAT_SLICE1_BACKEND_BLOCKED',
  'EMPRESAS_COMPAT_SLICE1_PRISMA_BLOCKED',
  'EMPRESAS_COMPAT_SLICE1_MIGRATION_BLOCKED',
  'EMPRESAS_COMPAT_SLICE1_PRODUCTION_BLOCKED',
  'EMPRESAS_COMPAT_SLICE1_STAGING_BLOCKED',
  'EMPRESAS_COMPAT_SLICE1_FETCH_BLOCKED',
  'EMPRESAS_COMPAT_SLICE1_MUTATION_BLOCKED',
  'EMPRESAS_COMPAT_SLICE1_REWRITE_EMPRESAS_BLOCKED',
];

/** Typed error for the Empresas Studio compatibility slice 1 layer. */
export class EmpresasCompatSlice1Error extends Error {
  /**
   * @param {string} code one of EMPRESAS_COMPAT_SLICE1_ERROR_CODES
   * @param {string} message sanitized message (no secrets)
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'EmpresasCompatSlice1Error';
    this.code = EMPRESAS_COMPAT_SLICE1_ERROR_CODES.includes(code) ? code : 'EMPRESAS_COMPAT_SLICE1_INVALID_MIRROR';
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
export function createEmpresasCompatSlice1Error(code, options = {}) {
  const o = options && typeof options === 'object' ? options : {};
  const known = EMPRESAS_COMPAT_SLICE1_ERROR_CODES.includes(code);
  return {
    kind: 'empresas-compat-slice1-error',
    code: known ? code : 'EMPRESAS_COMPAT_SLICE1_INVALID_MIRROR',
    type: typeof o.type === 'string' ? o.type : 'compatibility',
    message: typeof o.message === 'string' && o.message.length > 0 ? o.message : `Empresas compat slice1 error: ${code}`,
    safe: true,
    sideEffects: false,
    empresasCodeChanged: false,
    uiCreated: false,
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
export function empresasCompatSlice1Error(code, message, meta) {
  return new EmpresasCompatSlice1Error(code, message, meta);
}

export default EmpresasCompatSlice1Error;
