import { redactSensitive, safeClone } from '../../shadow/pilots/tableFormProjection.js';

/**
 * Builds a deterministic, SAFE mock preview model for the Empresas dev-only
 * preview harness. It uses only structural example data — never real company
 * data, never a database/backend/Prisma query, never network I/O. Sensitive
 * example keys are masked. The same call always returns the same model.
 *
 * The output is shaped exactly like a `ControlledPreview` preview model
 * (`{ table, form, diagnostics, meta }`), so it flows through
 * `EmpresasDevPreview` / `createEmpresasDevPreviewModel` unchanged.
 *
 * @returns {import('../../types/preview.js').PreviewModel}
 */
export function createEmpresasDevPreviewFixture() {
  const columns = [
    { id: 'codempresa', label: 'Cód.', sortable: true, filterable: true, visible: true },
    { id: 'cpf_cnpj', label: 'CPF/CNPJ', sortable: false, filterable: true, visible: true },
    { id: 'inscricao_estadual', label: 'IE', sortable: false, filterable: false, visible: false },
    { id: 'razao_social', label: 'Razão Social', sortable: true, filterable: true, visible: true },
    { id: 'status', label: 'Ativa', sortable: true, filterable: true, visible: true },
  ];
  /** @type {Record<string, string>} */
  const headerLabels = {};
  /** @type {Record<string, {sortable: boolean, filterable: boolean}>} */
  const cellMetadata = {};
  for (const c of columns) {
    headerLabels[c.id] = c.label;
    cellMetadata[c.id] = { sortable: c.sortable, filterable: c.filterable };
  }

  const fields = [
    { id: 'codempresa', label: 'Cód. Empresa', type: 'string', required: false, permitted: true, denied: false, validation: { rules: [], source: 'descriptor' } },
    { id: 'cpf_cnpj', label: 'CPF/CNPJ', type: 'document', required: false, permitted: true, denied: false, validation: { rules: ['cpf_cnpj'], source: 'descriptor' } },
    { id: 'inscricao_estadual', label: 'Inscrição Estadual', type: 'string', required: false, permission: 'empresas.view_fiscal', permitted: false, denied: true, validation: { rules: [], source: 'descriptor' } },
    { id: 'razao_social', label: 'Nome/Razão Social', type: 'string', required: true, permitted: true, denied: false, validation: { rules: ['required', 'uppercase'], source: 'descriptor' } },
    { id: 'tipo_pessoa', label: 'Tipo de Pessoa', type: 'select', required: true, permitted: true, denied: false, validation: { rules: ['required'], source: 'descriptor' } },
  ];
  const visibleFields = fields.filter((f) => !f.denied).map((f) => f.id);

  const model = {
    moduleId: 'empresas',
    entityName: 'EmpresaCadastro',
    kind: /** @type {'preview-model'} */ ('preview-model'),
    isPreviewModel: true,
    table: {
      columns,
      visibleColumns: columns.filter((c) => c.visible).map((c) => c.id),
      headerLabels,
      cellMetadata,
      rowActions: [
        { id: 'empresa.create', kind: 'action', ref: 'empresa_create' },
        { id: 'empresa.edit', kind: 'action', ref: 'empresa_edit' },
      ],
    },
    form: {
      fields,
      visibleFields,
      sections: [{ id: 'default', label: 'Empresa', fields: visibleFields }],
      formActions: [{ id: 'empresa.save', kind: 'action', ref: 'empresa_save' }],
      formWorkflows: [{ id: 'empresa.approval', ref: 'empresa_approval' }],
    },
    diagnostics: {
      warnings: ['1 field(s) denied by permission'],
      differences: [{ path: 'form' }],
      deniedFields: ['inscricao_estadual'],
      missingLabels: [],
      invalidMetadata: [],
      unsupportedFeatures: ['form.workflows:metadata-only'],
    },
    // Example metadata — sensitive-looking keys are masked before leaving the fixture.
    meta: /** @type {Record<string, unknown>} */ (redactSensitive(safeClone({
      source: 'mock-fixture',
      mocked: true,
      region: 'BR',
      apiKey: 'EXAMPLE-KEY-SHOULD-BE-MASKED',
    }))),
  };

  // Return a deep, independent copy — callers can never mutate the shared fixture template.
  return /** @type {import('../../types/preview.js').PreviewModel} */ (safeClone(model));
}
