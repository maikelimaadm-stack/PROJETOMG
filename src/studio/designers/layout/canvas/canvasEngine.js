/** Canvas engine configuration — extensible architecture (Program 2.2) */

export const CANVAS_ENGINE_VERSION = "mak-layout-canvas-v1";

export const DEFAULT_CANVAS_CONFIG = Object.freeze({
  version: CANVAS_ENGINE_VERSION,
  zoom: { enabled: true, min: 0.25, max: 2, step: 0.1, default: 1 },
  pan: { enabled: true },
  grid: { enabled: true, size: 8, snap: false },
  snap: { enabled: false, threshold: 4 },
  guides: { enabled: false },
  rulers: { enabled: false },
  overlays: { enabled: true, selection: true, hover: true },
  multiSelection: { enabled: true },
});

export function createCanvasEngineState(config = DEFAULT_CANVAS_CONFIG) {
  return Object.freeze({
    config,
    zoom: config.zoom.default,
    pan: { x: 0, y: 0 },
    selectedIds: [],
    hoveredId: null,
  });
}

export function canvasZoom(state, delta) {
  const next = Math.min(state.config.zoom.max, Math.max(state.config.zoom.min, state.zoom + delta));
  return { ...state, zoom: next };
}

export function canvasPan(state, dx, dy) {
  if (!state.config.pan.enabled) return state;
  return { ...state, pan: { x: state.pan.x + dx, y: state.pan.y + dy } };
}

export function canvasSelect(state, ids, multi = false) {
  if (!state.config.multiSelection.enabled || !multi) {
    return { ...state, selectedIds: [...ids] };
  }
  const merged = new Set([...state.selectedIds, ...ids]);
  return { ...state, selectedIds: [...merged] };
}

export default DEFAULT_CANVAS_CONFIG;
