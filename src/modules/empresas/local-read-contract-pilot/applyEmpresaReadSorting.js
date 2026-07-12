import { isGenericModelPlainObject } from '../../../runtime/generic-model/index.js';

/**
 * Stable sort of a record list by a single field. Pure; never mutates the input.
 * Stability is guaranteed by breaking ties on the original index.
 *
 * @param {Object} [options]
 * @param {Object[]} [options.records]
 * @param {string} [options.sort] field to sort by (default 'codempresa')
 * @param {'asc'|'desc'} [options.direction] default 'asc'
 * @returns {Object[]} sorted records (new array)
 */
export function applyEmpresaReadSorting(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const records = Array.isArray(o.records) ? o.records : [];
  const sort = typeof o.sort === 'string' ? o.sort : 'codempresa';
  const dir = o.direction === 'desc' ? -1 : 1;

  const indexed = records.map((rec, idx) => ({ rec, idx }));
  indexed.sort((a, b) => {
    const av = a.rec[sort];
    const bv = b.rec[sort];
    let cmp;
    if (typeof av === 'number' && typeof bv === 'number') {
      cmp = av - bv;
    } else {
      cmp = String(av ?? '').localeCompare(String(bv ?? ''), 'pt-BR', { numeric: true, sensitivity: 'base' });
    }
    if (cmp !== 0) return cmp * dir;
    return a.idx - b.idx; // stable tie-break
  });
  return indexed.map((x) => x.rec);
}

export default applyEmpresaReadSorting;
