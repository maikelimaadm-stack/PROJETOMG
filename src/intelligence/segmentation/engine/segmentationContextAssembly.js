import { assembleBusinessDnaContext } from "../../dna/engine/businessDnaContextAssembly.js";
import { summarizeBusinessDnaEngine } from "../../dna/engine/businessDnaSummarization.js";
import { retrieveLatestBusinessDna } from "../../dna/engine/businessDnaRetrieval.js";
import { summarizeEvolutionEngine } from "../../evolution/engine/evolutionSummarization.js";
import { summarizeConsultingEngine } from "../../consulting/engine/consultingSummarization.js";
import { summarizeDecisionEngine } from "../../decision/engine/decisionSummarization.js";
import { processObservationLayer } from "../../observation/observationLayer.js";

/** Assemble segmentation context from DNA + full intelligence stack */
export function assembleSegmentationContext(tenantId = "default") {
  const dnaContext = assembleBusinessDnaContext(tenantId);
  const dnaSummary = summarizeBusinessDnaEngine(tenantId);
  const dnaRetrieved = retrieveLatestBusinessDna(tenantId);
  const evolutionSummary = summarizeEvolutionEngine(tenantId);
  const consultingSummary = summarizeConsultingEngine(tenantId);
  const decisionSummary = summarizeDecisionEngine(tenantId);
  const observation = processObservationLayer(tenantId);

  return Object.freeze({
    tenantId,
    assembledAt: new Date().toISOString(),
    dnaContext,
    dnaSummary,
    dnaProfile: dnaRetrieved.profile,
    dnaFingerprint: dnaRetrieved.fingerprint,
    evolutionSummary,
    consultingSummary,
    decisionSummary,
    observation,
    patterns: dnaRetrieved.patterns ?? [],
    maturityLevel: dnaSummary.maturityLevel,
    maturityScore: dnaSummary.averageMaturityScore,
    strengths: dnaSummary.strengths ?? [],
    gaps: dnaSummary.gaps ?? [],
    explainable: true,
    belongsToEnterprise: true,
    individualProfilingForbidden: true,
  });
}

export default assembleSegmentationContext;
