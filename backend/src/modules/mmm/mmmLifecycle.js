/** Allowed lifecycle transitions for persistence writes (Program 4.03). */
const TRANSITIONS = {
  draft: new Set(["draft", "review", "deleted"]),
  review: new Set(["review", "approved", "rejected"]),
  approved: new Set(["approved", "published"]),
  published: new Set(["published", "active", "deprecated"]),
  active: new Set(["active", "deprecated"]),
  deprecated: new Set(["deprecated", "archived"]),
  archived: new Set(["archived", "draft"]),
  rejected: new Set(["rejected", "draft", "deleted"]),
  deleted: new Set(["deleted"]),
};

export const assertLifecycleTransition = (fromStatus, toStatus) => {
  if (fromStatus === toStatus) return;
  const allowed = TRANSITIONS[fromStatus];
  if (!allowed?.has(toStatus)) {
    const error = new Error(`Invalid lifecycle transition: ${fromStatus} → ${toStatus}`);
    error.code = "INVALID_TRANSITION";
    error.statusCode = 422;
    throw error;
  }
};

export const assertNotDirectPublish = (toStatus, { isPublishOperation = false } = {}) => {
  if (isPublishOperation) return;
  if (toStatus === "published" || toStatus === "active") {
    const error = new Error("Direct transition to published/active requires publish operation (S-05).");
    error.code = "DIRECT_PUBLISH_FORBIDDEN";
    error.statusCode = 422;
    throw error;
  }
};
