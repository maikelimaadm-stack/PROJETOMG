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
export const inputClass = "h-[22px] text-xs border-0 rounded-none shadow-none focus-visible:ring-0 bg-white px-1";

export const buildEmptyEmpresaForm = () => ({
  codigo_empresa: "",
  razao_social: "",
  nome_fantasia: "",
  tipo_pessoa: "PJ",
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
    if (fieldId === "codigo_empresa") return;
    if (String(fieldId).startsWith("custom:")) {
      next.campos_personalizados[String(fieldId).replace(/^custom:/, "")] = "";
      return;
    }
    if (fieldId === "status") next.status = "Ativa";
    else if (fieldId === "tipo_pessoa") next.tipo_pessoa = "PJ";
    else next[fieldId] = "";
  });
  return next;
};

export const NATIVE_FIELDS = new Set([
  "codigo_empresa",
  "razao_social",
  "nome_fantasia",
  "tipo_pessoa",
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

