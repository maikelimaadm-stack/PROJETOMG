const parseBooleanEnv = (value) => {
  const normalized = String(value ?? "").trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
};

export const isEmpresasPreferencesPerfEnabled = () =>
  parseBooleanEnv(import.meta.env.VITE_EMPRESAS_PREFERENCES_PERF);

const getActiveScope = () => {
  if (typeof window === "undefined") return { clienteId: null, userId: null };
  const scope = window.__mgActivePrefScopeKey || "";
  const [clienteId, userId] = scope.split(":");
  return { clienteId: clienteId || null, userId: userId || null };
};

const perfLog = [];

export const markEmpPreferencesPerf = (
  markName,
  {
    section = null,
    source = null,
    dirty = null,
    changed = null,
    modulo = "empresas",
    tela = null,
  } = {}
) => {
  if (!isEmpresasPreferencesPerfEnabled() || typeof performance === "undefined") return;

  const scope = getActiveScope();
  const entry = {
    mark: markName,
    timestamp: performance.now(),
    scope: { ...scope, modulo, tela },
    section,
    source,
    dirty,
    changed,
  };

  try {
    performance.mark(markName);
  } catch {
    // ignore duplicate mark names in StrictMode
  }

  perfLog.push(entry);

  if (typeof window !== "undefined") {
    window.__empPreferencesPerfLog = perfLog;
  }
};

export const measureEmpPreferencesPerf = (measureName, startMark, endMark) => {
  if (!isEmpresasPreferencesPerfEnabled() || typeof performance === "undefined") return null;
  try {
    performance.measure(measureName, startMark, endMark);
    return performance.getEntriesByName(measureName).at(-1)?.duration ?? null;
  } catch {
    return null;
  }
};

export const getEmpPreferencesPerfLog = () => [...perfLog];

export const clearEmpPreferencesPerfLog = () => {
  perfLog.length = 0;
  if (typeof window !== "undefined") {
    window.__empPreferencesPerfLog = perfLog;
  }
};
