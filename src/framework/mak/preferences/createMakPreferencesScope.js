import { configurePreferencesCacheHooks } from "./userPreferencesCache.js";

/**
 * Configura escopo de preferências por módulo sobre a infraestrutura MAK genérica.
 * @param {{ getOriginTabId: () => string, onPreferenceWrite?: (reason: string) => void }} hooks
 */
export function createMakPreferencesScope(hooks) {
  configurePreferencesCacheHooks(hooks);
  return hooks;
}
