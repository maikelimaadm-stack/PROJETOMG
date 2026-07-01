import { upsertPortfolioRanking } from "./portfolioIntelligenceStore.js";
import { appendPortfolioAuditEntry } from "./portfolioAuditTrail.js";

export function buildPortfolioRanking(groupId, ctx, comparison) {
  if (!ctx.authorized) return Object.freeze({ rankings: [] });

  const sorted = [...(comparison.comparisons ?? [])].sort((a, b) => b.healthScore - a.healthScore);
  const ranking = upsertPortfolioRanking(
    Object.freeze({
      rankingId: `prank-${groupId}-health`,
      groupId,
      authorizedTenantIds: ctx.authorizedTenantIds,
      metric: "health_score",
      label: "Ranking de saúde operacional",
      entries: Object.freeze(
        sorted.map((c, i) =>
          Object.freeze({
            rank: i + 1,
            tenantId: c.tenantId,
            label: c.label,
            score: c.healthScore,
            isCurrentTenant: c.isCurrentTenant,
          })
        )
      ),
      explainable: true,
      recordedAt: new Date().toISOString(),
    })
  );

  appendPortfolioAuditEntry({ groupId, action: "ranking_built", entityType: "ranking" });
  return Object.freeze({ rankings: Object.freeze([ranking]), leader: sorted[0] ?? null, laggard: sorted[sorted.length - 1] ?? null });
}

export default buildPortfolioRanking;
