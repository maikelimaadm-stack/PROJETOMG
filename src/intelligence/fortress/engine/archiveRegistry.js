import { upsertArchiveRecord } from "./fortressStore.js";
import { appendFortressAuditEntry } from "./auditFortressAuditTrail.js";

export function buildArchiveRegistry(groupId, ctx, retentionRules) {
  if (!ctx.authorized) return Object.freeze({ archives: [] });

  const archives = (retentionRules.rules ?? []).map((r) =>
    upsertArchiveRecord(
      Object.freeze({
        archiveId: `farch-${r.ruleId}`,
        groupId,
        authorizedTenantIds: ctx.authorizedTenantIds,
        ruleId: r.ruleId,
        label: `Arquivo: ${r.dataCategory}`,
        summary: `Dados ${r.dataCategory} elegíveis para arquivamento após ${r.retentionDays} dias.`,
        dataCategory: r.dataCategory,
        status: "scheduled",
        humanApprovalRequired: true,
        explainable: true,
        recordedAt: new Date().toISOString(),
      })
    )
  );

  appendFortressAuditEntry({ groupId, action: "archive_registry_built", entityType: "archive" });
  return Object.freeze({ archives: Object.freeze(archives), explainable: true });
}

export default buildArchiveRegistry;
