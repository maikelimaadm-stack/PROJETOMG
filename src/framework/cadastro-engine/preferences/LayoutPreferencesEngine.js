import { userPreferencesApi } from "@/apis/preferences/userPreferencesApi";
import {
  getLayoutHydratedEventName,
  getLayoutStorageKeysForModule,
  getLayoutUpdatedEventName,
} from "../core/CadastroModuleConfig.js";
import {
  pickLayoutConfig,
  readStoredLayoutConfig as readStoredLayoutConfigLegacy,
  writeStoredLayoutConfig as writeStoredLayoutConfigLegacy,
  bindLayoutStoreUser,
  getLayoutStorageKeys,
} from "@/framework/cadastro/layouts/empFormLayoutStore.js";
import { migrateStoredLayoutConfig } from "./layoutMigration.js";

const engines = new Map();
let boundUserId = null;
const syncTimers = new Map();

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

const readText = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

function layoutConfigsEqual(a, b) {
  if (!a && !b) return true;
  if (!a || !b) return false;
  try {
    return JSON.stringify(pickLayoutConfig(a)) === JSON.stringify(pickLayoutConfig(b));
  } catch {
    return false;
  }
}

export class LayoutPreferencesEngine {
  /** @param {import('../core/CadastroModuleConfig.js').CadastroModuleConfig} config */
  constructor(config) {
    this.config = config;
    this.moduleId = config.moduleId;
    this.updatedEvent = getLayoutUpdatedEventName(config.moduleId);
    this.hydratedEvent = getLayoutHydratedEventName(config.moduleId);
  }

  static for(config) {
    if (!engines.has(config.moduleId)) {
      engines.set(config.moduleId, new LayoutPreferencesEngine(config));
    }
    return engines.get(config.moduleId);
  }

  getStorageKeys(userId = boundUserId) {
    return getLayoutStorageKeysForModule(this.config, userId);
  }

  bindUser(userId) {
    boundUserId = userId || null;
    bindLayoutStoreUser(userId);
  }

  migrateLegacyKeys(userId) {
    if (!userId) return;
    const { layoutKey, legacyKey } = this.getStorageKeys(userId);
    if (localStorage.getItem(layoutKey)) return;

    const globalLegacy = this.config.legacyGlobalStorageKey
      ? localStorage.getItem(this.config.legacyGlobalStorageKey)
      : null;
    if (globalLegacy) {
      localStorage.setItem(layoutKey, globalLegacy);
      return;
    }

    const oldKeys = getLayoutStorageKeys(userId);
    const legacyConfig = localStorage.getItem(oldKeys.legacyKey);
    if (legacyConfig) localStorage.setItem(layoutKey, legacyConfig);
  }

  readLocal(userId) {
    this.bindUser(userId);
    this.migrateLegacyKeys(userId);
    const keys = this.getStorageKeys(userId);
    try {
      const raw = localStorage.getItem(keys.layoutKey);
      const parsed = raw ? JSON.parse(raw) : null;
      if (!parsed || typeof parsed !== "object") return null;
      const defaults = this.config.getDefaultLayoutConfig();
      const upgraded = migrateStoredLayoutConfig(parsed, defaults);
      return upgraded || parsed;
    } catch {
      return null;
    }
  }

  writeLocal(userId, config) {
    if (!config) return;
    this.bindUser(userId);
    const keys = this.getStorageKeys(userId);
    localStorage.setItem(keys.layoutKey, JSON.stringify(pickLayoutConfig(config)));
    localStorage.setItem(`${keys.layoutKey}__updatedAt`, new Date().toISOString());
    if (config.aggregationConfig) {
      localStorage.setItem(keys.aggregationKey, JSON.stringify(config.aggregationConfig || {}));
    }
    window.dispatchEvent(new Event(this.updatedEvent));
  }

