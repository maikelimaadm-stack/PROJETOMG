import {
  USER_PREFERENCE_SCREENS,
  userPreferencesApi,
} from "@/apis/preferences/userPreferencesApi";
import empFormLayoutStore, {
  bindLayoutStoreUser,
  getLayoutStorageKeys,
} from "@/framework/cadastro/layouts/empFormLayoutStore";

const LEGACY_PRESETS_KEY = "cadastro_emp_form_layout_presets_v1";
const LEGACY_CONFIG_KEY = "cadastro_emp_form_layout_config";

let syncTimer = null;
let boundUserId = null;
let hydrationPromise = null;

const readJson = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeJson = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const migrateLegacyToUserKeys = (userId) => {
  const { presetsKey, legacyKey } = getLayoutStorageKeys(userId);
  const hasUserPresets = localStorage.getItem(presetsKey);
  const hasUserConfig = localStorage.getItem(legacyKey);
  if (hasUserPresets || hasUserConfig) return;

  const legacyPresets = localStorage.getItem(LEGACY_PRESETS_KEY);
  const legacyConfig = localStorage.getItem(LEGACY_CONFIG_KEY);
  if (legacyPresets) localStorage.setItem(presetsKey, legacyPresets);
  if (legacyConfig) localStorage.setItem(legacyKey, legacyConfig);
};

const buildLayoutBlob = (userId) => {
  bindLayoutStoreUser(userId);
  const { legacyKey } = getLayoutStorageKeys(userId);
  return {
    version: 1,
    activeConfig: readJson(legacyKey),
    presetsState: empFormLayoutStore.getState(),
  };
};

const applyLayoutBlob = (userId, blob) => {
  if (!blob || typeof blob !== "object") return false;
  bindLayoutStoreUser(userId);
  const { presetsKey, legacyKey } = getLayoutStorageKeys(userId);
  let applied = false;

  if (blob.presetsState?.presets?.length) {
    writeJson(presetsKey, blob.presetsState);
    applied = true;
  }
  if (blob.activeConfig) {
    writeJson(legacyKey, blob.activeConfig);
    applied = true;
  }
  return applied;
};

const hasLocalLayoutData = (userId) => {
  const { presetsKey, legacyKey } = getLayoutStorageKeys(userId);
  return Boolean(localStorage.getItem(presetsKey) || localStorage.getItem(legacyKey));
};

export const hydrateEmpresasFormLayout = async (userId) => {
  if (!userId) return null;
  if (hydrationPromise && boundUserId === userId) return hydrationPromise;

  hydrationPromise = (async () => {
    boundUserId = userId;
    bindLayoutStoreUser(userId);
    migrateLegacyToUserKeys(userId);

    try {
      const remote = await userPreferencesApi.get(USER_PREFERENCE_SCREENS.empresasFormLayout);
      if (remote?.config && applyLayoutBlob(userId, remote.config)) {
        return empFormLayoutStore.getState();
      }
    } catch (error) {
      if (error?.status !== 404) {
        console.warn("Falha ao carregar layout remoto:", error);
      }
    }

    if (hasLocalLayoutData(userId)) {
      scheduleEmpresasFormLayoutSync(userId);
    }

    return empFormLayoutStore.getState();
  })();

  try {
    return await hydrationPromise;
  } finally {
    hydrationPromise = null;
  }
};

export const scheduleEmpresasFormLayoutSync = (userId = boundUserId) => {
  if (!userId) return;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(async () => {
    const blob = buildLayoutBlob(userId);
    if (!blob.activeConfig && !blob.presetsState?.presets?.length) return;
    try {
      await userPreferencesApi.save(USER_PREFERENCE_SCREENS.empresasFormLayout, blob);
    } catch (error) {
      console.warn("Falha ao sincronizar layout do formulário:", error);
    }
  }, 700);
};

export const resetEmpresasFormLayoutSync = () => {
  boundUserId = null;
  clearTimeout(syncTimer);
  syncTimer = null;
  hydrationPromise = null;
  bindLayoutStoreUser(null);
};

export const getEmpresasFormLayoutKey = (userId) => getLayoutStorageKeys(userId).legacyKey;
