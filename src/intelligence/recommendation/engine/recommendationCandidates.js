import { upsertRecommendationCandidate } from "./recommendationEngineStore.js";
import { buildRecommendationLineage } from "./replicationLineage.js";

export function buildRecommendationCandidates(tenantId, ctx, signals) {
  const candidates = [];

  for (const match of (ctx.templateMatches ?? []).slice(0, 3)) {
    candidates.push(
      upsertRecommendationCandidate(
        Object.freeze({
          candidateId: `rcand-${tenantId}-${match.templateId}`,
          tenantId,
          title: `Adotar template: ${match.templateLabel}`,
          summary: match.summary,
          expectedImpact: match.expectedImpact ?? "Aceleração de maturidade operacional.",
          confidence: match.compatibilityScore >= 70 ? "high" : "medium",
          priority: match.compatibilityScore >= 80 ? "high" : "medium",
          candidateType: "template",
          refId: match.templateId,
          requiresHumanApproval: true,
          lineage: buildRecommendationLineage({ templateIds: [match.templateId] }),
          explainable: true,
          autonomousExecutionForbidden: true,
          recordedAt: new Date().toISOString(),
        })
      )
    );
  }

  for (const gap of (ctx.gaps ?? []).slice(0, 2)) {
    candidates.push(
      upsertRecommendationCandidate(
        Object.freeze({
          candidateId: `rcand-${tenantId}-gap-${gap.replace(/\s+/g, "-").toLowerCase()}`,
          tenantId,
          title: `Amadurecer: ${gap}`,
          summary: `Priorizar evolução no domínio ${gap}.`,
          expectedImpact: "Melhoria mensurável na maturidade do domínio.",
          confidence: "medium",
          priority: "high",
          candidateType: "maturity",
          requiresHumanApproval: true,
          explainable: true,
          autonomousExecutionForbidden: true,
          recordedAt: new Date().toISOString(),
        })
      )
    );
  }

  for (const pattern of (ctx.corporatePatterns?.suggestions ?? []).slice(0, 2)) {
    if (ctx.corporatePatterns?.authorized !== true) continue;
    candidates.push(
      upsertRecommendationCandidate(
        Object.freeze({
          candidateId: `rcand-${tenantId}-repl-${pattern.tenantId}`,
          tenantId,
          title: `Replicar prática: ${pattern.label}`,
          summary: pattern.because,
          expectedImpact: "Adaptação de prática comprovada no grupo autorizado.",
          confidence: "medium",
          priority: "medium",
          candidateType: "replication",
          sourceTenantId: pattern.tenantId,
          requiresHumanApproval: true,
          lineage: buildRecommendationLineage({ sourceTenantIds: [pattern.tenantId] }),
          explainable: true,
          autonomousExecutionForbidden: true,
          crossTenantMixingForbidden: true,
          recordedAt: new Date().toISOString(),
        })
      )
    );
  }

  return Object.freeze(candidates);
}

export default buildRecommendationCandidates;
