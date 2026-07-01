import { explainSyncState } from "./lifecycleEventSync.js";

export { explainSyncState };

export function explainSyncRecord(record) {
  if (!record) return null;
  return Object.freeze({
    id: record.syncId ?? record.entityId,
    label: record.label,
    because:
      record.status === "diverged"
        ? `Divergência detectada: ${record.frontendState} no frontend vs ${record.backendState} no backend.`
        : record.status === "pending"
          ? "Aguardando confirmação no backend."
          : record.status === "synced"
            ? "Estado confirmado em ambos os lados."
            : record.summary ?? "Estado de sincronização registrado.",
    explainable: true,
  });
}

export default { explainSyncState, explainSyncRecord };
