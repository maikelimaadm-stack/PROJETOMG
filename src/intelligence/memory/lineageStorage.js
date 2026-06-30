/** Lineage storage — links events to Intent, assets, derivations, outcomes */

export function buildEventLineage(input = {}) {
  return Object.freeze([
    ...(input.intentId
      ? [
          Object.freeze({
            kind: "business.intent",
            ref: input.intentId,
            revision: input.intentRevision ?? null,
          }),
        ]
      : []),
    ...(input.derivationId
      ? [
          Object.freeze({
            kind: "derivation",
            ref: input.derivationId,
            kind_detail: input.derivationKind ?? null,
          }),
        ]
      : []),
    ...(input.assetId
      ? [
          Object.freeze({
            kind: "business.asset",
            ref: input.assetId,
            assetType: input.assetType ?? null,
          }),
        ]
      : []),
    ...(input.workflowId
      ? [
          Object.freeze({
            kind: "business.workflow",
            ref: input.workflowId,
          }),
        ]
      : []),
    ...(input.parentEventId
      ? [
          Object.freeze({
            kind: "caused_by",
            ref: input.parentEventId,
          }),
        ]
      : []),
  ]);
}

export function appendLineageRecord(existing = [], record) {
  return Object.freeze([...existing, Object.freeze(record)]);
}

export default buildEventLineage;
