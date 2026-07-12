import { isGenericModelPlainObject } from '../../../runtime/generic-model/index.js';
import {
  EMPRESAS_LOCAL_READ_SORTABLE,
  EMPRESAS_LOCAL_READ_FILTERABLE,
  EMPRESAS_LOCAL_READ_MAX_PAGE_SIZE,
  EMPRESAS_LOCAL_READ_MAX_SEARCH_LEN,
  EMPRESAS_LOCAL_READ_MUTATION_TOKENS,
} from './empresasLocalReadContractConfig.js';

const FORBIDDEN_KEYS = new Set(['__proto__', 'prototype', 'constructor']);
const RAW_SQL = /\b(select|insert|update|delete|drop|union|--|;)\b/i;
const EXTERNAL_URL = /https?:\/\/|railway|\/api\//i;

function isUnsafeValue(v) {
  if (typeof v === 'function') return true;
  if (v && typeof v === 'object') {
    // React element or Prisma-like object → unsafe.
    if (v.$$typeof) return true;
    if (typeof v.$queryRaw === 'function' || typeof v.findMany === 'function' || v._prisma) return true;
  }
  if (typeof v === 'string') {
    if (RAW_SQL.test(v)) return true;
    if (EXTERNAL_URL.test(v)) return true;
    if (EMPRESAS_LOCAL_READ_MUTATION_TOKENS.some((t) => v.toLowerCase() === t)) return true;
  }
  return false;
}

function hasForbiddenKeys(obj) {
  if (!isGenericModelPlainObject(obj)) return false;
  return Object.keys(obj).some((k) => FORBIDDEN_KEYS.has(k));
}

/**
 * Validates a read query for the pilot. Pure; fail-closed. Returns a normalized,
 * safe query plus blockers. Never throws for a bad query — returns `valid:false`.
 *
 * @param {Object} [options]
 * @param {Object} [options.query]
 * @returns {{valid: boolean, reason: string, blockers: string[], normalized: Object}}
 */
export function validateEmpresaReadQuery(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const q = isGenericModelPlainObject(o.query) ? o.query : {};
  /** @type {string[]} */ const blockers = [];

  if (hasForbiddenKeys(q) || hasForbiddenKeys(q.filters)) blockers.push('prototype-pollution');
  for (const [k, v] of Object.entries(q)) {
    if (k === 'filters') continue;
    if (isUnsafeValue(v)) blockers.push(`unsafe-value:${k}`);
  }
  if (isGenericModelPlainObject(q.filters)) {
    for (const [k, v] of Object.entries(q.filters)) {
      if (!EMPRESAS_LOCAL_READ_FILTERABLE.includes(k)) blockers.push(`filter-not-allowed:${k}`);
      if (isUnsafeValue(v)) blockers.push(`unsafe-filter:${k}`);
    }
  } else if (q.filters !== undefined) {
    blockers.push('filters-not-object');
  }

  const page = q.page === undefined ? 1 : Number(q.page);
  if (!Number.isInteger(page) || page < 1) blockers.push('invalid-page');
  const pageSize = q.pageSize === undefined ? 50 : Number(q.pageSize);
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > EMPRESAS_LOCAL_READ_MAX_PAGE_SIZE) blockers.push('invalid-pageSize');

  const sort = q.sort === undefined ? 'codempresa' : q.sort;
  if (typeof sort !== 'string' || !EMPRESAS_LOCAL_READ_SORTABLE.includes(sort)) blockers.push('invalid-sort');
  const direction = q.direction === undefined ? 'asc' : String(q.direction).toLowerCase();
  if (direction !== 'asc' && direction !== 'desc') blockers.push('invalid-direction');

  const search = q.search === undefined || q.search === null ? '' : q.search;
  if (typeof search !== 'string') blockers.push('invalid-search');
  else if (search.length > EMPRESAS_LOCAL_READ_MAX_SEARCH_LEN) blockers.push('search-too-long');

  const valid = blockers.length === 0;
  return {
    valid,
    reason: valid ? 'valid' : blockers[0],
    blockers,
    normalized: valid
      ? { page, pageSize, sort, direction, search, filters: isGenericModelPlainObject(q.filters) ? { ...q.filters } : {} }
      : { page: 1, pageSize: 50, sort: 'codempresa', direction: 'asc', search: '', filters: {} },
  };
}

export default validateEmpresaReadQuery;
