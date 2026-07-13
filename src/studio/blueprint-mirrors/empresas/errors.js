/**
 * Typed error catalog for the EMPRESAS CERTIFIED BLUEPRINT MIRROR & ALIGNMENT AUDIT.
 *
 * Headless and audit/mirror-only: no UI, route, menu, module registration, backend/
 * Prisma/migration/fetch, production/staging, mutation, or rewrite of Empresas.
 * Descriptors are sanitized and side-effect-free.
 */

export const EMPRESAS_MIRROR_ERROR_CODES = [
  'EMPRESAS_BLUEPRINT_MIRROR_INVALID_SOURCE',
  'EMPRESAS_BLUEPRINT_MIRROR_INVALID_STUDIO_CONTRACT',
  'EMPRESAS_BLUEPRINT_MIRROR_FIELD_MAPPING_FAILED',
  'EMPRESAS_BLUEPRINT_MIRROR_SCREEN_MAPPING_FAILED',
  'EMPRESAS_BLUEPRINT_MIRROR_PERMISSION_UNSAFE',
  'EMPRESAS_BLUEPRINT_MIRROR_TENANT_UNSAFE',
  'EMPRESAS_BLUEPRINT_MIRROR_PERSISTENCE_UNSAFE',
  'EMPRESAS_BLUEPRINT_MIRROR_RUNTIME_BINDING_UNSAFE',
  'EMPRESAS_BLUEPRINT_MIRROR_DIGEST_MISMATCH',
  'EMPRESAS_BLUEPRINT_MIRROR_VERIFIER_FAILED',
  'EMPRESAS_BLUEPRINT_MIRROR_COMPATIBILITY_BLOCKED',
  'EMPRESAS_BLUEPRINT_MIRROR_UI_BLOCKED',
  'EMPRESAS_BLUEPRINT_MIRROR_ROUTE_BLOCKED',
  'EMPRESAS_BLUEPRINT_MIRROR_MENU_BLOCKED',
  'EMPRESAS_BLUEPRINT_MIRROR_MODULE_REGISTRATION_BLOCKED',
  'EMPRESAS_BLUEPRINT_MIRROR_BACKEND_BLOCKED',
  'EMPRESAS_BLUEPRINT_MIRROR_PRISMA_BLOCKED',
  'EMPRESAS_BLUEPRINT_MIRROR_MIGRATION_BLOCKED',
  'EMPRESAS_BLUEPRINT_MIRROR_PRODUCTION_BLOCKED',
  'EMPRESAS_BLUEPRINT_MIRROR_STAGING_BLOCKED',
  'EMPRESAS_BLUEPRINT_MIRROR_FETCH_BLOCKED',
  'EMPRESAS_BLUEPRINT_MIRROR_MUTATION_BLOCKED',
  'EMPRESAS_BLUEPRINT_MIRROR_REWRITE_EMPRESAS_BLOCKED',
];

/** Typed error for the Empresas blueprint mirror layer. */
export class EmpresasBlueprintMirrorError extends Error {
  /**
   * @param {string} code one of EMPRESAS_MIRROR_ERROR_CODES
   * @param {string} message sanitized message (no secrets)
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'EmpresasBlueprintMirrorError';
    this.code = EMPRESAS_MIRROR_ERROR_CODES.includes(code) ? code : 'EMPRESAS_BLUEPRINT_MIRROR_INVALID_SOURCE';
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
export function createEmpresasMirrorError(code, options = {}) {
  const o = options && typeof options === 'object' ? options : {};
  const known = EMPRESAS_MIRROR_ERROR_CODES.includes(code);
  return {
    kind: 'empresas-blueprint-mirror-error',
    code: known ? code : 'EMPRESAS_BLUEPRINT_MIRROR_INVALID_SOURCE',
    type: typeof o.type === 'string' ? o.type : 'mirror',
    message: typeof o.message === 'string' && o.message.length > 0 ? o.message : `Empresas mirror error: ${code}`,
    safe: true,
    sideEffects: false,
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
export function empresasBlueprintMirrorError(code, message, meta) {
  return new EmpresasBlueprintMirrorError(code, message, meta);
}

export default EmpresasBlueprintMirrorError;
