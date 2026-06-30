import {
  BUSINESS_MEMORY_FOUNDATION_VERSION,
  MEMORY_RECORD_TYPES,
} from "../contracts/intelligenceContracts.js";

const STORAGE_KEY = "mak-business-memory-foundation-v1";
const memoryFallback = [];

function readMemoryStore() {
  if (typeof localStorage === "undefined") return [...memoryFallback];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeMemoryStore(records) {
  const trimmed = records.slice(0, 500);
  if (typeof localStorage === "undefined") {
    memoryFallback.length = 0;
    memoryFallback.push(...trimmed);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

/** Business Memory Foundation — tenant-owned longitudinal record (MVP local persistence) */
export function createBusinessMemoryRecord(envelope) {
  const memoryType = resolveMemoryType(envelope);
  return Object.freeze({
    schemaVersion: BUSINESS_MEMORY_FOUNDATION_VERSION,
    memoryId: `mem-${envelope.eventId}`,
    tenantId: envelope.tenantId,
    memoryType,
    recordedAt: new Date().toISOString(),
    eventId: envelope.eventId,
    eventType: envelope.eventType,
    occurredAt: envelope.occurredAt,
    lineage: envelope.lineage,
    explainability: envelope.explainability,
    subject: envelope.subject,
    outcome: envelope.outcome,
    ownership: envelope.ownership,
  });
}

function resolveMemoryType(envelope) {
  if (envelope.eventCategory?.includes("workflow")) return MEMORY_RECORD_TYPES.WORKFLOW;
  if (envelope.eventCategory?.includes("intent")) return MEMORY_RECORD_TYPES.INTENT;
  if (envelope.eventCategory?.includes("decision") || envelope.eventCategory?.includes("approval")) {
    return MEMORY_RECORD_TYPES.DECISION;
  }
  if (envelope.eventCategory?.includes("outcome")) return MEMORY_RECORD_TYPES.OUTCOME;
  if (envelope.eventCategory?.includes("health")) return MEMORY_RECORD_TYPES.ENTERPRISE;
  return MEMORY_RECORD_TYPES.OPERATIONAL;
}

export function persistBusinessMemoryRecord(envelope) {
  const record = createBusinessMemoryRecord(envelope);
  const store = readMemoryStore().filter((r) => r.memoryId !== record.memoryId);
  store.unshift(record);
  writeMemoryStore(store);
  return record;
}

export function listBusinessMemoryRecords(tenantId = "default", options = {}) {
  const limit = options.limit ?? 50;
  return readMemoryStore()
    .filter((r) => r.tenantId === tenantId)
    .slice(0, limit);
}

export function getBusinessMemoryFoundationInfo() {
  return Object.freeze({
    schemaVersion: BUSINESS_MEMORY_FOUNDATION_VERSION,
    belongsToEnterprise: true,
    aiSubstituteForbidden: true,
  });
}

export default persistBusinessMemoryRecord;
