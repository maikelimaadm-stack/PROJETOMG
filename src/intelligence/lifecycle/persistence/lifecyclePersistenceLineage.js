import { listDurableAuditEntries, listTransitions } from "./durableLifecycleStore.js";

export function buildLifecyclePersistenceLineage(groupId) {
  return Object.freeze({
    groupId,
    auditTrail: Object.freeze(listDurableAuditEntries(groupId, { limit: 30 })),
    transitions: Object.freeze(listTransitions(groupId, { limit: 30 })),
    explainable: true,
  });
}

export default buildLifecyclePersistenceLineage;
