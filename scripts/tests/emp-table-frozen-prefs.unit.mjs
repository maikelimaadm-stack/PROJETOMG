import assert from "node:assert/strict";
import { FROZEN_KEY, VISIBLE_KEY } from "@/modules/empresas/components/tblEmp.constants";
import {
  normalizeFrozenColumnCount,
  readEmpTablePreferencesSnapshot,
} from "@/modules/empresas/preferences/empTablePreferencesHydration";
import {
  writeEmpPreferencesJson,
  writeEmpPreferencesText,
} from "@/modules/empresas/preferences/empresasPreferencesCache";

const BASE_COLUMNS = [
  { id: "codempresa", label: "Código", default: true, width: 120 },
  { id: "razao_social", label: "Razão social", default: true, width: 240 },
  { id: "cidade", label: "Cidade", default: true, width: 160 },
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

assert.equal(normalizeFrozenColumnCount(5, 3), 3);
assert.equal(normalizeFrozenColumnCount(-1, 3), 0);
assert.equal(normalizeFrozenColumnCount(2, 3), 2);

writeEmpPreferencesText(FROZEN_KEY, "5", { emit: false });
writeEmpPreferencesJson(VISIBLE_KEY, ["codempresa", "razao_social"], { emit: false });

const snapshot = readEmpTablePreferencesSnapshot(BASE_COLUMNS);
assert.equal(snapshot.frozenColumnCount, 2, "congeladas devem respeitar colunas visíveis");

console.log("OK: emp-table-frozen-prefs.unit");
