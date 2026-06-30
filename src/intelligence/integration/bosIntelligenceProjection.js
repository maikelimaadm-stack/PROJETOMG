import { buildMemoryEngineBosProjection } from "../memory/engine/memoryToBosProjection.js";
import { bridgeMemoryToIntelligence } from "../memory/engine/memoryToIntelligenceBridge.js";
import { processObservationLayer } from "../observation/observationLayer.js";
import { listImprovementOpportunities } from "../registry/improvementOpportunityRegistry.js";

/** BOS-facing projection — prefers Memory Engine when records exist */
export function buildIntelligenceHomeProjection(tenantId = "default") {
  const memoryProjection = buildMemoryEngineBosProjection(tenantId);
  const observation = processObservationLayer(tenantId);
  const improvements = listImprovementOpportunities(tenantId);

  if (memoryProjection.hasMemory) {
    return Object.freeze({
      ...memoryProjection,
      hasObservations: true,
      improvementCount: improvements.length,
      intelligenceBridge: bridgeMemoryToIntelligence(tenantId),
      patterns: observation.patterns,
    });
  }

  return Object.freeze({
    health: memoryProjection.health,
    activity: memoryProjection.activity,
    hasObservations: false,
    hasMemory: false,
    improvementCount: improvements.length,
    operationalSummary: memoryProjection.operationalSummary,
    recentDecisions: [],
    recentWorkflows: [],
    whyHighlights: [],
    replayTeaser: memoryProjection.replayTeaser,
    evolutionSignal: memoryProjection.evolutionSignal,
    patterns: observation.patterns,
  });
}

export default buildIntelligenceHomeProjection;
