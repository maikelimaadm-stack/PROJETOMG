import { listObservations } from "./observationRegistry.js";
import { detectPatternsFromEvents } from "./patternCapture.js";
import { deriveHealthSignals } from "../signals/businessHealthSignals.js";
import { registerImprovementOpportunity } from "../registry/improvementOpportunityRegistry.js";
import { recordEvolutionTelemetry } from "../registry/evolutionTelemetry.js";
import { emitConsultingSignal } from "../registry/consultingSignals.js";

/** Business Observation Layer — processes events into explainable signals */
export function processObservationLayer(tenantId = "default") {
  const observations = listObservations(tenantId, { limit: 100 });
  const patterns = detectPatternsFromEvents(observations);
  const healthSignals = deriveHealthSignals(tenantId, observations);
  const improvements = patterns
    .filter((p) => p.suggestImprovement)
    .map((p) =>
      registerImprovementOpportunity({
        tenantId,
        patternId: p.patternId,
        title: p.improvementTitle,
        explanation: p.explanation,
        evidenceCount: p.occurrences,
      })
    );

  recordEvolutionTelemetry({
    tenantId,
    observationCount: observations.length,
    patternCount: patterns.length,
    healthSignalCount: healthSignals.length,
  });

  if (healthSignals.some((s) => s.severity === "attention")) {
    emitConsultingSignal({
      tenantId,
      signalType: "operational_attention",
      summary: "Sinais operacionais requerem acompanhamento.",
      evidenceRefs: healthSignals.filter((s) => s.severity === "attention").map((s) => s.signalId),
    });
  }

  return Object.freeze({
    tenantId,
    processedAt: new Date().toISOString(),
    observationCount: observations.length,
    patterns: Object.freeze(patterns),
    healthSignals: Object.freeze(healthSignals),
    improvements: Object.freeze(improvements),
    explainable: true,
  });
}

export default processObservationLayer;
