import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { createEmpresasSyntheticDataset } from './createEmpresasSyntheticDataset.js';
import { validateEmpresaReadQuery } from './validateEmpresaReadQuery.js';
import { applyEmpresaReadFilters } from './applyEmpresaReadFilters.js';
import { applyEmpresaReadSorting } from './applyEmpresaReadSorting.js';
import { applyEmpresaReadPagination } from './applyEmpresaReadPagination.js';
import { normalizeEmpresaReadPayload, normalizeEmpresaReadPayloadList } from './normalizeEmpresaReadPayload.js';
import { blockEmpresasReadPilotMutation } from './blockEmpresasReadPilotMutation.js';
import { empresasLocalReadError } from './errors.js';

/**
 * Resolves whether a synthetic tenant context is allowed to read. Fail-closed.
 * @param {Object} context
 * @returns {{allowed: boolean, reason: string}}
 */
function resolveContext(context) {
  const c = isGenericModelPlainObject(context) ? context : {};
  if (c.valid === false) return { allowed: false, reason: typeof c.reason === 'string' ? c.reason : 'invalid-context' };
  if (!Array.isArray(c.permissions) || !c.permissions.includes('empresas.read')) return { allowed: false, reason: 'permission-denied' };
  if (!c.empresaHeader) return { allowed: false, reason: 'missing-header' };
  if (!c.tenantId) return { allowed: false, reason: 'missing-tenant' };
  if (c.erpEmpresaId && c.empresaHeader !== c.erpEmpresaId) return { allowed: false, reason: 'tenant-mismatch' };
  return { allowed: true, reason: 'allowed' };
}

/**
 * A LOCAL, READ-ONLY repository over a synthetic dataset. Always applies tenant
 * scope, fails closed on an invalid/denied context, returns safe copies, and never
 * mutates the dataset. Exposes NO write methods — `create/update/delete` exist only
 * to explicitly refuse via the mutation blocker. Never calls a real API/Prisma/fetch.
 *
 * @param {Object} [options]
 * @param {Object} [options.dataset] optional pre-built synthetic dataset
 * @returns {Object} read-only repository
 */
export function createEmpresasReadOnlyRepository(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const dataset = isGenericModelPlainObject(o.dataset) ? o.dataset : createEmpresasSyntheticDataset({});
  const all = Array.isArray(dataset.records) ? dataset.records : [];

  const scopedRecords = (context) => all.filter((r) => r.cliente_id === context.tenantId);

  const failClosed = (reason) => ({
    ok: false,
    reason,
    items: [],
    total: 0,
    page: 1,
    pageSize: 50,
    totalPages: 1,
    hasNext: false,
    nextCursor: null,
    mutationExecuted: false,
    productionAccessed: false,
    backendAccessed: false,
    prismaAccessed: false,
    fetchUsed: false,
  });

  function list(query, context) {
    const ctx = resolveContext(context);
    if (!ctx.allowed) return safeCloneGenericModel(failClosed(ctx.reason));
    const v = validateEmpresaReadQuery({ query });
    if (!v.valid) return safeCloneGenericModel({ ...failClosed(v.reason), blockers: v.blockers });

    const scoped = scopedRecords(context);
    const filtered = applyEmpresaReadFilters({ records: scoped, filters: v.normalized.filters, search: v.normalized.search });
    const sorted = applyEmpresaReadSorting({ records: filtered, sort: v.normalized.sort, direction: v.normalized.direction });
    const paged = applyEmpresaReadPagination({ records: sorted, page: v.normalized.page, pageSize: v.normalized.pageSize });

    return safeCloneGenericModel({
      ok: true,
      reason: 'ok',
      items: normalizeEmpresaReadPayloadList({ records: paged.items }),
      total: paged.total,
      page: paged.page,
      pageSize: paged.pageSize,
      totalPages: paged.totalPages,
      hasNext: paged.hasNext,
      nextCursor: paged.nextCursor,
      query: v.normalized,
      mutationExecuted: false,
      productionAccessed: false,
      backendAccessed: false,
      prismaAccessed: false,
      fetchUsed: false,
    });
  }

  function getById(id, context) {
    const ctx = resolveContext(context);
    if (!ctx.allowed) return safeCloneGenericModel({ ok: false, reason: ctx.reason, item: null });
    const rec = scopedRecords(context).find((r) => r.id === id) || null;
    return safeCloneGenericModel({ ok: true, reason: rec ? 'ok' : 'not-found', item: rec ? normalizeEmpresaReadPayload({ record: rec }) : null });
  }

  function count(query, context) {
    const ctx = resolveContext(context);
    if (!ctx.allowed) return safeCloneGenericModel({ ok: false, reason: ctx.reason, total: 0 });
    const v = validateEmpresaReadQuery({ query });
    if (!v.valid) return safeCloneGenericModel({ ok: false, reason: v.reason, total: 0 });
    const scoped = scopedRecords(context);
    const filtered = applyEmpresaReadFilters({ records: scoped, filters: v.normalized.filters, search: v.normalized.search });
    return safeCloneGenericModel({ ok: true, reason: 'ok', total: filtered.length });
  }

  const refuse = (operation) => {
    const blocked = blockEmpresasReadPilotMutation({ operation });
    throw empresasLocalReadError('MAK-EMP-LOCAL-READ-001', blocked.reason, blocked);
  };

  function inspectContract() {
    return safeCloneGenericModel({
      kind: 'empresas-read-only-repository-contract',
      readOperations: ['list', 'getById', 'count', 'inspectContract'],
      writeOperations: [],
      mutationBlocked: true,
      localOnly: true,
      readOnly: true,
      backendAccessed: false,
      prismaAccessed: false,
      fetchUsed: false,
    });
  }

  return {
    kind: 'empresas-read-only-repository',
    datasetSize: all.length,
    list,
    getById,
    count,
    inspectContract,
    // Write methods exist ONLY to explicitly refuse — nothing is ever executed.
    create: () => refuse('create'),
    update: () => refuse('update'),
    delete: () => refuse('delete'),
    upsert: () => refuse('upsert'),
    save: () => refuse('save'),
    bulkCreate: () => refuse('bulkCreate'),
    bulkUpdate: () => refuse('bulkUpdate'),
    bulkDelete: () => refuse('bulkDelete'),
    sync: () => refuse('sync'),
  };
}

export default createEmpresasReadOnlyRepository;
