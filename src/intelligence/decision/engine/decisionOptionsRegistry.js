import { listDecisionOptions } from "./decisionEngineStore.js";

export function listDecisionOptionsForDecision(tenantId, decisionId) {
  return listDecisionOptions(tenantId, { decisionId, limit: 10 });
}

export default { listDecisionOptionsForDecision };
