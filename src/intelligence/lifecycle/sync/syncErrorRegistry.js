import { listSyncErrors } from "./durabilitySyncStore.js";

export function buildSyncErrorRegistry(groupId) {
  const errors = listSyncErrors(groupId, { limit: 30 });
  return Object.freeze({
    groupId,
    errors: errors.map((e) =>
      Object.freeze({
        id: e.errorId,
        label: e.errorCode,
        context: e.summary,
        retryable: e.retryable ?? true,
      })
    ),
    failureCount: errors.length,
    explainable: true,
  });
}

export default buildSyncErrorRegistry;
