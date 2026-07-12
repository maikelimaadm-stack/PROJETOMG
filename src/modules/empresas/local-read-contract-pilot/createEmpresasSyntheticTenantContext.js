import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { EMPRESAS_LOCAL_READ_ENVIRONMENT } from './empresasLocalReadContractConfig.js';

/**
 * Builds a SYNTHETIC tenant/permission context. Never a real JWT — no signing, no
 * secret. `tokenClaims` are plain fictional claims for fail-closed testing only.
 *
 * Supported presets:
 * - 'A' / 'B'        → valid read context for the synthetic tenant
 * - 'noPermission'   → tenant present but lacks `empresas.read`
 * - 'noHeader'       → missing empresaHeader → fail closed
 * - 'invalidHeader'  → header not matching any tenant → fail closed
 * - 'tenantMismatch' → header/tenant disagree → fail closed
 * - 'expiredToken'   → synthetic expired claims → fail closed
 * - 'noScope'        → token without scope → fail closed
 *
 * @param {Object} [options]
 * @param {string} [options.preset]
 * @param {Object} [options.overrides]
 * @returns {Object} tenant context descriptor
 */
export function createEmpresasSyntheticTenantContext(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const preset = typeof o.preset === 'string' ? o.preset : 'A';

  const TENANT_A = { tenantId: 'MAK_TEST_CLIENTE_A', erpEmpresaId: 'erp_test_A' };
  const TENANT_B = { tenantId: 'MAK_TEST_CLIENTE_B', erpEmpresaId: 'erp_test_B' };
  const nowIso = '2025-06-01T00:00:00.000Z';
  const futureIso = '2999-01-01T00:00:00.000Z';
  const pastIso = '2000-01-01T00:00:00.000Z';

  /** @type {Record<string, unknown>} */
  const base = {
    kind: 'empresas-synthetic-tenant-context',
    synthetic: true,
    environment: EMPRESAS_LOCAL_READ_ENVIRONMENT,
    preset,
    userId: 'MAK_TEST_USER',
    permissions: ['empresas.read'],
    empresaHeader: TENANT_A.erpEmpresaId,
    tokenClaims: { sub: 'MAK_TEST_USER', scope: 'empresas.read', tenantId: TENANT_A.tenantId, exp: futureIso, iat: nowIso, synthetic: true },
    valid: true,
    reason: 'valid',
    ...TENANT_A,
    clienteId: TENANT_A.tenantId,
  };

  switch (preset) {
    case 'A':
      break;
    case 'B':
      base.tenantId = TENANT_B.tenantId;
      base.clienteId = TENANT_B.tenantId;
      base.erpEmpresaId = TENANT_B.erpEmpresaId;
      base.empresaHeader = TENANT_B.erpEmpresaId;
      base.tokenClaims = { ...base.tokenClaims, tenantId: TENANT_B.tenantId };
      break;
    case 'noPermission':
      base.permissions = [];
      base.tokenClaims = { ...base.tokenClaims, scope: '' };
      base.valid = false;
      base.reason = 'permission-denied';
      break;
    case 'noHeader':
      base.empresaHeader = null;
      base.valid = false;
      base.reason = 'missing-header';
      break;
    case 'invalidHeader':
      base.empresaHeader = 'erp_does_not_exist';
      base.valid = false;
      base.reason = 'invalid-header';
      break;
    case 'tenantMismatch':
      base.empresaHeader = TENANT_B.erpEmpresaId; // header for B but tenant A
      base.valid = false;
      base.reason = 'tenant-mismatch';
      break;
    case 'expiredToken':
      base.tokenClaims = { ...base.tokenClaims, exp: pastIso };
      base.valid = false;
      base.reason = 'token-expired';
      break;
    case 'noScope':
      base.tokenClaims = { ...base.tokenClaims, scope: undefined };
      base.valid = false;
      base.reason = 'missing-scope';
      break;
    default:
      base.valid = false;
      base.reason = 'unknown-preset';
  }

  if (isGenericModelPlainObject(o.overrides)) Object.assign(base, o.overrides);
  return safeCloneGenericModel(base);
}

export default createEmpresasSyntheticTenantContext;
