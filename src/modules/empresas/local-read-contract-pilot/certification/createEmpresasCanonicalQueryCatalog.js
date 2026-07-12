import { isGenericModelPlainObject, safeCloneGenericModel, createGenericModelChecksum } from '../../../../runtime/generic-model/index.js';
import { createEmpresasReadOnlyRepository } from '../createEmpresasReadOnlyRepository.js';
import { contextForScaledTenant } from '../hardening/createEmpresasScaledSyntheticDataset.js';
import { createEmpresasParityDigest } from '../hardening/createEmpresasParityDigest.js';
import { createEmpresasCanonicalFixtures } from './createEmpresasCanonicalFixtures.js';

/** Canonical read/query scenarios (certifiable ones get an expectedDigest). */
function scenarioDefs() {
  return [
    { scenarioId: 'list-default', operation: 'list', query: {}, contextProfile: 'A', expectedOutcome: 'ok', essential: true },
    { scenarioId: 'list-page-1', operation: 'list', query: { page: 1, pageSize: 5 }, contextProfile: 'A', expectedOutcome: 'ok', essential: true },
    { scenarioId: 'list-page-2', operation: 'list', query: { page: 2, pageSize: 5 }, contextProfile: 'A', expectedOutcome: 'ok', essential: true },
    { scenarioId: 'pageSize-1', operation: 'list', query: { page: 1, pageSize: 1 }, contextProfile: 'A', expectedOutcome: 'ok', essential: true },
    { scenarioId: 'pageSize-max', operation: 'list', query: { page: 1, pageSize: 100 }, contextProfile: 'A', expectedOutcome: 'ok', essential: true },
    { scenarioId: 'search-name', operation: 'list', query: { search: 'EMP' }, contextProfile: 'A', expectedOutcome: 'ok', essential: true },
    { scenarioId: 'search-ci', operation: 'list', query: { search: 'emp' }, contextProfile: 'A', expectedOutcome: 'ok', essential: true },
    { scenarioId: 'search-spaces', operation: 'list', query: { search: '  EMP  ' }, contextProfile: 'A', expectedOutcome: 'ok', essential: true },
    { scenarioId: 'filter-code', operation: 'list', query: { filters: { codempresa: 100001 } }, contextProfile: 'A', expectedOutcome: 'ok', essential: true },
    { scenarioId: 'filter-status', operation: 'list', query: { filters: { status: 'Ativa' } }, contextProfile: 'A', expectedOutcome: 'ok', essential: true },
    { scenarioId: 'filter-composite', operation: 'list', query: { filters: { status: 'Ativa', estado: 'SP' } }, contextProfile: 'A', expectedOutcome: 'ok', essential: true },
    { scenarioId: 'sort-asc', operation: 'list', query: { sort: 'razao_social', direction: 'asc' }, contextProfile: 'A', expectedOutcome: 'ok', essential: true },
    { scenarioId: 'sort-desc', operation: 'list', query: { sort: 'razao_social', direction: 'desc' }, contextProfile: 'A', expectedOutcome: 'ok', essential: true },
    { scenarioId: 'sort-stable', operation: 'list', query: { sort: 'status' }, contextProfile: 'A', expectedOutcome: 'ok', essential: true },
    { scenarioId: 'search+filter', operation: 'list', query: { search: 'EMP', filters: { status: 'Ativa' } }, contextProfile: 'A', expectedOutcome: 'ok', essential: true },
    { scenarioId: 'search+sort', operation: 'list', query: { search: 'EMP', sort: 'codempresa' }, contextProfile: 'A', expectedOutcome: 'ok', essential: true },
    { scenarioId: 'filter+sort', operation: 'list', query: { filters: { status: 'Ativa' }, sort: 'codempresa' }, contextProfile: 'A', expectedOutcome: 'ok', essential: true },
    { scenarioId: 'full', operation: 'list', query: { search: 'EMP', filters: { status: 'Ativa' }, sort: 'razao_social', direction: 'desc', page: 1, pageSize: 5 }, contextProfile: 'A', expectedOutcome: 'ok', essential: true },
    { scenarioId: 'no-result', operation: 'list', query: { filters: { status: 'Inexistente' } }, contextProfile: 'A', expectedOutcome: 'ok', essential: true },
    { scenarioId: 'page-beyond-range', operation: 'list', query: { page: 9999, pageSize: 10 }, contextProfile: 'A', expectedOutcome: 'ok', essential: true },
    { scenarioId: 'tenant-A', operation: 'list', query: {}, contextProfile: 'A', expectedOutcome: 'ok', essential: true },
    { scenarioId: 'tenant-B', operation: 'list', query: {}, contextProfile: 'B', expectedOutcome: 'ok', essential: true },
    { scenarioId: 'permission-denied', operation: 'list', query: {}, contextProfile: 'denied', expectedOutcome: 'blocked', expectedErrorCode: 'PERMISSION_DENIED', essential: true },
    { scenarioId: 'header-missing', operation: 'list', query: {}, contextProfile: 'noHeader', expectedOutcome: 'blocked', expectedErrorCode: 'HEADER_REQUIRED', essential: true },
    { scenarioId: 'header-invalid', operation: 'list', query: {}, contextProfile: 'mismatch', expectedOutcome: 'blocked', expectedErrorCode: 'TENANT_MISMATCH', essential: true },
    { scenarioId: 'token-expired', operation: 'list', query: {}, contextProfile: 'expired', expectedOutcome: 'blocked', expectedErrorCode: 'TOKEN_EXPIRED', essential: true },
    { scenarioId: 'getById-valid', operation: 'getById', query: {}, contextProfile: 'A', expectedOutcome: 'ok', essential: true },
    { scenarioId: 'getById-foreign', operation: 'getById', query: {}, contextProfile: 'A', expectedOutcome: 'not_found', essential: true },
    { scenarioId: 'count-filtered', operation: 'count', query: { filters: { status: 'Ativa' } }, contextProfile: 'A', expectedOutcome: 'ok', essential: true },
    { scenarioId: 'fallback-flag-off', operation: 'fallback', query: {}, contextProfile: 'A', expectedOutcome: 'fallback', essential: false },
    { scenarioId: 'parity-mismatch-sim', operation: 'parity', query: {}, contextProfile: 'A', expectedOutcome: 'blocked', essential: false },
    { scenarioId: 'mutation-attempt', operation: 'mutation', query: {}, contextProfile: 'A', expectedOutcome: 'blocked', expectedErrorCode: 'MUTATION_BLOCKED', essential: true },
  ];
}

