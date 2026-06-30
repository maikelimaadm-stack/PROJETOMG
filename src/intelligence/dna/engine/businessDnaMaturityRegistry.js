import { listDnaMaturityRecords } from "./businessDnaStore.js";

export function buildDnaMaturityTimeline(tenantId) {
  const records = listDnaMaturityRecords(tenantId, { limit: 50 });
  return Object.freeze({
    tenantId,
    builtAt: new Date().toISOString(),
    entries: Object.freeze(
      records.map((r) =>
        Object.freeze({
          id: r.recordId,
          label: r.label,
          level: r.level,
          when: r.recordedAt,
        })
      )
    ),
    explainable: true,
  });
}

export function getDnaMaturityRegistry(tenantId = "default") {
  const records = listDnaMaturityRecords(tenantId, { limit: 100 });
  return Object.freeze({
    tenantId,
    recordCount: records.length,
    records: Object.freeze(records),
    explainable: true,
  });
}

export default { buildDnaMaturityTimeline, getDnaMaturityRegistry };
