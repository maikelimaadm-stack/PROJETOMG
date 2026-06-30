import { listEnterpriseMemoryRecords } from "./enterpriseMemoryStore.js";
import { aggregateMemoryByStore } from "./memoryAggregation.js";
import { MEMORY_STORE_TYPES } from "./memoryEngineContracts.js";

export function summarizeEnterpriseMemory(tenantId = "default") {
  const records = listEnterpriseMemoryRecords(tenantId, { limit: 100 });
  const byStore = aggregateMemoryByStore(tenantId);
  const decisions = records.filter((r) => r.storeType === MEMORY_STORE_TYPES.DECISION).length;
  const workflows = records.filter((r) => r.storeType === MEMORY_STORE_TYPES.WORKFLOW).length;
  const intents = records.filter((r) => r.storeType === MEMORY_STORE_TYPES.INTENT).length;
  const outcomes = records.filter((r) => r.storeType === MEMORY_STORE_TYPES.OUTCOME).length;

  return Object.freeze({
    tenantId,
    summarizedAt: new Date().toISOString(),
    totalRecords: records.length,
    byStore,
    headline:
      records.length === 0
        ? "A memória operacional está pronta para registrar a história da empresa."
        : `${records.length} momentos operacionais preservados — decisões, fluxos e resultados.`,
    decisions,
    workflows,
    intents,
    outcomes,
    explainable: true,
    aiGenerated: false,
  });
}

export default summarizeEnterpriseMemory;
