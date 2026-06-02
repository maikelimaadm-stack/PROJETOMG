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

export const EMP_FORM_BASE_PANELS = [
  { id: "principal", label: "Principal" },
  { id: "geral", label: "Geral" },
  { id: "endereco", label: "Endereço" },
  { id: "observacoes", label: "Observações" },
];

export const EMP_FORM_DEFAULT_LAYOUT = {
  principal: ["tipo_pessoa", "tipo_vinculo", "codempresa", "razao_social", "status"],
  geral: ["nome_fantasia", "cpf_cnpj", "inscricao_estadual", "telefone", "whatsapp", "email", "logo_url"],
  endereco: ["cep", "endereco", "numero", "bairro", "cidade", "estado"],
  observacoes: ["observacoes"],
};

export const buildEmpFormDefaultConfig = () => ({
  panels: EMP_FORM_BASE_PANELS.map((panel) => ({ ...panel })),
  layout: {
    principal: [...EMP_FORM_DEFAULT_LAYOUT.principal],
    geral: [...EMP_FORM_DEFAULT_LAYOUT.geral],
    endereco: [...EMP_FORM_DEFAULT_LAYOUT.endereco],
    observacoes: [...EMP_FORM_DEFAULT_LAYOUT.observacoes],
  },
  hiddenFieldIds: [],
  lockedFieldIds: [],
  requiredFieldIds: [],
  clearOnDuplicateFieldIds: [],
  fieldDefaultValues: {},
  aggregationConfig: {},
  visibilityRules: {},
  fieldLayoutConfig: { mode: "vertical", columns: 1 },
});
export const inputClass = "emp-form-input border-0 shadow-none focus-visible:ring-0 bg-white uppercase";

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

export const splitDateTimeValue = (value) => {
  if (!value) return { date: "", time: "" };
  const [datePart, timePart = ""] = String(value).replace(" ", "T").split("T");
  return { date: datePart || "", time: timePart.slice(0, 5) || "" };
};

const onlyDigits = (value) => String(value || "").replace(/\D/g, "");

const applyNumberMask = (digits, mask) => {
  let index = 0;
  return String(mask || "")
    .replace(/#/g, () => digits[index++] || "")
    .replace(/[^0-9]+$/g, "");
};

const getBestMask = (digits, masks) =>
  masks.find((mask) => (mask.match(/#/g) || []).length >= digits.length) ||
  masks[masks.length - 1] ||
  "";

export const formatMaskedNumber = (value, campo) => {
  const masks = String(campo.mascaras_text || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
    .sort((a, b) => (a.match(/#/g) || []).length - (b.match(/#/g) || []).length);
  const maxDigits = Math.max(...masks.map((mask) => (mask.match(/#/g) || []).length), 0);
  const digits = onlyDigits(value).slice(0, maxDigits || undefined);
  return applyNumberMask(digits, getBestMask(digits, masks));
};

