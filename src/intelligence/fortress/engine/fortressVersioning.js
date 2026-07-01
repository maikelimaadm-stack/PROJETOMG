const versionRegistry = new Map();

export function registerComplianceVersion(groupId, documentId) {
  const key = `comp:${groupId}:${documentId}`;
  const version = (versionRegistry.get(key) ?? 0) + 1;
  versionRegistry.set(key, version);
  return Object.freeze({ groupId, documentId, version, versionedAt: new Date().toISOString() });
}

export function registerRetentionVersion(groupId, documentId) {
  const key = `ret:${groupId}:${documentId}`;
  const version = (versionRegistry.get(key) ?? 0) + 1;
  versionRegistry.set(key, version);
  return Object.freeze({ groupId, documentId, version, versionedAt: new Date().toISOString() });
}

export function registerAuditVersion(groupId, documentId) {
  const key = `aud:${groupId}:${documentId}`;
  const version = (versionRegistry.get(key) ?? 0) + 1;
  versionRegistry.set(key, version);
  return Object.freeze({ groupId, documentId, version, versionedAt: new Date().toISOString() });
}

export default { registerComplianceVersion, registerRetentionVersion, registerAuditVersion };
