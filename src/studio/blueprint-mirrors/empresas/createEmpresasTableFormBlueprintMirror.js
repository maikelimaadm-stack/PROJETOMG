import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { createEmpresasCanonicalContract } from '../../../modules/empresas/local-read-contract-pilot/certification/createEmpresasCanonicalContract.js';
import { mirrorDigest } from './empresasBlueprintMirrorConfig.js';

/**
 * Mirrors the Empresas table + form onto the certified read contract. Pure, headless,
 * reference-only. Columns/fields derive from the certified field lists (no invented
 * columns); real preferences/layout stay `referenceOnly`; gaps are recorded.
 *
 * @param {Object} [options]
 * @returns {Object} table/form blueprint mirror
 */
export function createEmpresasTableFormBlueprintMirror(options = {}) {
  void options;
  const contract = createEmpresasCanonicalContract();
  const r = contract.record;

  // Table columns: the certified sortable/filterable fields are the observable columns.
  const columnSet = [...new Set([...r.sortableFields, ...r.filterableFields])];
  const columns = columnSet.map((name) => ({
    name,
    visible: true,
    sortable: r.sortableFields.includes(name),
    filterable: r.filterableFields.includes(name),
    searchable: r.searchableFields.includes(name),
    source: 'empresas-local-read-contract@1.0.0',
  }));

  const table = {
    columns,
    columnOrder: columnSet,
    rowActions: 'existingProductionBehavior/referenceOnly',
    toolbarActions: 'existingProductionBehavior/referenceOnly',
    export: { present: true, source: 'src/modules/empresas/config/empPdfExportConfig.jsx', referenceOnly: true },
    pagination: { present: true, envelope: contract.listEnvelope.fields, referenceOnly: true },
    preferencesLayout: { present: true, referenceOnly: true },
  };

  // Form fields: required + optional certified fields (id hidden), grouped generically.
  const formFieldNames = [...r.requiredFields, ...r.optionalFields].filter((n) => n !== 'id');
  const form = {
    fields: formFieldNames,
    groups: [{ group: 'identificação', fields: formFieldNames.filter((n) => ['codempresa', 'razao_social', 'nome_fantasia', 'tipo_pessoa', 'cpf_cnpj'].includes(n)) }, { group: 'localização', fields: formFieldNames.filter((n) => ['cidade', 'estado'].includes(n)) }, { group: 'status', fields: formFieldNames.filter((n) => ['status'].includes(n)) }],
    requiredFields: r.requiredFields.filter((n) => n !== 'id'),
    apparentValidations: { source: 'src/modules/empresas/config/empresasSchema.js', referenceOnly: true, confirmedInContract: false },
    submitActions: 'existingProductionBehavior/referenceOnly',
    createMode: 'existingProductionBehavior/referenceOnly',
    editMode: 'existingProductionBehavior/referenceOnly',
    deleteBehavior: 'existingProductionBehavior/referenceOnly',
    preferencesLayout: { present: true, referenceOnly: true },
  };

  const gaps = [];
  if (!table.pagination.present) gaps.push('table pagination not confirmed');
  if (!form.apparentValidations.confirmedInContract) gaps.push('form validations not in read contract → needs_alignment');

  const body = {
    kind: 'empresas-table-form-blueprint-mirror',
    table,
    form,
    gaps,
    uiChanged: false,
    preferencesChanged: false,
    alignmentStatus: gaps.length > 0 ? 'partially_aligned' : 'aligned',
  };
  return safeCloneGenericModel({ ...body, tableFormDigest: mirrorDigest({ columns: columnSet, formFields: formFieldNames }) });
}

export default createEmpresasTableFormBlueprintMirror;
