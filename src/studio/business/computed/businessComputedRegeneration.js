export function diffBusinessComputedFields(previous, next) {
  if (!previous || !next) {
    return Object.freeze({ kind: "full", changed: true, fields: Object.freeze(["all"]) });
  }

  const fields = [];
  if (previous.businessRuleSummary !== next.businessRuleSummary) fields.push("businessRuleSummary");
  if (previous.expressionSource !== next.expressionSource) fields.push("expressionSource");
  if (previous.revision !== next.revision) fields.push("revision");
  if (previous.metadata?.intentRevision !== next.metadata?.intentRevision) {
    fields.push("intentRevision");
  }

  return Object.freeze({
    kind: fields.length ? "incremental" : "none",
    changed: fields.length > 0,
    fields: Object.freeze(fields),
  });
}

export function prepareBusinessComputedRollback(session, priorAsset) {
  return Object.freeze({
    schemaVersion: "mak-business-computed-rollback-v1",
    prepared: Boolean(priorAsset),
    targetSessionId: session.resolverSessionId,
    priorComputedFieldId: priorAsset?.id ?? null,
    priorRevision: priorAsset?.revision ?? null,
    policy: priorAsset?.metadata?.policies?.rollbackPolicy ?? "allowed",
    status: "prepared",
  });
}

export default diffBusinessComputedFields;
