import assert from "node:assert/strict";
import {
  buildScreenKey,
  parseScopeFromScreenKey,
  validatePreferenceConfig,
} from "../src/modules/preferences/layoutValidators/index.js";

const run = () => {
  const parsedLegacy = parseScopeFromScreenKey("empresas.form_layout");
  assert.equal(parsedLegacy.modulo, "empresas");
  assert.equal(parsedLegacy.tela, "form_layout");
  assert.equal(parsedLegacy.screenKey, "empresas.form_layout");

  const parsedFallback = parseScopeFromScreenKey("legacy_only_key");
  assert.equal(parsedFallback.modulo, "legacy");
  assert.equal(parsedFallback.tela, "legacy_only_key");

  const sanitized = validatePreferenceConfig({
    modulo: "empresas",
    tela: "listagem",
    config: {
      version: 1,
      table: {
        visibleColumns: ["codempresa"],
        grouping: ["status"],
        pinnedRightColumnIds: ["status"],
      },
    },
  });
  assert.deepEqual(sanitized.table.visibleColumns, ["codempresa"]);
  assert.equal("grouping" in sanitized.table, false);
  assert.equal("pinnedRightColumnIds" in sanitized.table, false);

  assert.equal(buildScreenKey("empresas", "listagem"), "empresas.listagem");
  console.log("OK: testPreferencesValidators");
};

run();

