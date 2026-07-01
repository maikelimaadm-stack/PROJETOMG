import { upsertFortressReview } from "./fortressStore.js";
import { appendFortressAuditEntry } from "./auditFortressAuditTrail.js";

export function buildComplianceReviewRegistry(groupId, ctx, complianceRules) {
  if (!ctx.authorized) return Object.freeze({ reviews: [] });

  const compliantCount = complianceRules.rules?.filter((r) => r.status === "active")?.length ?? 0;
  const review = upsertFortressReview(
    Object.freeze({
      reviewId: `frev-comp-${groupId}-${Date.now()}`,
      groupId,
      authorizedTenantIds: ctx.authorizedTenantIds,
      reviewType: "compliance",
      label: "Revisão de conformidade",
      summary: `${compliantCount} regra(s) de compliance ativa(s) — revisão periódica recomendada.`,
      status: compliantCount > 0 ? "compliant" : "review_required",
      humanApprovalRequired: false,
      explainable: true,
      recordedAt: new Date().toISOString(),
    })
  );

  appendFortressAuditEntry({ groupId, action: "compliance_review_registered", entityId: review.reviewId, entityType: "compliance_review" });
  return Object.freeze({ reviews: Object.freeze([review]), explainable: true });
}

export default buildComplianceReviewRegistry;
