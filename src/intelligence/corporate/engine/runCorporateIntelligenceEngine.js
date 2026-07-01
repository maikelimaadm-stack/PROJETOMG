/**
 * Corporate Intelligence Engine orchestrator.
 */
import { CORPORATE_INTELLIGENCE_VERSION } from "./corporateIntelligenceContracts.js";
import { getCorporateIntelligenceStoreInfo } from "./corporateIntelligenceStore.js";
import { summarizeCorporateIntelligenceEngine } from "./corporateIntelligenceSummarization.js";
import { assembleCorporateIntelligenceContext } from "./corporateIntelligenceContextAssembly.js";
import { buildCorporateIntelligenceBosProjection } from "./corporateIntelligenceToBosProjection.js";
import { retrieveLatestCorporateIntelligence } from "./corporateIntelligenceRetrieval.js";
import { buildGroupAdoptionComparison } from "./groupAdoptionComparison.js";
import { trackReplicationAdoption } from "./replicationAdoptionTracking.js";
import { trackRecommendationOutcomes } from "./recommendationOutcomeTracking.js";

export function runCorporateIntelligenceEngine(groupId, tenantId = "default", options = {}) {
  return Object.freeze({
    engineVersion: CORPORATE_INTELLIGENCE_VERSION,
    groupId,
    tenantId,
    storeInfo: getCorporateIntelligenceStoreInfo(),
    summary: summarizeCorporateIntelligenceEngine(groupId),
    context: assembleCorporateIntelligenceContext(groupId, tenantId, options),
    bosProjection: buildCorporateIntelligenceBosProjection(groupId, tenantId, options),
    registry: retrieveLatestCorporateIntelligence(groupId),
    groupComparison: buildGroupAdoptionComparison(groupId, tenantId),
    replicationTracking: trackReplicationAdoption(tenantId),
    recommendationOutcomes: trackRecommendationOutcomes(tenantId),
    corporateIntelligenceReady: true,
    unauthorizedAggregationForbidden: true,
    crossTenantMixingForbidden: true,
    individualProfilingForbidden: true,
  });
}

export default runCorporateIntelligenceEngine;
