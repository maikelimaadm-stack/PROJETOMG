import { persistEnterpriseMemoryRecord } from "./enterpriseMemoryStore.js";
import { indexMemoryOutcome } from "./memoryOutcomeIndex.js";
import { appendMemoryAuditEntry } from "./memoryAuditTrail.js";
import { ingestMemoryRecordToKnowledgeGraph } from "../../knowledge/graph/memoryToGraphIngestion.js";

/** Event-to-memory persistence — ingests domain events into Enterprise Memory Engine */
export function ingestEventToMemoryEngine(envelope) {
  const record = persistEnterpriseMemoryRecord(envelope);
  indexMemoryOutcome(record);
  appendMemoryAuditEntry({
    tenantId: record.tenantId,
    memoryId: record.memoryId,
    action: "ingested",
    eventType: record.eventType,
  });
  try {
    ingestMemoryRecordToKnowledgeGraph(record);
  } catch {
    /* observational — never block business operation */
  }
  return record;
}

export default ingestEventToMemoryEngine;
