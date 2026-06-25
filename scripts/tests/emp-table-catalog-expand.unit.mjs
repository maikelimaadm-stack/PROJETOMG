import assert from "node:assert/strict";
import { markVisibleColumnsInitialized } from "@/framework/cadastro/tables/empColumnLayout";
import { ORDER_KEY, VISIBLE_KEY } from "@/modules/empresas/components/tblEmp.constants";
import { mergeExpandedCatalogIntoTableState } from "@/modules/empresas/preferences/empTablePreferencesHydration";
import {
  writeEmpPreferencesJson,
  writeEmpPreferencesText,
} from "@/modules/empresas/preferences/empresasPreferencesCache";

const BASE_COLUMNS = [
  { id: "codempresa", label: "Código", default: true, width: 120 },
  { id: "razao_social", label: "Razão social", default: true, width: 240 },
];

const EXPANDED_COLUMNS = [
  ...BASE_COLUMNS,
  { id: "custom:extra", label: "Campo extra", default: true, width: 160 },
  { id: "custom:outro", label: "Outro campo", default: true, width: 160 },
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
markVisibleColumnsInitialized();

writeEmpPreferencesJson(VISIBLE_KEY, ["codempresa", "razao_social"], { emit: false });
writeEmpPreferencesJson(
  ORDER_KEY,
  ["codempresa", "razao_social", "custom:extra", "custom:outro"],
  { emit: false }
);

const previousSignature = BASE_COLUMNS.map((column) => column.id).join("|");
const currentState = {
  colunasOrdem: ["codempresa", "razao_social"],
  colunasVisiveis: ["codempresa", "razao_social"],
  columnWidths: { codempresa: 120, razao_social: 240 },
};

const merged = mergeExpandedCatalogIntoTableState(
  currentState,
  EXPANDED_COLUMNS,
  previousSignature
);

assert.ok(merged, "deve mesclar quando entram colunas personalizadas");
assert.deepEqual(
  merged.colunasVisiveis,
  ["codempresa", "razao_social"],
  "campos personalizados não selecionados não devem aparecer na tabela"
);
assert.ok(
  merged.colunasOrdem.includes("custom:extra"),
  "ordem deve incluir colunas novas do catálogo"
);

writeEmpPreferencesJson(VISIBLE_KEY, ["codempresa", "razao_social", "custom:extra"], { emit: false });
writeEmpPreferencesJson(
  ORDER_KEY,
  ["codempresa", "razao_social", "custom:extra", "custom:outro"],
  { emit: false }
);

const mergedSelected = mergeExpandedCatalogIntoTableState(
  currentState,
  EXPANDED_COLUMNS,
  previousSignature
);

assert.deepEqual(
  mergedSelected.colunasVisiveis,
  ["codempresa", "razao_social", "custom:extra"],
  "somente campos personalizados selecionados devem ficar visíveis"
);

console.log("OK: emp-table-catalog-expand.unit");
