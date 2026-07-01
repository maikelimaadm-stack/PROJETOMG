import { RECOMMENDATION_OWNERSHIP } from "./recommendationEngineContracts.js";

export function assertRecommendationOwnership(record) {
  return Object.freeze({
    ...RECOMMENDATION_OWNERSHIP,
    recordId: record.recommendationId ?? record.replicationId,
    tenantId: record.tenantId,
    verifiedAt: new Date().toISOString(),
  });
}

export default assertRecommendationOwnership;
