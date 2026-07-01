import { assembleAdoptionContext } from "../../adoption/engine/adoptionContextAssembly.js";
import { summarizeAdoptionEngine } from "../../adoption/engine/adoptionSummarization.js";
import { retrieveLatestAdoptions } from "../../adoption/engine/adoptionRetrieval.js";
import { summarizeBusinessDnaEngine } from "../../dna/engine/businessDnaSummarization.js";
import { summarizeSegmentationEngine } from "../../segmentation/engine/segmentationSummarization.js";
import { summarizeEvolutionEngine } from "../../evolution/engine/evolutionSummarization.js";
import { summarizeConsultingEngine } from "../../consulting/engine/consultingSummarization.js";
import { summarizeDecisionEngine } from "../../decision/engine/decisionSummarization.js";
import { deriveHealthSignals } from "../../signals/businessHealthSignals.js";

export function assembleImprovementContext(tenantId = "default", options = {}) {
  const adoptionContext = assembleAdoptionContext(tenantId, options);
  const adoptionSummary = summarizeAdoptionEngine(tenantId);
  const adoptionRetrieved = retrieveLatestAdoptions(tenantId);
  const dnaSummary = summarizeBusinessDnaEngine(tenantId);
  const segmentationSummary = summarizeSegmentationEngine(tenantId);
  const evolutionSummary = summarizeEvolutionEngine(tenantId);
  const consultingSummary = summarizeConsultingEngine(tenantId);
  const decisionSummary = summarizeDecisionEngine(tenantId);
  const healthSignals = deriveHealthSignals(tenantId);

  return Object.freeze({
    tenantId,
    assembledAt: new Date().toISOString(),
    adoptionContext,
    adoptionSummary,
    adoptionRetrieved,
    dnaSummary,
    segmentationSummary,
    evolutionSummary,
    consultingSummary,
    decisionSummary,
    healthSignals,
    validatedOutcomes: adoptionRetrieved.outcomes.filter((o) => o.validated),
    pendingOutcomes: adoptionRetrieved.outcomes.filter((o) => o.pendingValidation),
    explainable: true,
    belongsToEnterprise: true,
    humanApprovalRequired: true,
    autonomousExecutionForbidden: true,
  });
}

export default assembleImprovementContext;
