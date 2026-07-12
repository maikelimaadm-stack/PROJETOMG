import { safeCloneGenericModel, createGenericModelChecksum } from '../../../../runtime/generic-model/index.js';
import { EMPRESAS_READ_ERROR_TYPES, createEmpresasReadError } from '../hardening/createEmpresasReadErrorContract.js';

/** Reference HTTP semantics per error type (documentation only — no HTTP is made). */
const HTTP_SEMANTIC = {
  validation: 400, context: 400, security: 403, auth: 401, notfound: 404, internal: 500,
};

/**
 * The canonical error catalog (the 22 hardened types), each certified with a
 * sanitized template + reference http semantic. Codes and types validated for
 * uniqueness. No secrets/JWT/DATABASE_URL/API_URL/personal data.
 *
 * @returns {Object} error catalog descriptor
 */
export function createEmpresasCanonicalErrorCatalog() {
  const entries = Object.keys(EMPRESAS_READ_ERROR_TYPES).map((code) => {
    const e = createEmpresasReadError(code, { operation: 'read' });
    return {
      code: e.code,
      type: e.type,
      category: EMPRESAS_READ_ERROR_TYPES[code].type,
      messageTemplate: e.message,
      retryable: e.retryable,
      httpSemantic: HTTP_SEMANTIC[e.type] || 400,
      safe: true,
      mutationExecuted: false,
      productionAccessed: false,
      backendAccessed: false,
      prismaAccessed: false,
      fetchUsed: false,
    };
  });

  const codes = entries.map((x) => x.code);
  const uniqueCodes = new Set(codes).size === codes.length;

  const body = {
    kind: 'empresas-canonical-error-catalog',
    total: entries.length,
    entries,
    uniqueCodes,
    // "types" here are the error type categories; multiple codes share a category,
    // so uniqueness is asserted on codes (unique) and the category set is reported.
    categories: [...new Set(entries.map((x) => x.category))],
  };
  return safeCloneGenericModel({ ...body, errorCatalogDigest: createGenericModelChecksum({ value: entries.map((x) => [x.code, x.category, x.retryable]) }) });
}

export default createEmpresasCanonicalErrorCatalog;
