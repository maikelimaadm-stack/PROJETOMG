import { DOMAIN_EVENT_BUS_VERSION } from "../contracts/intelligenceContracts.js";
import { createBusinessEventEnvelope } from "./businessEventEnvelope.js";
import { persistBusinessMemoryRecord } from "../memory/businessMemoryStore.js";
import { ingestEventToMemoryEngine } from "../memory/engine/eventToMemoryPersistence.js";
import { registerObservation } from "../observation/observationRegistry.js";

const STORAGE_KEY = "mak-domain-event-bus-v1";
const subscribers = new Set();
const memoryFallback = [];

function readPersistedEvents() {
  if (typeof localStorage === "undefined") return [...memoryFallback];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writePersistedEvents(events) {
  const trimmed = events.slice(0, 500);
  if (typeof localStorage === "undefined") {
    memoryFallback.length = 0;
    memoryFallback.push(...trimmed);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

/** Tenant-scoped domain event bus — observational, enterprise-owned (D-074 §10) */
export function getDomainEventBusInfo() {
  return Object.freeze({
    schemaVersion: DOMAIN_EVENT_BUS_VERSION,
    tenantScoped: true,
    crossTenantLeakageForbidden: true,
    autonomousExecutionForbidden: true,
  });
}

export function publishDomainEvent(envelopeInput) {
  const envelope =
    envelopeInput?.schemaVersion === undefined
      ? createBusinessEventEnvelope(envelopeInput)
      : envelopeInput;

  const events = readPersistedEvents();
  events.unshift(envelope);
  writePersistedEvents(events);

  const memoryRecord = persistBusinessMemoryRecord(envelope);
  ingestEventToMemoryEngine(envelope);
  registerObservation(envelope, memoryRecord);

  for (const handler of subscribers) {
    try {
      handler(envelope, memoryRecord);
    } catch {
      /* observational — never block business operation */
    }
  }

  return envelope;
}

export function listDomainEvents(tenantId = "default", options = {}) {
  const limit = options.limit ?? 100;
  return readPersistedEvents()
    .filter((e) => e.tenantId === tenantId)
    .slice(0, limit);
}

export function subscribeDomainEvents(handler) {
  subscribers.add(handler);
  return () => subscribers.delete(handler);
}

export function countDomainEventsByType(tenantId = "default") {
  const counts = {};
  for (const event of listDomainEvents(tenantId, { limit: 500 })) {
    counts[event.eventType] = (counts[event.eventType] ?? 0) + 1;
  }
  return Object.freeze(counts);
}

export default publishDomainEvent;
