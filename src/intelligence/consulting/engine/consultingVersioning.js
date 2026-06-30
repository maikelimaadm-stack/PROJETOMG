const versionRegistry = {};

export function registerConsultingVersion(tenantId, entityId, version = 1) {
  const key = `${tenantId}:${entityId}`;
  const next = (versionRegistry[key] ?? 0) + 1;
  versionRegistry[key] = next;
  return Object.freeze({
    tenantId,
    entityId,
    version: next,
    registeredAt: new Date().toISOString(),
  });
}

export function getConsultingVersion(tenantId, entityId) {
  return versionRegistry[`${tenantId}:${entityId}`] ?? 1;
}

export default { registerConsultingVersion, getConsultingVersion };
