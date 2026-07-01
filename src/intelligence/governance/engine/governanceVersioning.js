const versionRegistry = new Map();

export function registerGovernanceVersion(groupId, documentId) {
  const key = `${groupId}:${documentId}`;
  const version = (versionRegistry.get(key) ?? 0) + 1;
  versionRegistry.set(key, version);
  return Object.freeze({ groupId, documentId, version, versionedAt: new Date().toISOString() });
}

export default { registerGovernanceVersion };
