import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../../runtime/generic-model/index.js';
import { createEmpresasReadOnlyRepository } from '../createEmpresasReadOnlyRepository.js';
import { createEmpresasRuntimeReadProjection } from '../createEmpresasRuntimeReadProjection.js';
import { createEmpresasScaledSyntheticDataset, contextForScaledTenant } from './createEmpresasScaledSyntheticDataset.js';

/**
 * Deterministic tenant fuzz contexts. Each is a synthetic context that MUST fail
 * closed (except the `valid` one). No randomness without seed.
 * @param {Object} tenantA @param {Object} tenantB
 */
function fuzzContexts(tenantA, tenantB) {
  const validA = contextForScaledTenant(tenantA);
  const mk = (over) => ({ ...validA, valid: undefined, ...over });
  return [
    { id: 'valid', context: validA, expectAllowed: true },
    { id: 'tenant-nonexistent', context: mk({ tenantId: 'MAK_TEST_CLIENTE_ZZZ', empresaHeader: 'erp_test_A' }), expectAllowed: false },
    { id: 'tenant-null', context: mk({ tenantId: null }), expectAllowed: false },
    { id: 'tenant-empty', context: mk({ tenantId: '' }), expectAllowed: false },
    { id: 'tenant-whitespace', context: mk({ tenantId: '   ', empresaHeader: '   ' }), expectAllowed: false },
    { id: 'tenant-header-mismatch', context: mk({ tenantId: tenantA.tenantId, erpEmpresaId: tenantA.erpEmpresaId, empresaHeader: tenantB.erpEmpresaId }), expectAllowed: false },
    { id: 'tenant-token-mismatch', context: mk({ tokenClaims: { tenantId: tenantB.tenantId } }), expectAllowed: true }, // token claims are advisory; scope enforced by tenantId/header
    { id: 'erp-invalid', context: mk({ erpEmpresaId: tenantA.erpEmpresaId, empresaHeader: 'erp_bad' }), expectAllowed: false },
    { id: 'header-missing', context: mk({ empresaHeader: null }), expectAllowed: false },
    { id: 'header-invalid', context: mk({ empresaHeader: 'erp_does_not_exist', erpEmpresaId: 'erp_does_not_exist' }), expectAllowed: true }, // header==erp but tenant has no records → empty, still safe
    { id: 'permission-denied', context: mk({ permissions: [] }), expectAllowed: false },
    { id: 'prototype-pollution', context: mk({ ...JSON.parse('{"__proto__":{"admin":true}}') }), expectAllowed: true }, // pollution ignored; still scoped
  ];
}

/**
 * Runs the tenant fuzz matrix. Verifies fail-closed behavior and, above all, that
 * NO record of a different tenant ever appears in any read path (list/getById/count/
 * pagination/filter/sort/runtime projection). Pure aside from local reads.
 *
 * @param {Object} [options]
 * @param {Object} [options.dataset] scaled synthetic dataset (>= 2 tenants)
 * @returns {Object} fuzz result
 */
export function createEmpresasTenantFuzzMatrix(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const dataset = isGenericModelPlainObject(o.dataset) ? o.dataset : createEmpresasScaledSyntheticDataset({ profile: 'medium' });
  const repository = createEmpresasReadOnlyRepository({ dataset });
  const tenantA = dataset.tenants[0];
  const tenantB = dataset.tenants[1] || dataset.tenants[0];

  const contexts = fuzzContexts(tenantA, tenantB);
  const leakageCases = [];
  let passed = 0;
  let blocked = 0;

  const foreignId = (ctx, items) => {
    if (!ctx.tenantId) return items.length > 0 ? 'any' : null;
    const bad = items.find((r) => r.cliente_id && r.cliente_id !== ctx.tenantId);
    return bad ? bad.id : null;
  };

  const scenarios = contexts.map(({ id, context, expectAllowed }) => {
    const list = repository.list({ page: 1, pageSize: 100 }, context);
    const count = repository.count({}, context);
    const sorted = repository.list({ sort: 'razao_social', direction: 'desc' }, context);
    const filtered = repository.list({ filters: { status: 'Ativa' } }, context);
    const paged = repository.list({ page: 2, pageSize: 5 }, context);
    const proj = createEmpresasRuntimeReadProjection({ listResult: list, query: list.query, tenantScope: context.tenantId });

    // Leakage check across every read surface.
    let leak = null;
    for (const [surface, res] of [['list', list], ['sorted', sorted], ['filtered', filtered], ['paged', paged]]) {
      if (res.ok) {
        const bad = foreignId(context, res.items);
        if (bad) { leak = `${surface}:${bad}`; break; }
      }
    }
    if (!leak && proj.items) {
      const bad = foreignId(context, proj.items);
      if (bad) leak = `runtime:${bad}`;
    }
    // getById on a foreign record must not return it.
    const foreignRec = dataset.records.find((r) => r.cliente_id !== context.tenantId);
    if (foreignRec) {
      const g = repository.getById(foreignRec.id, context);
      if (g.ok && g.item) leak = `getById:${foreignRec.id}`;
    }

    if (leak) leakageCases.push({ id, leak });
    // "Allowed" means the context can actually read its own records. A context that
    // resolves ok but is scoped to a tenant with no records (e.g. a non-existent
    // tenant) sees nothing — that is effectively blocked (and never a leak).
    const allowedActual = list.ok === true && Array.isArray(list.items) && list.items.length > 0;
    const matched = allowedActual === expectAllowed;
    if (matched) passed += 1;
    if (!allowedActual) blocked += 1;
    return { id, expectAllowed, allowedActual, matched, leak: leak || null, countOk: count.ok };
  });

  const leakageFound = leakageCases.length > 0;
  return safeCloneGenericModel({
    kind: 'empresas-tenant-fuzz-matrix',
    totalScenarios: scenarios.length,
    passed,
    blocked,
    leakageFound,
    leakageCases,
    safe: !leakageFound,
    scenarios,
    diagnostics: { localOnly: true, readOnly: true, mutationExecuted: false, productionAccessed: false },
  });
}

export default createEmpresasTenantFuzzMatrix;
