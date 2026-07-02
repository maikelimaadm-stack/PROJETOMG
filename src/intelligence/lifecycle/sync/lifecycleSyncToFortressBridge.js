import { retrieveSyncState } from "./lifecycleRetrievalSync.js";
import { SYNC_OWNERSHIP } from "./lifecycleSyncContracts.js";

export function bridgeSyncToFortress(groupId, tenantId = "default") {
  const state = retrieveSyncState(groupId);
  return Object.freeze({
    groupId,
    tenantId,
    readOnly: true,
    auditSyncCount: state.syncRecords.filter((r) => r.entityType === "audit").length,
    complianceProtected: true,
    ...SYNC_OWNERSHIP,
    explainable: true,
  });
}

export default bridgeSyncToFortress;
