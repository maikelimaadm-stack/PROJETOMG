/**
 * Preview Event Integration — Preview responds to events; never depends on Layout Designer directly.
 * @param {ReturnType<import("../hub/studioEventHub.js").createStudioEventHub>} hub
 * @param {object} previewApi — createPreviewApi instance
 */

export function wirePreviewToEventHub(hub, previewApi) {
  if (!previewApi?.refresh) {
    throw new Error("wirePreviewToEventHub: valid previewApi required.");
  }

  const triggerEvents = [
    "layout.changed",
    "property.changed",
    "component.created",
    "component.deleted",
    "component.updated",
    "theme.changed",
    "token.changed",
    "manifest.updated",
    "history.undo",
    "history.redo",
    "publish.completed",
  ];

  const subscriptionIds = triggerEvents.map((eventId) =>
    hub.subscribe(
      eventId,
      async (envelope) => {
        if (!previewApi.getLastPreview && !previewApi.refresh) return;
        try {
          const moduleId = envelope.scope?.moduleId ?? envelope.payload?.moduleId ?? null;
          if (previewApi.refresh) {
            await previewApi.refresh({ moduleId, trigger: eventId });
          }
          hub.publish("preview.updated", {
            moduleId: moduleId ?? "unknown",
            previewId: previewApi.getLastPreview?.()?.crb?.moduleId ?? null,
            source: "preview",
          });
        } catch {
          // Preview refresh is best-effort during foundation phase
        }
      },
      { priority: "normal" }
    )
  );

  return Object.freeze({
    refresh: previewApi.refresh,
    getLastPreview: previewApi.getLastPreview,
    clear: previewApi.clear,
    subscribe: previewApi.subscribe,
    dispose: () => subscriptionIds.forEach((id) => hub.unsubscribe(id)),
  });
}

export default wirePreviewToEventHub;
