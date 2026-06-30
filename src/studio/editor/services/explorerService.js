/** Explorer Service — reusable Explorer panel integration (Program 2.2.7) */

export function createExplorerService(deps = {}) {
  const { hub } = deps;

  const select = (entryId, meta = {}) => {
    hub?.publish?.("editor.explorer.select", { entryId, ...meta });
    return Object.freeze({ entryId, ...meta });
  };

  const configure = ({ tree, selectedId, onSelect, footerLabel }) =>
    Object.freeze({
      tree: tree ?? [],
      selectedId: selectedId ?? null,
      onSelect: onSelect ?? select,
      footerLabel: footerLabel ?? "",
    });

  return Object.freeze({ select, configure });
}

export default createExplorerService;
