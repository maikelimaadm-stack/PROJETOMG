import { EVOLUTION_OWNERSHIP } from "./evolutionEngineContracts.js";

export function assertEvolutionOwnership(record) {
  return Object.freeze({
    ...EVOLUTION_OWNERSHIP,
    recordId: record.evolutionId ?? record.planId ?? record.roadmapId,
    tenantId: record.tenantId,
    verifiedAt: new Date().toISOString(),
  });
}

export default assertEvolutionOwnership;
