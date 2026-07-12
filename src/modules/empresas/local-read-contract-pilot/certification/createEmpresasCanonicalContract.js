import { isGenericModelPlainObject, safeCloneGenericModel, createGenericModelChecksum } from '../../../../runtime/generic-model/index.js';
import { EMPRESAS_READ_FIELDS } from '../normalizeEmpresaReadPayload.js';
import {
  EMPRESAS_LOCAL_READ_SORTABLE,
  EMPRESAS_LOCAL_READ_FILTERABLE,
  EMPRESAS_LOCAL_READ_SEARCHABLE,
  EMPRESAS_LOCAL_READ_MAX_PAGE_SIZE,
  EMPRESAS_LOCAL_READ_MAX_SEARCH_LEN,
} from '../empresasLocalReadContractConfig.js';
import { EMPRESAS_CONTRACT_ID } from './empresasLocalReadCertificationConfig.js';

/**
 * The canonical, versioned read contract for Empresas. Pure data derived from the
 * REAL Empresa field shape + the pilot's allowlists (no invented fields). Read-only;
 * mutation forbidden.
 *
 * @param {Object} [options]
 * @returns {Object} canonical contract descriptor
 */
export function createEmpresasCanonicalContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};

  const record = {
    requiredFields: ['id', 'cliente_id', 'codempresa', 'razao_social'],
    optionalFields: ['nome_fantasia', 'tipo_pessoa', 'cpf_cnpj', 'cidade', 'estado', 'status', 'id_global', 'campos_personalizados', 'createdAt', 'updatedAt'],
    nullableFields: ['nome_fantasia', 'cpf_cnpj', 'cidade', 'estado', 'campos_personalizados'],
    identifierFields: ['id', 'codempresa', 'id_global'],
    tenantFields: ['cliente_id'],
    sortableFields: [...EMPRESAS_LOCAL_READ_SORTABLE],
    filterableFields: [...EMPRESAS_LOCAL_READ_FILTERABLE],
    searchableFields: [...EMPRESAS_LOCAL_READ_SEARCHABLE],
    protectedFields: ['cliente_id'],
    omittedSensitiveFields: ['telefone', 'email', '__fixture'],
    allFields: [...EMPRESAS_READ_FIELDS],
  };

  const listEnvelope = {
    fields: ['items', 'total', 'page', 'pageSize', 'totalPages', 'nextCursor'],
    diagnosticsOnlyInLocalHarness: true,
  };

  const getById = {
    outcomes: ['found', 'not_found', 'permission_denied', 'tenant_mismatch', 'invalid_id'],
    returns: 'item | null',
  };

  const count = {
    scopedBy: ['tenant', 'permission', 'filters'],
    returns: 'total',
  };

  const query = {
    fields: ['page', 'pageSize', 'search', 'filters', 'sort', 'direction', 'context'],
    maxPageSize: EMPRESAS_LOCAL_READ_MAX_PAGE_SIZE,
    maxSearchLen: EMPRESAS_LOCAL_READ_MAX_SEARCH_LEN,
    directions: ['asc', 'desc'],
  };

  const safety = {
    readOnly: true,
    mutationAllowed: false,
    productionAccessed: false,
    backendAccessed: false,
    prismaAccessed: false,
    fetchUsed: false,
  };

  const body = {
    kind: 'empresas-canonical-contract',
    contractId: EMPRESAS_CONTRACT_ID,
    record,
    listEnvelope,
    getById,
    count,
    query,
    safety,
  };

  return safeCloneGenericModel({ ...body, contractDigest: createGenericModelChecksum({ value: body }) });
}

export default createEmpresasCanonicalContract;
