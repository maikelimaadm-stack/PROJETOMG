import { userPreferencesApi } from "@/apis/preferences/userPreferencesApi";
import {
  getLayoutHydratedEventName,
  getLayoutStorageKeysForModule,
  getLayoutUpdatedEventName,
} from "../core/CadastroModuleConfig.js";
import {
  pickLayoutConfig,
  bindLayoutStoreUser,
  getLayoutStorageKeys,
} from "@/framework/cadastro/layouts/empFormLayoutStore.js";
import { migrateStoredLayoutConfig } from "./layoutMigration.js";
import {
  readEmpPreferencesJson,
  readEmpPreferencesText,
  writeEmpPreferencesJson,
  writeEmpPreferencesText,
} from "@/modules/empresas/preferences/empresasPreferencesCache";

const engines = new Map();
let boundUserId = null;
const syncTimers = new Map();

export const isLocalPersonalizacoesMode = () =>
  import.meta.env.DEV && String(import.meta.env.VITE_LOCAL_PERSONALIZACOES || "").toLowerCase() === "true";

const parseScopeFromScreenKey = (screenKey) => {
  const normalized = String(screenKey || "").trim().toLowerCase();
  if (!normalized) {
    return { modulo: "legacy", tela: "default" };
  }
  const [modulo, ...rest] = normalized.split(".");
  if (rest.length === 0) {
    return { modulo: "legacy", tela: normalized };
  }
  return {
    modulo: modulo || "legacy",
    tela: rest.join(".") || "default",
  };
};

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
    if (readEmpPreferencesText(layoutKey, null)) return;

    const globalLegacy = this.config.legacyGlobalStorageKey
      ? readEmpPreferencesText(this.config.legacyGlobalStorageKey, null)
      : null;
    if (globalLegacy) {
      writeEmpPreferencesText(layoutKey, globalLegacy, { reason: "form-layout:migrate-legacy" });
      return;
    }

    const oldKeys = getLayoutStorageKeys(userId);
    const legacyConfig = readEmpPreferencesText(oldKeys.legacyKey, null);
    if (legacyConfig) {
      writeEmpPreferencesText(layoutKey, legacyConfig, { reason: "form-layout:migrate-legacy" });
    }
  }

  readLocal(userId) {
    this.bindUser(userId);
    this.migrateLegacyKeys(userId);
    const keys = this.getStorageKeys(userId);
    const parsed = readEmpPreferencesJson(keys.layoutKey, null);
    if (!parsed || typeof parsed !== "object") return null;
    const defaults = this.config.getDefaultLayoutConfig();
    const upgraded = migrateStoredLayoutConfig(parsed, defaults);
    return upgraded || parsed;
  }

  writeLocal(userId, config) {
    if (!config) return;
    this.bindUser(userId);
    const keys = this.getStorageKeys(userId);
    writeEmpPreferencesJson(keys.layoutKey, pickLayoutConfig(config), {
      reason: "form-layout:local-write",
    });
    writeEmpPreferencesText(`${keys.layoutKey}__updatedAt`, new Date().toISOString(), {
      reason: "form-layout:local-write",
    });
    if (config.aggregationConfig) {
      writeEmpPreferencesJson(keys.aggregationKey, config.aggregationConfig || {}, {
        reason: "form-layout:local-write",
      });
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
    const { modulo, tela } = parseScopeFromScreenKey(this.config.screenKey);

    try {
      const remote = await userPreferencesApi.getByScope(modulo, tela);
      const activeConfig = remote?.preferencias?.activeConfig;
      if (!activeConfig) return;

      const defaults = this.config.getDefaultLayoutConfig();
      const upgraded = migrateStoredLayoutConfig(activeConfig, defaults);
      if (!upgraded) return;

      const keys = this.getStorageKeys(userId);
      const localUpdatedAt = readEmpPreferencesText(`${keys.layoutKey}__updatedAt`, null);
      const remoteUpdatedAt = remote?.updatedAt ? new Date(remote.updatedAt).getTime() : 0;
      const localTime = localUpdatedAt ? new Date(localUpdatedAt).getTime() : 0;

      if (remoteUpdatedAt >= localTime) {
        this.writeLocal(userId, upgraded);
        if (remote?.updatedAt) {
          writeEmpPreferencesText(`${keys.layoutKey}__serverUpdatedAt`, remote.updatedAt, {
            reason: "form-layout:remote-hydrate",
          });
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
        const { modulo, tela } = parseScopeFromScreenKey(this.config.screenKey);
        const expectedUpdatedAt = readEmpPreferencesText(`${keys.layoutKey}__serverUpdatedAt`, null);
        const saved = await userPreferencesApi.saveByScope(modulo, tela, {
          preferencias: {
            version: 3,
            activeConfig: pickLayoutConfig(activeConfig),
          },
          expectedUpdatedAt,
          versao_schema: 3,
        });
        if (saved?.updatedAt) {
          writeEmpPreferencesText(`${keys.layoutKey}__serverUpdatedAt`, saved.updatedAt, {
            reason: "form-layout:remote-sync",
          });
        }
      } catch (error) {
        if (Number(error?.status) === 409) {
          // Em conflito entre abas, reidrata remoto e preserva edição local para novo retry.
          this.syncRemote(userId);
        }
        console.warn(`[${this.moduleId}] Falha ao sincronizar layout:`, error);
      }
    }, 800);

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
