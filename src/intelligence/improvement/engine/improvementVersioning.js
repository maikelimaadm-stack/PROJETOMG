const versionRegistry = new Map();

export function registerImprovementVersion(tenantId, loopId) {
  const key = `${tenantId}:${loopId}`;
  const version = (versionRegistry.get(key) ?? 0) + 1;
  versionRegistry.set(key, version);
  return Object.freeze({ tenantId, loopId, version, versionedAt: new Date().toISOString() });
}

export default { registerImprovementVersion };
