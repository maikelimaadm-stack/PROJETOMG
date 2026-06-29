/**
 * Typed payload contracts for official Studio Event Hub events.
 * Payloads are metadata-only — no DOM or React references.
 */
import { getBusEvent } from "../registry/eventBusRegistry.js";

export const EVENT_PAYLOAD_CONTRACTS = Object.freeze({
  "selection.changed": {
    selectionId: "string|null",
    entryId: "string|null",
    entryType: "string|null",
    source: "string",
  },
  "component.created": {
    componentId: "string",
    entryId: "string",
    parentId: "string|null",
    source: "string",
  },
  "component.deleted": {
    componentId: "string",
    entryId: "string",
    source: "string",
  },
  "component.updated": {
    componentId: "string",
    entryId: "string",
    changes: "object",
    source: "string",
  },
  "property.changed": {
    propertyId: "string",
    entryId: "string",
    previousValue: "unknown",
    nextValue: "unknown",
    source: "string",
  },
  "layout.changed": {
    layoutId: "string",
    entryId: "string",
    changeType: "string",
    source: "string",
  },
  "theme.changed": {
    themeId: "string",
    previousThemeId: "string|null",
    source: "string",
  },
  "token.changed": {
    tokenId: "string",
    themeId: "string|null",
    source: "string",
  },
  "manifest.updated": {
    componentId: "string",
    manifestVersion: "string",
    source: "string",
  },
  "publish.started": {
    moduleId: "string",
    versionId: "string|null",
    source: "string",
  },
  "publish.completed": {
    moduleId: "string",
    versionId: "string",
    success: "boolean",
    source: "string",
  },
  "preview.updated": {
    moduleId: "string",
    previewId: "string|null",
    source: "string",
  },
  "history.undo": {
    commandLabel: "string",
    source: "string",
  },
  "history.redo": {
    commandLabel: "string",
    source: "string",
  },
  "dock.changed": {
    panelId: "string",
    zone: "string",
    visible: "boolean",
    source: "string",
  },
  "workspace.changed": {
    workspaceId: "string",
    moduleId: "string|null",
    source: "string",
  },
  "designer.active.changed": {
    designerId: "string",
    previousDesignerId: "string|null",
    source: "string",
  },
});

/**
 * @param {string} eventId
 * @param {object} payload
 */
export function validateEventPayload(eventId, payload) {
  let contract = EVENT_PAYLOAD_CONTRACTS[eventId];
  if (!contract) {
    contract = getBusEvent(eventId)?.payload ?? null;
  }
  if (!contract) {
    return { valid: false, errors: [`No payload contract for event: ${eventId}`] };
  }
  const errors = [];
  Object.entries(contract).forEach(([key, typeHint]) => {
    if (!(key in payload)) {
      errors.push(`payload.${key} is required.`);
      return;
    }
    const value = payload[key];
    if (typeHint === "string|null" && value != null && typeof value !== "string") {
      errors.push(`payload.${key} must be string or null.`);
    } else if (typeHint === "string" && typeof value !== "string") {
      errors.push(`payload.${key} must be string.`);
    } else if (typeHint === "boolean" && typeof value !== "boolean") {
      errors.push(`payload.${key} must be boolean.`);
    } else if (typeHint === "object" && (value == null || typeof value !== "object")) {
      errors.push(`payload.${key} must be object.`);
    }
  });
  return { valid: errors.length === 0, errors };
}

export default EVENT_PAYLOAD_CONTRACTS;
