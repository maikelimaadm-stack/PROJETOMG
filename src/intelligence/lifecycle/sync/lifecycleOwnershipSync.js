import { SYNC_OWNERSHIP } from "./lifecycleSyncContracts.js";

export function getSyncOwnership() {
  return Object.freeze({ ...SYNC_OWNERSHIP, explainable: true });
}

export default getSyncOwnership;
