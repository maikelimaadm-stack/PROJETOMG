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
import { upgradeStoredLayoutConfig } from "@/framework/cadastro/layouts/empFormLayoutUpgrade";

const LEGACY_CONFIG_KEY = "cadastro_emp_form_layout_config";
const LOCAL_PERSONALIZACOES_ROOT = ".local/personalizacoes/empresas";

let syncTimer = null;
let boundUserId = null;

export const isLocalPersonalizacoesMode = () =>
  import.meta.env.DEV && String(import.meta.env.VITE_LOCAL_PERSONALIZACOES || "").toLowerCase() === "true";

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
  if (!userId || isLocalPersonalizacoesMode()) return;
  bindLayoutStoreUser(userId);

  void (async () => {
    try {
      const remote = await userPreferencesApi.get(USER_PREFERENCE_SCREENS.empresasFormLayout);
      const activeConfig = remote?.config?.activeConfig;
      if (!activeConfig) return;

      const upgraded = upgradeStoredLayoutConfig(activeConfig);
      if (!upgraded) return;

      const localUpdatedAt = readJson(`${getLayoutStorageKeys(userId).legacyKey}__updatedAt`);
      const remoteUpdatedAt = remote?.updatedAt ? new Date(remote.updatedAt).getTime() : 0;
      const localTime = localUpdatedAt ? new Date(localUpdatedAt).getTime() : 0;

      if (remoteUpdatedAt >= localTime) {
        writeStoredLayoutConfig(upgraded);
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
  if (!userId || isLocalPersonalizacoesMode()) return;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(async () => {
    bindLayoutStoreUser(userId);
    const activeConfig = readStoredLayoutConfig();
    if (!activeConfig) return;

    const { legacyKey } = getLayoutStorageKeys(userId);
    localStorage.setItem(`${legacyKey}__updatedAt`, new Date().toISOString());

    try {
      await userPreferencesApi.save(USER_PREFERENCE_SCREENS.empresasFormLayout, {
        version: 3,
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

const downloadJson = (filename, payload) => {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

export const exportEmpresasFormLayoutSnapshot = () => {
  const config = readStoredLayoutConfig();
  if (!config) {
    console.warn("[emp-personalizacoes] Nenhum layout salvo no localStorage.");
    return null;
  }
  return {
    exportedAt: new Date().toISOString(),
    screen: "empresas.form_layout",
    storageKey: getLayoutStorageKeys(boundUserId).legacyKey,
    config,
  };
};

export const registerEmpresasPersonalizacoesDevTools = () => {
  if (!import.meta.env.DEV) return;

  window.__empPersonalizacoes = {
    mode: isLocalPersonalizacoesMode(),
    storageRoot: LOCAL_PERSONALIZACOES_ROOT,
    exportFormLayout: () => {
      const snapshot = exportEmpresasFormLayoutSnapshot();
      if (!snapshot) return null;
      downloadJson("form-layout.snapshot.json", snapshot);
      console.info("[emp-personalizacoes] Exportado form-layout.snapshot.json");
      return snapshot;
    },
    readFormLayout: () => readStoredLayoutConfig(),
    copyFormLayout: async () => {
      const snapshot = exportEmpresasFormLayoutSnapshot();
      if (!snapshot) return null;
      await navigator.clipboard.writeText(JSON.stringify(snapshot, null, 2));
      console.info("[emp-personalizacoes] Layout copiado para a área de transferência.");
      return snapshot;
    },
  };

  if (isLocalPersonalizacoesMode()) {
    console.info(
      "[emp-personalizacoes] Modo local ativo — sync remoto desabilitado. Use window.__empPersonalizacoes.exportFormLayout()"
    );
  }
};
