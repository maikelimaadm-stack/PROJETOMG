/** Frontend ↔ Backend sync API client with memory fallback for gates/Node. */

const memoryBackend = {};

export function seedBackendSnapshot(clienteId, groupId, snapshot) {
  memoryBackend[`${clienteId}:${groupId}`] = Object.freeze({
    ...snapshot,
    durable: true,
    source: "memory_backend",
  });
}

export function getMemoryBackendSnapshot(clienteId, groupId) {
  return (
    memoryBackend[`${clienteId}:${groupId}`] ??
    Object.freeze({
      approvals: [],
      executions: [],
      audits: [],
      storageActions: [],
      backupActions: [],
      durable: true,
      source: "memory_backend_empty",
    })
  );
}

export async function fetchBackendSyncSnapshot(groupId, options = {}) {
  const clienteId = options.clienteId ?? "default-client";
  if (options.useMemory === true || typeof fetch === "undefined") {
    return getMemoryBackendSnapshot(clienteId, groupId);
  }

  try {
    const res = await fetch(`/api/lifecycle/sync/${encodeURIComponent(groupId)}`, {
      credentials: "include",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return getMemoryBackendSnapshot(clienteId, groupId);
    const data = await res.json();
    return Object.freeze({ ...data, durable: true, source: "backend_api" });
  } catch {
    return getMemoryBackendSnapshot(clienteId, groupId);
  }
}

export async function pushSyncBatch(groupId, batch, options = {}) {
  if (options.useMemory === true || typeof fetch === "undefined") {
    const clienteId = options.clienteId ?? "default-client";
    const existing = getMemoryBackendSnapshot(clienteId, groupId);
    seedBackendSnapshot(clienteId, groupId, {
      approvals: [...(batch.approvals ?? []), ...(existing.approvals ?? [])].slice(0, 200),
      executions: [...(batch.executions ?? []), ...(existing.executions ?? [])].slice(0, 200),
      audits: [...(batch.audits ?? []), ...(existing.audits ?? [])].slice(0, 500),
      storageActions: [...(batch.storageActions ?? []), ...(existing.storageActions ?? [])].slice(0, 200),
      backupActions: [...(batch.backupActions ?? []), ...(existing.backupActions ?? [])].slice(0, 200),
    });
    return Object.freeze({ pushed: true, durable: true, source: "memory_backend" });
  }

  try {
    const res = await fetch(`/api/lifecycle/sync/${encodeURIComponent(groupId)}/push`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(batch),
    });
    if (!res.ok) return Object.freeze({ pushed: false, reason: "Falha ao sincronizar com backend." });
    return await res.json();
  } catch {
    return Object.freeze({ pushed: false, reason: "Backend indisponível." });
  }
}

export async function reconcileSync(groupId, options = {}) {
  if (options.useMemory === true || typeof fetch === "undefined") {
    return Object.freeze({ reconciled: true, durable: true, source: "memory_backend" });
  }

  try {
    const res = await fetch(`/api/lifecycle/sync/${encodeURIComponent(groupId)}/reconcile`, {
      method: "POST",
      credentials: "include",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return Object.freeze({ reconciled: false });
    return await res.json();
  } catch {
    return Object.freeze({ reconciled: false });
  }
}

export default { fetchBackendSyncSnapshot, pushSyncBatch, reconcileSync };
