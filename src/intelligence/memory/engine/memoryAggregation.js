import { listEnterpriseMemoryRecords } from "./enterpriseMemoryStore.js";
import { MEMORY_STORE_TYPES } from "./memoryEngineContracts.js";

export function aggregateMemoryByStore(tenantId = "default") {
  const records = listEnterpriseMemoryRecords(tenantId, { limit: 500 });
  const counts = {};
  for (const type of Object.values(MEMORY_STORE_TYPES)) {
    counts[type] = 0;
  }
  for (const record of records) {
    counts[record.storeType] = (counts[record.storeType] ?? 0) + 1;
  }
  return Object.freeze(counts);
}

export function aggregateMemoryTimelineBuckets(tenantId = "default") {
  const records = listEnterpriseMemoryRecords(tenantId, { limit: 200 });
  const buckets = { today: 0, recent: 0, older: 0 };
  const now = Date.now();
  for (const record of records) {
    const age = now - new Date(record.occurredAt).getTime();
    if (age < 86_400_000) buckets.today += 1;
    else if (age < 7 * 86_400_000) buckets.recent += 1;
    else buckets.older += 1;
  }
  return Object.freeze(buckets);
}

export default aggregateMemoryByStore;
