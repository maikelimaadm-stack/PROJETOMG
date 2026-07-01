import { upsertReplicationDocument, upsertReplicationPlan } from "./recommendationEngineStore.js";
import { buildReplicationLineage } from "./replicationLineage.js";
import { registerReplicationVersion } from "./recommendationVersioning.js";
import { appendReplicationAuditEntry } from "./recommendationAuditTrail.js";
import { REPLICATION_LIFECYCLE_STATES } from "./recommendationEngineContracts.js";

export function buildReplicationPlans(tenantId, targets, recommendations) {
  const replications = [];
  const plans = [];

  for (const target of targets.slice(0, 3)) {
    const relatedRec = recommendations.find((r) =>
      r.lineage?.some((l) => l.refId === target.sourceTenantId)
    );

    const doc = upsertReplicationDocument(
      Object.freeze({
        replicationId: `repl-${tenantId}-${target.sourceTenantId}`,
        tenantId,
        sourceTenantId: target.sourceTenantId,
        title: `Replicar prática de ${target.sourceTenantId}`,
        summary: target.because,
        compatibilityScore: target.compatibilityScore,
        lifecycleState: REPLICATION_LIFECYCLE_STATES[2],
        requiresHumanApproval: true,
        autonomousExecutionForbidden: true,
        lineage: buildReplicationLineage({
          sourceTenantIds: [target.sourceTenantId],
          targetTenantIds: [tenantId],
          recommendationIds: relatedRec ? [relatedRec.recommendationId] : [],
        }),
        explainable: true,
        recordedAt: new Date().toISOString(),
      })
    );
    registerReplicationVersion(tenantId, doc.replicationId);
    replications.push(doc);

    plans.push(
      upsertReplicationPlan(
        Object.freeze({
          planId: `rplplan-${tenantId}-${target.sourceTenantId}`,
          tenantId,
          replicationId: doc.replicationId,
          title: `Plano de replicação assistida`,
          objective: `Adaptar prática de empresa referência ao contexto desta organização.`,
          steps: Object.freeze([
            Object.freeze({ order: 1, label: "Revisar prática de origem", requiresHuman: true }),
            Object.freeze({ order: 2, label: "Validar compatibilidade", requiresHuman: true }),
            Object.freeze({ order: 3, label: "Aprovar replicação", requiresHuman: true }),
            Object.freeze({ order: 4, label: "Acompanhar adoção", requiresHuman: true }),
          ]),
          requiresHumanApproval: true,
          autonomousExecutionForbidden: true,
          explainable: true,
          recordedAt: new Date().toISOString(),
        })
      )
    );
  }

  appendReplicationAuditEntry({
    tenantId,
    action: "replication_plans_built",
    entityType: "replication_plan",
  });

  return Object.freeze({ replications, plans });
}

export default buildReplicationPlans;
