import { DomainActionTypes } from "./studioDomainReducer.js";

/**
 * Creates domain action dispatchers bound to store + external deps.
 * @param {import("./createStudioDomainStore.js").StudioDomainStore} store
 * @param {{ hub?: object, sdk?: object, services?: object }} deps
 */
export function createDomainActions(store, deps = {}) {
  const { hub, sdk, services } = deps;
  const dispatch = store.dispatch;

  return Object.freeze({
    selection: {
      selectEntry(entry) {
        const payload = {
          entryId: entry?.entryId ?? null,
          entryType: entry?.entryType ?? null,
          moduleId: store.getState().workspace.moduleId,
          designerId: store.getState().workspace.designerId,
        };
        dispatch({ type: DomainActionTypes.SELECTION_SET, payload });
        sdk?.selection?.setSelection(payload);
        hub?.publish("selection.changed", {
          selectionId: payload.entryId,
          entryId: payload.entryId,
          entryType: payload.entryType,
          source: "domain",
        });
      },
      clear() {
        dispatch({
          type: DomainActionTypes.SELECTION_SET,
          payload: { entryId: null, entryType: null },
        });
      },
    },

    workspace: {
      setModule(moduleId) {
        dispatch({ type: DomainActionTypes.WORKSPACE_SET_MODULE, payload: { moduleId } });
        hub?.publish("workspace.changed", { workspaceId: `ws-${moduleId}`, moduleId, source: "domain" });
      },
      setDesigner(designerId) {
        const prev = store.getState().workspace.designerId;
        dispatch({ type: DomainActionTypes.WORKSPACE_SET_DESIGNER, payload: { designerId } });
        hub?.publish("designer.active.changed", {
          designerId,
          previousDesignerId: prev,
          source: "domain",
        });
      },
      setExplorerTree(tree) {
        dispatch({ type: DomainActionTypes.WORKSPACE_SET_TREE, payload: { tree } });
      },
      setDesignerLabel(label) {
        dispatch({ type: DomainActionTypes.WORKSPACE_SET_LABEL, payload: { label } });
      },
    },

    dock: {
      toggle(panel) {
        dispatch({ type: DomainActionTypes.DOCK_TOGGLE, payload: { panel } });
      },
      setVisibility(visibility) {
        dispatch({ type: DomainActionTypes.DOCK_SET, payload: visibility });
      },
    },

    tabs: {
      setTab(region, tabId) {
        dispatch({ type: DomainActionTypes.TABS_SET, payload: { region, tabId } });
      },
    },

    history: {
      syncFromSdk() {
        if (!sdk?.history) return;
        dispatch({
          type: DomainActionTypes.HISTORY_SYNC,
          payload: {
            canUndo: sdk.history.canUndo?.() ?? false,
            canRedo: sdk.history.canRedo?.() ?? false,
            stackSize: sdk.history.size?.() ?? 0,
          },
        });
      },
      undo() {
        sdk?.history?.undo?.();
        this.syncFromSdk();
      },
      redo() {
        sdk?.history?.redo?.();
        this.syncFromSdk();
      },
    },

    notifications: {
      add(notification) {
        const item = {
          id: `n-${Date.now()}`,
          timestamp: new Date().toISOString(),
          severity: "info",
          ...notification,
        };
        dispatch({ type: DomainActionTypes.NOTIFICATION_ADD, payload: item });
      },
      clear() {
        dispatch({ type: DomainActionTypes.NOTIFICATION_CLEAR });
      },
    },

    clipboard: {
      copy(items) {
        dispatch({
          type: DomainActionTypes.CLIPBOARD_SET,
          payload: { items, lastOperation: "copy" },
        });
        sdk?.clipboard?.copy?.(items);
      },
      clear() {
        dispatch({ type: DomainActionTypes.CLIPBOARD_SET, payload: { items: [], lastOperation: null } });
      },
    },

    preview: {
      async compile() {
        dispatch({ type: DomainActionTypes.PREVIEW_SET, payload: { status: "loading" } });
        const result = await services?.previewService?.compile?.();
        dispatch({
          type: DomainActionTypes.PREVIEW_SET,
          payload: {
            status: result?.ok ? "ready" : "error",
            compileId: result?.compileId ?? null,
            message: result?.reason ?? null,
          },
        });
        return result;
      },
      setStatus(status, message = null) {
        dispatch({ type: DomainActionTypes.PREVIEW_SET, payload: { status, message } });
      },
    },

    publish: {
      async validate() {
        const result = await services?.publishService?.validate?.();
        dispatch({
          type: DomainActionTypes.PUBLISH_SET,
          payload: { status: result?.ok ? "valid" : "invalid" },
        });
        return result;
      },
      async publish() {
        const result = await services?.publishService?.publish?.();
        if (result?.ok) {
          dispatch({
            type: DomainActionTypes.PUBLISH_SET,
            payload: { status: "published", version: result.version ?? null },
          });
        }
        return result;
      },
    },

    search: {
      setQuery(query) {
        dispatch({ type: DomainActionTypes.SEARCH_SET_QUERY, payload: query });
      },
      async runSearch(query) {
        const results = await services?.searchService?.search?.(query);
        dispatch({ type: DomainActionTypes.SEARCH_SET_RESULTS, payload: results ?? [] });
        return results;
      },
      setOpen(isOpen) {
        dispatch({ type: DomainActionTypes.SEARCH_SET_OPEN, payload: isOpen });
        dispatch({ type: DomainActionTypes.COMMAND_PALETTE_SET, payload: isOpen });
      },
    },

    assets: {
      async load() {
        dispatch({ type: DomainActionTypes.ASSETS_LOADING, payload: true });
        const items = await services?.assetService?.listAssets?.();
        dispatch({ type: DomainActionTypes.ASSETS_SET, payload: items ?? [] });
        return items;
      },
    },

    properties: {
      setFields(fields, entryId = null) {
        dispatch({ type: DomainActionTypes.PROPERTIES_SET_FIELDS, payload: { fields, entryId } });
      },
      updateField(propertyId, value) {
        dispatch({ type: DomainActionTypes.PROPERTIES_UPDATE_FIELD, payload: { propertyId, value } });
        const entryId = store.getState().selection.entryId;
        hub?.publish("property.changed", {
          propertyId,
          entryId,
          previousValue: null,
          nextValue: value,
          source: "domain",
        });
      },
    },

    commandPalette: {
      setOpen(open) {
        dispatch({ type: DomainActionTypes.COMMAND_PALETTE_SET, payload: open });
        dispatch({ type: DomainActionTypes.SEARCH_SET_OPEN, payload: open });
      },
    },
  });
}
