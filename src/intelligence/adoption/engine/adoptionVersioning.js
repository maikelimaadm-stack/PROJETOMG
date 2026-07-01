const versionRegistry = new Map();

export function registerAdoptionVersion(tenantId, adoptionId) {
  const key = `${tenantId}:${adoptionId}`;
  const version = (versionRegistry.get(key) ?? 0) + 1;
  versionRegistry.set(key, version);
  return Object.freeze({
    tenantId,
    adoptionId,
    version,
    versionedAt: new Date().toISOString(),
  });
}

export function getAdoptionVersion(tenantId, adoptionId) {
  const key = `${tenantId}:${adoptionId}`;
  return versionRegistry.get(key) ?? 1;
}

export default { registerAdoptionVersion, getAdoptionVersion };
