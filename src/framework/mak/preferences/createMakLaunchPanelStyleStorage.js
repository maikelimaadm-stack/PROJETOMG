import { readPreferencesText, writePreferencesText } from "./userPreferencesCache.js";

const normalizeLaunchPanelStyle = (style) => (style === "sidebar" ? "sidebar" : "tabs");

/**
 * Storage genérico de launchPanelStyle por keyPrefix de módulo.
 */
export function createMakLaunchPanelStyleStorage({
  keyPrefix,
  moduleId = keyPrefix,
  updatedEvent = null,
} = {}) {
  const prefix = String(keyPrefix || moduleId || "cadastro").trim();
  const storageKey = `${prefix}_launch_panel_style_v1`;
  const eventName = updatedEvent ?? `${moduleId}-launch-panel-style-updated`;

  const readStoredLaunchPanelStyle = () =>
    normalizeLaunchPanelStyle(readPreferencesText(storageKey, "tabs"));

  const writeStoredLaunchPanelStyle = (style, reason = "form-layout:panel-style-local") => {
    writePreferencesText(storageKey, normalizeLaunchPanelStyle(style), { reason });
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(eventName));
    }
  };

  return {
    storageKey,
    readStoredLaunchPanelStyle,
    writeStoredLaunchPanelStyle,
    normalizeLaunchPanelStyle,
  };
}

export default createMakLaunchPanelStyleStorage;
