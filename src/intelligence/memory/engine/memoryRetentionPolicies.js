import { DEFAULT_RETENTION_DAYS } from "./memoryEngineContracts.js";

export function getMemoryRetentionPolicy(tenantId = "default") {
  return Object.freeze({
    tenantId,
    retentionDays: DEFAULT_RETENTION_DAYS,
    purgeRequiresAudit: true,
    crossTenantPurgeForbidden: true,
    humanGoverned: true,
  });
}

export function isMemoryWithinRetention(record, policy = getMemoryRetentionPolicy()) {
  const ageMs = Date.now() - new Date(record.occurredAt).getTime();
  const maxMs = policy.retentionDays * 86_400_000;
  return ageMs <= maxMs;
}

export function filterRetainedRecords(records, tenantId) {
  const policy = getMemoryRetentionPolicy(tenantId);
  return records.filter((r) => isMemoryWithinRetention(r, policy));
}

export default getMemoryRetentionPolicy;
