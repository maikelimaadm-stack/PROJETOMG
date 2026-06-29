/**
 * Smart Field Templates — centralized catalog (Program 2.3.1)
 * Single source of truth for template metadata; no duplicated logic elsewhere.
 */

export const SMART_FIELD_TEMPLATE_VERSION = "mak-smart-field-template-v1";

/** @typedef {object} SmartFieldTemplate
 * @property {string} templateId
 * @property {string} label
 * @property {string} icon
 * @property {string} fieldType
 * @property {string} [fieldNamePrefix]
 * @property {string} [category]
 * @property {string} documentation
 * @property {object} defaults
 */

export const SMART_FIELD_TEMPLATES = Object.freeze([
  {
    templateId: "cpf",
    label: "CPF",
    icon: "id-card",
    fieldType: "string",
    fieldNamePrefix: "cpf",
    category: "documentos",
    documentation: "Cadastro de Pessoa Física — 11 dígitos com validação de formato.",
    defaults: {
      label: "CPF",
      required: false,
      useMask: true,
      maskText: "999.999.999-99",
      placeholder: "000.000.000-00",
      helpText: "Informe o CPF com 11 dígitos.",
      validationHints: { pattern: "^\\d{11}$|^\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}$", minLength: 11, maxLength: 14 },
    },
  },
  {
    templateId: "cnpj",
    label: "CNPJ",
    icon: "building",
    fieldType: "string",
    fieldNamePrefix: "cnpj",
    category: "documentos",
    documentation: "Cadastro Nacional de Pessoa Jurídica — 14 dígitos.",
    defaults: {
      label: "CNPJ",
      required: false,
      useMask: true,
      maskText: "99.999.999/9999-99",
      placeholder: "00.000.000/0000-00",
      helpText: "Informe o CNPJ com 14 dígitos.",
      validationHints: { pattern: "^\\d{14}$|^\\d{2}\\.\\d{3}\\.\\d{3}/\\d{4}-\\d{2}$", minLength: 14, maxLength: 18 },
    },
  },
  {
    templateId: "email",
    label: "E-mail",
    icon: "mail",
    fieldType: "string",
    fieldNamePrefix: "email",
    category: "contato",
    documentation: "Endereço de e-mail corporativo ou pessoal.",
    defaults: {
      label: "E-mail",
      required: false,
      useMask: false,
      maskText: null,
      placeholder: "nome@empresa.com",
      helpText: "Endereço de e-mail válido.",
      validationHints: { pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$" },
    },
  },
  {
    templateId: "telefone",
    label: "Telefone",
    icon: "phone",
    fieldType: "string",
    fieldNamePrefix: "telefone",
    category: "contato",
    documentation: "Telefone fixo ou celular brasileiro.",
    defaults: {
      label: "Telefone",
      required: false,
      useMask: true,
      maskText: "(99) 99999-9999",
      placeholder: "(00) 00000-0000",
      helpText: "DDD + número com 8 ou 9 dígitos.",
      validationHints: { minLength: 10, maxLength: 15 },
    },
  },
  {
    templateId: "cep",
    label: "CEP",
    icon: "map-pin",
    fieldType: "string",
    fieldNamePrefix: "cep",
    category: "endereco",
    documentation: "Código de Endereçamento Postal brasileiro.",
    defaults: {
      label: "CEP",
      required: false,
      useMask: true,
      maskText: "99999-999",
      placeholder: "00000-000",
      helpText: "CEP com 8 dígitos.",
      validationHints: { pattern: "^\\d{8}$|^\\d{5}-\\d{3}$", minLength: 8, maxLength: 9 },
    },
  },
  {
    templateId: "url",
    label: "URL",
    icon: "link",
    fieldType: "string",
    fieldNamePrefix: "url",
    category: "web",
    documentation: "Endereço web completo (HTTP/HTTPS).",
    defaults: {
      label: "URL",
      required: false,
      useMask: false,
      placeholder: "https://exemplo.com.br",
      helpText: "Informe uma URL válida iniciando com http:// ou https://",
      validationHints: { pattern: "^https?://.+" },
    },
  },
  {
    templateId: "pix",
    label: "PIX",
    icon: "qr-code",
    fieldType: "string",
    fieldNamePrefix: "pix",
    category: "financeiro",
    documentation: "Chave PIX (CPF, CNPJ, e-mail, telefone ou aleatória).",
    defaults: {
      label: "Chave PIX",
      required: false,
      useMask: false,
      placeholder: "CPF, CNPJ, e-mail, telefone ou chave aleatória",
      helpText: "Informe a chave PIX para recebimentos.",
      validationHints: { maxLength: 77 },
    },
  },
  {
    templateId: "data",
    label: "Data",
    icon: "calendar",
    fieldType: "date",
    fieldNamePrefix: "data",
    category: "temporal",
    documentation: "Data calendário (sem hora).",
    defaults: {
      label: "Data",
      required: false,
      useMask: true,
      maskText: "99/99/9999",
      placeholder: "DD/MM/AAAA",
      helpText: "Selecione ou informe a data.",
    },
  },
  {
    templateId: "hora",
    label: "Hora",
    icon: "clock",
    fieldType: "string",
    fieldNamePrefix: "hora",
    category: "temporal",
    documentation: "Horário no formato HH:MM.",
    defaults: {
      label: "Hora",
      required: false,
      useMask: true,
      maskText: "99:99",
      placeholder: "HH:MM",
      helpText: "Horário no formato 24h.",
      validationHints: { pattern: "^([01]?\\d|2[0-3]):[0-5]\\d$" },
    },
  },
  {
    templateId: "data_hora",
    label: "Data/Hora",
    icon: "calendar-clock",
    fieldType: "datetime",
    fieldNamePrefix: "data_hora",
    category: "temporal",
    documentation: "Data e hora combinadas.",
    defaults: {
      label: "Data/Hora",
      required: false,
      useMask: true,
      maskText: "99/99/9999 99:99",
      placeholder: "DD/MM/AAAA HH:MM",
      helpText: "Data e hora no formato brasileiro.",
    },
  },
]);

const templateById = new Map(SMART_FIELD_TEMPLATES.map((t) => [t.templateId, t]));

export function getSmartFieldTemplate(templateId) {
  return templateById.get(templateId) ?? null;
}

export function listSmartFieldTemplates() {
  return SMART_FIELD_TEMPLATES;
}

export function listSmartFieldTemplateCategories() {
  const categories = new Set(SMART_FIELD_TEMPLATES.map((t) => t.category).filter(Boolean));
  return [...categories];
}

export default SMART_FIELD_TEMPLATES;
