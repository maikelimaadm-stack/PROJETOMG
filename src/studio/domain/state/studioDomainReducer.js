/** Studio Domain reducer — single shared state model (Program 2.1A.6) */

export const DomainActionTypes = Object.freeze({
  SELECTION_SET: "domain/selection/set",
  WORKSPACE_SET_MODULE: "domain/workspace/setModule",
  WORKSPACE_SET_DESIGNER: "domain/workspace/setDesigner",
  WORKSPACE_SET_TREE: "domain/workspace/setTree",
  WORKSPACE_SET_LABEL: "domain/workspace/setLabel",
  DOCK_TOGGLE: "domain/dock/toggle",
  DOCK_SET: "domain/dock/set",
  TABS_SET: "domain/tabs/set",
  HISTORY_SYNC: "domain/history/sync",
  NOTIFICATION_ADD: "domain/notifications/add",
  NOTIFICATION_CLEAR: "domain/notifications/clear",
  CLIPBOARD_SET: "domain/clipboard/set",
  PREVIEW_SET: "domain/preview/set",
  PUBLISH_SET: "domain/publish/set",
  SEARCH_SET_QUERY: "domain/search/setQuery",
  SEARCH_SET_RESULTS: "domain/search/setResults",
  SEARCH_SET_OPEN: "domain/search/setOpen",
  ASSETS_SET: "domain/assets/set",
  ASSETS_LOADING: "domain/assets/loading",
  PROPERTIES_SET_FIELDS: "domain/properties/setFields",
  PROPERTIES_UPDATE_FIELD: "domain/properties/updateField",
  COMMAND_PALETTE_SET: "domain/commandPalette/set",
});

export function studioDomainReducer(state, action) {
  switch (action.type) {
    case DomainActionTypes.SELECTION_SET:
      return { ...state, selection: { ...state.selection, ...action.payload } };

    case DomainActionTypes.WORKSPACE_SET_MODULE:
      return {
        ...state,
        workspace: { ...state.workspace, moduleId: action.payload.moduleId },
        selection: { ...state.selection, moduleId: action.payload.moduleId },
      };

    case DomainActionTypes.WORKSPACE_SET_DESIGNER:
      return {
        ...state,
        workspace: { ...state.workspace, designerId: action.payload.designerId },
        selection: { ...state.selection, designerId: action.payload.designerId },
      };

    case DomainActionTypes.WORKSPACE_SET_TREE:
      return {
        ...state,
        workspace: { ...state.workspace, explorerTree: action.payload.tree },
      };

    case DomainActionTypes.WORKSPACE_SET_LABEL:
      return {
        ...state,
        workspace: { ...state.workspace, designerLabel: action.payload.label },
      };

    case DomainActionTypes.DOCK_TOGGLE:
      return {
        ...state,
        dock: { ...state.dock, [action.payload.panel]: !state.dock[action.payload.panel] },
      };

    case DomainActionTypes.DOCK_SET:
      return { ...state, dock: { ...state.dock, ...action.payload } };

    case DomainActionTypes.TABS_SET:
      return {
        ...state,
        tabs: { ...state.tabs, [action.payload.region]: action.payload.tabId },
      };

    case DomainActionTypes.HISTORY_SYNC:
      return { ...state, history: { ...state.history, ...action.payload } };

    case DomainActionTypes.NOTIFICATION_ADD:
      return {
        ...state,
        notifications: {
          items: [action.payload, ...state.notifications.items].slice(0, 10),
        },
      };

    case DomainActionTypes.NOTIFICATION_CLEAR:
      return { ...state, notifications: { items: [] } };

    case DomainActionTypes.CLIPBOARD_SET:
      return { ...state, clipboard: { ...state.clipboard, ...action.payload } };

    case DomainActionTypes.PREVIEW_SET:
      return { ...state, preview: { ...state.preview, ...action.payload } };

    case DomainActionTypes.PUBLISH_SET:
      return { ...state, publish: { ...state.publish, ...action.payload } };

    case DomainActionTypes.SEARCH_SET_QUERY:
      return { ...state, search: { ...state.search, query: action.payload } };

    case DomainActionTypes.SEARCH_SET_RESULTS:
      return { ...state, search: { ...state.search, results: action.payload } };

    case DomainActionTypes.SEARCH_SET_OPEN:
      return { ...state, search: { ...state.search, isOpen: action.payload } };

    case DomainActionTypes.ASSETS_SET:
      return { ...state, assets: { ...state.assets, items: action.payload, loading: false } };

    case DomainActionTypes.ASSETS_LOADING:
      return { ...state, assets: { ...state.assets, loading: action.payload } };

    case DomainActionTypes.PROPERTIES_SET_FIELDS:
      return {
        ...state,
        properties: {
          fields: action.payload.fields,
          entryId: action.payload.entryId ?? state.properties.entryId,
        },
      };

    case DomainActionTypes.PROPERTIES_UPDATE_FIELD:
      return {
        ...state,
        properties: {
          ...state.properties,
          fields: state.properties.fields.map((f) =>
            f.propertyId === action.payload.propertyId
              ? { ...f, value: action.payload.value }
              : f
          ),
        },
      };

    case DomainActionTypes.COMMAND_PALETTE_SET:
      return { ...state, commandPalette: { open: action.payload } };

    default:
      return state;
  }
}
