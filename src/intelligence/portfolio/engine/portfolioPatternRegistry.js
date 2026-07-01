import { upsertPortfolioPattern } from "./portfolioIntelligenceStore.js";
import { appendPortfolioAuditEntry } from "./portfolioAuditTrail.js";

export function buildPortfolioPatternRegistry(groupId, ctx) {
  if (!ctx.authorized) return Object.freeze({ patterns: [] });

  const patterns = [
    upsertPortfolioPattern(
      Object.freeze({
        patternId: `ppat-${groupId}-improvement`,
        groupId,
        authorizedTenantIds: ctx.authorizedTenantIds,
        label: "Padrão de melhoria contínua no grupo",
        summary: "Empresas do grupo seguem ciclos de melhoria com aprovação humana.",
        consolidationLevel: "emerging",
        explainable: true,
        recordedAt: new Date().toISOString(),
      })
    ),
  ];

  appendPortfolioAuditEntry({ groupId, action: "patterns_built", entityType: "pattern" });
  return Object.freeze({ patterns });
}

export default buildPortfolioPatternRegistry;
