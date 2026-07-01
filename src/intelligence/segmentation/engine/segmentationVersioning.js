const versionRegistry = {};

export function registerSegmentationVersion(tenantId, entityId) {
  const key = `${tenantId}:${entityId}`;
  const next = (versionRegistry[key] ?? 0) + 1;
  versionRegistry[key] = next;
  return Object.freeze({ tenantId, entityId, version: next, registeredAt: new Date().toISOString() });
}

export default { registerSegmentationVersion };
