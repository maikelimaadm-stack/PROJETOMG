export function createBusinessWorkflowVersioning(partial = {}) {
  const contentSeed = partial.contentSeed ?? "";
  let hash = 0;
  for (let i = 0; i < contentSeed.length; i += 1) {
    hash = (hash * 31 + contentSeed.charCodeAt(i)) >>> 0;
  }
  return Object.freeze({
    revision: partial.revision ?? 1,
    contentHash: partial.contentHash ?? `bwh-${hash.toString(16).padStart(8, "0")}`,
    schemaVersion: partial.schemaVersion ?? "mak-business-workflow-document-v1",
    compatibilityVersion: partial.compatibilityVersion ?? "mak-business-workflow-compat-v1",
  });
}

export function bumpBusinessWorkflowRevision(versioning) {
  return createBusinessWorkflowVersioning({
    ...versioning,
    revision: (versioning.revision ?? 1) + 1,
    contentSeed: `${versioning.contentHash}:${Date.now()}`,
  });
}

export default createBusinessWorkflowVersioning;
