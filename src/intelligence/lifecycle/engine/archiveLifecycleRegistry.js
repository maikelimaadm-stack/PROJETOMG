import { upsertArchiveLifecycle } from "./lifecycleStore.js";
import { appendLifecycleAuditEntry } from "./lifecycleAuditTrail.js";

export function buildArchiveLifecycleRegistry(groupId, ctx, archiveRules) {
  if (!ctx.authorized) return Object.freeze({ archives: [] });

  const archives = (archiveRules.rules ?? []).map((r) =>
    upsertArchiveLifecycle(
      Object.freeze({
        archiveLifecycleId: `alcy-${r.ruleId}`,
        groupId,
        authorizedTenantIds: ctx.authorizedTenantIds,
        ruleId: r.ruleId,
        label: `Arquivo: ${r.dataCategory}`,
        summary: `Registros ${r.dataCategory} elegíveis para arquivamento controlado.`,
        dataCategory: r.dataCategory,
        status: "eligible",
        humanApprovalRequired: true,
        explainable: true,
        recordedAt: new Date().toISOString(),
      })
    )
  );

  appendLifecycleAuditEntry({ groupId, action: "archive_lifecycle_built", entityType: "archive_lifecycle" });
  return Object.freeze({ archives: Object.freeze(archives), explainable: true });
}

export default buildArchiveLifecycleRegistry;
