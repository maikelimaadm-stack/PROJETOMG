const parseBooleanEnv = (value) => {
  const normalized = String(value ?? "").trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
};

/** Kill switch for Empresas preferences v2 (cross-tab, awaitable flush, bootstrap generation). */
export const isEmpresasPreferencesV2Enabled = () =>
  parseBooleanEnv(import.meta.env.VITE_EMPRESAS_PREFERENCES_V2_ENABLED);

export const EMPRESAS_PREFERENCES_BOOTSTRAP_TIMEOUT_MS = 3_000;
