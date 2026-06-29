/** History Service — undo/redo via SDK history (Program 2.2.7) */

export function createHistoryService(deps = {}) {
  const { sdk } = deps;

  const undo = async () => sdk?.history?.undo?.();
  const redo = async () => sdk?.history?.redo?.();
  const canUndo = () => Boolean(sdk?.history?.canUndo?.());
  const canRedo = () => Boolean(sdk?.history?.canRedo?.());

  const registerCommands = (commandApi) => {
    commandApi?.register?.({
      id: "history.undo",
      label: "Desfazer",
      category: "Edit",
      run: () => undo(),
    });
    commandApi?.register?.({
      id: "history.redo",
      label: "Refazer",
      category: "Edit",
      run: () => redo(),
    });
  };

  return Object.freeze({ undo, redo, canUndo, canRedo, registerCommands });
}

export default createHistoryService;
