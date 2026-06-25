import assert from "node:assert/strict";
import {
  normalizeEmpListViewMode,
  resolveMgViewMode,
} from "../../src/modules/empresas/layout/mgViewMode.js";

assert.equal(normalizeEmpListViewMode("cards"), "search");
assert.equal(normalizeEmpListViewMode("tabela"), "table");
assert.equal(normalizeEmpListViewMode("registro", { allowRecord: true }), "record");
assert.equal(normalizeEmpListViewMode("registro", { allowRecord: false }), "table");

assert.equal(resolveMgViewMode({ showForm: false, viewMode: "record" }), "tabela");
assert.equal(resolveMgViewMode({ showForm: false, viewMode: "search" }), "cards");
assert.equal(resolveMgViewMode({ showForm: true, viewMode: "table" }), "registro");
assert.equal(resolveMgViewMode({ showForm: false, viewMode: "table" }), "tabela");

console.log("OK: mg-view-mode.unit");
