import { assembleAdoptionContext } from "../../adoption/engine/adoptionContextAssembly.js";
import { summarizeAdoptionEngine } from "../../adoption/engine/adoptionSummarization.js";
import { summarizeBusinessDnaEngine } from "../../dna/engine/businessDnaSummarization.js";
import { summarizeSegmentationEngine } from "../../segmentation/engine/segmentationSummarization.js";
import { resolveAuthorizedGroupScope } from "../../dna/engine/groupMaturityAggregation.js";

/** Assemble corporate intelligence context — authorized group scope only */
export function assembleCorporateIntelligenceContext(groupId, tenantId = "default", options = {}) {
  const scope = resolveAuthorizedGroupScope(groupId, tenantId);
  const authorizedTenantIds = scope?.authorizedTenantIds ?? [];

  if (!scope || !authorizedTenantIds.length) {
    return Object.freeze({
      groupId,
      tenantId,
      assembledAt: new Date().toISOString(),
      authorized: false,
      reason: "Escopo de grupo não autorizado — inteligência corporativa indisponível.",
      explainable: true,
      unauthorizedAggregationForbidden: true,
    });
  }

  const adoptionSummary = summarizeAdoptionEngine(tenantId);
  const adoptionContext = assembleAdoptionContext(tenantId, { ...options, groupId });
  const dnaSummary = summarizeBusinessDnaEngine(tenantId);
  const segmentationSummary = summarizeSegmentationEngine(tenantId);

  return Object.freeze({
    groupId,
    tenantId,
    assembledAt: new Date().toISOString(),
    authorized: true,
    authorizedTenantIds: Object.freeze([...authorizedTenantIds]),
    ownerClientId: scope?.ownerClientId ?? null,
    adoptionSummary,
    adoptionContext,
    dnaSummary,
    segmentationSummary,
    explainable: true,
    belongsToEnterprise: true,
    crossTenantMixingForbidden: true,
    unauthorizedAggregationForbidden: true,
  });
}

export default assembleCorporateIntelligenceContext;
