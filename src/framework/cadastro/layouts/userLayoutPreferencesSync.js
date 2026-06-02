import {
  USER_PREFERENCE_SCREENS,
  userPreferencesApi,
} from "@/apis/preferences/userPreferencesApi";
import {
  bindLayoutStoreUser,
  getLayoutStorageKeys,
  readStoredLayoutConfig,
  writeStoredLayoutConfig,
} from "@/framework/cadastro/layouts/empFormLayoutStore";

const LEGACY_CONFIG_KEY = "cadastro_emp_form_layout_config";

let syncTimer = null;
let boundUserId = null;

const readJson = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const migrateLegacyToUserKeys = (userId) => {
  const { legacyKey } = getLayoutStorageKeys(userId);
  if (localStorage.getItem(legacyKey)) return;

  const legacyConfig = localStorage.getItem(LEGACY_CONFIG_KEY);
  if (legacyConfig) localStorage.setItem(legacyKey, legacyConfig);
};

export const initEmpresasFormLayoutLocal = (userId) => {
  if (!userId) return null;
  boundUserId = userId;
  bindLayoutStoreUser(userId);
  migrateLegacyToUserKeys(userId);
  return readStoredLayoutConfig();
};

export const syncEmpresasFormLayoutRemote = (userId = boundUserId) => {
  if (!userId) return;
  bindLayoutStoreUser(userId);

  void (async () => {
    try {
      const remote = await userPreferencesApi.get(USER_PREFERENCE_SCREENS.empresasFormLayout);
      const activeConfig = remote?.config?.activeConfig;
      if (!activeConfig) return;

      const localUpdatedAt = readJson(`${getLayoutStorageKeys(userId).legacyKey}__updatedAt`);
      const remoteUpdatedAt = remote?.updatedAt ? new Date(remote.updatedAt).getTime() : 0;
      const localTime = localUpdatedAt ? new Date(localUpdatedAt).getTime() : 0;

      if (remoteUpdatedAt >= localTime) {
        writeStoredLayoutConfig(activeConfig);
        window.dispatchEvent(new CustomEvent("emp-layout-hydrated", { detail: { userId } }));
      } else if (readStoredLayoutConfig()) {
        scheduleEmpresasFormLayoutSync(userId);
      }
    } catch (error) {
      if (error?.status !== 404 && readStoredLayoutConfig()) {
        scheduleEmpresasFormLayoutSync(userId);
      }
    }
  })();
};

export const scheduleEmpresasFormLayoutSync = (userId = boundUserId) => {
  if (!userId) return;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(async () => {
    bindLayoutStoreUser(userId);
    const activeConfig = readStoredLayoutConfig();
    if (!activeConfig) return;

    const { legacyKey } = getLayoutStorageKeys(userId);
    localStorage.setItem(`${legacyKey}__updatedAt`, new Date().toISOString());

    try {
      await userPreferencesApi.save(USER_PREFERENCE_SCREENS.empresasFormLayout, {
        version: 2,
        activeConfig,
      });
    } catch (error) {
      console.warn("Falha ao sincronizar layout do formulário:", error);
    }
  }, 700);
};

export const resetEmpresasFormLayoutSync = () => {
  boundUserId = null;
  clearTimeout(syncTimer);
  syncTimer = null;
  bindLayoutStoreUser(null);
};

export const getEmpresasFormLayoutKey = (userId) => getLayoutStorageKeys(userId).legacyKey;
