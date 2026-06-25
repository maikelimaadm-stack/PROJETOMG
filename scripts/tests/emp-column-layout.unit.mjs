import assert from "node:assert/strict";
import {
  isVisibleColumnsInitialized,
  loadVisibleColumns,
  markVisibleColumnsInitialized,
  mergeSavedVisibleColumns,
} from "@/framework/cadastro/tables/empColumnLayout";
import { VISIBLE_KEY } from "@/modules/empresas/components/tblEmp.constants";
import {
  writeEmpPreferencesJson,
  writeEmpPreferencesText,
  removeEmpPreferencesKey,
} from "@/modules/empresas/preferences/empresasPreferencesCache";

const BASE_COLUMNS = [
  { id: "codempresa", default: true },
  { id: "razao_social", default: true },
  { id: "cidade", default: true },
  { id: "status", default: false },
];

const storage = new Map();
global.window = {
  localStorage: {
    getItem: (key) => (storage.has(key) ? storage.get(key) : null),
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: (key) => storage.delete(key),
    key: (index) => [...storage.keys()][index] ?? null,
    get length() {
      return storage.size;
    },
  },
  dispatchEvent: () => true,
  addEventListener: () => {},
  removeEventListener: () => {},
};
global.localStorage = global.window.localStorage;
global.CustomEvent = class CustomEvent {
  constructor(type, init = {}) {
    this.type = type;
    this.detail = init.detail;
  }
};

storage.clear();

assert.deepEqual(
  mergeSavedVisibleColumns(["codempresa", "razao_social"], BASE_COLUMNS, { initialized: true }),
  ["codempresa", "razao_social"]
);

assert.deepEqual(mergeSavedVisibleColumns([], BASE_COLUMNS, { initialized: true }), []);

assert.deepEqual(mergeSavedVisibleColumns(["codempresa"], BASE_COLUMNS, { initialized: false }), [
  "codempresa",
]);

assert.deepEqual(mergeSavedVisibleColumns([], BASE_COLUMNS, { initialized: false }), [
  "codempresa",
  "razao_social",
  "cidade",
]);

writeEmpPreferencesJson(VISIBLE_KEY, ["codempresa", "razao_social"], { emit: false });
markVisibleColumnsInitialized();
assert.equal(isVisibleColumnsInitialized(), true);
assert.deepEqual(loadVisibleColumns(VISIBLE_KEY, BASE_COLUMNS), ["codempresa", "razao_social"]);

writeEmpPreferencesJson(VISIBLE_KEY, [], { emit: false });
assert.deepEqual(loadVisibleColumns(VISIBLE_KEY, BASE_COLUMNS), []);

removeEmpPreferencesKey(VISIBLE_KEY, { emit: false });
removeEmpPreferencesKey("emp_col_vis_initialized_v1", { emit: false });
assert.deepEqual(loadVisibleColumns(VISIBLE_KEY, BASE_COLUMNS), [
  "codempresa",
  "razao_social",
  "cidade",
]);

console.log("OK: emp-column-layout.unit");
