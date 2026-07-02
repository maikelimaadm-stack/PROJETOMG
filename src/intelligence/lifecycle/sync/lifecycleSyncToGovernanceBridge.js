import { retrieveSyncState } from "./lifecycleRetrievalSync.js";
import { SYNC_OWNERSHIP } from "./lifecycleSyncContracts.js";

export function bridgeSyncToGovernance(groupId, tenantId = "default") {
  const state = retrieveSyncState(groupId);
  return Object.freeze({
    groupId,
    tenantId,
    readOnly: true,
    syncRecordCount: state.syncRecords.length,
    autonomousPolicyForbidden: true,
    ...SYNC_OWNERSHIP,
    explainable: true,
  });
}

export default bridgeSyncToGovernance;
