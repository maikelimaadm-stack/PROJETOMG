/** Studio Editor Engine — official contracts (Program 2.2.7) */

export const STUDIO_EDITOR_VERSION = "mak-studio-editor-v1";

export const OFFICIAL_EDITOR_SERVICES = Object.freeze([
  "explorer",
  "workspace",
  "inspector",
  "propertyGrid",
  "canvas",
  "preview",
  "history",
  "publish",
  "selection",
]);

export const EDITOR_CONTRIBUTION_KINDS = Object.freeze([
  "tools",
  "panels",
  "commands",
  "objects",
  "behaviors",
  "renderers",
]);

/** Generic editor hub events — designers must not define editor-level events locally */
export const EDITOR_HUB_EVENTS = Object.freeze({
  PROPERTY_CHANGE: "editor.property.change",
  VALIDATION_CHANGED: "editor.validation.changed",
  PREVIEW_CHANGED: "editor.preview.changed",
  DOCUMENT_SYNCED: "editor.document.synced",
});

export default STUDIO_EDITOR_VERSION;
