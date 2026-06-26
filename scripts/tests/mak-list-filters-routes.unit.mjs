import assert from "node:assert/strict";
import {
  buildMakColumnFilters,
  buildMakPanelFilters,
  mergeMakListFilters,
} from "../../src/framework/mak/filters/buildMakListFilters.js";
import { isMakCadastroRoute, MAK_CADASTRO_ROUTES } from "../../src/framework/mak/routes/makCadastroRoutes.js";

assert.equal(isMakCadastroRoute("/"), true);
assert.equal(isMakCadastroRoute("/CadastroEmpresas"), true);
assert.equal(isMakCadastroRoute("/CadastroCamposPersonalizados"), true);
assert.equal(isMakCadastroRoute("/unknown"), false);
assert.ok(MAK_CADASTRO_ROUTES.includes("/CadastroEmpresas"));

const panel = buildMakPanelFilters("empresas", { status: "Ativa" });
assert.ok(panel && typeof panel === "object");

const column = buildMakColumnFilters("empresas", {});
assert.ok(column && typeof column === "object");

const merged = mergeMakListFilters("empresas", { search: "x" }, column);
assert.ok(merged && typeof merged === "object");

console.log("OK: mak-list-filters-routes.unit");
