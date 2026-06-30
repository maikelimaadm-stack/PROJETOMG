import { resolveAuthorizedGroupScope } from "../../dna/engine/groupMaturityAggregation.js";
import { computeAdvancedMaturityScore } from "./advancedMaturityScoring.js";
import { classifyOperationalSegment } from "./segmentationClassifiers.js";
import { assembleSegmentationContext } from "./segmentationContextAssembly.js";

/** Authorized group comparison — segment + maturity */
export function buildAuthorizedGroupComparison(groupId, requestingTenantId) {
  const scope = resolveAuthorizedGroupScope(groupId, requestingTenantId);
  if (!scope) {
    return Object.freeze({
      authorized: false,
      comparisons: [],
      crossTenantMixingForbidden: true,
    });
  }

  const entries = scope.authorizedTenantIds.map((tenantId) => {
    const ctx = assembleSegmentationContext(tenantId);
    const classification = classifyOperationalSegment(ctx);
    const scoring = computeAdvancedMaturityScore(tenantId);
    return Object.freeze({
      tenantId,
      label: `Empresa ${tenantId}`,
      segmentLabel: classification.segmentLabel,
      advancedScore: scoring.advancedScore,
      isSelf: tenantId === requestingTenantId,
    });
  });

  entries.sort((a, b) => b.advancedScore - a.advancedScore);
  const groupAvg = entries.reduce((s, e) => s + e.advancedScore, 0) / (entries.length || 1);
  const similar = entries.filter(
    (e) =>
      e.segmentLabel === entries.find((x) => x.isSelf)?.segmentLabel && !e.isSelf
  );

  return Object.freeze({
    authorized: true,
    groupId,
    groupAverage: Math.round(groupAvg * 10) / 10,
    comparisons: Object.freeze(entries),
    similarCompanies: Object.freeze(similar),
    referenceTenant: entries[0]?.tenantId ?? null,
    explainable: true,
    crossTenantMixingForbidden: true,
  });
}

export default buildAuthorizedGroupComparison;
