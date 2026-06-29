/** Command Engine — base for all Designer commands (Program 2.2.5) */

export const COMMAND_ENGINE_VERSION = "mak-command-engine-v1";

/**
 * @param {{ store: object, history: object, applyCommand: Function, onAfterExecute?: Function, clone?: Function }} config
 */
export function createCommandEngine(config) {
  const { store, history, applyCommand, onAfterExecute, clone = (v) => JSON.parse(JSON.stringify(v)) } = config;

  if (!store?.replace && !store?._replaceDocument) {
    throw new Error("Command engine requires store with replace() method.");
  }
  if (!history?.pushCommand) {
    throw new Error("Command engine requires history.pushCommand.");
  }
  if (typeof applyCommand !== "function") {
    throw new Error("Command engine requires applyCommand handler.");
  }

  const replace = store.replace?.bind(store) ?? store._replaceDocument.bind(store);

  const dispatch = async (command) => {
    const before = store.getState();
    const after = applyCommand(clone(before), command);
    return history.pushCommand({
      id: command.id ?? command.type,
      label: command.label ?? command.type,
      execute: async () => {
        replace(after);
        await onAfterExecute?.(store.getState(), command);
      },
      undo: async () => {
        replace(before);
        await onAfterExecute?.(store.getState(), command);
      },
    });
  };

  const createCommand = (type, payload, label, id) =>
    Object.freeze({ type, payload, label: label ?? type, id: id ?? type });

  return Object.freeze({
    version: COMMAND_ENGINE_VERSION,
    dispatch,
    createCommand,
  });
}

export default createCommandEngine;
