import { LIFECYCLE_PERSISTENCE_VERSION } from "./lifecyclePersistenceContracts.js";

export function buildPersistenceVersionRecord(groupId) {
  return Object.freeze({
    groupId,
    engineVersion: LIFECYCLE_PERSISTENCE_VERSION,
    versionedAt: new Date().toISOString(),
    explainable: true,
  });
}

export default buildPersistenceVersionRecord;
