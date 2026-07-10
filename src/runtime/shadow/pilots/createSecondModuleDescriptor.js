/**
 * Static, SAFE generic descriptor for the second pilot module — `cadcps`
 * (CadCpsCampo, "Cadastro de Campos"). Chosen as the second module because it
 * is a real, simple config-field cadastro that mirrors the Empresas table/form
 * structure, with no critical operational flow and no mandatory external
 * integration. As with Empresas, the runtime never imports the production
 * `src/modules/cadcps/*` UI — this passive descriptor mirrors its known
 * columns/fields and can be overridden by caller-supplied input.
 *
 * @type {import('../../types/generic-module-shadow.js').GenericModuleDescriptor}
 */
export const CADCPS_DESCRIPTOR = {
  moduleId: 'cadcps',
  moduleName: 'Cadastro de Campos',
  entityName: 'CadCpsCampo',
  fields: [
    { id: 'nome', label: 'Nome do Campo', type: 'text', required: true, validation: { rules: ['required', 'uppercase'] } },
    { id: 'tela_id', label: 'Tela', type: 'select', required: true, validation: { rules: ['required'] } },
    { id: 'tipo', label: 'Tipo', type: 'select', required: true, validation: { rules: ['required'] } },
    { id: 'field_name', label: 'Field Name', type: 'text', required: false },
    { id: 'descricao', label: 'Descrição', type: 'text', required: false },
    { id: 'obrigatorio', label: 'Obrigatório', type: 'select', required: false },
    { id: 'ativo', label: 'Ativo', type: 'select', required: false, permission: 'cadcps.manage' },
  ],
  table: {
    columns: [
      { id: 'codigo', label: 'Código', sortable: true, filterable: true, visible: true },
      { id: 'nome', label: 'Nome do Campo', sortable: true, filterable: true, visible: true },
      { id: 'tipo', label: 'Tipo', sortable: true, filterable: true, visible: true },
      { id: 'telas', label: 'Tela', sortable: false, filterable: true, visible: true },
      { id: 'obrigatorio', label: 'Obrigatório', sortable: true, filterable: false, visible: true },
      { id: 'ativo', label: 'Ativo', sortable: true, filterable: false, visible: false },
    ],
    actions: [
      { id: 'cps.create', kind: 'action', ref: 'cps_create' },
      { id: 'cps.edit', kind: 'action', ref: 'cps_edit' },
    ],
  },
  form: {
    actions: [{ id: 'cps.save', kind: 'action', ref: 'cps_save' }],
    workflows: [{ id: 'cps.publish', ref: 'cps_publish' }],
  },
  requiredFields: ['nome', 'tela_id', 'tipo'],
};

/**
 * Returns a deep, independent copy of the cadcps descriptor (callers can never
 * mutate the shared template). Alias-friendly: `createSecondModuleDescriptor`.
 * @returns {import('../../types/generic-module-shadow.js').GenericModuleDescriptor}
 */
export function createCadcpsDescriptor() {
  return JSON.parse(JSON.stringify(CADCPS_DESCRIPTOR));
}

/** Generic alias — the "second module" descriptor factory. */
export const createSecondModuleDescriptor = createCadcpsDescriptor;
