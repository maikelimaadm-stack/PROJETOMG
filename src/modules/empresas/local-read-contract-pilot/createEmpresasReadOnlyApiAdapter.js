import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { createEmpresasReadOnlyRepository } from './createEmpresasReadOnlyRepository.js';
import { blockEmpresasReadPilotMutation } from './blockEmpresasReadPilotMutation.js';
import { empresasLocalReadError } from './errors.js';

/**
 * Simulates the read contract of the real `EmpresaApi` WITHOUT the network. The
 * list envelope mirrors `EmpresaApi.listEmpresas`:
 * `{ items, total, page, pageSize, totalPages, nextCursor }`. `getEmpresaById`
 * returns the item or null, like `EmpresaApi.getEmpresa`. Never uses fetch, never
 * calls an external URL/Railway/Prisma, never mutates.
 *
 * @param {Object} [options]
 * @param {Object} [options.repository] optional read-only repository
 * @param {Object} [options.dataset] optional synthetic dataset
 * @returns {Object} read-only API adapter
 */
export function createEmpresasReadOnlyApiAdapter(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const repository = isGenericModelPlainObject(o.repository)
    ? o.repository
    : createEmpresasReadOnlyRepository({ dataset: o.dataset });

  function listEmpresas(params = {}, context) {
    const p = isGenericModelPlainObject(params) ? params : {};
    const res = repository.list(p, context);
    if (!res.ok) {
      return safeCloneGenericModel({ items: [], total: 0, page: 1, pageSize: 50, totalPages: 1, nextCursor: null, ok: false, reason: res.reason, diagnostics: { blockers: res.blockers || [] } });
    }
    // Mirror EmpresaApi.listEmpresas envelope exactly.
    return safeCloneGenericModel({
      items: res.items,
      total: res.total,
      page: res.page,
      pageSize: res.pageSize,
      totalPages: res.totalPages,
      nextCursor: res.nextCursor,
      ok: true,
      diagnostics: { source: 'local_read_contract_pilot', fetchUsed: false, productionAccessed: false },
    });
  }

  function getEmpresaById(id, context) {
    const res = repository.getById(id, context);
    return safeCloneGenericModel({ item: res.ok ? res.item : null, ok: res.ok, reason: res.reason });
  }

  function countEmpresas(params = {}, context) {
    const res = repository.count(isGenericModelPlainObject(params) ? params : {}, context);
    return safeCloneGenericModel({ total: res.ok ? res.total : 0, ok: res.ok, reason: res.reason });
  }

  function inspectResponseContract() {
    return safeCloneGenericModel({
      kind: 'empresas-read-only-api-contract',
      list: ['items', 'total', 'page', 'pageSize', 'totalPages', 'nextCursor'],
      getById: 'item | null',
      count: 'total',
      readOnly: true,
      fetchUsed: false,
      externalUrlUsed: false,
      productionAccessed: false,
    });
  }

  const refuse = (operation) => {
    const blocked = blockEmpresasReadPilotMutation({ operation });
    throw empresasLocalReadError('MAK-EMP-LOCAL-READ-001', blocked.reason, blocked);
  };

  return {
    kind: 'empresas-read-only-api-adapter',
    listEmpresas,
    getEmpresaById,
    countEmpresas,
    inspectResponseContract,
    // Mutations are refused explicitly; no fetch, no external URL, no method != GET-logical.
    createEmpresa: () => refuse('createEmpresa'),
    updateEmpresa: () => refuse('updateEmpresa'),
    deleteEmpresa: () => refuse('deleteEmpresa'),
  };
}

export default createEmpresasReadOnlyApiAdapter;
