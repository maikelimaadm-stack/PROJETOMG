import { upsertLifecycleReview } from "./lifecycleStore.js";
import { appendLifecycleAuditEntry } from "./lifecycleAuditTrail.js";

export function buildLifecycleReviewRegistry(groupId, ctx) {
  if (!ctx.authorized) return Object.freeze({ reviews: [] });

  const review = upsertLifecycleReview(
    Object.freeze({
      reviewId: `lrev-${groupId}`,
      groupId,
      authorizedTenantIds: ctx.authorizedTenantIds,
      label: "Revisão de ciclo de vida",
      summary: "Ações sensíveis de archive, hold e expunge requerem revisão administrativa.",
      status: "pending_review",
      humanApprovalRequired: true,
      explainable: true,
      recordedAt: new Date().toISOString(),
    })
  );

  appendLifecycleAuditEntry({ groupId, action: "lifecycle_review_built", entityType: "review" });
  return Object.freeze({ reviews: Object.freeze([review]), explainable: true });
}

export default buildLifecycleReviewRegistry;
