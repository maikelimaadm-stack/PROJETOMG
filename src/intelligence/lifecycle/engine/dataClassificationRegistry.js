import { upsertDataClassification } from "./lifecycleStore.js";
import { appendLifecycleAuditEntry } from "./lifecycleAuditTrail.js";

export function buildDataClassificationRegistry(groupId, ctx) {
  if (!ctx.authorized) return Object.freeze({ classifications: [] });

  const levels = [
    { level: "operacional", label: "Operacional", exposure: "tenant_only" },
    { level: "sensível", label: "Sensível", exposure: "authorized_only" },
    { level: "corporativo", label: "Corporativo autorizado", exposure: "group_authorized" },
  ];

  const classifications = levels.map((l) =>
    upsertDataClassification(
      Object.freeze({
        classificationId: `dclass-${groupId}-${l.level}`,
        groupId,
        authorizedTenantIds: ctx.authorizedTenantIds,
        label: l.label,
        summary: `Classificação ${l.label}. Exposição: ${l.exposure}.`,
        level: l.level,
        exposureRule: l.exposure,
        status: "active",
        explainable: true,
        recordedAt: new Date().toISOString(),
      })
    )
  );

  appendLifecycleAuditEntry({ groupId, action: "data_classification_built", entityType: "classification" });
  return Object.freeze({ classifications: Object.freeze(classifications), explainable: true });
}

export default buildDataClassificationRegistry;
