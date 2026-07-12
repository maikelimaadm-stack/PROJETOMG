import { isGenericModelPlainObject, safeCloneGenericModel, createGenericModelChecksum } from '../../../../runtime/generic-model/index.js';

/**
 * Builds a deterministic parity digest of a read result + its query/tenant/
 * permission context. Same input → same digest; any change in ids/order/count/
 * page/filters/search/sort/tenant/permission/empty/error/fallback changes the
 * digest. No secrets enter the digest. Never mutates the input.
 *
 * @param {Object} [options]
 * @param {Object} [options.result] read result ({ items, total, page, pageSize, ok, reason })
 * @param {Object} [options.query] normalized query
 * @param {Object} [options.context] tenant/permission context summary
 * @returns {Object} digest descriptor
 */
export function createEmpresasParityDigest(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const result = isGenericModelPlainObject(o.result) ? o.result : {};
  const query = isGenericModelPlainObject(o.query) ? o.query : {};
  const context = isGenericModelPlainObject(o.context) ? o.context : {};

  const items = Array.isArray(result.items) ? result.items : [];
  const ids = items.map((r) => r && r.id);

  const tenantScope = {
    tenantId: context.tenantId ?? null,
    empresaHeader: context.empresaHeader ?? null,
    permissionOutcome: result.ok === true ? 'allowed' : (result.reason || 'denied'),
  };
  const queryNorm = {
    page: query.page ?? result.page ?? null,
    pageSize: query.pageSize ?? result.pageSize ?? null,
    sort: query.sort ?? null,
    direction: query.direction ?? null,
    search: query.search ?? null,
    filters: isGenericModelPlainObject(query.filters) ? query.filters : {},
  };
  const resultNorm = {
    ids,
    recordCount: items.length,
    total: result.total ?? 0,
    ok: result.ok === true,
    empty: items.length === 0,
    reason: result.reason ?? null,
  };

  const normalizedInput = { tenantScope, query: queryNorm, result: resultNorm };
  return safeCloneGenericModel({
    kind: 'empresas-parity-digest',
    algorithm: 'fnv-1a',
    digest: createGenericModelChecksum({ value: normalizedInput }),
    normalizedInput,
    recordCount: items.length,
    tenantScopeDigest: createGenericModelChecksum({ value: tenantScope }),
    queryDigest: createGenericModelChecksum({ value: queryNorm }),
    resultDigest: createGenericModelChecksum({ value: resultNorm }),
  });
}

export default createEmpresasParityDigest;
