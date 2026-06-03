export const CADCPS_APLICACAO = {
  TODAS: "todas",
  ESPECIFICAS: "especificas",
};

/** Tipos canônicos (valor persistido). Labels no frontend. */
export const CADCPS_TIPOS = [
  "texto",
  "observacao",
  "inteiro",
  "decimal",
  "moeda",
  "percentual",
  "data",
  "hora",
  "data_hora",
  "sim_nao",
  "email",
  "url",
  "lista",
  "lista_multipla",
  "relacao",
  "arquivo",
  "imagem",
  "assinatura",
  "formula",
];

/** Tipos removidos — normalizados para texto + máscara quando lidos do banco. */
export const CADCPS_TIPOS_REMOVIDOS = ["cpf", "cnpj", "telefone", "cep", "rg"];

export const normalizeCadcpsTipo = (tipo) => {
  const value = String(tipo || "").trim();
  if (CADCPS_TIPOS_REMOVIDOS.includes(value)) return "texto";
  if (CADCPS_TIPOS.includes(value)) return value;
  return value;
};

/** Mapeamento tipo legado (dialog antigo) → tipo CADCPS */
export const LEGACY_TIPO_TO_CADCPS = {
  text: "texto",
  textarea: "observacao",
  number: "decimal",
  date: "data",
  time: "hora",
  datetime: "data_hora",
  select: "lista",
  option_list: "lista_multipla",
  relation: "relacao",
  calculado: "formula",
  image: "imagem",
  file: "arquivo",
  cpf: "texto",
  cnpj: "texto",
  telefone: "texto",
  cep: "texto",
  rg: "texto",
};

/** Mapeamento tipo CADCPS → tipo legado (runtime Empresas / campoEngine) */
export const CADCPS_TIPO_TO_LEGACY = {
  texto: "text",
  observacao: "textarea",
  inteiro: "number",
  decimal: "number",
  moeda: "number",
  percentual: "number",
  data: "date",
  hora: "time",
  data_hora: "datetime",
  sim_nao: "text",
  email: "text",
  url: "text",
  lista: "select",
  lista_multipla: "option_list",
  relacao: "relation",
  arquivo: "file",
  imagem: "image",
  assinatura: "file",
  formula: "calculado",
};
