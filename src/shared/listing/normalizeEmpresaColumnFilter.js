const TIPO_VINCULO_TO_RAW = {
  PROPRIETÁRIO: "proprietario",
  PROPRIETARIO: "proprietario",
  ARRENDATÁRIO: "arrendatario",
  ARRENDATARIO: "arrendatario",
};

/** Converte valor exibido na UI do filtro para valor persistido no banco. */
export function normalizeEmpresaColumnFilterValue(columnId, value) {
  if (value == null || value === "") return value;
  const text = String(value).trim();
  if (columnId === "tipo_vinculo") {
    return TIPO_VINCULO_TO_RAW[text.toUpperCase()] || text.toLowerCase();
  }
  if (columnId === "codempresa" || columnId === "id_global") {
    const cleaned = text.replace(/\./g, "").replace(",", ".");
    const numeric = Number(cleaned);
    return Number.isFinite(numeric) ? numeric : text;
  }
  return text;
}

export function mapEmpresaColumnIdToFilterKey(columnId) {
  if (!columnId) return columnId;
  if (String(columnId).startsWith("custom:")) {
    return columnId;
  }
  return columnId;
}
