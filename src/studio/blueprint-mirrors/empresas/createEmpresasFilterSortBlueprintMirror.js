import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { createEmpresasCanonicalContract } from '../../../modules/empresas/local-read-contract-pilot/certification/createEmpresasCanonicalContract.js';
import { mirrorDigest } from './empresasBlueprintMirrorConfig.js';

/**
 * Mirrors the Empresas search/filter/sort surface against the certified read contract
 * and the Studio canonical query semantics. Pure, headless, reference-only.
 *
 * @param {Object} [options]
 * @returns {Object} filter/sort blueprint mirror
 */
export function createEmpresasFilterSortBlueprintMirror(options = {}) {
  void options;
  const contract = createEmpresasCanonicalContract();
  const r = contract.record;
  const q = contract.query;

  const supportedSearch = { fields: [...r.searchableFields], maxSearchLen: q.maxSearchLen, present: r.searchableFields.length > 0 };
  const supportedFilters = [...r.filterableFields];
  const supportedSorts = [...r.sortableFields];
  const directions = [...q.directions];

  // Fields present in the record but NOT filterable/sortable are documented as gaps
  // (not unsupported by the contract — simply out of the certified query surface).
  const nonQueryableFields = r.allFields.filter((f) => !supportedFilters.includes(f) && !supportedSorts.includes(f) && !r.searchableFields.includes(f));

  const pagination = { fields: ['page', 'pageSize'], maxPageSize: q.maxPageSize, envelope: contract.listEnvelope.fields, present: true };

  const queryAlignment = {
    emptyResultBehavior: 'contract: returns empty items + total 0',
    invalidQueryBehavior: 'contract: validated (maxPageSize/maxSearchLen), fail-closed',
    defaultQueryBehavior: 'contract: page 1, default pageSize, tenant-scoped',
    aligned: true,
  };

  const gaps = [];
  if (nonQueryableFields.length > 0) gaps.push(`fields outside certified query surface: ${nonQueryableFields.join(', ')}`);

  const body = {
    kind: 'empresas-filter-sort-blueprint-mirror',
    supportedSearch,
    supportedFilters,
    supportedSorts,
    directions,
    pagination,
    unsupportedFilters: [],
    unsupportedSorts: [],
    nonQueryableFields,
    queryAlignment,
    gaps,
    risks: nonQueryableFields.length > 0 ? ['UI may expose columns without certified query support'] : [],
    alignmentStatus: gaps.length > 0 ? 'partially_aligned' : 'aligned',
  };
  return safeCloneGenericModel({ ...body, filterSortDigest: mirrorDigest({ search: r.searchableFields, filters: supportedFilters, sorts: supportedSorts }) });
}

export default createEmpresasFilterSortBlueprintMirror;
