/**
 * Segmentation bridges to Consulting, Decision, Evolution — read-only context.
 */
import { summarizeSegmentationEngine } from "./segmentationSummarization.js";
import { retrieveLatestSegmentation } from "./segmentationRetrieval.js";

export function bridgeSegmentationToConsulting(tenantId = "default") {
  const summary = summarizeSegmentationEngine(tenantId);
  const retrieved = retrieveLatestSegmentation(tenantId);
  return Object.freeze({
    tenantId,
    bridgedAt: new Date().toISOString(),
    segmentContext: summary.segmentLabel,
    templateMatches: retrieved.templateMatches.slice(0, 3),
    consultingBridgeReady: false,
    autonomousAdviceForbidden: true,
  });
}

export function bridgeSegmentationToDecision(tenantId = "default") {
  const summary = summarizeSegmentationEngine(tenantId);
  return Object.freeze({
    tenantId,
    bridgedAt: new Date().toISOString(),
    segmentContext: summary.headline,
    priorityDomains: summary.priorityDomains,
    decisionBridgeReady: false,
    autonomousDecisionForbidden: true,
  });
}

export function bridgeSegmentationToEvolution(tenantId = "default") {
  const summary = summarizeSegmentationEngine(tenantId);
  const retrieved = retrieveLatestSegmentation(tenantId);
  return Object.freeze({
    tenantId,
    bridgedAt: new Date().toISOString(),
    evolutionBaseline: summary.advancedMaturityScore,
    topTemplate: summary.topTemplate,
    templateMatches: retrieved.templateMatches.slice(0, 3),
    evolutionBridgeReady: false,
    autonomousEvolutionForbidden: true,
  });
}

export default {
  bridgeSegmentationToConsulting,
  bridgeSegmentationToDecision,
  bridgeSegmentationToEvolution,
};
