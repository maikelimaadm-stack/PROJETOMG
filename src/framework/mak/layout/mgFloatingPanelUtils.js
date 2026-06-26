/** Retorna true se o clique ocorreu dentro de um painel flutuante aninhado (ex.: cmd-panel). */
export function isNestedMgFloatingPanelTarget(target) {
  if (!target || typeof target.closest !== "function") return false;
  return Boolean(target.closest(".cmd-panel, .mg-dp-panel, .mg-tp-panel, .mg-lookup-panel"));
}
