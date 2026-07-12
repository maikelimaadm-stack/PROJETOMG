import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../../runtime/generic-model/index.js';

/** Canonical error categories with type + retryable classification. */
export const EMPRESAS_READ_ERROR_TYPES = {
  INVALID_QUERY: { type: 'validation', retryable: true },
  INVALID_PAGE: { type: 'validation', retryable: true },
  INVALID_PAGE_SIZE: { type: 'validation', retryable: true },
  INVALID_SORT: { type: 'validation', retryable: true },
  INVALID_DIRECTION: { type: 'validation', retryable: true },
  INVALID_FILTER: { type: 'validation', retryable: true },
  INVALID_SEARCH: { type: 'validation', retryable: true },
  INVALID_CONTEXT: { type: 'context', retryable: false },
  TENANT_REQUIRED: { type: 'context', retryable: false },
  TENANT_MISMATCH: { type: 'security', retryable: false },
  HEADER_REQUIRED: { type: 'context', retryable: false },
  HEADER_INVALID: { type: 'context', retryable: false },
  TOKEN_EXPIRED: { type: 'auth', retryable: false },
  PERMISSION_DENIED: { type: 'security', retryable: false },
  RECORD_NOT_FOUND: { type: 'notfound', retryable: false },
  DATASET_INVALID: { type: 'internal', retryable: false },
  PARITY_MISMATCH: { type: 'internal', retryable: false },
  MUTATION_BLOCKED: { type: 'security', retryable: false },
  PRODUCTION_BLOCKED: { type: 'security', retryable: false },
  BACKEND_BLOCKED: { type: 'security', retryable: false },
  PRISMA_BLOCKED: { type: 'security', retryable: false },
  FETCH_BLOCKED: { type: 'security', retryable: false },
};

/** Sanitized, non-sensitive messages (no secrets/JWT/URLs/personal data). */
const MESSAGES = {
  INVALID_QUERY: 'The read query is invalid.',
  INVALID_PAGE: 'The page parameter is invalid.',
  INVALID_PAGE_SIZE: 'The pageSize parameter is invalid.',
  INVALID_SORT: 'The sort field is not allowed.',
  INVALID_DIRECTION: 'The sort direction is invalid.',
  INVALID_FILTER: 'A filter field is not allowed.',
  INVALID_SEARCH: 'The search term is invalid.',
  INVALID_CONTEXT: 'The tenant context is invalid.',
  TENANT_REQUIRED: 'A tenant is required.',
  TENANT_MISMATCH: 'The tenant does not match the request scope.',
  HEADER_REQUIRED: 'The empresa header is required.',
  HEADER_INVALID: 'The empresa header is invalid.',
  TOKEN_EXPIRED: 'The session token has expired.',
  PERMISSION_DENIED: 'Read permission is required.',
  RECORD_NOT_FOUND: 'The record was not found in scope.',
  DATASET_INVALID: 'The synthetic dataset is invalid.',
  PARITY_MISMATCH: 'A parity divergence was detected.',
  MUTATION_BLOCKED: 'Mutation is blocked in the read-only pilot.',
  PRODUCTION_BLOCKED: 'Production access is blocked.',
  BACKEND_BLOCKED: 'Backend access is blocked.',
  PRISMA_BLOCKED: 'Prisma access is blocked.',
  FETCH_BLOCKED: 'Network access is blocked.',
};

/**
 * Builds a typed, sanitized error descriptor. Never includes secrets/JWT/
 * DATABASE_URL/API_URL/stack/personal data/full sensitive payload.
 *
 * @param {string} code one of EMPRESAS_READ_ERROR_TYPES keys
 * @param {Object} [options]
 * @param {string} [options.operation]
 * @returns {Object} error descriptor
 */
export function createEmpresasReadError(code, options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const known = EMPRESAS_READ_ERROR_TYPES[code];
  const meta = known || { type: 'internal', retryable: false };
  return safeCloneGenericModel({
    kind: 'empresas-read-error',
    code: known ? code : 'INVALID_QUERY',
    type: meta.type,
    message: MESSAGES[code] || 'Invalid read request.',
    operation: typeof o.operation === 'string' ? o.operation : 'read',
    retryable: Boolean(meta.retryable),
    safe: true,
    mutationExecuted: false,
    productionAccessed: false,
    backendAccessed: false,
    prismaAccessed: false,
    fetchUsed: false,
    diagnostics: { sanitized: true },
  });
}

/**
 * Returns the full error contract (all types) plus a factory reference.
 * @returns {Object}
 */
export function createEmpresasReadErrorContract() {
  const errors = Object.keys(EMPRESAS_READ_ERROR_TYPES).map((code) => createEmpresasReadError(code, { operation: 'read' }));
  return safeCloneGenericModel({
    kind: 'empresas-read-error-contract',
    types: Object.keys(EMPRESAS_READ_ERROR_TYPES),
    total: errors.length,
    errors,
    localOnly: true,
    readOnly: true,
  });
}

export default createEmpresasReadErrorContract;
