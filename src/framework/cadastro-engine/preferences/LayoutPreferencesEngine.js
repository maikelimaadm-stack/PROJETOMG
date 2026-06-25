import { userPreferencesApi } from "@/apis/preferences/userPreferencesApi";
import {
  getLayoutHydratedEventName,
  getLayoutStorageKeysForModule,
  getLayoutUpdatedEventName,
} from "../core/CadastroModuleConfig.js";
import {
  pickLayoutConfig,
  bindLayoutStoreUser,
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
const syncStates = new Map();
const REMOTE_SYNC_ALLOWED_ORIGINS = new Set(["user-action", "migration"]);
const SYNC_DEBOUNCE_MS = 350;
const SYNC_RETRY_MS = 1_500;
const FORM_LAYOUT_MIGRATION_MARKER_SUFFIX = "__migrationHashV1";
const FORM_LAYOUT_SERVER_HASH_SUFFIX = "__serverHash";

const normalizeOrigin = (origin) => {
  const normalized = String(origin || "").trim().toLowerCase();
  if (!normalized) return "default-init";
  return normalized;
};

const toObject = (value) =>
  value && typeof value === "object" && !Array.isArray(value) ? value : {};

const normalizeForStableCompare = (value) => {
  if (Array.isArray(value)) return value.map((item) => normalizeForStableCompare(item));
  if (value && typeof value === "object") {
    return Object.keys(value)
      .sort()
      .reduce((acc, key) => {
        acc[key] = normalizeForStableCompare(value[key]);
        return acc;
      }, {});
  }
  return value;
};

const stableStringify = (value) => {
  try {
    return JSON.stringify(normalizeForStableCompare(value ?? null));
  } catch {
    return null;
  }
};

const getSyncState = (timerKey) => {
  if (!syncStates.has(timerKey)) {
    syncStates.set(timerKey, {
      timer: null,
      inFlight: false,
      pendingConfig: null,
      pendingOrigin: null,
    });
  }
  return syncStates.get(timerKey);
};

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
    // Migração de escrita desativada — legado é fallback somente leitura em readLocal().
    void userId;
  }

  readLocal(userId) {
    this.bindUser(userId);
    const keys = this.getStorageKeys(userId);
    let parsed = readEmpPreferencesJson(keys.layoutKey, null);

    if (!parsed || typeof parsed !== "object") {
      const userLegacy = readEmpPreferencesJson(keys.legacyKey, null);
      if (userLegacy && typeof userLegacy === "object") {
        parsed = userLegacy;
      } else if (this.config.legacyGlobalStorageKey) {
        parsed = readEmpPreferencesJson(this.config.legacyGlobalStorageKey, null);
      }
    }

    if (!parsed || typeof parsed !== "object") return null;
    const defaults = this.config.getDefaultLayoutConfig();
    const upgraded = migrateStoredLayoutConfig(parsed, defaults);
    return upgraded || parsed;
  }

  writeLocal(userId, config, { origin = "default-init" } = {}) {
    if (!config) return;
    this.bindUser(userId);
    const normalizedOrigin = normalizeOrigin(origin);
    const reason = `form-layout:${normalizedOrigin}:local-write`;
    const keys = this.getStorageKeys(userId);
    writeEmpPreferencesJson(keys.layoutKey, pickLayoutConfig(config), {
      reason,
    });
    writeEmpPreferencesText(`${keys.layoutKey}__updatedAt`, new Date().toISOString(), {
      reason,
    });
    if (config.aggregationConfig) {
      writeEmpPreferencesJson(keys.aggregationKey, config.aggregationConfig || {}, {
        reason,
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
      this.writeLocal(userId, upgraded, { origin: "migration" });
      return upgraded;
    }
    if (!local) {
      this.writeLocal(userId, defaults, { origin: "default-init" });
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
        this.writeLocal(userId, upgraded, { origin: "hydrate" });
        const stableConfigHash = stableStringify(pickLayoutConfig(upgraded));
        if (remote?.updatedAt) {
          writeEmpPreferencesText(`${keys.layoutKey}__serverUpdatedAt`, remote.updatedAt, {
            reason: "form-layout:remote-hydrate",
          });
        }
        if (remote?.revision != null) {
          writeEmpPreferencesText(`${keys.layoutKey}__serverRevision`, String(remote.revision), {
            reason: "form-layout:remote-hydrate",
          });
        }
        if (stableConfigHash) {
          writeEmpPreferencesText(`${keys.layoutKey}${FORM_LAYOUT_SERVER_HASH_SUFFIX}`, stableConfigHash, {
            reason: "form-layout:remote-hydrate",
          });
        }
        window.dispatchEvent(
          new CustomEvent(this.hydratedEvent, { detail: { userId, moduleId: this.moduleId } })
        );
      }
    } catch (error) {
      if (error?.status !== 404) {
        console.warn(`[${this.moduleId}] Falha ao hidratar layout remoto:`, error);
      }
    }
  }

  async flushSyncState(userId, timerKey) {
    const syncState = syncStates.get(timerKey);
    if (!syncState || syncState.inFlight) return;
    const pendingConfig = syncState.pendingConfig;
    const pendingOrigin = normalizeOrigin(syncState.pendingOrigin);
    if (!pendingConfig || !REMOTE_SYNC_ALLOWED_ORIGINS.has(pendingOrigin)) return;

    syncState.pendingConfig = null;
    syncState.pendingOrigin = null;
    syncState.inFlight = true;

    try {
      const keys = this.getStorageKeys(userId);
      const configToSave = pickLayoutConfig(toObject(pendingConfig));
      const configHash = stableStringify(configToSave);
      if (!configHash) return;

      const serverHashKey = `${keys.layoutKey}${FORM_LAYOUT_SERVER_HASH_SUFFIX}`;
      const migrationHashKey = `${keys.layoutKey}${FORM_LAYOUT_MIGRATION_MARKER_SUFFIX}`;
      const serverHash = readEmpPreferencesText(serverHashKey, null);
      if (serverHash && serverHash === configHash) return;

      if (pendingOrigin === "migration") {
        const migrationHash = readEmpPreferencesText(migrationHashKey, null);
        if (migrationHash && migrationHash === configHash) return;
      }

      const { modulo, tela } = parseScopeFromScreenKey(this.config.screenKey);
      const expectedUpdatedAt = readEmpPreferencesText(`${keys.layoutKey}__serverUpdatedAt`, null);
      const expectedRevisionRaw = readEmpPreferencesText(`${keys.layoutKey}__serverRevision`, null);
      const expectedRevision = Number(expectedRevisionRaw);
      const saved = await userPreferencesApi.saveByScope(modulo, tela, {
        preferencias: {
          version: 3,
          activeConfig: configToSave,
        },
        expectedUpdatedAt,
        expectedRevision: Number.isFinite(expectedRevision) ? expectedRevision : undefined,
        versao_schema: 3,
      });

      if (saved?.updatedAt) {
        writeEmpPreferencesText(`${keys.layoutKey}__serverUpdatedAt`, saved.updatedAt, {
          reason: `form-layout:remote-sync:${pendingOrigin}`,
        });
      }
      if (saved?.revision != null) {
        writeEmpPreferencesText(`${keys.layoutKey}__serverRevision`, String(saved.revision), {
          reason: `form-layout:remote-sync:${pendingOrigin}`,
        });
      }
      writeEmpPreferencesText(serverHashKey, configHash, {
        reason: `form-layout:remote-sync:${pendingOrigin}`,
      });
      if (pendingOrigin === "migration") {
        writeEmpPreferencesText(migrationHashKey, configHash, {
          reason: "form-layout:migration-marker",
        });
      }
    } catch (error) {
      if (Number(error?.status) === 409) {
        // Reidrata em caso de conflito e mantém patch pendente para um único retry.
        await this.syncRemote(userId);
      }
      syncState.pendingConfig = syncState.pendingConfig || pendingConfig;
      syncState.pendingOrigin =
        syncState.pendingOrigin === "user-action" || pendingOrigin === "user-action"
          ? "user-action"
          : pendingOrigin;
      if (!syncState.timer) {
        syncState.timer = setTimeout(() => {
          syncState.timer = null;
          void this.flushSyncState(userId, timerKey);
        }, SYNC_RETRY_MS);
      }
      console.warn(`[${this.moduleId}] Falha ao sincronizar layout:`, error);
    } finally {
      syncState.inFlight = false;
      if (!syncState.timer && syncState.pendingConfig) {
        syncState.timer = setTimeout(() => {
          syncState.timer = null;
          void this.flushSyncState(userId, timerKey);
        }, SYNC_DEBOUNCE_MS);
      }
    }
  }

  scheduleSync(userId = boundUserId, { origin = "user-action", config = null } = {}) {
    if (!userId || isLocalPersonalizacoesMode()) return;
    const normalizedOrigin = normalizeOrigin(origin);
    if (!REMOTE_SYNC_ALLOWED_ORIGINS.has(normalizedOrigin)) return;
    const sourceConfig = config && typeof config === "object" ? config : this.readLocal(userId);
    if (!sourceConfig || typeof sourceConfig !== "object") return;
    const activeConfig = pickLayoutConfig(sourceConfig);
    const stableConfigHash = stableStringify(activeConfig);
    if (!stableConfigHash) return;

    const keys = this.getStorageKeys(userId);
    const serverHash = readEmpPreferencesText(`${keys.layoutKey}${FORM_LAYOUT_SERVER_HASH_SUFFIX}`, null);
    if (serverHash && serverHash === stableConfigHash) return;

    if (normalizedOrigin === "migration") {
      const migrationHash = readEmpPreferencesText(
        `${keys.layoutKey}${FORM_LAYOUT_MIGRATION_MARKER_SUFFIX}`,
        null
      );
      if (migrationHash && migrationHash === stableConfigHash) return;
    }

    const timerKey = `${this.moduleId}:${userId}`;
    const syncState = getSyncState(timerKey);
    syncState.pendingConfig = activeConfig;
    syncState.pendingOrigin =
      syncState.pendingOrigin === "user-action" || normalizedOrigin === "user-action"
        ? "user-action"
        : normalizedOrigin;

    if (syncState.inFlight) return;
    if (syncState.timer) clearTimeout(syncState.timer);
    syncState.timer = setTimeout(() => {
      syncState.timer = null;
      void this.flushSyncState(userId, timerKey);
    }, SYNC_DEBOUNCE_MS);
  }

  resetSyncState() {
    syncStates.forEach((state) => {
      if (state.timer) clearTimeout(state.timer);
    });
    syncStates.clear();
    boundUserId = null;
    bindLayoutStoreUser(null);
  }

  apply(userId, config, layoutEngine, { origin = "user-action" } = {}) {
    const defaults = this.config.getDefaultLayoutConfig();
    const ensured =
      layoutEngine.ensureFields(config, { knownFieldIds: config.knownFieldIds }) || defaults;
    const normalized = layoutEngine.normalize(ensured, {
      basePanels: this.config.basePanels,
      defaultLayout: this.config.defaultFlatLayout,
    });
    this.writeLocal(userId, normalized, { origin });
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
