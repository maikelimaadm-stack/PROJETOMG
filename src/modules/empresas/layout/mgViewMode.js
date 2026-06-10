export function resolveMgViewMode({ showForm, viewMode }) {
  if (showForm || viewMode === "record") return "registro";
  if (viewMode === "search") return "cards";
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
