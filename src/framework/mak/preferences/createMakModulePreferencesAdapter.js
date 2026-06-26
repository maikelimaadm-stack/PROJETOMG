/**
 * Adapter genérico de preferências por módulo — Preferences Engine.
 */
import {
  emitPreferencesCacheUpdate,
  readPreferencesJson,
  readPreferencesText,
  removePreferencesKey,
  subscribePreferencesCache,
  writePreferencesJson,
  writePreferencesText,
} from "@/framework/mak/preferences/userPreferencesCache.js";

const noop = () => {};

export function createMakModulePreferencesAdapter({
  moduleId,
  keyPrefix,
  bootstrapAppliedEvent = null,
  markPerf = noop,
  isSectionDirty = () => false,
}) {
  const resolveKey = (key) => String(key ?? "").trim();

  return {
    moduleId,
    readJson: (key, fallback) => readPreferencesJson(resolveKey(key), fallback),
    readText: (key, fallback) => readPreferencesText(resolveKey(key), fallback),
    writeText: (key, value, opts) => writePreferencesText(resolveKey(key), value, opts),
    writeJson: (key, value, opts) => writePreferencesJson(resolveKey(key), value, opts),
    removeKey: (key) => removePreferencesKey(resolveKey(key)),
    subscribe: (listener) => subscribePreferencesCache(listener),
    isSectionDirty,
    bootstrapAppliedEvent,
    markPerf,
    emitCacheUpdate: emitPreferencesCacheUpdate,
    keyPrefix,
  };
}
