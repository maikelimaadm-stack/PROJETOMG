/**
 * History Event Integration — History responds to events; never calls Layout directly.
 * @param {ReturnType<import("../hub/studioEventHub.js").createStudioEventHub>} hub
 * @param {object} historyApi — createHistoryApi instance
 */

export function wireHistoryToEventHub(hub, historyApi) {
  if (!historyApi?.pushCommand) {
    throw new Error("wireHistoryToEventHub: valid historyApi required.");
  }

  const originalUndo = historyApi.undo.bind(historyApi);
  const originalRedo = historyApi.redo.bind(historyApi);

  const patchedUndo = async () => {
    const ok = await originalUndo();
    if (ok) {
      hub.publish("history.undo", {
        commandLabel: "undo",
        source: "history",
      });
    }
    return ok;
  };

  const patchedRedo = async () => {
    const ok = await originalRedo();
    if (ok) {
      hub.publish("history.redo", {
        commandLabel: "redo",
        source: "history",
      });
    }
    return ok;
  };

  const changeSubscriptions = [
    hub.subscribe("layout.changed", () => {}, { priority: "low" }),
    hub.subscribe("property.changed", () => {}, { priority: "low" }),
    hub.subscribe("component.updated", () => {}, { priority: "low" }),
  ];

  return Object.freeze({
    undo: patchedUndo,
    redo: patchedRedo,
    pushCommand: historyApi.pushCommand,
    subscribe: historyApi.subscribe,
    canUndo: historyApi.canUndo,
    canRedo: historyApi.canRedo,
    clear: historyApi.clear,
    dispose: () => changeSubscriptions.forEach((id) => hub.unsubscribe(id)),
  });
}

export default wireHistoryToEventHub;
