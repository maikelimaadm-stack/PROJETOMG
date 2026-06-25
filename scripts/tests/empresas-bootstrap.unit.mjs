import assert from "node:assert/strict";
import {
  setActiveUserPreferencesScope,
  clearActiveUserPreferencesScope,
} from "@/shared/preferences/userPreferencesScope.js";
import { resetEmpPreferencesMemoryCache } from "@/modules/empresas/preferences/empresasPreferencesCache";
import {
  applyListagemPreferencesToStorage,
  buildListagemPreferencesFromStorage,
} from "@/modules/empresas/preferences/empresasPreferencesStorage";

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

const listeners = new Map();
global.window = {
  localStorage: createStorage(),
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
      callbacks.filter((item) => item !== callback)
    );
  },
};

setActiveUserPreferencesScope({ clienteId: "cliente-a", userId: "user-a" });
resetEmpPreferencesMemoryCache();

const tablePatch = {
  version: 2,
  table: {
    visibleColumns: ["codempresa", "razao_social"],
    columnOrder: ["codempresa", "razao_social"],
  },
  cards: {
    visibleFields: { codempresa: true, razao_social: true },
    fieldOrder: ["razao_social", "codempresa"],
    layoutConfig: { cardsPerRow: 3 },
  },
  filtersConfig: {
    filterFieldsLayout: { visiveis: ["razao_social"], ordem: ["razao_social"], maxVisible: 5 },
    maxVisibleFields: 5,
    operatorsByField: { razao_social: "contains" },
  },
};

applyListagemPreferencesToStorage(tablePatch);
const snapshot = buildListagemPreferencesFromStorage();
assert.deepEqual(snapshot.table.visibleColumns, ["codempresa", "razao_social"]);
assert.equal(snapshot.cards.layoutConfig.cardsPerRow, 3);
assert.deepEqual(snapshot.cards.fieldOrder, ["razao_social", "codempresa"]);

applyListagemPreferencesToStorage({
  version: 2,
  cards: {
    layoutConfig: { cardsPerRow: 4 },
  },
});
const merged = buildListagemPreferencesFromStorage();
assert.equal(merged.cards.layoutConfig.cardsPerRow, 4);
assert.deepEqual(merged.table.visibleColumns, ["codempresa", "razao_social"]);

clearActiveUserPreferencesScope();
resetEmpPreferencesMemoryCache();
console.log("empresas-bootstrap.unit.mjs: ok");
