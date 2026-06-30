import { DECISION_OWNERSHIP } from "./decisionEngineContracts.js";

export function assertDecisionOwnership(record) {
  return Object.freeze({
    ...DECISION_OWNERSHIP,
    recordId: record.decisionId ?? record.optionId ?? record.scenarioId,
    tenantId: record.tenantId,
    verifiedAt: new Date().toISOString(),
  });
}

export default assertDecisionOwnership;
