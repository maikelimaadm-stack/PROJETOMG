import { MEMORY_OWNERSHIP } from "./memoryEngineContracts.js";

export function createMemoryOwnership(tenantId) {
  return Object.freeze({
    tenantId,
    belongsToEnterprise: MEMORY_OWNERSHIP.belongsToEnterprise,
    belongsToAi: MEMORY_OWNERSHIP.belongsToAi,
    transferable: false,
  });
}

export default createMemoryOwnership;
