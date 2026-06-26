/** Eventos de cache que indicam re-hidratação remota (bootstrap/hydrate/login). */
export const isRemotePreferenceCacheReason = (reason = "") => {
  const normalized = String(reason || "").toLowerCase();
  return (
    normalized.includes("bootstrap") ||
    normalized.includes("listagem:hydrate") ||
    normalized.includes("remote-tab") ||
    normalized.includes("remote-sync") ||
    normalized.includes("remote:apply") ||
    normalized === "storage"
  );
};

export const shouldRefreshListagemHydrate = (reason = "") => isRemotePreferenceCacheReason(reason);
