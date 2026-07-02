import { summarizeLifecycleSync } from "./lifecycleSummariesSync.js";
import { SYNC_OWNERSHIP } from "./lifecycleSyncContracts.js";

export function bridgeSyncToPortfolio(groupId, tenantId = "default") {
  const summary = summarizeLifecycleSync(groupId);
  return Object.freeze({
    groupId,
    tenantId,
    readOnly: true,
    aggregatedOnlyWithAuthorization: true,
    syncedCount: summary.syncedCount,
    ...SYNC_OWNERSHIP,
    explainable: true,
  });
}

export default bridgeSyncToPortfolio;
