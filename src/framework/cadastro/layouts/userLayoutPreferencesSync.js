/**
 * @deprecated Use LayoutPreferencesEngine via cadastro-engine.
 * Mantido para compatibilidade com imports existentes.
 */
import { LayoutPreferencesEngine, resetAllLayoutPreferencesSync } from "@/framework/cadastro-engine/preferences/LayoutPreferencesEngine.js";
import { clearLegacyLayoutStorageForUser } from "@/framework/cadastro/layouts/empFormLayoutUpgrade.js";
import { empresasCadastroConfig } from "@/modules/empresas/config/empresasCadastroConfig.js";

const engine = () => LayoutPreferencesEngine.for(empresasCadastroConfig);

export const USER_PREFERENCE_SCREENS = {
  empresasFormLayout: empresasCadastroConfig.screenKey,
};

export const isLocalPersonalizacoesMode = () =>
  import.meta.env.DEV && String(import.meta.env.VITE_LOCAL_PERSONALIZACOES || "").toLowerCase() === "true";

export const initEmpresasFormLayoutLocal = (userId) => engine().initLocal(userId);

export const syncEmpresasFormLayoutRemote = (userId) => engine().syncRemote(userId);

export const scheduleEmpresasFormLayoutSync = (userId) => engine().scheduleSync(userId);

export const resetEmpresasFormLayoutSync = () => {
  resetAllLayoutPreferencesSync();
};

export const getEmpresasFormLayoutKey = (userId) => engine().getStorageKeys(userId).layoutKey;

export const exportEmpresasFormLayoutSnapshot = () => {
  const config = engine().readLocal();
  if (!config) return null;
  return {
    exportedAt: new Date().toISOString(),
    screen: empresasCadastroConfig.screenKey,
    storageKey: engine().getStorageKeys().layoutKey,
    config,
  };
};

const clearStoredPersonalizacoes = (userId) => {
  if (typeof localStorage === "undefined") return [];
  const removed = [];
  const prefixes = ["emp_", "cadastro", "cadastro_"];
  for (let i = localStorage.length - 1; i >= 0; i -= 1) {
    const key = localStorage.key(i);
    if (!key) continue;
    if (prefixes.some((prefix) => key.startsWith(prefix))) {
      localStorage.removeItem(key);
      removed.push(key);
    }
  }
  if (userId) clearLegacyLayoutStorageForUser(userId);
  resetAllLayoutPreferencesSync();
  return removed;
};

export const registerEmpresasPersonalizacoesDevTools = () => {
  if (!import.meta.env.DEV) return;
  window.__empPersonalizacoes = {
    mode: isLocalPersonalizacoesMode(),
    exportFormLayout: exportEmpresasFormLayoutSnapshot,
    readFormLayout: () => engine().readLocal(),
    resetStoredLayouts: (userId) => {
      const removed = clearStoredPersonalizacoes(userId);
      console.info("[empPersonalizacoes] chaves removidas:", removed);
      window.location.reload();
      return removed;
    },
  };
};
