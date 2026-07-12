import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  EMPRESAS_LOCAL_READ_MODULE_ID,
  EMPRESAS_LOCAL_READ_MODEL_TYPE,
  EMPRESAS_LOCAL_READ_SOURCE,
} from './empresasLocalReadContractConfig.js';

/**
 * Builds a runtime-v2-compatible read projection from a repository list result.
 * READ-ONLY: it never touches the write path, Prisma, backend or fetch, never
 * ignores tenant/permission, never modifies preferences. Pure; safe copies only.
 *
 * @param {Object} [options]
 * @param {Object} [options.listResult] output of repository.list
 * @param {Object} [options.query] normalized query
 * @param {string} [options.tenantScope] tenant id the result is scoped to
 * @returns {Object} runtime projection
 */
export function createEmpresasRuntimeReadProjection(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const listResult = isGenericModelPlainObject(o.listResult) ? o.listResult : {};
  const query = isGenericModelPlainObject(o.query) ? o.query : {};
  const items = Array.isArray(listResult.items) ? listResult.items : [];

  return safeCloneGenericModel({
    kind: 'empresas-runtime-read-projection',
    moduleId: EMPRESAS_LOCAL_READ_MODULE_ID,
    modelType: EMPRESAS_LOCAL_READ_MODEL_TYPE,
    source: EMPRESAS_LOCAL_READ_SOURCE,
    items,
    records: items,
    total: Number(listResult.total || 0),
    page: Number(listResult.page || 1),
    pageSize: Number(listResult.pageSize || 50),
    sort: typeof query.sort === 'string' ? query.sort : 'codempresa',
    direction: query.direction === 'desc' ? 'desc' : 'asc',
    filters: isGenericModelPlainObject(query.filters) ? { ...query.filters } : {},
    search: typeof query.search === 'string' ? query.search : '',
    tenantScope: typeof o.tenantScope === 'string' ? o.tenantScope : null,
    diagnostics: { readOnly: true, writePathTouched: false },
    fallbackMetadata: { available: true, byteIdentical: true },
    readOnly: true,
    prismaAccessed: false,
    backendAccessed: false,
    fetchUsed: false,
    productionAccessed: false,
  });
}

export default createEmpresasRuntimeReadProjection;