  initLocal(userId) {
    if (!userId) return null;
    const defaults = this.config.getDefaultLayoutConfig();
    const local = this.readLocal(userId);
    const upgraded = migrateStoredLayoutConfig(local, defaults);
    if (upgraded) {
      this.writeLocal(userId, upgraded);
      return upgraded;
    }
    if (!local) {
      this.writeLocal(userId, defaults);
      return defaults;
    }
    return local;
  }

  async syncRemote(userId = boundUserId) {
    if (!userId || isLocalPersonalizacoesMode()) return;
    this.bindUser(userId);

    try {
      const remote = await userPreferencesApi.get(this.config.screenKey);
      const activeConfig = remote?.config?.activeConfig;
      if (!activeConfig) return;

      const defaults = this.config.getDefaultLayoutConfig();
      const upgraded = migrateStoredLayoutConfig(activeConfig, defaults);
      if (!upgraded) return;

      const keys = this.getStorageKeys(userId);
      const localUpdatedAt = readJson(`${keys.layoutKey}__updatedAt`);
      const remoteUpdatedAt = remote?.updatedAt ? new Date(remote.updatedAt).getTime() : 0;
      const localTime = localUpdatedAt ? new Date(localUpdatedAt).getTime() : 0;

      if (remoteUpdatedAt >= localTime) {
        this.writeLocal(userId, upgraded);
        if (remote?.updatedAt) {
          localStorage.setItem(`${keys.layoutKey}__serverUpdatedAt`, remote.updatedAt);
        }
        window.dispatchEvent(
          new CustomEvent(this.hydratedEvent, { detail: { userId, moduleId: this.moduleId } })
        );
      } else if (this.readLocal(userId)) {
        this.scheduleSync(userId);
      }
    } catch (error) {
      if (error?.status !== 404 && this.readLocal(userId)) {
        this.scheduleSync(userId);
      }
    }
  }

  scheduleSync(userId = boundUserId) {
    if (!userId || isLocalPersonalizacoesMode()) return;
    const timerKey = `${this.moduleId}:${userId}`;
    if (syncTimers.has(timerKey)) clearTimeout(syncTimers.get(timerKey));

    const timer = setTimeout(async () => {
      const activeConfig = this.readLocal(userId);
      if (!activeConfig) return;
      try {
        const keys = this.getStorageKeys(userId);
        const expectedUpdatedAt = readText(`${keys.layoutKey}__serverUpdatedAt`);
        const saved = await userPreferencesApi.save(this.config.screenKey, {
          version: 3,
          activeConfig: pickLayoutConfig(activeConfig),
        }, {
          expectedUpdatedAt,
          versao_schema: 3,
        });
        if (saved?.updatedAt) {
          localStorage.setItem(`${keys.layoutKey}__serverUpdatedAt`, saved.updatedAt);
        }
      } catch (error) {
        if (Number(error?.status) === 409) {
          // Em conflito entre abas, reidrata remoto e preserva edição local para novo retry.
          this.syncRemote(userId);
        }
        console.warn(`[${this.moduleId}] Falha ao sincronizar layout:`, error);
      }
    }, 700);

    syncTimers.set(timerKey, timer);
  }

  resetSyncState() {
    syncTimers.forEach((t) => clearTimeout(t));
    syncTimers.clear();
    boundUserId = null;
    bindLayoutStoreUser(null);
  }

  apply(userId, config, layoutEngine) {
    const defaults = this.config.getDefaultLayoutConfig();
    const ensured =
      layoutEngine.ensureFields(config, { knownFieldIds: config.knownFieldIds }) || defaults;
    const normalized = layoutEngine.normalize(ensured, {
      basePanels: this.config.basePanels,
      defaultLayout: this.config.defaultFlatLayout,
    });
    this.writeLocal(userId, normalized);
    return normalized;
  }
}

/** Compat: delega ao engine do módulo empresas quando registrado */
export function readStoredLayoutConfigForModule(moduleConfig, userId) {
  return LayoutPreferencesEngine.for(moduleConfig).readLocal(userId);
}

export function resetAllLayoutPreferencesSync() {
  engines.forEach((engine) => engine.resetSyncState());
}
