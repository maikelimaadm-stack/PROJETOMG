import { isGenericModelPlainObject } from '../../../runtime/generic-model/index.js';

/**
 * Deterministic pagination over a record list. Pure; never mutates the input.
 * A page beyond range returns an empty `items` with a safe, coherent envelope.
 *
 * @param {Object} [options]
 * @param {Object[]} [options.records]
 * @param {number} [options.page] 1-based (default 1)
 * @param {number} [options.pageSize] default 50
 * @returns {{items: Object[], total: number, page: number, pageSize: number, totalPages: number, hasNext: boolean, nextCursor: null}}
 */
export function applyEmpresaReadPagination(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const records = Array.isArray(o.records) ? o.records : [];
  const total = records.length;
  const pageSize = Number.isInteger(o.pageSize) && o.pageSize > 0 ? o.pageSize : 50;
  const totalPages = total === 0 ? 1 : Math.ceil(total / pageSize);
  const page = Number.isInteger(o.page) && o.page > 0 ? o.page : 1;

  const start = (page - 1) * pageSize;
  const items = start >= total ? [] : records.slice(start, start + pageSize);
  const hasNext = page < totalPages && items.length > 0;

  return { items, total, page, pageSize, totalPages, hasNext, nextCursor: null };
}

export default applyEmpresaReadPagination;
