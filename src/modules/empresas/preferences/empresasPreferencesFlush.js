import { isEmpresasPreferencesV2Enabled } from "@/modules/empresas/preferences/empresasPreferencesFeatureFlags";

const FLUSH_TIMEOUT_MS = 2_000;

let activeFlushHandler = null;

export const registerEmpPreferencesFlushHandler = (handler) => {
  if (!isEmpresasPreferencesV2Enabled()) {
    activeFlushHandler = null;
    return;
  }
  activeFlushHandler = typeof handler === "function" ? handler : null;
};

export const flushEmpPreferencesNow = async () => {
  if (!isEmpresasPreferencesV2Enabled() || !activeFlushHandler) return;
  try {
    await Promise.race([
      activeFlushHandler(),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error("preferences flush timeout")), FLUSH_TIMEOUT_MS);
      }),
    ]);
  } catch {
    // Falha ou timeout de preferências não pode bloquear logout/login.
  }
};
