import { formatIdGlobal } from "@/shared/utils/formatIdGlobal";
import { aplicacaoLabel, tipoLabel } from "@/modules/cadcps/config/cadcpsConstants.js";

const formatDateValue = (value) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleString("pt-BR");
};

export function resolveCadcpsFieldValue(item, colId) {
  if (!item) return "-";

  switch (colId) {
    case "id_global":
      return item.id_global ? formatIdGlobal(item.id_global) : "-";
    case "codigo":
      return item.codigo ?? "-";
    case "tipo":
      return tipoLabel(item.tipo) || "-";
    case "telas":
      return (item.telas || []).map((t) => t.nome).join(", ") || "-";
    case "aplicacao":
      return aplicacaoLabel(item.aplicacao_modo, item.quantidade_empresas);
    case "obrigatorio":
    case "ativo":
      return item[colId] ? "Sim" : "Não";
    case "createdAt":
    case "updatedAt":
      return formatDateValue(item[colId]);
    case "quantidade_empresas":
      return item.quantidade_empresas ?? item.empresa_ids?.length ?? 0;
    default:
      if (item[colId] != null && item[colId] !== "") return item[colId];
      return undefined;
  }
}

export function resolveCadcpsComparableValue(item, col) {
  if (col?.id === "id_global") return Number(item?.id_global || 0);
  if (col?.id === "codigo") return Number(item?.codigo || 0);
  if (col?.id === "quantidade_empresas") return Number(item?.quantidade_empresas || 0);
  return resolveCadcpsFieldValue(item, col?.id);
}
