import { isGenericModelPlainObject } from '../../../runtime/generic-model/index.js';
import { EMPRESAS_LOCAL_READ_SEARCHABLE } from './empresasLocalReadContractConfig.js';

/** Enumerable/short fields matched by case-insensitive EQUALITY (not contains). */
const EXACT_MATCH_FIELDS = new Set(['status', 'estado', 'tipo_pessoa', 'codempresa', 'id_global']);

/**
 * Applies filters + case-insensitive search to a record list. Pure; never mutates
 * the input array or its records.
 *
 * @param {Object} [options]
 * @param {Object[]} [options.records]
 * @param {Object} [options.filters] field → value (equality; string is case-insensitive contains)
 * @param {string} [options.search] case-insensitive contains across searchable fields
 * @returns {Object[]} filtered records (new array)
 */
export function applyEmpresaReadFilters(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const records = Array.isArray(o.records) ? o.records : [];
  const filters = isGenericModelPlainObject(o.filters) ? o.filters : {};
  const search = typeof o.search === 'string' ? o.search.trim().toLowerCase() : '';

  return records.filter((rec) => {
    for (const [field, value] of Object.entries(filters)) {
      if (value === undefined || value === null || value === '') continue;
      const rv = rec[field];
      if (typeof value === 'string' && !EXACT_MATCH_FIELDS.has(field)) {
        // Text fields (razao_social, nome_fantasia, cidade) → case-insensitive contains.
        if (String(rv ?? '').toLowerCase().indexOf(value.toLowerCase()) === -1) return false;
      } else if (typeof value === 'string') {
        // Enumerable/short fields → case-insensitive equality.
        if (String(rv ?? '').toLowerCase() !== value.toLowerCase()) return false;
      } else if (Number(rv) !== Number(value)) {
        return false;
      }
    }
    if (search) {
      const hit = EMPRESAS_LOCAL_READ_SEARCHABLE.some((f) => String(rec[f] ?? '').toLowerCase().includes(search));
      if (!hit) return false;
    }
    return true;
  });
}

export default applyEmpresaReadFilters;
