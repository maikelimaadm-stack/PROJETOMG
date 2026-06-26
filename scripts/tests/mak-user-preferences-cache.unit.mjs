/**
 * Testes do cache genérico de preferências (framework/mak).
 */
import {
  configurePreferencesCacheHooks,
  emitPreferencesCacheUpdate,
  readPreferencesJson,
  readPreferencesText,
  resetPreferencesMemoryCache,
  resetPreferencesCacheHooks,
  resolvePreferenceStorageKey,
  writePreferencesJson,
  writePreferencesText,
} from "../../src/framework/mak/preferences/userPreferencesCache.js";
import {
  setActiveUserPreferencesScope,
  clearActiveUserPreferencesScope,
} from "../../src/shared/preferences/userPreferencesScope.js";

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const setupStorage = () => {
  const store = new Map();
  const listeners = new Map();
  global.window = {
    localStorage: {
      get length() {
        return store.size;
      },
      key(index) {
        return [...store.keys()][index] ?? null;
      },
      getItem(key) {
        return store.has(key) ? store.get(key) : null;
      },
      setItem(key, value) {
        store.set(key, String(value));
      },
      removeItem(key) {
        store.delete(key);
      },
    },
    dispatchEvent(event) {
      const callbacks = listeners.get(event.type) || [];
      callbacks.forEach((callback) => callback(event));
      return true;
    },
    addEventListener(type, callback) {
      const callbacks = listeners.get(type) || [];
      callbacks.push(callback);
      listeners.set(type, callbacks);
    },
    removeEventListener(type, callback) {
      const callbacks = listeners.get(type) || [];
      listeners.set(
        type,
        callbacks.filter((cb) => cb !== callback)
      );
    },
  };
  global.CustomEvent = class CustomEvent {
    constructor(type, init = {}) {
      this.type = type;
      this.detail = init.detail;
    }
  };
  return store;
};

const run = () => {
  resetPreferencesCacheHooks();
  resetPreferencesMemoryCache();
  clearActiveUserPreferencesScope();

  const store = setupStorage();
  setActiveUserPreferencesScope({ clienteId: "c1", userId: "u1" });

  const scoped = resolvePreferenceStorageKey("emp_col_widths");
  assert(scoped.startsWith("mg_pref_v2:"), "emp_col_widths deve resolver para chave scoped");

  writePreferencesJson("emp_col_widths", { a: 1 }, { reason: "listagem:test" });
  assert(store.has(scoped), "valor scoped deve existir no storage");

  const readBack = readPreferencesJson("emp_col_widths", null);
  assert(readBack?.a === 1, "readPreferencesJson deve ler valor escrito");

  writePreferencesText("plain_key", "hello", { reason: "test" });
  assert(readPreferencesText("plain_key", null) === "hello", "readPreferencesText roundtrip");

  let trackedReason = null;
  configurePreferencesCacheHooks({
    getOriginTabId: () => "tab-1",
    onPreferenceWrite: (reason) => {
      trackedReason = reason;
    },
  });

  writePreferencesText("emp_sort_columns_v1", "[]", { reason: "listagem:columns-local" });
  assert(trackedReason === "listagem:columns-local", "hook onPreferenceWrite deve ser chamado");

  emitPreferencesCacheUpdate(["emp_col_widths"], "listagem:emit-test");

  const legacyEvents = [];
  const makEvents = [];
  const onLegacy = (e) => legacyEvents.push(e.detail);
  const onMak = (e) => makEvents.push(e.detail);
  global.window.addEventListener("emp-preferences-cache-updated", onLegacy);
  global.window.addEventListener("mak-preferences-cache-updated", onMak);
  emitPreferencesCacheUpdate(["emp_sort_columns_v1"], "listagem:dual-event");
  assert(legacyEvents.length >= 1, "evento legado emp-preferences-cache-updated deve ser emitido");
  assert(makEvents.length >= 1, "evento mak-preferences-cache-updated deve ser emitido");

  resetPreferencesMemoryCache();
  resetPreferencesCacheHooks();
  clearActiveUserPreferencesScope();
  delete global.window;

  console.log("OK: mak-user-preferences-cache.unit");
};

run();
