const AUTH_TOKEN_KEY = "erp_auth_token";

let memoryToken = null;

const resolveStorageMode = () => {
  const raw = String(import.meta.env.VITE_AUTH_TOKEN_STORAGE || "session").trim().toLowerCase();
  if (raw === "local") return "local";
  if (raw === "memory") return "memory";
  return "session";
};

const safeStorageGet = (storage, key) => {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
};

const safeStorageSet = (storage, key, value) => {
  try {
    storage.setItem(key, value);
  } catch {
    // noop
  }
};

const safeStorageRemove = (storage, key) => {
  try {
    storage.removeItem(key);
  } catch {
    // noop
  }
};

const migrateLegacyLocalStorageToken = () => {
  if (typeof window === "undefined") return null;
  const legacyToken = safeStorageGet(localStorage, AUTH_TOKEN_KEY);
  if (!legacyToken) return null;
  const mode = resolveStorageMode();
  if (mode === "session") {
    safeStorageSet(sessionStorage, AUTH_TOKEN_KEY, legacyToken);
    safeStorageRemove(localStorage, AUTH_TOKEN_KEY);
  }
  return legacyToken;
};

export const tokenStore = {
  key: AUTH_TOKEN_KEY,
  getToken() {
    if (typeof window === "undefined") return memoryToken;
    if (memoryToken) return memoryToken;
    const mode = resolveStorageMode();
    if (mode === "memory") return null;
    const preferredStorage = mode === "local" ? localStorage : sessionStorage;
    const token = safeStorageGet(preferredStorage, AUTH_TOKEN_KEY);
    if (token) {
      memoryToken = token;
      return token;
    }
    const migrated = migrateLegacyLocalStorageToken();
    if (migrated) {
      memoryToken = migrated;
      return migrated;
    }
    return null;
  },
  setToken(token) {
    const nextToken = String(token || "").trim();
    if (!nextToken) return;
    memoryToken = nextToken;
    if (typeof window === "undefined") return;
    const mode = resolveStorageMode();
    if (mode === "memory") {
      safeStorageRemove(localStorage, AUTH_TOKEN_KEY);
      safeStorageRemove(sessionStorage, AUTH_TOKEN_KEY);
      return;
    }
    const preferredStorage = mode === "local" ? localStorage : sessionStorage;
    const fallbackStorage = mode === "local" ? sessionStorage : localStorage;
    safeStorageSet(preferredStorage, AUTH_TOKEN_KEY, nextToken);
    safeStorageRemove(fallbackStorage, AUTH_TOKEN_KEY);
  },
  clearToken() {
    memoryToken = null;
    if (typeof window === "undefined") return;
    safeStorageRemove(localStorage, AUTH_TOKEN_KEY);
    safeStorageRemove(sessionStorage, AUTH_TOKEN_KEY);
  },
};
