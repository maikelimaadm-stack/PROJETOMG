const versionRegistry = new Map();

export function registerCorporateIntelligenceVersion(groupId, viewId) {
  const key = `${groupId}:${viewId}`;
  const version = (versionRegistry.get(key) ?? 0) + 1;
  versionRegistry.set(key, version);
  return Object.freeze({ groupId, viewId, version, versionedAt: new Date().toISOString() });
}

export default { registerCorporateIntelligenceVersion };
