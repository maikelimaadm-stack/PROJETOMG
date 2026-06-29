import { STUDIO_HISTORY_DEFAULT_LIMIT } from "../studioSdkConstants.js";

/**
 * History + Undo/Redo API — session-level command stack.
 * @param {object} [options]
 */
export function createHistoryApi(options = {}) {
  const limit = options.limit ?? STUDIO_HISTORY_DEFAULT_LIMIT;
  const undoStack = [];
  const redoStack = [];
  const listeners = new Set();

  const notify = () => {
    listeners.forEach((listener) =>
      listener({
        canUndo: undoStack.length > 0,
        canRedo: redoStack.length > 0,
        undoLabel: undoStack.at(-1)?.label ?? null,
        redoLabel: redoStack.at(-1)?.label ?? null,
      })
    );
  };

  const pushCommand = async (command) => {
    if (!command?.execute || !command?.undo || !command?.label) {
      throw new Error("History command requires label, execute, undo.");
    }
    await command.execute();
    undoStack.push(command);
    if (undoStack.length > limit) undoStack.shift();
    redoStack.length = 0;
    notify();
    return command;
  };

  return Object.freeze({
    pushCommand,
    undo: async () => {
      const command = undoStack.pop();
      if (!command) return false;
      await command.undo();
      redoStack.push(command);
      notify();
      return true;
    },
    redo: async () => {
      const command = redoStack.pop();
      if (!command) return false;
      await command.execute();
      undoStack.push(command);
      notify();
      return true;
    },
    canUndo: () => undoStack.length > 0,
    canRedo: () => redoStack.length > 0,
    clear: () => {
      undoStack.length = 0;
      redoStack.length = 0;
      notify();
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  });
}

export default createHistoryApi;
