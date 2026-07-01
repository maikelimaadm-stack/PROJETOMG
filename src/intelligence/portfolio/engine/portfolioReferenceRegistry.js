import { upsertPortfolioReference } from "./portfolioIntelligenceStore.js";
import { appendPortfolioAuditEntry } from "./portfolioAuditTrail.js";

export function buildPortfolioReferenceRegistry(groupId, ctx, comparison) {
  if (!ctx.authorized) return Object.freeze({ references: [] });

  const references = (comparison.aboveStandard ?? []).slice(0, 3).map((c, i) =>
    upsertPortfolioReference(
      Object.freeze({
        referenceId: `pref-${groupId}-${c.tenantId}`,
        groupId,
        authorizedTenantIds: ctx.authorizedTenantIds,
        referenceTenantId: c.tenantId,
        label: `Empresa referência ${i + 1}`,
        processArea: "Operacional",
        summary: `${c.label} está acima do padrão do grupo — candidata a referência interna.`,
        explainable: true,
        recordedAt: new Date().toISOString(),
      })
    )
  );

  appendPortfolioAuditEntry({ groupId, action: "references_built", entityType: "reference" });
  return Object.freeze({ references });
}

export default buildPortfolioReferenceRegistry;
