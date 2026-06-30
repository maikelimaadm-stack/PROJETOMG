import { processObservationLayer } from "../observation/observationLayer.js";
import {
  buildBusinessEventTimeline,
  formatTimelineForBos,
} from "../timeline/businessEventTimeline.js";
import {
  deriveHealthSignals,
  computeHealthScore,
} from "../signals/businessHealthSignals.js";
import { listImprovementOpportunities } from "../registry/improvementOpportunityRegistry.js";
import { buildTenantKnowledgeSeeds } from "../memory/knowledgeSeeds.js";
import { captureEnterpriseContext } from "../capture/enterpriseContextCapture.js";

/** BOS-facing projection — business vocabulary only, no technical exposure */
export function buildIntelligenceHomeProjection(tenantId = "default") {
  const observation = processObservationLayer(tenantId);
  const timeline = buildBusinessEventTimeline(tenantId, { limit: 10 });
  const activity = formatTimelineForBos(timeline);
  const healthSignals = observation.healthSignals;
  const score = computeHealthScore(healthSignals);
  const improvements = listImprovementOpportunities(tenantId);

  const health = Object.freeze({
    score,
    trend: score >= 75 ? "stable" : "attention",
    label: "Saúde operacional",
    highlights: healthSignals.slice(0, 3).map((s) =>
      Object.freeze({
        id: s.signalId,
        label: s.label,
        value: s.value,
        tone: s.tone,
      })
    ),
  });

  if (!activity.length) {
    return Object.freeze({
      health,
      activity: null,
      hasObservations: false,
      improvementCount: improvements.length,
      context: captureEnterpriseContext(tenantId),
      knowledgeSeeds: buildTenantKnowledgeSeeds(tenantId),
    });
  }

  return Object.freeze({
    health,
    activity,
    hasObservations: true,
    improvementCount: improvements.length,
    context: captureEnterpriseContext(tenantId),
    knowledgeSeeds: buildTenantKnowledgeSeeds(tenantId),
  });
}

export default buildIntelligenceHomeProjection;
