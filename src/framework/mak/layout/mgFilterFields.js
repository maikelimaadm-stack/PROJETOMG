import { COLUNAS_BASE } from "@/modules/empresas/components/tblEmp.constants";
import campoEngine from "@/framework/cadastro/fields/campoEngine";

/** Campos do painel lateral (busca rápida por texto). */
export const MG_FILTER_SIDEBAR_FIELDS = [
  { key: "razao_social", label: "Razão Social", column: "razao_social" },
  { key: "nome_fantasia", label: "Nome Fantasia", column: "nome_fantasia" },
  { key: "cnpj", label: "CNPJ", column: "cpf_cnpj" },
  { key: "telefone", label: "Telefone", column: "telefone" },
  { key: "cidade", label: "Cidade", column: "cidade" },
  { key: "uf", label: "UF", column: "estado" },
];

export const MG_FILTER_STATUS_FIELD = {
  key: "status",
  label: "Status",
  column: "status",
};

/** @deprecated use MG_FILTER_SIDEBAR_FIELDS */
export const MG_FILTER_FIELDS = MG_FILTER_SIDEBAR_FIELDS;

/** @deprecated use MG_FILTER_SIDEBAR_FIELDS */
export const MG_FILTER_TEXT_FIELDS = MG_FILTER_SIDEBAR_FIELDS;

/** Todos os campos do lançamento disponíveis como pills na faixa inferior. */
export function buildMgFilterFields(camposPersonalizados = []) {
  const native = COLUNAS_BASE.map((col) => ({
    key: col.id,
    label: col.label,
    column: col.id,
    filtravel: col.filtravel !== false,
    columnMeta: col,
  }));

  const custom = camposPersonalizados
    .map((campo) => campoEngine.normalize(campo))
    .filter((campo) => campo?.ativo !== false && campo.visivel_form !== false && campo.filtravel !== false)
    .map((campo) => ({
      key: `custom:${campo.field_name}`,
      label: campo.label || campo.nome,
      column: `custom:${campo.field_name}`,
      filtravel: true,
      customField: campo.field_name,
      campoMeta: {
        ...campo,
        id: `custom:${campo.field_name}`,
        customField: campo.field_name,
      },
    }));

  const seen = new Set();
  return [...native, ...custom].filter((field) => {
    if (seen.has(field.key)) return false;
    seen.add(field.key);
    return field.filtravel !== false;
  });
}

export function buildPanelFilterColumnMap(filterFields = []) {
  return filterFields.reduce((acc, field) => {
    acc[field.key] = field.column || field.key;
    return acc;
  }, {});
}
