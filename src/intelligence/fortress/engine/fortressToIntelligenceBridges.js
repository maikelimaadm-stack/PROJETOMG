import { summarizeFortressEngine } from "./fortressSummarization.js";
import { retrieveLatestFortress } from "./fortressRetrieval.js";
import { runConsultingEngine } from "../../consulting/engine/runConsultingEngine.js";
import { runDecisionEngine } from "../../decision/engine/runDecisionEngine.js";

export function bridgeFortressToConsulting(groupId, tenantId = "default") {
  const summary = summarizeFortressEngine(groupId);
  const consulting = runConsultingEngine(tenantId);
  return Object.freeze({
    groupId,
    tenantId,
    bridgedAt: new Date().toISOString(),
    fortressContext: summary.headline,
    consultingContext: consulting.summary?.headline,
    consultingBridgeReady: false,
    autonomousAdviceForbidden: true,
    readOnly: true,
  });
}

export function bridgeFortressToDecision(groupId, tenantId = "default") {
  const retrieved = retrieveLatestFortress(groupId);
  const decision = runDecisionEngine(tenantId);
  return Object.freeze({
    groupId,
    tenantId,
    bridgedAt: new Date().toISOString(),
    complianceRules: retrieved.complianceRules.slice(0, 3),
    decisionContext: decision.summary?.headline,
    decisionBridgeReady: false,
    autonomousDecisionForbidden: true,
    humanApprovalRequired: true,
    readOnly: true,
  });
}

export function bridgeFortressToIntelligence(groupId, tenantId = "default") {
  const summary = summarizeFortressEngine(groupId);
  return Object.freeze({
    groupId,
    tenantId,
    bridgedAt: new Date().toISOString(),
    fortressSummary: summary.headline,
    intelligenceBridgeReady: summary.compliance.documentCount > 0,
    readOnly: true,
    explainable: true,
  });
}

export default { bridgeFortressToConsulting, bridgeFortressToDecision, bridgeFortressToIntelligence };
