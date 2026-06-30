export function createBusinessComputedAuditEntry(partial = {}) {
  return Object.freeze({
    entryId: partial.entryId ?? `audit-${Date.now()}`,
    action: partial.action ?? "created",
    actorId: partial.actorId ?? "system",
    actorKind: partial.actorKind ?? "resolver",
    timestamp: partial.timestamp ?? new Date().toISOString(),
    intentRevision: partial.intentRevision ?? null,
    assetRevision: partial.assetRevision ?? null,
    details: Object.freeze(partial.details ?? {}),
  });
}

export function createBusinessComputedAuditTrail(partial = {}) {
  const initial =
    partial.entries ??
    (partial.generatedBy
      ? [
          createBusinessComputedAuditEntry({
            action: "created",
            actorId: partial.generatedBy,
            actorKind: "resolver",
            intentRevision: partial.intentRevision,
            assetRevision: partial.assetRevision ?? 1,
          }),
        ]
      : []);

  return Object.freeze({
    schemaVersion: "mak-business-computed-audit-trail-v1",
    entries: Object.freeze([...initial]),
  });
}

export default createBusinessComputedAuditTrail;
