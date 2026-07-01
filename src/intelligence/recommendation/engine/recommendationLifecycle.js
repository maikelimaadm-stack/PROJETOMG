import { RECOMMENDATION_LIFECYCLE_STATES, REPLICATION_LIFECYCLE_STATES } from "./recommendationEngineContracts.js";

export function getRecommendationLifecycleStates() {
  return RECOMMENDATION_LIFECYCLE_STATES;
}

export function getReplicationLifecycleStates() {
  return REPLICATION_LIFECYCLE_STATES;
}

export default { getRecommendationLifecycleStates, getReplicationLifecycleStates };
