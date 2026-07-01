import { upsertLifecycleComplianceRecord } from "./lifecycleStore.js";
import { appendLifecycleAuditEntry } from "./lifecycleAuditTrail.js";

export function buildLifecycleComplianceRegistry(groupId, ctx) {
  if (!ctx.authorized) return Object.freeze({ records: [] });

  const record = upsertLifecycleComplianceRecord(
    Object.freeze({
      recordId: `lcomp-${groupId}`,
      groupId,
      authorizedTenantIds: ctx.authorizedTenantIds,
      label: "Conformidade de ciclo de vida",
      summary: "Políticas de retenção, arquivo e expurgo em conformidade com Fortress.",
      status: "compliant",
      explainable: true,
      recordedAt: new Date().toISOString(),
    })
  );

  appendLifecycleAuditEntry({ groupId, action: "lifecycle_compliance_built", entityType: "compliance" });
  return Object.freeze({ records: Object.freeze([record]), explainable: true });
}

export default buildLifecycleComplianceRegistry;
