/**
 * Testes unitários para sincronização painel ↔ colunas (MAK listing).
 */
import { syncPanelFiltersIntoColumns, syncColumnsIntoPanelFilters } from "@/framework/mak/listing/syncPanelColumnFilters.js";

const panelMap = { nome: "razao_social", status: "status" };

const panelValues = {
  nome: { type: "text", operator: "contains", value: "ACME" },
};

const columnFilters = syncPanelFiltersIntoColumns(panelValues, {}, panelMap);
if (!columnFilters.razao_social?.value?.includes("ACME")) {
  throw new Error("syncPanelFiltersIntoColumns failed");
}

const roundTrip = syncColumnsIntoPanelFilters(columnFilters, panelMap);
if (!roundTrip.nome?.value?.includes("ACME")) {
  throw new Error("syncColumnsIntoPanelFilters failed");
}

console.log("OK: mak-sync-panel-column-filters.unit");
