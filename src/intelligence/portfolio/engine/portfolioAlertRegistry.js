/**
 * Portfolio Alert Registry — executive alerts for authorized group.
 * @see Program 3.22
 */
import { upsertPortfolioAlert } from "./portfolioIntelligenceStore.js";
import { appendPortfolioAuditEntry } from "./portfolioAuditTrail.js";

export function buildPortfolioAlertRegistry(groupId, ctx, comparison) {
  if (!ctx.authorized) return Object.freeze({ alerts: [] });

  const alerts = [];
  const atRisk = comparison.belowStandard?.filter((c) => c.atRisk) ?? [];

  if (atRisk.length) {
    alerts.push(
      upsertPortfolioAlert(
        Object.freeze({
          alertId: `palert-${groupId}-risk`,
          groupId,
          authorizedTenantIds: ctx.authorizedTenantIds,
          title: `${atRisk.length} empresa(s) em atenção`,
          severity: "warning",
          category: "health",
          summary: "Empresas abaixo do padrão de saúde e maturidade do grupo.",
          explainable: true,
          recordedAt: new Date().toISOString(),
        })
      )
    );
  }

  if (comparison.aboveStandard?.length) {
    alerts.push(
      upsertPortfolioAlert(
        Object.freeze({
          alertId: `palert-${groupId}-reference`,
          groupId,
          authorizedTenantIds: ctx.authorizedTenantIds,
          title: "Empresas referência identificadas",
          severity: "info",
          category: "reference",
          summary: `${comparison.aboveStandard.length} empresa(s) acima do padrão do grupo.`,
          explainable: true,
          recordedAt: new Date().toISOString(),
        })
      )
    );
  }

  appendPortfolioAuditEntry({ groupId, action: "alerts_built", entityType: "alert" });
  return Object.freeze({ alerts });
}

export default buildPortfolioAlertRegistry;
