import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../../runtime/generic-model/index.js';
import { createEmpresasReadOnlyRepository } from '../createEmpresasReadOnlyRepository.js';
import { createEmpresasScaledSyntheticDataset, contextForScaledTenant } from './createEmpresasScaledSyntheticDataset.js';

/** The composite query scenarios (query + whether it should be accepted). */
export function empresasCompositeQueryScenarios() {
  return [
    { id: 'search-only', query: { search: 'EMP' }, accept: true },
    { id: 'filter-only', query: { filters: { status: 'Ativa' } }, accept: true },
    { id: 'sort-only', query: { sort: 'razao_social', direction: 'asc' }, accept: true },
    { id: 'page-only', query: { page: 1, pageSize: 5 }, accept: true },
    { id: 'search+filter', query: { search: 'EMP', filters: { status: 'Ativa' } }, accept: true },
    { id: 'search+sort', query: { search: 'EMP', sort: 'razao_social' }, accept: true },
    { id: 'search+page', query: { search: 'EMP', page: 1, pageSize: 3 }, accept: true },
    { id: 'filter+sort', query: { filters: { status: 'Ativa' }, sort: 'codempresa' }, accept: true },
    { id: 'filter+page', query: { filters: { status: 'Ativa' }, page: 1, pageSize: 3 }, accept: true },
    { id: 'sort+page', query: { sort: 'codempresa', direction: 'desc', page: 1, pageSize: 3 }, accept: true },
    { id: 'search+filter+sort', query: { search: 'EMP', filters: { status: 'Ativa' }, sort: 'razao_social' }, accept: true },
    { id: 'search+filter+page', query: { search: 'EMP', filters: { status: 'Ativa' }, page: 1, pageSize: 4 }, accept: true },
    { id: 'filter+sort+page', query: { filters: { status: 'Ativa' }, sort: 'codempresa', page: 1, pageSize: 4 }, accept: true },
    { id: 'search+sort+page', query: { search: 'EMP', sort: 'razao_social', page: 1, pageSize: 4 }, accept: true },
    { id: 'full', query: { search: 'EMP', filters: { status: 'Ativa' }, sort: 'razao_social', direction: 'desc', page: 1, pageSize: 4 }, accept: true },
    { id: 'page-beyond-range', query: { page: 9999, pageSize: 10 }, accept: true },
    { id: 'pageSize-1', query: { page: 1, pageSize: 1 }, accept: true },
    { id: 'pageSize-max', query: { page: 1, pageSize: 100 }, accept: true },
    { id: 'search-spaces', query: { search: '  EMP  ' }, accept: true },
    { id: 'search-case-insensitive', query: { search: 'emp' }, accept: true },
    { id: 'filter-no-result', query: { filters: { status: 'Inexistente' } }, accept: true },
    { id: 'invalid-filter', query: { filters: { senha: 'x' } }, accept: false },
    { id: 'invalid-sort', query: { sort: 'senha' }, accept: false },
    { id: 'invalid-direction', query: { direction: 'sideways' }, accept: false },
    { id: 'invalid-page', query: { page: 0 }, accept: false },
    { id: 'invalid-pageSize', query: { pageSize: 99999 }, accept: false },
  ];
}

/**
 * Runs the composite query matrix against a read-only repository over a synthetic
 * dataset. Pure aside from local reads. Verifies that accepted queries succeed and
 * rejected queries fail closed.
 *
 * @param {Object} [options]
 * @param {Object} [options.dataset] scaled synthetic dataset
 * @param {Object} [options.context] tenant context (default: first tenant of dataset)
 * @returns {Object} matrix result
 */
export function createEmpresasCompositeQueryMatrix(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const dataset = isGenericModelPlainObject(o.dataset) ? o.dataset : createEmpresasScaledSyntheticDataset({ profile: 'small' });
  const repository = createEmpresasReadOnlyRepository({ dataset });
  const context = isGenericModelPlainObject(o.context) ? o.context : contextForScaledTenant(dataset.tenants[0]);

  const scenarios = empresasCompositeQueryScenarios().map((sc) => {
    const res = repository.list(sc.query, context);
    const ok = res.ok === true;
    const matched = ok === sc.accept;
    return {
      id: sc.id,
      query: sc.query,
      accept: sc.accept,
      ok,
      matched,
      count: ok ? res.items.length : 0,
      total: ok ? res.total : 0,
      reason: res.reason,
    };
  });

  const passed = scenarios.filter((s) => s.matched).length;
  return safeCloneGenericModel({
    kind: 'empresas-composite-query-matrix',
    total: scenarios.length,
    passed,
    failed: scenarios.length - passed,
    allMatched: passed === scenarios.length,
    scenarios,
    localOnly: true,
    readOnly: true,
  });
}

export default createEmpresasCompositeQueryMatrix;
