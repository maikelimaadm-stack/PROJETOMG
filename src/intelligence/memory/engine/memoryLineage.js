import { MEMORY_STORE_TYPES } from "./memoryEngineContracts.js";

export function buildMemoryLineage(envelope) {
  const base = Object.freeze([...(envelope.lineage ?? [])]);
  const extras = [];
  if (envelope.subject?.intentId) {
    extras.push(
      Object.freeze({ kind: "intent.origin", ref: envelope.subject.intentId })
    );
  }
  if (envelope.subject?.workflowId) {
    extras.push(
      Object.freeze({ kind: "workflow.instance", ref: envelope.subject.workflowId })
    );
  }
  if (envelope.subject?.assetId) {
    extras.push(
      Object.freeze({
        kind: "asset.involved",
        ref: envelope.subject.assetId,
        assetType: envelope.subject.assetType,
      })
    );
  }
  return Object.freeze([...base, ...extras]);
}

export function traceMemoryLineage(record) {
  return Object.freeze({
    memoryId: record.memoryId,
    lineage: record.lineage,
    intentId: record.intentId,
    workflowId: record.workflowId,
    assetId: record.assetId,
    explainable: true,
  });
}

export default buildMemoryLineage;
