export function createBusinessComputedSynchronization(partial = {}) {
  return Object.freeze({
    schemaVersion: "mak-business-computed-synchronization-v1",
    policy: partial.policy ?? "sync_on_intent_change",
    lastSyncedIntentRevision: partial.lastSyncedIntentRevision ?? null,
    lastSyncedAt: partial.lastSyncedAt ?? null,
    pendingChanges: Object.freeze(partial.pendingChanges ?? []),
    status: partial.status ?? "synchronized",
  });
}

export function planBusinessComputedSynchronization(asset, intentDocument) {
  const drift =
    asset.metadata?.intentRevision != null &&
    intentDocument.revision !== asset.metadata.intentRevision;

  return Object.freeze({
    required: drift,
    reason: drift ? "intent_revision_changed" : "none",
    fromRevision: asset.metadata?.intentRevision ?? null,
    toRevision: intentDocument.revision,
    policy: asset.metadata?.policies?.synchronizationPolicy ?? "sync_on_intent_change",
  });
}

export default createBusinessComputedSynchronization;
