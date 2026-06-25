import assert from "node:assert/strict";
import {
  buildUserPrefStorageKey,
  clearActiveUserPreferencesScope,
  preferenceEventMatchesScope,
  resolveListagemPreferenceStorageKey,
  setActiveUserPreferencesScope,
} from "@/shared/preferences/userPreferencesScope.js";
import {
  readEmpPreferencesText,
  resetEmpPreferencesMemoryCache,
  writeEmpPreferencesText,
} from "@/modules/empresas/preferences/empresasPreferencesCache.js";
import { VISIBLE_KEY } from "@/modules/empresas/components/tblEmp.constants.js";

const localStorage = (() => {
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
})();

global.window = {
  localStorage,
  dispatchEvent: () => true,
  addEventListener: () => {},
  removeEventListener: () => {},
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

setActiveUserPreferencesScope({ clienteId: "cli_001", userId: "usr_ana" });
writeEmpPreferencesText(VISIBLE_KEY, JSON.stringify(["codempresa", "telefone"]));

const anaKey = resolveListagemPreferenceStorageKey(VISIBLE_KEY);
assert.ok(anaKey.includes("cli_001"));
assert.ok(anaKey.includes("usr_ana"));
assert.equal(readEmpPreferencesText(VISIBLE_KEY, null), JSON.stringify(["codempresa", "telefone"]));

setActiveUserPreferencesScope({ clienteId: "cli_001", userId: "usr_joao" });
resetEmpPreferencesMemoryCache();
assert.equal(readEmpPreferencesText(VISIBLE_KEY, null), null, "João não deve ver storage scoped de Ana");

writeEmpPreferencesText(VISIBLE_KEY, JSON.stringify(["codempresa", "email"]));
const joaoValue = readEmpPreferencesText(VISIBLE_KEY, null);
assert.equal(joaoValue, JSON.stringify(["codempresa", "email"]));

setActiveUserPreferencesScope({ clienteId: "cli_001", userId: "usr_ana" });
resetEmpPreferencesMemoryCache();
assert.equal(
  readEmpPreferencesText(VISIBLE_KEY, null),
  JSON.stringify(["codempresa", "telefone"]),
  "Ana mantém preferência individual após João salvar"
);

assert.equal(
  preferenceEventMatchesScope({ clienteId: "cli_001", userId: "usr_ana" }),
  true
);
setActiveUserPreferencesScope({ clienteId: "cli_001", userId: "usr_joao" });
assert.equal(
  preferenceEventMatchesScope({ clienteId: "cli_001", userId: "usr_ana" }),
  false
);

assert.equal(
  buildUserPrefStorageKey({
    clienteId: "cli_001",
    userId: "usr_ana",
    modulo: "empresas",
    tela: "listagem",
    field: "emp_col_visiveis",
  }),
  "mg_pref_v2:cli_001:usr_ana:empresas:listagem:emp_col_visiveis"
);

console.log("OK: user-preferences-scope.unit");
