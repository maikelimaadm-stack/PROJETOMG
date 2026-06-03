import { CADCPS_TIPO_TO_LEGACY } from "./cadcpsConstants.js";

/**
 * Converte registro CADCPS para formato legado consumido por campoEngine / FORMEMP.
 */
export const toLegacyCampoShape = (campo) => {
  if (!campo) return null;
  const legacyTipo = CADCPS_TIPO_TO_LEGACY[campo.tipo] || campo.tipo;
  const opcoes = (campo.opcoes || []).map((o) => ({
    value: o.codigo,
    label: o.descricao,
    codigo: o.codigo,
  }));

  return {
    id: campo.id,
    field_id: campo.id,
    legacy_campo_id: campo.legacy_campo_id,
    cliente_id: campo.cliente_id,
    codigo: campo.codigo,
    label: campo.nome,
    nome: campo.nome,
    field_name: campo.field_name,
    descricao: campo.descricao,
    placeholder: campo.placeholder,
    tipo: legacyTipo,
    tipo_cadcps: campo.tipo,
    obrigatorio: campo.obrigatorio,
    read_only: campo.read_only,
    visivel_form: campo.visivel_form,
    visivel_tabela: campo.visivel_tabela,
    visivel_relatorio: campo.visivel_relatorio,
    ativo: campo.ativo,
    opcoes,
    options: opcoes,
    formula: campo.formula,
    calculation_builder: campo.calculation_builder,
    usar_decimal: campo.usar_decimal,
    decimal_places: campo.decimal_places,
    usar_mascara: campo.usar_mascara,
    mascaras_text: campo.mascaras_text,
    separador_decimal: campo.separador_decimal,
    separador_milhar: campo.separador_milhar,
    relation_entity: campo.relation_entity,
    options_source_entity: campo.relation_entity,
    options_label_field: campo.options_label_field || "nome",
    options_value_field: campo.options_value_field || "id",
    ordem_tabela: campo.ordem_tabela,
    largura_coluna: campo.largura_coluna,
    aplicacao_modo: campo.aplicacao_modo,
    empresa_id: campo.aplicacao_modo === "especificas" ? campo.empresa_ids?.[0] : null,
    entity_name: campo.telas?.[0]?.entity_name || campo.entity_name,
    telas: campo.telas,
    origem: "customizado",
    customField: campo.field_name,
  };
};

export const toLegacyCampoList = (items = []) => items.map(toLegacyCampoShape).filter(Boolean);
