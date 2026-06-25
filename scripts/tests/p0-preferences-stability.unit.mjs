import assert from "node:assert/strict";
import {
  isEmpresasPreferencesV2Enabled,
  EMPRESAS_PREFERENCES_BOOTSTRAP_TIMEOUT_MS,
} from "@/modules/empresas/preferences/empresasPreferencesFeatureFlags.js";

assert.equal(isEmpresasPreferencesV2Enabled(), false);
assert.equal(EMPRESAS_PREFERENCES_BOOTSTRAP_TIMEOUT_MS, 3_000);

process.env.VITE_EMPRESAS_PREFERENCES_V2_ENABLED = "true";
assert.equal(isEmpresasPreferencesV2Enabled(), false, "feature flag reads build-time env only");

console.log("p0-preferences-stability.unit.mjs: ok");
