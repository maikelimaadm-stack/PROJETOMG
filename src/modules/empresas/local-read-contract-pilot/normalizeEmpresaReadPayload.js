import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/**
 * The public read fields the pilot exposes — mirrors the real `Empresa` shape,
 * minus the internal `__fixture` metadata (never exposed in a normalized payload).
 */
export const EMPRESAS_READ_FIELDS = [
  'id', 'cliente_id', 'id_global', 'codempresa', 'razao_social', 'nome_fantasia',
  'tipo_pessoa', 'cpf_cnpj', 'cidade', 'estado', 'status', 'campos_personalizados',
  'createdAt', 'updatedAt',
];

/**
 * Normalizes a single synthetic record into the read payload. Pure; preserves IDs
 * and tenant scope (`cliente_id`), coerces missing values to `null`, and never
 * leaks the `__fixture` metadata. Returns a safe copy.
 *
 * @param {Object} [options]
 * @param {Object} [options.record]
 * @returns {Object|null}
 */
export function normalizeEmpresaReadPayload(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const record = isGenericModelPlainObject(o.record) ? o.record : null;
  if (!record) return null;

  /** @type {Record<string, unknown>} */
  const out = {};
  for (const field of EMPRESAS_READ_FIELDS) {
    out[field] = record[field] === undefined ? null : record[field];
  }
  return safeCloneGenericModel(out);
}

/**
 * Normalizes a list of records.
 * @param {Object} [options]
 * @param {Object[]} [options.records]
 * @returns {Object[]}
 */
export function normalizeEmpresaReadPayloadList(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const records = Array.isArray(o.records) ? o.records : [];
  return records.map((record) => normalizeEmpresaReadPayload({ record })).filter(Boolean);
}

export default normalizeEmpresaReadPayload;
