import { MEMORY_STORE_TYPES } from "./memoryEngineContracts.js";
import { listEnterpriseMemoryRecords } from "./enterpriseMemoryStore.js";

function createTypedStoreFacade(storeType) {
  return {
    list(tenantId = "default", limit = 50) {
      return listEnterpriseMemoryRecords(tenantId, { storeType, limit });
    },
  };
}

export const enterpriseMemoryStoreFacade = createTypedStoreFacade(MEMORY_STORE_TYPES.ENTERPRISE);
export const businessMemoryStoreFacade = createTypedStoreFacade(MEMORY_STORE_TYPES.BUSINESS);
export const operationalMemoryStoreFacade = createTypedStoreFacade(MEMORY_STORE_TYPES.OPERATIONAL);
export const decisionMemoryStoreFacade = createTypedStoreFacade(MEMORY_STORE_TYPES.DECISION);
export const workflowMemoryStoreFacade = createTypedStoreFacade(MEMORY_STORE_TYPES.WORKFLOW);
export const intentMemoryStoreFacade = createTypedStoreFacade(MEMORY_STORE_TYPES.INTENT);
export const outcomeMemoryStoreFacade = createTypedStoreFacade(MEMORY_STORE_TYPES.OUTCOME);

export default {
  enterprise: enterpriseMemoryStoreFacade,
  business: businessMemoryStoreFacade,
  operational: operationalMemoryStoreFacade,
  decision: decisionMemoryStoreFacade,
  workflow: workflowMemoryStoreFacade,
  intent: intentMemoryStoreFacade,
  outcome: outcomeMemoryStoreFacade,
};
