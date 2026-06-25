export const EMP_PREFERENCES_BOOTSTRAP_APPLIED_EVENT = "emp-preferences-bootstrap-applied";

export const dispatchEmpPreferencesBootstrapApplied = (detail = {}) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(EMP_PREFERENCES_BOOTSTRAP_APPLIED_EVENT, {
      detail: {
        generation: Number(detail.generation) || 0,
        status: detail.status || "remote_applied",
        hadLocalSnapshot: Boolean(detail.hadLocalSnapshot),
        clienteId: detail.clienteId || null,
        userId: detail.userId || null,
      },
    })
  );
};
