import { DATA_LIFECYCLE_VERSION } from "./dataLifecycleContracts.js";

export function buildLifecycleVersionRecord(groupId, ctx) {
  return Object.freeze({
    groupId,
    engineVersion: DATA_LIFECYCLE_VERSION,
    versionedAt: new Date().toISOString(),
    authorized: ctx.authorized ?? false,
    explainable: true,
  });
}

export default buildLifecycleVersionRecord;
