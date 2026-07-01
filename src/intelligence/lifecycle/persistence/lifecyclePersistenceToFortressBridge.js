import { retrievePersistentLifecycle } from "./lifecyclePersistenceRetrieval.js";
import { PERSISTENCE_OWNERSHIP } from "./lifecyclePersistenceContracts.js";

export function bridgePersistenceToFortress(groupId, tenantId = "default") {
  const data = retrievePersistentLifecycle(groupId);
  return Object.freeze({
    groupId,
    tenantId,
    readOnly: true,
    auditCount: data.auditEntries.length,
    durable: true,
    ...PERSISTENCE_OWNERSHIP,
    explainable: true,
  });
}

export default bridgePersistenceToFortress;
