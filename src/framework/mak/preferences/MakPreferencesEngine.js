/**
 * Preferences Engine — camada genérica sobre adapter de persistência por módulo.
 * A Foundation nunca importa empresasPreferences* diretamente.
 *
 * @param {object} adapter
 * @param {string} adapter.moduleId
 * @param {(key: string, fallback?: unknown) => unknown} adapter.readJson
 * @param {(key: string, fallback?: unknown) => string|null} adapter.readText
 * @param {(key: string, value: string, opts?: object) => void} adapter.writeText
 * @param {(key: string, value: unknown, opts?: object) => void} adapter.writeJson
 * @param {(key: string) => void} [adapter.removeKey]
 * @param {(listener: () => void) => () => void} [adapter.subscribe]
 * @param {(section: string) => boolean} [adapter.isSectionDirty]
 */
export function createMakPreferencesEngine(adapter) {
  if (!adapter || typeof adapter.readJson !== "function") {
    throw new TypeError("createMakPreferencesEngine: adapter.readJson is required");
  }

  const resolveKey = (key) => String(key ?? "");

  return Object.freeze({
    moduleId: adapter.moduleId ?? null,
    readJson: (key, fallback) => adapter.readJson(resolveKey(key), fallback),
    readText: (key, fallback) => adapter.readText?.(resolveKey(key), fallback) ?? fallback ?? null,
    writeText: (key, value, opts) => adapter.writeText?.(resolveKey(key), value, opts),
    writeJson: (key, value, opts) => adapter.writeJson?.(resolveKey(key), value, opts),
    removeKey: (key) => adapter.removeKey?.(resolveKey(key)),
    subscribe: (listener) => adapter.subscribe?.(listener) ?? (() => {}),
    isSectionDirty: (section) => Boolean(adapter.isSectionDirty?.(section)),
    bootstrapAppliedEvent: adapter.bootstrapAppliedEvent ?? null,
    markPerf: adapter.markPerf ?? (() => {}),
    tableKeys: (tableMetadata) => tableMetadata?.preferenceKeys ?? {},
    formKeys: (formMetadata) => formMetadata?.preferenceKeys ?? {},
  });
}
