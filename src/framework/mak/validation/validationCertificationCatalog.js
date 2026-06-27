/**
 * Catálogo de certificação V16 — Validation Configuration Engine.
 * Demonstra validações exclusivamente via metadata.
 */
export const MAK_VALIDATION_CERTIFICATION_CATALOG = Object.freeze([
  {
    id: "val_required",
    name: "val_required",
    label: "Obrigatório",
    type: "text",
    required: true,
    validation: { required: true, messages: { required: "Campo obrigatório." } },
  },
  {
    id: "val_email",
    name: "val_email",
    label: "E-mail",
    type: "email",
    validation: { email: true, messages: { email: "E-mail inválido." } },
  },
  {
    id: "val_url",
    name: "val_url",
    label: "URL",
    type: "url",
    validation: { url: true, messages: { url: "URL inválida." } },
  },
  {
    id: "val_min_max",
    name: "val_min_max",
    label: "Número min/max",
    type: "number",
    validation: { min: 1, max: 100, messages: { min: "Mínimo 1.", max: "Máximo 100." } },
  },
  {
    id: "val_minlength",
    name: "val_minlength",
    label: "Min length",
    type: "text",
    validation: { minLength: 3, messages: { minLength: "Mínimo 3 caracteres." } },
  },
  {
    id: "val_maxlength",
    name: "val_maxlength",
    label: "Max length",
    type: "text",
    validation: { maxLength: 10, messages: { maxLength: "Máximo 10 caracteres." } },
  },
  {
    id: "val_regex",
    name: "val_regex",
    label: "Regex",
    type: "text",
    validation: { regex: "^[A-Z]{3}$", messages: { regex: "Use 3 letras maiúsculas." } },
  },
  {
    id: "val_cep",
    name: "val_cep",
    label: "CEP",
    type: "cep",
    validation: { cep: true, messages: { cep: "CEP inválido." } },
  },
  {
    id: "val_cpf_cnpj",
    name: "val_cpf_cnpj",
    label: "CPF/CNPJ",
    type: "cpf_cnpj",
    validation: { cpf_cnpj: true, messages: { cpf_cnpj: "CPF/CNPJ inválido." } },
  },
  {
    id: "val_tel",
    name: "val_tel",
    label: "Telefone",
    type: "tel",
    validation: { tel: true, messages: { tel: "Telefone inválido." } },
  },
  {
    id: "val_precision",
    name: "val_precision",
    label: "Precisão",
    type: "decimal",
    validation: { precision: 2, messages: { precision: "Máximo 2 casas decimais." } },
  },
  {
    id: "val_mask",
    name: "val_mask",
    label: "Máscara",
    type: "text",
    validation: { mask: "###-##", messages: { mask: "Formato ###-##." } },
  },
  {
    id: "val_when",
    name: "val_when",
    label: "Condicional",
    type: "text",
    validation: {
      when: [{ type: "required", message: "Preencha quando toggle ativo." }],
    },
    dependsOn: "val_switch",
  },
  {
    id: "val_switch",
    name: "val_switch",
    label: "Toggle condição",
    type: "switch",
  },
  {
    id: "val_readonly",
    name: "val_readonly",
    label: "Readonly",
    type: "text",
    readOnly: true,
    defaultValue: "Somente leitura",
  },
  {
    id: "val_disabled",
    name: "val_disabled",
    label: "Disabled",
    type: "text",
    disabled: true,
  },
  {
    id: "val_hidden",
    name: "val_hidden",
    label: "Hidden",
    type: "text",
    hidden: true,
  },
]);

export const MAK_VALIDATION_CERTIFICATION_LAYOUT = Object.freeze({
  principais: MAK_VALIDATION_CERTIFICATION_CATALOG.map((field) => field.id),
});

export default MAK_VALIDATION_CERTIFICATION_CATALOG;
