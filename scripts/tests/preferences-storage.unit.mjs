import assert from "node:assert/strict";
import {
  setActiveUserPreferencesScope,
  clearActiveUserPreferencesScope,
} from "@/shared/preferences/userPreferencesScope.js";
import {
  resetEmpPreferencesMemoryCache,
} from "@/modules/empresas/preferences/empresasPreferencesCache";
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

clearActiveUserPreferencesScope();
resetEmpPreferencesMemoryCache();
setActiveUserPreferencesScope({ clienteId: "cli_test", userId: "usr_test" });
resetEmpPreferencesMemoryCache();

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

const scopedKeys = [];
for (let index = 0; index < localStorage.length; index += 1) {
  const key = localStorage.key(index);
  if (key) scopedKeys.push(key);
}
assert.ok(
  scopedKeys.some((key) => key.includes("mg_pref_v2:cli_test:usr_test")),
  "deve gravar em chave scoped por cliente+usuário"
);
const snapshot = buildListagemPreferencesFromStorage();
assert.equal(snapshot.viewMode, "search");
assert.equal(snapshot.panels.launchPanelStyle, "sidebar");
assert.equal("grouping" in (snapshot.table || {}), false);

console.log("OK: preferences-storage.unit");

