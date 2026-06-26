/**
 * @deprecated Use registerMakPreferencesFlushHandler from framework — compat Empresas.
 */
import {
  registerMakPreferencesFlushHandler,
  flushMakPreferencesNow as flushAllMakPreferences,
} from "@/framework/mak/preferences/makPreferencesFlushRegistry.js";
import { isEmpresasPreferencesV2Enabled } from "@/modules/empresas/preferences/empresasPreferencesFeatureFlags";

export const registerEmpPreferencesFlushHandler = (handler) => {
  if (!isEmpresasPreferencesV2Enabled()) {
    registerMakPreferencesFlushHandler("empresas", null);
    return;
  }
  registerMakPreferencesFlushHandler("empresas", handler);
};

export const flushEmpPreferencesNow = async () => flushAllMakPreferences(["empresas"]);
