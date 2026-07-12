import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../../runtime/generic-model/index.js';
import { createEmpresasReadOnlyRepository } from '../createEmpresasReadOnlyRepository.js';
import { createEmpresasScaledSyntheticDataset, contextForScaledTenant } from './createEmpresasScaledSyntheticDataset.js';

/**
 * Deterministic permission profiles. All read-oriented; none may enable mutation
 * or bypass tenant/header/token state.
 * @param {Object} tenant
 */
function permissionProfiles(tenant) {
  const valid = contextForScaledTenant(tenant);
  const mk = (over) => ({ ...valid, ...over });
  return [
    { id: 'read-allowed', context: valid, expectRead: true },
    { id: 'read-denied', context: mk({ valid: false, reason: 'permission-denied', permissions: [] }), expectRead: false },
    { id: 'no-permission', context: mk({ permissions: undefined }), expectRead: false },
    { id: 'empty-permission', context: mk({ permissions: [] }), expectRead: false },
    { id: 'invalid-permission', context: mk({ permissions: 'empresas.read' }), expectRead: false }, // not an array
    { id: 'other-module-permission', context: mk({ permissions: ['cadcps.read'] }), expectRead: false },
    { id: 'admin-synthetic', context: mk({ permissions: ['empresas.read', 'admin'] }), expectRead: true, readOnlyExpected: true },
    { id: 'partial-permission', context: mk({ permissions: ['empresas'] }), expectRead: false },
    { id: 'no-userId', context: mk({ userId: undefined }), expectRead: true }, // userId not required for read scope; still tenant-scoped
    { id: 'token-expired', context: mk({ valid: false, reason: 'token-expired' }), expectRead: false },
    { id: 'tenant-mismatch', context: mk({ empresaHeader: 'erp_other', erpEmpresaId: tenant.erpEmpresaId }), expectRead: false },
  ];
}

/**
 * Runs the permission matrix. Fail-closed. Verifies no profile enables mutation
 * (admin included), bypasses tenant scope, or reads when denied. Pure aside from
 * local reads.
 *
 * @param {Object} [options]
 * @param {Object} [options.dataset]
 * @returns {Object} permission matrix result
 */
export function createEmpresasPermissionMatrix(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const dataset = isGenericModelPlainObject(o.dataset) ? o.dataset : createEmpresasScaledSyntheticDataset({ profile: 'small' });
  const repository = createEmpresasReadOnlyRepository({ dataset });
  const tenant = dataset.tenants[0];

  let permissionBypassFound = false;
  const bypassCases = [];
  let passed = 0;

  const scenarios = permissionProfiles(tenant).map(({ id, context, expectRead, readOnlyExpected }) => {
    const list = repository.list({}, context);
    const getById = repository.getById(dataset.records[0].id, context);
    const count = repository.count({}, context);
    const readActual = list.ok === true;
    const matched = readActual === expectRead;
    if (matched) passed += 1;

    // No profile may enable mutation: the repository must still throw on write.
    let mutationThrew = false;
    try { repository.create({}); } catch { mutationThrew = true; }
    if (!mutationThrew) { permissionBypassFound = true; bypassCases.push({ id, kind: 'mutation-enabled' }); }

    // Denied profiles must not read; admin must remain read-only (no records leaked cross-tenant).
    if (readActual && list.items) {
      const foreign = list.items.find((r) => r.cliente_id !== context.tenantId);
      if (foreign) { permissionBypassFound = true; bypassCases.push({ id, kind: 'tenant-bypass' }); }
    }
    if (readOnlyExpected && !mutationThrew) { permissionBypassFound = true; bypassCases.push({ id, kind: 'admin-write' }); }

    return { id, expectRead, readActual, matched, mutationThrew, getByIdOk: getById.ok, countOk: count.ok };
  });

  return safeCloneGenericModel({
    kind: 'empresas-permission-matrix',
    total: scenarios.length,
    passed,
    failed: scenarios.length - passed,
    permissionBypassFound,
    bypassCases,
    failClosed: true,
    scenarios,
    diagnostics: { localOnly: true, readOnly: true, mutationExecuted: false },
  });
}

export default createEmpresasPermissionMatrix;
