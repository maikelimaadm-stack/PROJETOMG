export const ESTADOS_BR = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

export const UPPER_FIELDS = [
  "razao_social",
  "nome_fantasia",
  "cpf_cnpj",
  "inscricao_estadual",
  "email",
  "cep",
  "endereco",
  "numero",
  "bairro",
  "cidade",
  "estado",
  "observacoes",
];

export const REQUIRED_FIELDS = ["razao_social", "tipo_pessoa"];
export const FORM_LAYOUT_KEY = "cadastro_emp_form_layout_config";
export const TABLE_AGGREGATION_KEY = "emp_table_aggregation_config";

/** Abas do formulário (sem painel principal de campos — só seleção por aba). */
export const EMP_FORM_BASE_PANELS = [
  { id: "principais", label: "Principais" },
  { id: "endereco", label: "Endereço" },
  { id: "observacoes", label: "Observações" },
];

export const EMP_FORM_DEFAULT_LAYOUT = {
  principais: [
    "tipo_pessoa",
    "tipo_vinculo",
    "codempresa",
    "status",
    "razao_social",
    "nome_fantasia",
    "cpf_cnpj",
    "inscricao_estadual",
    "telefone",
    "whatsapp",
    "email",
    "logo_url",
  ],
  endereco: ["cep", "endereco", "numero", "bairro", "cidade", "estado"],
  observacoes: ["observacoes"],
};

/** Layout V3 — cards (tela inteira / meia tela); linhas visuais auto-empacotadas por largura. */
export const EMP_FORM_DEFAULT_LAYOUT_V3 = {
  principais: {
    cards: [
      {
        id: "dados_pessoais",
        label: "Dados principais",
        order: 1,
        colSpan: 12,
        columns: 12,
        collapsible: true,
        fieldIds: [
          "tipo_pessoa",
          "tipo_vinculo",
          "codempresa",
          "status",
          "razao_social",
          "nome_fantasia",
        ],
      },
      {
        id: "informacoes_funcionais",
        label: "Informações adicionais",
        order: 2,
        colSpan: 6,
        columns: 12,
        collapsible: true,
        fieldIds: ["cpf_cnpj", "inscricao_estadual", "telefone", "whatsapp"],
      },
      {
        id: "informacoes_contato",
        label: "Contato",
        order: 3,
        colSpan: 6,
        columns: 12,
        collapsible: true,
        fieldIds: ["email", "logo_url"],
      },
    ],
  },
  endereco: {
    cards: [
      {
        id: "endereco_completo",
        label: "Endereço",
        order: 1,
        colSpan: 12,
        columns: 12,
        collapsible: true,
        fieldIds: ["cep", "endereco", "numero", "bairro", "cidade", "estado"],
      },
    ],
  },
  observacoes: {
    cards: [
      {
        id: "observacoes_card",
        label: "Observações",
        order: 1,
        colSpan: 12,
        columns: 12,
        collapsible: true,
        fieldIds: ["observacoes"],
      },
    ],
  },
};

/** Override opcional de tipo de largura por campo (vazio = inferência automática por tipo). */
export const EMP_FORM_DEFAULT_FIELD_SIZES = {};

export const buildEmpFormDefaultConfig = () => ({
  version: 3,
  panels: EMP_FORM_BASE_PANELS.map((panel) => ({ ...panel })),
  layout: { ...EMP_FORM_DEFAULT_LAYOUT_V3 },
  hiddenFieldIds: [],
  lockedFieldIds: [],
  requiredFieldIds: [],
  clearOnDuplicateFieldIds: [],
  fieldDefaultValues: {},
  aggregationConfig: {},
  visibilityRules: {},
  fieldLayoutConfig: { mode: "corporate", columns: 12 },
  fieldSizes: { ...EMP_FORM_DEFAULT_FIELD_SIZES },
});

export const inputClass = "emp-form-input border-0 shadow-none focus-visible:ring-0 bg-white uppercase w-full";

export const buildEmptyEmpresaForm = () => ({
  codempresa: "",
  razao_social: "",
  nome_fantasia: "",
  tipo_pessoa: "PJ",
  tipo_vinculo: "",
  cpf_cnpj: "",
  inscricao_estadual: "",
  telefone: "",
  whatsapp: "",
  email: "",
  logo_url: "",
  cep: "",
  endereco: "",
  numero: "",
  bairro: "",
  cidade: "",
  estado: "",
  observacoes: "",
  status: "Ativa",
  campos_personalizados: {},
});

export const applyDuplicateFieldClears = (data, clearFieldIds = []) => {
  if (!data?._isDuplicate || !clearFieldIds.length) return data;
  const next = { ...data, campos_personalizados: { ...(data.campos_personalizados || {}) } };
  clearFieldIds.forEach((fieldId) => {
    if (fieldId === "codempresa") return;
    if (String(fieldId).startsWith("custom:")) {
      next.campos_personalizados[String(fieldId).replace(/^custom:/, "")] = "";
      return;
    }
    if (fieldId === "status") next.status = "Ativa";
    else if (fieldId === "tipo_pessoa") next.tipo_pessoa = "PJ";
    else if (fieldId === "tipo_vinculo") next.tipo_vinculo = "";
    else next[fieldId] = "";
  });
  return next;
};

