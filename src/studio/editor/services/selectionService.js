/** Selection Service — domain selection bridge (Program 2.2.7) */

export function createSelectionService(deps = {}) {
  const { hub } = deps;

  const select = ({ designerId, selection }) => {
    hub?.publish?.("editor.selection.changed", { designerId, selection });
    return selection;
  };

  const syncFromCanvas = ({ designerId, objectId, objectKind, moduleId, metadata = {} }) =>
    select({
      designerId,
      selection: Object.freeze({
        selectionKind: objectKind,
        targetId: objectId,
        entryId: objectId,
        entryType: objectKind,
        moduleId,
        designerId,
        metadata,
      }),
    });

  return Object.freeze({ select, syncFromCanvas });
}

export default createSelectionService;
