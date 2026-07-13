import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { createEmpresasCanonicalContract } from '../../../modules/empresas/local-read-contract-pilot/certification/createEmpresasCanonicalContract.js';
import { createStudioCanonicalFieldContract } from '../../foundation-contracts/certification/createStudioCanonicalFieldContract.js';
import { mirrorDigest } from './empresasBlueprintMirrorConfig.js';

/**
 * Type inference for the REAL Empresa read fields, mapped to the certified Studio
 * canonical field types. No invented fields — only what the Empresas certified read
 * contract guarantees. `campos_personalizados` maps to no single Studio type (it is a
 * cadcps custom-field container), so it is recorded as an unsupported/needs-alignment
 * mapping, not an error.
 * @type {Record<string, { type: string, confidence: string, note: string }>}
 */
const FIELD_TYPE_MAP = {
  id: { type: 'text', confidence: 'high', note: 'identifier' },
  cliente_id: { type: 'text', confidence: 'high', note: 'tenant field; protected' },
  id_global: { type: 'text', confidence: 'high', note: 'global identifier' },
  codempresa: { type: 'text', confidence: 'medium', note: 'business code; could be number, kept text' },
  razao_social: { type: 'text', confidence: 'high', note: 'legal name' },
  nome_fantasia: { type: 'text', confidence: 'high', note: 'trade name; nullable' },
  tipo_pessoa: { type: 'select', confidence: 'medium', note: 'PF/PJ; select options metadata not in read contract → needs_alignment' },
  cpf_cnpj: { type: 'text', confidence: 'medium', note: 'document; masked/validated in UI, not in read contract' },
  cidade: { type: 'text', confidence: 'high', note: 'city; nullable' },
  estado: { type: 'text', confidence: 'medium', note: 'UF; could be select, kept text' },
  status: { type: 'status', confidence: 'high', note: 'maps directly to Studio status type' },
  campos_personalizados: { type: 'unsupported', confidence: 'low', note: 'cadcps custom-field container; no single Studio type' },
  createdAt: { type: 'datetime', confidence: 'high', note: 'audit timestamp' },
  updatedAt: { type: 'datetime', confidence: 'high', note: 'audit timestamp' },
};

/**
 * Mirrors the REAL Empresas fields onto the certified Studio field contract. Pure,
 * headless, reference-only. Never invents a production field and never alters Empresas.
 *
 * @param {Object} [options]
 * @returns {Object} field blueprint mirror
 */
export function createEmpresasFieldBlueprintMirror(options = {}) {
  void options;
  const contract = createEmpresasCanonicalContract();
  const studioField = createStudioCanonicalFieldContract();
  const allowedTypes = new Set(studioField.allowedTypes);
  const r = contract.record;

  const sourceFields = [...r.allFields];
  const fields = sourceFields.map((name) => {
    const map = FIELD_TYPE_MAP[name] || { type: 'unsupported', confidence: 'low', note: 'no inference' };
    const typeAllowed = allowedTypes.has(map.type);
    const tenantScoped = r.tenantFields.includes(name);
    const protectedField = r.protectedFields.includes(name);
    return {
      name,
      label: name,
      type: map.type,
      typeAllowed,
      required: r.requiredFields.includes(name),
      visibleInTable: r.sortableFields.includes(name) || r.filterableFields.includes(name) || ['razao_social', 'codempresa', 'status'].includes(name),
      visibleInForm: !['id', '__fixture'].includes(name),
      searchable: r.searchableFields.includes(name),
      filterable: r.filterableFields.includes(name),
      sortable: r.sortableFields.includes(name),
      permission: 'read',
      tenantScoped,
      protected: protectedField,
      source: 'empresas-local-read-contract@1.0.0',
      confidence: map.confidence,
      alignmentNotes: map.note,
      alignmentStatus: typeAllowed ? (map.confidence === 'low' ? 'needs_alignment' : 'aligned') : 'not_aligned',
    };
  });

  const mappedFields = fields.filter((f) => f.typeAllowed).map((f) => f.name);
  const unmappedFields = fields.filter((f) => !f.typeAllowed).map((f) => f.name);
  const unsupportedFields = fields.filter((f) => f.type === 'unsupported').map((f) => f.name);
  const needsAlignment = fields.filter((f) => f.alignmentStatus === 'needs_alignment').map((f) => f.name);

  const body = {
    kind: 'empresas-field-blueprint-mirror',
    fields,
    sourceFields,
    mappedFields,
    unmappedFields,
    unsupportedFields,
    requiredFields: [...r.requiredFields],
    optionalFields: [...r.optionalFields],
    protectedFields: [...r.protectedFields],
    tenantFields: [...r.tenantFields],
    searchableFields: [...r.searchableFields],
    filterableFields: [...r.filterableFields],
    sortableFields: [...r.sortableFields],
    computedFields: [],
    relationFields: [],
    customFieldHooks: { source: 'src/modules/cadcps', field: 'campos_personalizados', documentedOnly: true },
    needsAlignment,
    invented: false,
    alignmentStatus: unsupportedFields.length > 0 || needsAlignment.length > 0 ? 'partially_aligned' : 'aligned',
  };
  return safeCloneGenericModel({ ...body, fieldDigest: mirrorDigest({ fields: fields.map((f) => [f.name, f.type, f.alignmentStatus]) }) });
}

export default createEmpresasFieldBlueprintMirror;
