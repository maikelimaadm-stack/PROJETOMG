import repCps from "@/modules/cadcps/repositories/repCps";

const LEGACY_TIPO_TO_CADCPS = {
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
};

const CADCPS_TIPO_TO_LEGACY = {
  texto: "text",
  observacao: "textarea",
  inteiro: "number",
  decimal: "number",
  moeda: "number",
  percentual: "number",
  data: "date",
  hora: "time",
  data_hora: "datetime",
  lista: "select",
  lista_multipla: "option_list",
  relacao: "relation",
  arquivo: "file",
  imagem: "image",
  assinatura: "file",
  formula: "calculado",
};

export const toLegacyDialogCampo = (campo) => {
  if (!campo) return null;
  const opcoes = (campo.opcoes || []).map((o) => ({
    value: o.codigo,
    label: o.descricao,
    codigo: o.codigo,
  }));
  return {
    ...campo,
    id: campo.id,
    field_id: campo.id,
    label: campo.nome,
    tipo: CADCPS_TIPO_TO_LEGACY[campo.tipo] || campo.tipo,
    opcoes,
    options: opcoes,
    empresa_id:
      campo.aplicacao_modo === "especificas" ? campo.empresa_ids?.[0] ?? null : null,
    entity_name: campo.telas?.[0]?.entity_name || "EmpresaCadastro",
  };
};

const mapOpcoesToCadcps = (opcoes = []) =>
  opcoes.map((opcao, index) => ({
    codigo: String(opcao.codigo ?? opcao.value ?? opcao.label ?? `opt_${index + 1}`),
    descricao: String(opcao.descricao ?? opcao.label ?? opcao.value ?? ""),
    ordem: opcao.ordem ?? index,
    ativo: opcao.ativo ?? true,
  }));

let cachedTelaEmpresasId = null;

const resolveTelaEmpresasId = async () => {
  if (cachedTelaEmpresasId) return cachedTelaEmpresasId;
  const telas = await repCps.listTelas();
  cachedTelaEmpresasId = telas.find((t) => t.codigo === "EMPRESAS")?.id || telas[0]?.id;
  return cachedTelaEmpresasId;
};

export const legacyPayloadToCadcps = async (payload = {}) => {
  const tipoRaw = String(payload.tipo || "text");
  const tipo = LEGACY_TIPO_TO_CADCPS[tipoRaw] || tipoRaw;
  const telaId = await resolveTelaEmpresasId();
  const aplicacao_modo =
    payload.aplicacao_modo === "empresa" || payload.empresa_id ? "especificas" : payload.aplicacao_modo || "todas";

  return {
    nome: payload.label || payload.nome,
    field_name: payload.field_name,
    descricao: payload.descricao,
    placeholder: payload.placeholder,
    tipo,
    tela_id: telaId || "",
    aplicacao_modo,
    empresa_ids: payload.empresa_id ? [payload.empresa_id] : payload.empresa_ids,
    obrigatorio: payload.obrigatorio,
    read_only: payload.read_only,
    visivel_form: payload.visivel_form,
    visivel_tabela: payload.visivel_tabela,
    visivel_relatorio: payload.visivel_relatorio,
    formula: payload.formula,
    calculation_builder: payload.calculation_builder,
    usar_decimal: payload.usar_decimal,
    decimal_places: payload.decimal_places,
    usar_mascara: payload.usar_mascara,
    mascaras_text: payload.mascaras_text,
    relation_entity: payload.relation_entity || payload.options_source_entity,
    options_label_field: payload.options_label_field,
    options_value_field: payload.options_value_field,
    ordem_tabela: payload.ordem_tabela,
    largura_coluna: payload.largura_coluna,
    opcoes: payload.opcoes?.length ? mapOpcoesToCadcps(payload.opcoes) : undefined,
  };
};

export const listCamposForLegacyDialog = async () => {
  const result = await repCps.listPage({ page: 1, pageSize: 500, sortBy: "codigo", sortDir: "asc" });
  return (result.items || []).map(toLegacyDialogCampo).filter(Boolean);
};
