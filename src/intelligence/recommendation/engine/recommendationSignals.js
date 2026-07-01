import { RECOMMENDATION_SIGNAL_TYPES } from "./recommendationEngineContracts.js";
import { upsertRecommendationSignal } from "./recommendationEngineStore.js";

export function registerRecommendationSignals(tenantId, ctx) {
  const signals = [];

  for (const gap of (ctx.gaps ?? []).slice(0, 3)) {
    signals.push(
      upsertRecommendationSignal(
        Object.freeze({
          signalId: `rsig-${tenantId}-gap-${gap.replace(/\s+/g, "-").toLowerCase()}`,
          tenantId,
          signalType: RECOMMENDATION_SIGNAL_TYPES.MATURITY_GAP,
          label: `Gap de maturidade: ${gap}`,
          summary: `O domínio ${gap} precisa amadurecer.`,
          explainable: true,
          recordedAt: new Date().toISOString(),
        })
      )
    );
  }

  for (const match of (ctx.templateMatches ?? []).slice(0, 2)) {
    signals.push(
      upsertRecommendationSignal(
        Object.freeze({
          signalId: `rsig-${tenantId}-tmpl-${match.templateId}`,
          tenantId,
          signalType: RECOMMENDATION_SIGNAL_TYPES.TEMPLATE_MATCH,
          label: `Template compatível: ${match.templateLabel}`,
          summary: match.summary,
          explainable: true,
          recordedAt: new Date().toISOString(),
        })
      )
    );
  }

  if (ctx.segmentLabel) {
    signals.push(
      upsertRecommendationSignal(
        Object.freeze({
          signalId: `rsig-${tenantId}-segment`,
          tenantId,
          signalType: RECOMMENDATION_SIGNAL_TYPES.SEGMENT_ALIGNMENT,
          label: `Segmento: ${ctx.segmentLabel}`,
          summary: "Recomendações alinhadas ao segmento operacional da empresa.",
          explainable: true,
          recordedAt: new Date().toISOString(),
        })
      )
    );
  }

  for (const pattern of (ctx.corporatePatterns?.suggestions ?? []).slice(0, 2)) {
    signals.push(
      upsertRecommendationSignal(
        Object.freeze({
          signalId: `rsig-${tenantId}-prac-${pattern.tenantId}`,
          tenantId,
          signalType: RECOMMENDATION_SIGNAL_TYPES.PRACTICE_REFERENCE,
          label: pattern.label,
          summary: pattern.because,
          sourceTenantId: pattern.tenantId,
          authorizedScope: ctx.corporatePatterns?.authorized === true,
          explainable: true,
          recordedAt: new Date().toISOString(),
        })
      )
    );
  }

  return Object.freeze(signals);
}

export default registerRecommendationSignals;