function ctxFor(profile, fixtures) {
  const a = fixtures.tenants[0];
  const b = fixtures.tenants[1] || fixtures.tenants[0];
  const valid = contextForScaledTenant(a);
  switch (profile) {
    case 'A': return valid;
    case 'B': return contextForScaledTenant(b);
    case 'denied': return { ...valid, valid: false, reason: 'permission-denied', permissions: [] };
    case 'noHeader': return { ...valid, empresaHeader: null, valid: false, reason: 'missing-header' };
    case 'mismatch': return { ...valid, empresaHeader: b.erpEmpresaId, valid: false, reason: 'tenant-mismatch' };
    case 'expired': return { ...valid, valid: false, reason: 'token-expired' };
    default: return valid;
  }
}

/**
 * Builds the canonical query catalog and computes a stable expectedDigest for each
 * read scenario over the certification-small fixture. Pure aside from local reads.
 *
 * @param {Object} [options]
 * @returns {Object} query catalog descriptor
 */
export function createEmpresasCanonicalQueryCatalog(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const fixtures = isGenericModelPlainObject(o.fixtures) ? o.fixtures : createEmpresasCanonicalFixtures({ profile: 'certification-small' });
  const repository = createEmpresasReadOnlyRepository({ dataset: { records: fixtures.records, tenants: fixtures.tenants } });
  const foreignRec = fixtures.records.find((r) => r.cliente_id === fixtures.tenants[1].tenantId);

  const scenarios = scenarioDefs().map((sc) => {
    const context = ctxFor(sc.contextProfile, fixtures);
    let expectedDigest = null;
    if (sc.operation === 'list') {
      const res = repository.list(sc.query, context);
      expectedDigest = createEmpresasParityDigest({ result: res, query: res.query || sc.query, context }).digest;
    } else if (sc.operation === 'count') {
      const res = repository.count(sc.query, context);
      expectedDigest = createGenericModelChecksum({ value: { total: res.total, ok: res.ok } });
    } else if (sc.operation === 'getById') {
      const id = sc.scenarioId === 'getById-foreign' ? (foreignRec && foreignRec.id) : fixtures.records[0].id;
      const res = repository.getById(id, context);
      expectedDigest = createGenericModelChecksum({ value: { ok: res.ok, reason: res.reason, id: res.item && res.item.id } });
    }
    return {
      scenarioId: sc.scenarioId,
      operation: sc.operation,
      query: sc.query,
      contextProfile: sc.contextProfile,
      expectedOutcome: sc.expectedOutcome,
      expectedErrorCode: sc.expectedErrorCode || null,
      expectedDigest,
      essential: sc.essential === true,
      notes: sc.notes || null,
    };
  });

  const body = { kind: 'empresas-canonical-query-catalog', total: scenarios.length, essentialCount: scenarios.filter((s) => s.essential).length, scenarios };
  return safeCloneGenericModel({ ...body, queryCatalogDigest: createGenericModelChecksum({ value: scenarios.map((s) => [s.scenarioId, s.expectedDigest, s.expectedOutcome]) }) });
}

export default createEmpresasCanonicalQueryCatalog;
