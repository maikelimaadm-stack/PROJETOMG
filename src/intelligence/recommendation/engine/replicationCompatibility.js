import { getAuthorizedGroupScope } from "../../dna/engine/businessDnaStore.js";
import { resolveAuthorizedGroupScope } from "../../dna/engine/groupMaturityAggregation.js";
import { summarizeSegmentationEngine } from "../../segmentation/engine/segmentationSummarization.js";
import { upsertReplicationTarget } from "./recommendationEngineStore.js";

/** Assess replication compatibility between authorized tenants */
export function assessReplicationCompatibility(sourceTenantId, targetTenantId, groupId) {
  const scope = resolveAuthorizedGroupScope(groupId, targetTenantId);
  if (!scope || !scope.authorizedTenantIds.includes(sourceTenantId)) {
    return Object.freeze({
      compatible: false,
      score: 0,
      because: "Replicação requer escopo de grupo autorizado incluindo origem e destino.",
      crossTenantMixingForbidden: true,
    });
  }

  const sourceSegment = summarizeSegmentationEngine(sourceTenantId);
  const targetSegment = summarizeSegmentationEngine(targetTenantId);
  const sameSegment = sourceSegment.segmentId === targetSegment.segmentId;
  const score = sameSegment ? 85 : sourceSegment.advancedMaturityScore >= targetSegment.advancedMaturityScore ? 70 : 50;

  return Object.freeze({
    compatible: score >= 50,
    score,
    sameSegment,
    sourceSegment: sourceSegment.segmentLabel,
    targetSegment: targetSegment.segmentLabel,
    because: sameSegment
      ? "Empresas no mesmo segmento operacional — replicação mais segura."
      : "Segmentos diferentes — adaptação cuidadosa recomendada.",
    crossTenantMixingForbidden: true,
    requiresHumanApproval: true,
  });
}

export function buildReplicationTargets(tenantId, ctx, groupId) {
  if (!groupId || ctx.corporatePatterns?.authorized !== true) {
    return Object.freeze([]);
  }

  const scope = getAuthorizedGroupScope(groupId);
  if (!scope) return Object.freeze([]);

  return Object.freeze(
    scope.authorizedTenantIds
      .filter((tid) => tid !== tenantId)
      .map((sourceTenantId) => {
        const compat = assessReplicationCompatibility(sourceTenantId, tenantId, groupId);
        const target = Object.freeze({
          targetId: `rtgt-${tenantId}-${sourceTenantId}`,
          tenantId,
          sourceTenantId,
          label: `Prática de empresa ${sourceTenantId}`,
          compatibilityScore: compat.score,
          compatible: compat.compatible,
          because: compat.because,
          requiresHumanApproval: true,
          explainable: true,
        });
        if (target.compatible) upsertReplicationTarget(target);
        return target;
      })
      .filter((t) => t.compatible)
  );
}

export default { assessReplicationCompatibility, buildReplicationTargets };
