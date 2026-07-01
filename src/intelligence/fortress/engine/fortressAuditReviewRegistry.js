import { upsertFortressReview } from "./fortressStore.js";
import { appendFortressAuditEntry } from "./auditFortressAuditTrail.js";

export function buildFortressAuditReviewRegistry(groupId, ctx) {
  if (!ctx.authorized) return Object.freeze({ reviews: [] });

  const review = upsertFortressReview(
    Object.freeze({
      reviewId: `frev-audit-${groupId}-${Date.now()}`,
      groupId,
      authorizedTenantIds: ctx.authorizedTenantIds,
      reviewType: "audit",
      label: "Revisão de auditoria do fortress",
      summary: "Ações sensíveis e eventos auditados aguardam revisão administrativa.",
      status: "pending_review",
      humanApprovalRequired: true,
      explainable: true,
      recordedAt: new Date().toISOString(),
    })
  );

  appendFortressAuditEntry({ groupId, action: "audit_review_registered", entityId: review.reviewId, entityType: "audit_review" });
  return Object.freeze({ reviews: Object.freeze([review]), explainable: true });
}

export default buildFortressAuditReviewRegistry;
