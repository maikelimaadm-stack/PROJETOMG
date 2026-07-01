import { upsertGovernanceAudit } from "./platformGovernanceStore.js";
import { appendGovernanceAuditEntry } from "./governanceAuditTrail.js";

export function buildAuditReviewRegistry(groupId, ctx) {
  if (!ctx.authorized) return Object.freeze({ reviews: [] });

  const review = upsertGovernanceAudit(
    Object.freeze({
      auditId: `gaudit-review-${groupId}-${Date.now()}`,
      groupId,
      authorizedTenantIds: ctx.authorizedTenantIds,
      label: "Revisão de auditoria de governança",
      summary: "Registro de ações administrativas e mudanças de política do grupo.",
      reviewStatus: "pending_review",
      auditRequired: true,
      explainable: true,
      recordedAt: new Date().toISOString(),
    })
  );

  appendGovernanceAuditEntry({ groupId, action: "audit_review_registered", entityId: review.auditId, entityType: "audit_review" });
  return Object.freeze({ reviews: Object.freeze([review]), explainable: true });
}

export default buildAuditReviewRegistry;
