import { LIFECYCLE_SYNC_VERSION } from "./lifecycleSyncContracts.js";

export function getSyncVersionInfo() {
  return Object.freeze({
    syncVersion: LIFECYCLE_SYNC_VERSION,
    explainable: true,
  });
}

export default getSyncVersionInfo;
