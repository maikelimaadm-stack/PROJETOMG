import { retrieveReplicationsByContext } from "./recommendationRetrieval.js";

export function summarizeReplicationEngine(tenantId = "default") {
  const retrieved = retrieveReplicationsByContext(tenantId);
  const pending = retrieved.replications.filter(
    (r) => r.lifecycleState === "pending_approval" || r.lifecycleState === "proposed"
  );

  return Object.freeze({
    tenantId,
    summarizedAt: new Date().toISOString(),
    replicationCount: retrieved.replications.length,
    pendingApprovalCount: pending.length,
    planCount: retrieved.plans.length,
    headline:
      retrieved.replications.length > 0
        ? `${retrieved.replications.length} prática(s) replicável(is) — aprovação humana necessária.`
        : "Replicações assistidas disponíveis quando houver escopo de grupo autorizado.",
    explainable: true,
    humanApprovalRequired: true,
    autonomousExecutionForbidden: true,
  });
}

export default summarizeReplicationEngine;
