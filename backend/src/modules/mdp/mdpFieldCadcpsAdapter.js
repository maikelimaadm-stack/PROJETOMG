import { normalizeCadcpsTipo } from "../cadcps/cadcpsConstants.js";
import {
  CADCPS_APLICACAO_TO_MDP,
  DEFAULT_LOCALE,
  MDP_TO_CADCPS_APLICACAO,
} from "./mdpFieldConstants.js";

const defaultLabel = (row) =>
  row.labels?.find((l) => l.locale === DEFAULT_LOCALE) || row.labels?.[0] || null;

/** Converts MDP field row (with includes) to CADCPS API shape consumed by repCps/svcCps. */
export const mdpFieldToCampoShape = (row) => {
  if (!row) return null;
  const label = defaultLabel(row);
  const tipo = normalizeCadcpsTipo(row.field_type);
  const deprecatedMask = ["cpf", "cnpj", "telefone", "cep", "rg"].includes(row.field_type);
  const aplicacao_modo =
    MDP_TO_CADCPS_APLICACAO[row.empresa_applicability] || "todas";

  return {
    id: row.id,
    cliente_id: row.cliente_id,
    id_global: row.id_global,
    codigo: row.codigo,
    nome: label?.label || row.field_name,
    field_name: row.field_name,
    descricao: label?.description ?? null,
    tipo,
    ativo: row.active,
    obrigatorio: row.required,
    read_only: row.read_only,
    visivel_form: row.visible_form,
    visivel_tabela: row.visible_table,
    visivel_relatorio: row.visible_report,
    pesquisavel: row.searchable,
    filtravel: row.filterable,
    exportavel: row.exportable,
    auditavel: row.auditable,
    aplicacao_modo,
    placeholder: row.placeholder ?? label?.placeholder ?? null,
    formula: row.formula,
    calculation_builder: row.calculation_builder,
    usar_mascara: deprecatedMask && !row.use_mask ? true : row.use_mask,
    mascaras_text: row.mask_text,
    usar_decimal: row.use_decimal,
    decimal_places: row.decimal_places,
    separador_decimal: row.decimal_separator,
    separador_milhar: row.thousand_separator,
    ordem_tabela: row.table_order,
    largura_coluna: row.column_width,
    relation_entity: row.relation_entity,
    options_label_field: row.options_label_field,
    options_value_field: row.options_value_field,
    legacy_campo_id: row.legacy_campo_id,
    created_by: row.created_by,
    updated_by: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    source: row.source,
    field_id: row.field_id,
    telas: (row.telas || []).map((link) => link.tela).filter(Boolean),
    empresa_ids: (row.empresa_scopes || []).map((link) => link.empresa_id),
    empresas_vinculadas: (row.empresa_scopes || [])
      .map((link) => link.empresa)
      .filter(Boolean),
    quantidade_empresas:
      aplicacao_modo === "todas" ? null : (row.empresa_scopes || []).length,
    opcoes: (row.options || []).map((o) => ({
      id: o.id,
      campo_id: row.id,
      codigo: o.code,
      descricao: o.label,
      ordem: o.sort_order,
      ativo: o.active,
    })),
  };
};

/** Maps CADCPS create/update payload to MDP field data fragment. */
export const campoPayloadToMdpFieldData = (payload, { fieldName, entityRowId, stableFieldId, scope, clienteId, source = "custom" }) => {
  const aplicacao = payload.aplicacao_modo
    ? CADCPS_APLICACAO_TO_MDP[payload.aplicacao_modo] || "all"
    : "all";

  return {
    field_id: stableFieldId,
    entity_row_id: entityRowId,
    field_name: fieldName,
    source,
    field_type: normalizeCadcpsTipo(payload.tipo),
    scope,
    cliente_id: clienteId,
    active: payload.ativo ?? true,
    required: payload.obrigatorio ?? false,
    read_only: payload.read_only ?? false,
    searchable: payload.pesquisavel ?? true,
    filterable: payload.filtravel ?? true,
    exportable: payload.exportavel ?? true,
    auditable: payload.auditavel ?? true,
    visible_form: payload.visivel_form ?? true,
    visible_table: payload.visivel_tabela ?? false,
    visible_report: payload.visivel_relatorio ?? false,
    empresa_applicability: aplicacao,
    placeholder: payload.placeholder ?? null,
    formula: payload.formula ?? null,
    calculation_builder: payload.calculation_builder ?? undefined,
    use_mask: payload.usar_mascara ?? false,
    mask_text: payload.mascaras_text ?? null,
    use_decimal: payload.usar_decimal ?? false,
    decimal_places: payload.decimal_places ?? 2,
    decimal_separator: payload.separador_decimal || ",",
    thousand_separator: payload.separador_milhar || ".",
    table_order: payload.ordem_tabela ?? 999,
    column_width: payload.largura_coluna ?? 160,
    relation_entity: payload.relation_entity ?? null,
    options_label_field: payload.options_label_field ?? null,
    options_value_field: payload.options_value_field ?? null,
    legacy_campo_id: payload.legacy_campo_id ?? null,
  };
};

export const buildLabelCreate = (nome, descricao, placeholder) => ({
  locale: DEFAULT_LOCALE,
  label: nome,
  description: descricao ?? null,
  placeholder: placeholder ?? null,
});
