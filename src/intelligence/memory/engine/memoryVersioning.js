export function bumpMemoryVersion(existingRevision = 0) {
  return existingRevision + 1;
}

export function createMemoryVersionMetadata(memoryId, revision) {
  return Object.freeze({
    memoryId,
    revision,
    versionedAt: new Date().toISOString(),
    monotonic: true,
  });
}

export default bumpMemoryVersion;
