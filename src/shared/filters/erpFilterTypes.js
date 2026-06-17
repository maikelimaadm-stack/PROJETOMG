import { getErpDefaultOperator, getErpFilterOperators } from "@/shared/filters/erpFilterOperators";

const KNOWN_ENUM_COLUMNS = new Set(["status", "tipo_pessoa", "tipo_vinculo"]);

const STATUS_ENUM_OPTIONS = ["Ativo", "Inativo"];
const TIPO_PESSOA_OPTIONS = ["PJ", "PF"];
const TIPO_VINCULO_OPTIONS = ["PROPRIETÁRIO", "ARRENDATÁRIO"];

export function resolveErpFilterType(meta = {}) {
  const col = meta.campoMeta || meta.columnMeta || meta;
  const id = String(meta.key || col.id || meta.column || "").trim();
  const columnId = id.startsWith("custom:") ? id : String(meta.column || id);
  const tipo = col.tipo || col.type || meta.tipo;

  if (tipo === "boolean" || tipo === "checkbox" || col.field_type === "boolean") {
    return "boolean";
  }

  if (
    meta.filterType === "enum" ||
    KNOWN_ENUM_COLUMNS.has(columnId) ||
    KNOWN_ENUM_COLUMNS.has(id) ||
    tipo === "select" ||
    tipo === "enum" ||
    (Array.isArray(col.options) && col.options.length > 0 && col.options.length <= 12)
  ) {
    return "enum";
  }

  if (tipo === "date" || columnId === "data") return "date";

  if (tipo === "money" || tipo === "currency" || (tipo === "number" && col.usar_mascara)) {
    return "money";
  }

  if (tipo === "number" || tipo === "calculado" || columnId === "codempresa" || id === "codempresa") {
    return "number";
  }

  return "text";
}

export function resolveErpFilterEnumOptions(meta = {}, distinctOptions = []) {
  if (Array.isArray(meta.enumOptions) && meta.enumOptions.length > 0) {
    return meta.enumOptions.map((item) => String(item));
  }

  const col = meta.campoMeta || meta.columnMeta || meta;
  const id = String(meta.key || col.id || meta.column || "").trim();
  const columnId = id.startsWith("custom:") ? id : String(meta.column || id);

  if (columnId === "status" || id === "status") return [...STATUS_ENUM_OPTIONS];
  if (columnId === "tipo_pessoa" || id === "tipo_pessoa") return [...TIPO_PESSOA_OPTIONS];
  if (columnId === "tipo_vinculo" || id === "tipo_vinculo") return [...TIPO_VINCULO_OPTIONS];

  if (Array.isArray(col.options) && col.options.length > 0) {
    return col.options.map((option) => {
      if (typeof option === "string") return option;
      return String(option.nome || option.label || option.id || option.value || "");
    }).filter(Boolean);
  }

  if (Array.isArray(distinctOptions) && distinctOptions.length > 0) {
    return distinctOptions.map((item) => String(item));
  }

  return [];
}

export function resolveErpFilterMeta(fieldOrColumn = {}, distinctOptions = []) {
  const filterType = resolveErpFilterType(fieldOrColumn);
  const enumOptions =
    filterType === "enum" ? resolveErpFilterEnumOptions(fieldOrColumn, distinctOptions) : [];
  const operators = getErpFilterOperators(filterType);
  const defaultOperator = getErpDefaultOperator(filterType);

  return {
    filterType,
    enumOptions,
    operators,
    defaultOperator,
    label: fieldOrColumn.label || fieldOrColumn.nome || "",
  };
}

/** Compatibilidade com TBLEMP — resolve tipo a partir de coluna da tabela. */
export function getColumnFilterType(col) {
  return resolveErpFilterType({ columnMeta: col, column: col?.id, key: col?.id });
}
