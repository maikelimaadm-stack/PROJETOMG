/** Modos persistidos / internos da listagem. */
export const EMP_LIST_VIEW_MODES = ["table", "search", "record"];

/** Valores do segmento MgViewSeg / MgMobileViewBar. */
export const MG_VIEW_SEG_MODES = ["registro", "tabela", "cards"];

export const normalizeEmpListViewMode = (value, { allowRecord = true } = {}) => {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "search" || normalized === "cards") return "search";
  if (allowRecord && (normalized === "record" || normalized === "registro")) return "record";
  return "table";
};

export function resolveMgViewMode({ showForm, viewMode }) {
  if (showForm) return "registro";
  const normalized = normalizeEmpListViewMode(viewMode, { allowRecord: false });
  if (normalized === "search") return "cards";
  return "tabela";
}

export function applyMgViewMode(mode, handlers) {
  if (mode === "registro") {
    handlers.onOpenRegistro?.();
    return;
  }
  if (mode === "tabela") {
    handlers.onOpenTabela?.();
    return;
  }
  if (mode === "cards") {
    handlers.onOpenCards?.();
  }
}
