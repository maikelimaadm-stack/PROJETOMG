/**
 * Business DNA bridges to Consulting, Decision, Evolution — read-only context.
 */
import { summarizeBusinessDnaEngine } from "./businessDnaSummarization.js";
import { retrieveLatestBusinessDna } from "./businessDnaRetrieval.js";

export function bridgeDnaToConsulting(tenantId = "default") {
  const summary = summarizeBusinessDnaEngine(tenantId);
  const retrieved = retrieveLatestBusinessDna(tenantId);
  return Object.freeze({
    tenantId,
    bridgedAt: new Date().toISOString(),
    organizationalIdentity: summary.headline,
    maturityGaps: summary.gaps,
    maturityStrengths: summary.strengths,
    patternCount: retrieved.patterns.length,
    consultingBridgeReady: false,
    autonomousAdviceForbidden: true,
  });
}

export function bridgeDnaToDecision(tenantId = "default") {
  const summary = summarizeBusinessDnaEngine(tenantId);
  return Object.freeze({
    tenantId,
    bridgedAt: new Date().toISOString(),
    decisionContext: summary.headline,
    capabilityMaturity: summary.averageMaturityScore,
    priorityDomains: summary.gaps,
    decisionBridgeReady: false,
    autonomousDecisionForbidden: true,
  });
}

export function bridgeDnaToEvolution(tenantId = "default") {
  const summary = summarizeBusinessDnaEngine(tenantId);
  const retrieved = retrieveLatestBusinessDna(tenantId);
  return Object.freeze({
    tenantId,
    bridgedAt: new Date().toISOString(),
    evolutionBaseline: summary.averageMaturityScore,
    growthSignalCount: summary.growthSignalCount,
    evolutionTargets: summary.gaps,
    milestoneCount: retrieved.milestones.length,
    evolutionBridgeReady: false,
    autonomousEvolutionForbidden: true,
  });
}

export default { bridgeDnaToConsulting, bridgeDnaToDecision, bridgeDnaToEvolution };
