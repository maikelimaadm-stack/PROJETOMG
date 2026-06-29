/** MAK Studio SDK — Program 2.0.5 constants. */

export const STUDIO_SDK_VERSION = "studio-sdk-v1";
export const STUDIO_REGISTRY_VERSION = "studio-registry-v1";

export const STUDIO_DOCK_ZONES = Object.freeze(["left", "right", "bottom"]);
export const STUDIO_HISTORY_DEFAULT_LIMIT = 50;

/** Reserved designer identifiers — shell registers plugins without modification. */
export const STUDIO_DESIGNER_IDS = Object.freeze([
  "layout",
  "field",
  "validation",
  "formula",
  "workflow",
  "dashboard",
  "kpi",
  "automation",
  "process",
  "mobile",
  "desktop",
  "ai",
]);

export const STUDIO_CAPABILITY_IDS = Object.freeze([
  "dragDrop",
  "responsive",
  "docking",
  "preview",
  "publish",
  "graph",
  "validation",
  "execution",
  "history",
  "commandPalette",
  "clipboard",
  "collaboration",
  "marketplace",
  "aiAssist",
]);