export const NATIVE_FIELDS = new Set([
  "codempresa",
  "razao_social",
  "nome_fantasia",
  "tipo_pessoa",
  "tipo_vinculo",
  "cpf_cnpj",
  "inscricao_estadual",
  "telefone",
  "whatsapp",
  "email",
  "logo_url",
  "cep",
  "endereco",
  "numero",
  "bairro",
  "cidade",
  "estado",
  "observacoes",
  "status",
  "campos_personalizados",
]);

/** Opções de domínio — permanecem no módulo Empresas (regra de negócio). */
export const OPCOES_TIPO_PESSOA = [
  { id: "PJ", nome: "PESSOA JURÍDICA (PJ)" },
  { id: "PF", nome: "PESSOA FÍSICA (PF)" },
];

export const OPCOES_TIPO_VINCULO = [
  { id: "proprietario", nome: "PROPRIETÁRIO" },
  { id: "arrendatario", nome: "ARRENDATÁRIO" },
];

export const OPCOES_STATUS_EMPRESA = [
  { id: "Ativa", nome: "ATIVA" },
  { id: "Inativa", nome: "INATIVA" },
];

const UF_OPTIONS = ESTADOS_BR.map((uf) => ({ id: uf, nome: uf }));

/**
 * Definições declarativas de campos nativos — metadata de domínio Empresas.
 * Renderização delegada à Foundation via buildMakDynamicFieldsWithCustomFields.
 */
export const EMP_FORM_FIELD_DEFS = [
  {
    id: "tipo_pessoa",
    label: "Tipo de Pessoa",
    type: "select",
    required: true,
    compact: true,
    errorKey: "tipo_pessoa",
    options: OPCOES_TIPO_PESSOA,
  },
  {
    id: "tipo_vinculo",
    label: "Proprietário/Arrendatário",
    type: "select",
    compact: true,
    options: OPCOES_TIPO_VINCULO,
  },
  {
    id: "codempresa",
    label: "Cód. Empresa",
    autoCode: true,
    compact: true,
    widthType: "CODIGO",
  },
  {
    id: "razao_social",
    label: "Nome/Razão Social Emp.",
    required: true,
    errorKey: "razao_social",
    wide: true,
    uppercase: true,
    placeholder: "NOME/RAZÃO SOCIAL",
  },
  {
    id: "status",
    label: "Ativa",
    type: "select",
    widthType: "SIM_NAO",
    compact: true,
    options: OPCOES_STATUS_EMPRESA,
  },
  {
    id: "nome_fantasia",
    label: "Nome fantasia",
    medium: true,
    uppercase: true,
    placeholder: "NOME FANTASIA",
  },
  {
    id: "cpf_cnpj",
    type: "cpf_cnpj",
    compact: true,
    resolveLabel: (formData) => (formData?.tipo_pessoa === "PF" ? "CPF" : "CNPJ"),
    resolvePlaceholder: (formData) =>
      formData?.tipo_pessoa === "PF" ? "000.000.000-00" : "00.000.000/0000-00",
  },
  {
    id: "inscricao_estadual",
    label: "Inscrição Estadual",
    placeholder: "INSCRIÇÃO ESTADUAL",
  },
  {
    id: "telefone",
    label: "Telefone",
    type: "tel",
    compact: true,
    placeholder: "(00) 0000-0000",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    type: "tel",
    compact: true,
    placeholder: "(00) 00000-0000",
  },
  {
    id: "email",
    label: "E-mail",
    type: "email",
    placeholder: "EMAIL@EMPRESA.COM.BR",
  },
  {
    id: "logo_url",
    label: "Logo da Empresa",
    type: "image",
    compact: true,
  },
  {
    id: "cep",
    label: "CEP",
    type: "cep",
    compact: true,
    placeholder: "00000-000",
  },
  {
    id: "endereco",
    label: "Endereço",
    medium: true,
    uppercase: true,
    placeholder: "RUA, AVENIDA...",
  },
  {
    id: "numero",
    label: "Número",
    widthType: "NUMERO",
    compact: true,
    placeholder: "Nº",
  },
  {
    id: "bairro",
    label: "Bairro",
    uppercase: true,
    placeholder: "BAIRRO",
  },
  {
    id: "cidade",
    label: "Cidade",
    uppercase: true,
    placeholder: "CIDADE",
  },
  {
    id: "estado",
    label: "Estado (UF)",
    type: "autocomplete",
    widthType: "UF",
    compact: true,
    options: UF_OPTIONS,
    placeholder: "UF",
  },
  {
    id: "observacoes",
    label: "Observações",
    type: "textarea",
    wide: true,
    uppercase: true,
    placeholder: "OBSERVAÇÕES GERAIS...",
  },
];

/** @deprecated Import from `@/framework/cadastro-engine/field/maskUtils` */
export { splitDateTimeValue, formatMaskedNumber } from "@/framework/cadastro-engine/field/maskUtils.js";
