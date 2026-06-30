import {
  ENTERPRISE_MEMORY_STORE_VERSION,
  MEMORY_RECORD_SCHEMA_VERSION,
  MEMORY_STORE_TYPES,
  MEMORY_OWNERSHIP,
  MEMORY_LIFECYCLE_STATES,
} from "./memoryEngineContracts.js";
import { MEMORY_RECORD_TYPES } from "../../contracts/intelligenceContracts.js";
import { buildMemoryLineage } from "./memoryLineage.js";
import { createMemoryExplainability } from "./memoryExplainability.js";
import { createMemoryOwnership } from "./memoryOwnership.js";
import { assignMemoryLifecycleState } from "./memoryLifecycle.js";

const STORAGE_KEY = "mak-enterprise-memory-engine-v1";
const memoryFallback = { records: [], audit: [], versions: {} };

function readStore() {
  if (typeof localStorage === "undefined") {
    return {
      records: [...memoryFallback.records],
      audit: [...memoryFallback.audit],
      versions: { ...memoryFallback.versions },
    };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { records: [], audit: [], versions: {} };
    return JSON.parse(raw);
  } catch {
    return { records: [], audit: [], versions: {} };
  }
}

function writeStore(data) {
  const trimmed = {
    records: (data.records ?? []).slice(0, 1000),
    audit: (data.audit ?? []).slice(0, 200),
    versions: data.versions ?? {},
  };
  if (typeof localStorage === "undefined") {
    memoryFallback.records.length = 0;
    memoryFallback.records.push(...trimmed.records);
    memoryFallback.audit.length = 0;
    memoryFallback.audit.push(...trimmed.audit);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

function mapFoundationTypeToStore(foundationType, envelope) {
  const map = {
    [MEMORY_RECORD_TYPES.WORKFLOW]: MEMORY_STORE_TYPES.WORKFLOW,
    [MEMORY_RECORD_TYPES.INTENT]: MEMORY_STORE_TYPES.INTENT,
    [MEMORY_RECORD_TYPES.DECISION]: MEMORY_STORE_TYPES.DECISION,
    [MEMORY_RECORD_TYPES.OUTCOME]: MEMORY_STORE_TYPES.OUTCOME,
    [MEMORY_RECORD_TYPES.ENTERPRISE]: MEMORY_STORE_TYPES.ENTERPRISE,
    [MEMORY_RECORD_TYPES.OPERATIONAL]: MEMORY_STORE_TYPES.OPERATIONAL,
    [MEMORY_RECORD_TYPES.BUSINESS]: MEMORY_STORE_TYPES.BUSINESS,
  };
  if (map[foundationType]) return map[foundationType];
  if (envelope.eventCategory?.includes("health")) return MEMORY_STORE_TYPES.ENTERPRISE;
  if (envelope.eventCategory?.includes("improvement")) return MEMORY_STORE_TYPES.BUSINESS;
  return MEMORY_STORE_TYPES.OPERATIONAL;
}

function resolveFoundationType(envelope) {
  if (envelope.eventCategory?.includes("workflow")) return MEMORY_RECORD_TYPES.WORKFLOW;
  if (envelope.eventCategory?.includes("intent")) return MEMORY_RECORD_TYPES.INTENT;
  if (envelope.eventCategory?.includes("decision") || envelope.eventCategory?.includes("approval")) {
    return MEMORY_RECORD_TYPES.DECISION;
  }
  if (envelope.eventCategory?.includes("outcome")) return MEMORY_RECORD_TYPES.OUTCOME;
  if (envelope.eventCategory?.includes("health")) return MEMORY_RECORD_TYPES.ENTERPRISE;
  return MEMORY_RECORD_TYPES.OPERATIONAL;
}

/** Create enriched enterprise memory record from domain event */
export function createEnterpriseMemoryRecord(envelope, options = {}) {
  const foundationType = resolveFoundationType(envelope);
  const storeType = mapFoundationTypeToStore(foundationType, envelope);
  const revision = (options.revision ?? 0) + 1;

  return Object.freeze({
    schemaVersion: MEMORY_RECORD_SCHEMA_VERSION,
    storeVersion: ENTERPRISE_MEMORY_STORE_VERSION,
    memoryId: `emem-${envelope.eventId}`,
    tenantId: envelope.tenantId,
    storeType,
    foundationType,
    lifecycleState: assignMemoryLifecycleState("indexed"),
    revision,
    recordedAt: new Date().toISOString(),
    occurredAt: envelope.occurredAt,
    eventId: envelope.eventId,
    eventType: envelope.eventType,
    actorId: envelope.provenance?.actorId ?? null,
    actorRole: envelope.provenance?.actorRole ?? null,
    subject: envelope.subject,
    outcome: envelope.outcome,
    payload: envelope.payload,
    lineage: buildMemoryLineage(envelope),
    explainability: createMemoryExplainability(envelope),
    ownership: createMemoryOwnership(envelope.tenantId),
    ownershipPolicy: MEMORY_OWNERSHIP,
    whyItHappened: envelope.explainability?.whatHappened ?? "",
    businessImpact: envelope.explainability?.businessImpact ?? null,
    intentId: envelope.subject?.intentId ?? null,
    workflowId: envelope.subject?.workflowId ?? null,
    assetId: envelope.subject?.assetId ?? null,
    assetType: envelope.subject?.assetType ?? null,
  });
}

export function persistEnterpriseMemoryRecord(envelope) {
  const store = readStore();
  const existing = store.records.find(
    (r) => r.eventId === envelope.eventId && r.tenantId === envelope.tenantId
  );
  const record = createEnterpriseMemoryRecord(envelope, {
    revision: existing?.revision ?? 0,
  });

  store.records = [record, ...store.records.filter((r) => r.memoryId !== record.memoryId)];
  store.audit.unshift(
    Object.freeze({
      auditId: `audit-${record.memoryId}`,
      action: existing ? "updated" : "created",
      memoryId: record.memoryId,
      tenantId: record.tenantId,
      at: record.recordedAt,
    })
  );
  store.versions[record.memoryId] = record.revision;
  writeStore(store);
  return record;
}

export function listEnterpriseMemoryRecords(tenantId = "default", options = {}) {
  const limit = options.limit ?? 100;
  const storeType = options.storeType ?? null;
  let records = readStore().records.filter((r) => r.tenantId === tenantId);
  if (storeType) records = records.filter((r) => r.storeType === storeType);
  return records.slice(0, limit);
}

export function getEnterpriseMemoryStoreInfo() {
  return Object.freeze({
    schemaVersion: ENTERPRISE_MEMORY_STORE_VERSION,
    storeTypes: Object.values(MEMORY_STORE_TYPES),
    lifecycleStates: MEMORY_LIFECYCLE_STATES,
    belongsToEnterprise: true,
  });
}

export function getMemoryAuditTrail(tenantId = "default", limit = 50) {
  return readStore()
    .audit.filter((a) => a.tenantId === tenantId)
    .slice(0, limit);
}

export default persistEnterpriseMemoryRecord;
