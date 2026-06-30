const versionRegistry = {};

export function registerDecisionVersion(tenantId, entityId) {
  const key = `${tenantId}:${entityId}`;
  const next = (versionRegistry[key] ?? 0) + 1;
  versionRegistry[key] = next;
  return Object.freeze({ tenantId, entityId, version: next, registeredAt: new Date().toISOString() });
}

export function getDecisionVersion(tenantId, entityId) {
  return versionRegistry[`${tenantId}:${entityId}`] ?? 1;
}

export default { registerDecisionVersion, getDecisionVersion };
