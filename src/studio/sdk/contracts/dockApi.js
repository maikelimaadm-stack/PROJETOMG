import { STUDIO_DOCK_ZONES } from "../studioSdkConstants.js";

/**
 * Dock API — panel zone management contract.
 */
export function createDockApi(options = {}) {
  const panels = new Map();
  const layout = {
    left: options.left ?? ["explorer", "outline"],
    right: options.right ?? ["inspector", "properties"],
    bottom: options.bottom ?? ["runtimeConsole"],
  };

  return Object.freeze({
    zones: STUDIO_DOCK_ZONES,
    registerPanel: (panelDef) => {
      if (!panelDef?.panelId) throw new Error("Dock panel requires panelId.");
      panels.set(panelDef.panelId, Object.freeze({ ...panelDef }));
      return panelDef.panelId;
    },
    getPanel: (panelId) => panels.get(panelId) ?? null,
    listPanels: (zone) => {
      const all = [...panels.values()];
      return zone ? all.filter((panel) => panel.zone === zone) : all;
    },
    getLayout: () => Object.freeze({ ...layout }),
    setZonePanels: (zone, panelIds) => {
      if (!STUDIO_DOCK_ZONES.includes(zone)) {
        throw new Error(`Invalid dock zone: ${zone}`);
      }
      layout[zone] = [...panelIds];
      return layout[zone];
    },
  });
}

export default createDockApi;
