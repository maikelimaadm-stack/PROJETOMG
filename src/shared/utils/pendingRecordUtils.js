export const PENDING_RECORD_PREFIX = "pending-";

export const isPendingRecordId = (id) =>
  typeof id === "string" && id.startsWith(PENDING_RECORD_PREFIX);
