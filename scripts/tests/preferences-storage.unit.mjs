import assert from "node:assert/strict";
import {
  EMP_LAUNCH_PANEL_STYLE_STORAGE_KEY,
  EMP_VIEW_MODE_STORAGE_KEY,
  applyListagemPreferencesToStorage,
  buildListagemPreferencesFromStorage,
} from "@/modules/empresas/preferences/empresasPreferencesStorage";
import {
  ORDER_KEY,
  VISIBLE_KEY,
} from "@/modules/empresas/components/tblEmp.constants";

const createStorage = () => {
  const data = new Map();
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
    clear: () => data.clear(),
    key: (index) => [...data.keys()][index] ?? null,
    get length() {
      return data.size;
    },
  };
};

const localStorage = createStorage();
const listeners = new Map();
global.window = {
  localStorage,
  dispatchEvent: (event) => {
    const callbacks = listeners.get(event.type) || [];
    callbacks.forEach((callback) => callback(event));
    return true;
  },
  addEventListener: (type, callback) => {
    const callbacks = listeners.get(type) || [];
    callbacks.push(callback);
    listeners.set(type, callbacks);
  },
  removeEventListener: (type, callback) => {
    const callbacks = listeners.get(type) || [];
    listeners.set(
      type,
      callbacks.filter((cb) => cb !== callback)
    );
  },
};
global.localStorage = localStorage;
global.CustomEvent = class CustomEvent {
  constructor(type, init = {}) {
    this.type = type;
    this.detail = init.detail;
  }
};

applyListagemPreferencesToStorage({
  viewMode: "search",
  table: {
    columnOrder: ["codempresa", "razao_social"],
    visibleColumns: ["codempresa"],
    grouping: ["status"],
  },
  panels: {
    launchPanelStyle: "sidebar",
  },
});

assert.equal(localStorage.getItem(EMP_VIEW_MODE_STORAGE_KEY), "search");
assert.equal(localStorage.getItem(EMP_LAUNCH_PANEL_STYLE_STORAGE_KEY), "sidebar");
assert.equal(localStorage.getItem(ORDER_KEY), JSON.stringify(["codempresa", "razao_social"]));
assert.equal(localStorage.getItem(VISIBLE_KEY), JSON.stringify(["codempresa"]));

const snapshot = buildListagemPreferencesFromStorage();
assert.equal(snapshot.viewMode, "search");
assert.equal(snapshot.panels.launchPanelStyle, "sidebar");
assert.equal("grouping" in (snapshot.table || {}), false);
assert.deepEqual(snapshot.filters.columnFilters, {});
assert.deepEqual(snapshot.filters.operatorsByField, {});
assert.equal(snapshot.cards.cardsPerRow, 3);
assert.deepEqual(snapshot.cards.fieldOrder, []);
assert.equal(snapshot.cards.density, "normal");

console.log("OK: preferences-storage.unit");

