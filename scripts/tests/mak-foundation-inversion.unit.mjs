/**
 * Smoke test — inversão arquitetural MAK Foundation (sem importar React/hooks).
 */
import { empresasMakRuntime } from "@/modules/empresas/config/empresasMakRuntime.js";
import { createMakListCache } from "@/framework/mak/data/createMakListCache.js";
import { syncPanelFiltersIntoColumns } from "@/framework/mak/listing/syncPanelColumnFilters.js";

if (empresasMakRuntime.moduleId !== "empresas") {
  throw new Error("empresasMakRuntime misconfigured");
}
if (typeof empresasMakRuntime.patchListCache !== "function") {
  throw new Error("empresasMakRuntime.patchListCache missing");
}
if (typeof createMakListCache !== "function") {
  throw new Error("createMakListCache not exported");
}
const synced = syncPanelFiltersIntoColumns({}, {}, {});
if (typeof synced !== "object") {
  throw new Error("syncPanelFiltersIntoColumns failed");
}

console.log("OK: mak-foundation-inversion.unit");
