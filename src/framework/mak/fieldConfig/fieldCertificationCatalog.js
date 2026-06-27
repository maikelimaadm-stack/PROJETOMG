/**
 * Catálogo de certificação V14 — todos os tipos registrados na Field Engine.
 * Módulo fictício consome exclusivamente esta metadata (sem React específico).
 */
export const MAK_FIELD_CERTIFICATION_CATALOG = Object.freeze([
  { id: "cert_text", name: "cert_text", label: "Texto", type: "text", placeholder: "Texto livre" },
  { id: "cert_number", name: "cert_number", label: "Número", type: "number" },
  { id: "cert_decimal", name: "cert_decimal", label: "Decimal", type: "decimal", usar_decimal: true, decimal_places: 2 },
  { id: "cert_moeda", name: "cert_moeda", label: "Moeda", type: "moeda" },
  { id: "cert_percentual", name: "cert_percentual", label: "Percentual", type: "percentual" },
  { id: "cert_date", name: "cert_date", label: "Data", type: "date" },
  { id: "cert_time", name: "cert_time", label: "Hora", type: "time" },
  { id: "cert_datetime", name: "cert_datetime", label: "Data e Hora", type: "datetime" },
  { id: "cert_email", name: "cert_email", label: "E-mail", type: "email" },
  { id: "cert_url", name: "cert_url", label: "URL", type: "url" },
  { id: "cert_tel", name: "cert_tel", label: "Telefone", type: "tel" },
  { id: "cert_celular", name: "cert_celular", label: "Celular", type: "celular" },
  { id: "cert_cep", name: "cert_cep", label: "CEP", type: "cep" },
  { id: "cert_cpf_cnpj", name: "cert_cpf_cnpj", label: "CPF/CNPJ", type: "cpf_cnpj" },
  {
    id: "cert_select",
    name: "cert_select",
    label: "Select",
    type: "select",
    options: ["Opção A", "Opção B"],
  },
  {
    id: "cert_multiselect",
    name: "cert_multiselect",
    label: "MultiSelect",
    type: "option_list",
    options: ["Tag 1", "Tag 2", "Tag 3"],
  },
  {
    id: "cert_autocomplete",
    name: "cert_autocomplete",
    label: "Autocomplete",
    type: "autocomplete",
    options: [{ id: "1", nome: "Item 1" }, { id: "2", nome: "Item 2" }],
    displayField: "nome",
  },
  { id: "cert_checkbox", name: "cert_checkbox", label: "Checkbox", type: "checkbox" },
  { id: "cert_switch", name: "cert_switch", label: "Switch", type: "switch" },
  { id: "cert_textarea", name: "cert_textarea", label: "Textarea", type: "textarea", rows: 3 },
  { id: "cert_image", name: "cert_image", label: "Imagem", type: "image" },
  { id: "cert_file", name: "cert_file", label: "Upload", type: "file" },
  { id: "cert_calculado", name: "cert_calculado", label: "Calculado", type: "calculado", readOnly: true },
  { id: "cert_galeria", name: "cert_galeria", label: "Galeria", type: "galeria" },
  { id: "cert_documentos", name: "cert_documentos", label: "Documentos", type: "documentos" },
]);

export const MAK_FIELD_CERTIFICATION_LAYOUT = Object.freeze({
  principais: MAK_FIELD_CERTIFICATION_CATALOG.map((field) => field.id),
});

export default MAK_FIELD_CERTIFICATION_CATALOG;
