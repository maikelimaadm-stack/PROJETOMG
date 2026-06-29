/** MAK Studio Domain — official contracts (Program 2.1A.6) */

export const STUDIO_DOMAIN_VERSION = "mak-studio-domain-v1";

/** Official domain slices — no designer may duplicate these. */
export const OFFICIAL_DOMAIN_SLICES = Object.freeze([
  "selection",
  "workspace",
  "dock",
  "tabs",
  "history",
  "notifications",
  "clipboard",
  "preview",
  "publish",
  "search",
  "assets",
  "properties",
]);

export const OFFICIAL_DOMAIN_HOOKS = Object.freeze([
  "useSelection",
  "useWorkspace",
  "useDock",
  "useTabs",
  "useHistory",
  "useNotifications",
  "useClipboard",
  "usePreview",
  "usePublish",
  "useSearch",
  "useAssets",
  "useProperties",
]);

export const OFFICIAL_DOMAIN_SERVICES = Object.freeze([
  "previewService",
  "publishService",
  "compileService",
  "validationService",
  "assetService",
  "searchService",
]);

/**
 * @typedef {object} StudioDomainState
 * @property {SelectionState} selection
 * @property {WorkspaceState} workspace
 * @property {DockState} dock
 * @property {TabsState} tabs
 * @property {HistoryState} history
 * @property {NotificationsState} notifications
 * @property {ClipboardState} clipboard
 * @property {PreviewState} preview
 * @property {PublishState} publish
 * @property {SearchState} search
 * @property {AssetsState} assets
 * @property {PropertiesState} properties
 * @property {CommandPaletteState} commandPalette
 */

/** @typedef {object} SelectionState */
/** @typedef {object} WorkspaceState */
/** @typedef {object} DockState */
/** @typedef {object} TabsState */
/** @typedef {object} HistoryState */
/** @typedef {object} NotificationsState */
/** @typedef {object} ClipboardState */
/** @typedef {object} PreviewState */
/** @typedef {object} PublishState */
/** @typedef {object} SearchState */
/** @typedef {object} AssetsState */
/** @typedef {object} PropertiesState */
/** @typedef {{ open: boolean }} CommandPaletteState */

export function createInitialStudioDomainState(overrides = {}) {
  return {
    selection: {
      entryId: null,
      entryType: null,
      moduleId: null,
      designerId: null,
    },
    workspace: {
      moduleId: "empresas",
      designerId: "layout",
      explorerTree: [],
      designerLabel: null,
    },
    dock: { left: true, right: true, bottom: true },
    tabs: { left: "explorer", right: "inspector", bottom: "preview" },
    history: { canUndo: false, canRedo: false, stackSize: 0 },
    notifications: { items: [] },
    clipboard: { items: [], lastOperation: null },
    preview: { status: "idle", message: null, compileId: null },
    publish: { status: "draft", version: null, environment: null },
    search: { query: "", results: [], isOpen: false },
    assets: { items: [], loading: false },
    properties: { fields: [], entryId: null },
    commandPalette: { open: false },
    ...overrides,
  };
}
