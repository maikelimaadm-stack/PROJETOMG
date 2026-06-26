/**
 * Smoke test — runtime declarativo MAK Foundation V6 (sem React/DOM).
 */
import { defineMakModule } from "@/framework/mak/runtime/defineMakModule.js";
import { createMakPreferencesEngine } from "@/framework/mak/preferences/MakPreferencesEngine.js";
import { createMakListCache } from "@/framework/mak/data/createMakListCache.js";
import { syncPanelFiltersIntoColumns } from "@/framework/mak/listing/syncPanelColumnFilters.js";

const stubAdapter = {
  moduleId: "test",
  readJson: () => null,
  readText: () => null,
  writeText: () => {},
  writeJson: () => {},
};

const stubModule = defineMakModule(
  {
    moduleId: "test",
    entityName: "Test",
    singularLabel: "Test",
    pluralLabel: "Tests",
    repository: {},
  },
  { table: { columns: [{ id: "id", label: "ID" }] } },
  { patchListCache: createMakListCache({ queryKey: ["test"], defaultPageSize: 50 }) },
  stubAdapter
);

if (stubModule.moduleId !== "test") {
  throw new Error("defineMakModule failed");
}
if (!stubModule.preferences?.readJson) {
  throw new Error("preferences engine missing on stub module");
}
if (!stubModule.metadata?.table?.columns?.length) {
  throw new Error("table metadata missing on stub module");
}

const engine = createMakPreferencesEngine(stubAdapter);
if (typeof engine.readJson !== "function") {
  throw new Error("createMakPreferencesEngine failed");
}

if (typeof createMakListCache !== "function") {
  throw new Error("createMakListCache not exported");
}

const synced = syncPanelFiltersIntoColumns({}, {}, {});
if (typeof synced !== "object") {
  throw new Error("syncPanelFiltersIntoColumns failed");
}

console.log("OK: mak-foundation-inversion.unit");
