/**
 * Bootstrap de preferências por módulo — paridade com useEmpresasPreferencesBootstrap.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { userPreferencesApi } from "@/apis/preferences/userPreferencesApi";
import { showInfo } from "@/shared/feedback";
import { useAuth } from "@/shared/contexts/AuthContext";
import {
  broadcastMakPreferencesCrossTab,
  subscribeMakPreferencesCrossTab,
} from "./makPreferencesCrossTab.js";
import { registerMakPreferencesFlushHandler } from "./makPreferencesFlushRegistry.js";
import { dispatchMakPreferencesBootstrapApplied } from "./makModulePreferencesBootstrapEvents.js";
import { buildMakPreferencesBootstrapQueryKey } from "./makModulePreferencesQueryKeys.js";

const LISTAGEM_SECTIONS = ["table", "cards", "filtersConfig", "view"];
const PREFERENCES_SYNC_DEBOUNCE_MS = 100;
const PREFERENCES_SYNC_RETRY_MS = 1_500;
const MAX_CONFLICT_RETRIES = 3;

const parseBooleanEnv = (value) => {
  const normalized = String(value ?? "").trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
};

const isPreferencesV2Enabled = () =>
  parseBooleanEnv(import.meta.env.VITE_MAK_PREFERENCES_V2_ENABLED) ||
  parseBooleanEnv(import.meta.env.VITE_EMPRESAS_PREFERENCES_V2_ENABLED);

const toObject = (value) =>
  value && typeof value === "object" && !Array.isArray(value) ? value : {};

const deepMergeObjects = (baseValue, patchValue) => {
  if (patchValue === undefined) return baseValue;
  if (patchValue === null) return undefined;
  if (Array.isArray(patchValue)) return [...patchValue];
  if (!patchValue || typeof patchValue !== "object") return patchValue;
  const base = toObject(baseValue);
  const merged = { ...base };
  Object.entries(patchValue).forEach(([key, value]) => {
    const next = deepMergeObjects(base[key], value);
    if (next === undefined) delete merged[key];
    else merged[key] = next;
  });
  return merged;
};

const mergePatchState = (currentPatch, nextPatch) =>
  toObject(deepMergeObjects(toObject(currentPatch), toObject(nextPatch)));

const shouldIgnoreReason = (reason = "") => {
  const normalized = String(reason || "").toLowerCase();
  return (
    normalized.includes("hydrate") ||
    normalized.includes("bootstrap") ||
    normalized.includes("batch") ||
    normalized.includes("migration") ||
    normalized.includes("remote-tab") ||
    normalized.includes("remote-sync")
  );
};

const sectionsFromReason = (reason = "") => {
  const normalized = String(reason || "").toLowerCase();
  if (!normalized || normalized.includes("flush-all")) return [...LISTAGEM_SECTIONS];
  if (normalized === "storage") return [...LISTAGEM_SECTIONS];
  if (normalized.includes("temp-filters")) return [];
  if (normalized.includes("cards")) return ["cards"];
  if (
    normalized.includes("filter-fields") ||
    normalized.includes("filter-layout") ||
    normalized.includes("filter-max") ||
    normalized.includes("dropdown") ||
    normalized.includes("favorites") ||
    normalized.includes("filter-operators")
  ) {
    return ["filtersConfig"];
  }
  if (normalized.includes("view-mode") || normalized.includes("panel-style")) return ["view"];
  if (normalized.includes("table") || normalized.includes("load-batch") || normalized.includes("page-size")) {
    return ["table"];
  }
  return [];
};

const normalizeSections = (sections = []) => {
  const raw = Array.isArray(sections) ? sections : [sections];
  return [
    ...new Set(
      raw
        .map((section) => String(section || "").trim())
        .filter((section) => LISTAGEM_SECTIONS.includes(section))
    ),
  ];
};

const extractRevision = (record) => {
  const revision = Number(record?.revision ?? record?.preferencias?.meta?.revision);
  if (!Number.isFinite(revision) || revision < 0) return 0;
  return Math.floor(revision);
};

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

const sameJson = (left, right) =>
  JSON.stringify(normalizeForStableCompare(left ?? null)) ===
  JSON.stringify(normalizeForStableCompare(right ?? null));

const isListagemSyncReason = (reason = "") => {
  const normalized = String(reason || "").toLowerCase();
  if (!normalized) return false;
  return (
    normalized === "storage" ||
    normalized.startsWith("listagem:") ||
    normalized.includes("flush-all") ||
    normalized.includes("retry")
  );
};

const withStatus = (message, statusCode) => {
  const error = /** @type {any} */ (new Error(message));
  error.status = statusCode;
  return error;
};

export function createMakModulePreferencesBootstrapHook({
  moduleId,
  storage,
  scopeState,
  bootstrapTimeoutMs = 3_000,
}) {
  const LISTAGEM_SCOPE_KEY = `${storage.listagemScope.modulo}.${storage.listagemScope.tela}`;

  return function useMakModulePreferencesBootstrap(userId) {
    const { cliente } = useAuth();
    const clienteId = cliente?.id || null;
    const queryClient = useQueryClient();
    const bootstrapQueryKey = buildMakPreferencesBootstrapQueryKey(moduleId, clienteId, userId);

    const [bootstrapStatus, setBootstrapStatus] = useState("idle");
    const [preferencesReady, setPreferencesReady] = useState(false);
    const [bootstrapGeneration, setBootstrapGeneration] = useState(0);
    const [syncError, setSyncError] = useState(null);

    const listagemUpdatedAtRef = useRef(null);
    const listagemRevisionRef = useRef(0);
    const listagemSyncTimerRef = useRef(null);
    const listagemRetryTimerRef = useRef(null);
    const syncInFlightRef = useRef(false);
    const pendingDrainRef = useRef(false);
    const pendingPatchRef = useRef({});
    const conflictRetryCountRef = useRef(0);
    const lastSyncedPreferencesRef = useRef({});
    const hadLocalSnapshotRef = useRef(false);

    const bumpBootstrapGeneration = useCallback(
      (status) => {
        if (!isPreferencesV2Enabled()) return;
        setBootstrapGeneration((current) => {
          const next = current + 1;
          dispatchMakPreferencesBootstrapApplied(moduleId, {
            generation: next,
            status,
            hadLocalSnapshot: hadLocalSnapshotRef.current,
            clienteId,
            userId,
          });
          return next;
        });
      },
      [clienteId, userId]
    );

    const markPreferencesReady = useCallback(
      (status, { emitGeneration = false } = {}) => {
        setBootstrapStatus(status);
        setPreferencesReady(true);
        if (emitGeneration && isPreferencesV2Enabled()) {
          bumpBootstrapGeneration(status);
        }
      },
      [bumpBootstrapGeneration]
    );

    const bootstrapQuery = useQuery({
      queryKey: bootstrapQueryKey,
      queryFn: () => userPreferencesApi.bootstrap(),
      enabled: Boolean(userId && clienteId),
      staleTime: 10 * 60_000,
      gcTime: 30 * 60_000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: 1,
    });

    const hydrateListagemRecord = useCallback(
      (record, { emitCrossTab = false, sectionsChanged = LISTAGEM_SECTIONS } = {}) => {
        if (!record?.preferencias) return false;
        const currentSnapshot = storage.buildListagemPreferencesFromStorage();
        const incoming = toObject(record.preferencias);
        const mergedPreview = deepMergeObjects(currentSnapshot, incoming);
        if (sameJson(currentSnapshot, mergedPreview)) {
          listagemUpdatedAtRef.current = record.updatedAt || listagemUpdatedAtRef.current;
          listagemRevisionRef.current = extractRevision(record);
          lastSyncedPreferencesRef.current = toObject(record.preferencias);
          return false;
        }
        const hasLocalSnapshot = storage.hasScopedListagemPreferences();
        const visualChange = hasLocalSnapshot
          ? storage.applyRemoteListagemPreferencesToStorage(record.preferencias)
          : storage.applyListagemPreferencesToStorage(record.preferencias, { reason: "listagem:hydrate" });
        listagemUpdatedAtRef.current = record.updatedAt || null;
        listagemRevisionRef.current = extractRevision(record);
        lastSyncedPreferencesRef.current = toObject(record.preferencias);
        scopeState.setRemoteRevision(listagemRevisionRef.current, listagemUpdatedAtRef.current);
        if (!visualChange) return false;
        if (emitCrossTab && isPreferencesV2Enabled()) {
          broadcastMakPreferencesCrossTab({
            moduleId,
            modulo: storage.listagemScope.modulo,
            tela: storage.listagemScope.tela,
            clienteId,
            userId,
            revision: listagemRevisionRef.current,
            sectionsChanged,
            reason: "remote-sync",
          });
        }
        return true;
      },
      [clienteId, userId]
    );

    const patchBootstrapCache = useCallback(
      (record) => {
        queryClient.setQueryData(bootstrapQueryKey, (previous) => {
          const previousData =
            previous && typeof previous === "object" && !Array.isArray(previous) ? previous : {};
          const records = Array.isArray(previousData.preferences) ? [...previousData.preferences] : [];
          const index = records.findIndex(
            (item) => `${item?.modulo}.${item?.tela}` === LISTAGEM_SCOPE_KEY
          );
          if (index >= 0) records[index] = record;
          else records.push(record);
          return { ...previousData, preferences: records };
        });
      },
      [bootstrapQueryKey, queryClient]
    );

    const applyBootstrapToStorage = useCallback(
      (payload) => {
        const mapped = storage.mapBootstrapPreferences(payload);
        const listagemRecord = mapped[LISTAGEM_SCOPE_KEY];
        if (listagemRecord?.preferencias) {
          hydrateListagemRecord(listagemRecord);
        }
        return mapped;
      },
      [hydrateListagemRecord]
    );

    const migrateScopedLocalPreferencesIfNeeded = useCallback(
      async (mapped) => {
        if (!userId || !clienteId || storage.isPreferencesMigrated(userId)) return mapped;
        let shouldRefetch = false;
        if (!mapped[LISTAGEM_SCOPE_KEY] && storage.hasScopedListagemPreferences()) {
          const listagemPayload = storage.buildListagemPreferencesFromStorage();
          await userPreferencesApi.saveByScope(
            storage.listagemScope.modulo,
            storage.listagemScope.tela,
            {
              versao_schema: Number(listagemPayload?.version) || 1,
              preferencias: listagemPayload,
            }
          );
          shouldRefetch = true;
        }
        storage.markPreferencesMigrated(userId);
        if (!shouldRefetch) return mapped;
        return queryClient.fetchQuery({
          queryKey: bootstrapQueryKey,
          queryFn: () => userPreferencesApi.bootstrap(),
          staleTime: 0,
        }).then((payload) => storage.mapBootstrapPreferences(payload));
      },
      [bootstrapQueryKey, clienteId, queryClient, userId]
    );

    useEffect(() => {
      if (!userId || !clienteId) {
        setPreferencesReady(false);
        setBootstrapStatus("idle");
        return;
      }
      scopeState.bindScopeState({ clienteId, userId });
    }, [clienteId, userId]);

    useEffect(() => {
      if (!userId || !clienteId) return;
      if (bootstrapQuery.isLoading) return;
      if (bootstrapQuery.isError) {
        hadLocalSnapshotRef.current = storage.hasScopedListagemPreferences();
        markPreferencesReady(hadLocalSnapshotRef.current ? "fallback_local" : "defaults", {
          emitGeneration: true,
        });
        return;
      }
      if (!bootstrapQuery.isFetched) return;

      const run = async () => {
        try {
          hadLocalSnapshotRef.current = storage.hasScopedListagemPreferences();
          const mapped = await migrateScopedLocalPreferencesIfNeeded(
            storage.mapBootstrapPreferences(bootstrapQuery.data)
          );
          applyBootstrapToStorage({ preferences: Object.values(mapped) });
          markPreferencesReady(
            hadLocalSnapshotRef.current ? "local_applied" : "remote_applied",
            { emitGeneration: true }
          );
        } catch {
          markPreferencesReady("fallback_local", { emitGeneration: true });
        }
      };

      const timer = setTimeout(() => {
        void run();
      }, 0);
      return () => clearTimeout(timer);
    }, [
      applyBootstrapToStorage,
      bootstrapQuery.data,
      bootstrapQuery.isError,
      bootstrapQuery.isFetched,
      bootstrapQuery.isLoading,
      clienteId,
      markPreferencesReady,
      migrateScopedLocalPreferencesIfNeeded,
      userId,
    ]);

    const queueSectionsPatch = useCallback((sections = []) => {
      const normalized = normalizeSections(sections);
      if (normalized.length === 0) return;
      const snapshot = storage.buildListagemPreferencesFromStorage();
      const patch = {};
      normalized.forEach((section) => {
        patch[section] = snapshot[section];
      });
      pendingPatchRef.current = mergePatchState(pendingPatchRef.current, patch);
    }, []);

    const persistQueuedPatches = useCallback(async () => {
      if (!userId || !clienteId || syncInFlightRef.current) return;
      const pending = toObject(pendingPatchRef.current);
      const sections = Object.keys(pending).filter((section) => LISTAGEM_SECTIONS.includes(section));
      if (sections.length === 0) return;

      syncInFlightRef.current = true;
      scopeState.setSyncStatus("saving");
      try {
        const listagemPayload = storage.buildListagemPreferencesFromStorage();
        const response = await userPreferencesApi.saveByScope(
          storage.listagemScope.modulo,
          storage.listagemScope.tela,
          {
            versao_schema: Number(listagemPayload?.version) || 1,
            preferencias: listagemPayload,
            revision: listagemRevisionRef.current,
          }
        );
        listagemRevisionRef.current = extractRevision(response);
        listagemUpdatedAtRef.current = response?.updatedAt || listagemUpdatedAtRef.current;
        lastSyncedPreferencesRef.current = listagemPayload;
        sections.forEach((section) => scopeState.clearSectionDirty(section));
        scopeState.setSyncStatus("saved");
        patchBootstrapCache(response);
        pendingPatchRef.current = {};
        conflictRetryCountRef.current = 0;
        setSyncError(null);
      } catch (error) {
        scopeState.setSyncStatus("error");
        if (Number(error?.status) === 409) {
          conflictRetryCountRef.current += 1;
          if (conflictRetryCountRef.current <= MAX_CONFLICT_RETRIES) {
            setSyncError(null);
            return;
          }
        }
        setSyncError(error);
        if (isPreferencesV2Enabled()) throw error;
      } finally {
        syncInFlightRef.current = false;
        const hasPending = Object.keys(toObject(pendingPatchRef.current)).length > 0;
        if (pendingDrainRef.current || hasPending) {
          pendingDrainRef.current = false;
          queueMicrotask(() => {
            void persistQueuedPatches();
          });
        }
      }
    }, [clienteId, patchBootstrapCache, userId]);

    const scheduleListagemSync = useCallback(
      ({ immediate = false, reason = "", sections = [] } = {}) => {
        if (shouldIgnoreReason(reason)) return;
        const hasExplicitSections = Array.isArray(sections) ? sections.length > 0 : Boolean(sections);
        if (!hasExplicitSections && !isListagemSyncReason(reason)) return;
        const resolvedSections = normalizeSections(
          sections.length > 0 ? sections : sectionsFromReason(reason)
        );
        if (resolvedSections.length === 0) return;
        queueSectionsPatch(resolvedSections);

        if (listagemSyncTimerRef.current) {
          clearTimeout(listagemSyncTimerRef.current);
          listagemSyncTimerRef.current = null;
        }
        if (listagemRetryTimerRef.current) {
          clearTimeout(listagemRetryTimerRef.current);
          listagemRetryTimerRef.current = null;
        }

        const runner = async () => {
          try {
            await persistQueuedPatches();
            if (Object.keys(toObject(pendingPatchRef.current)).length > 0) {
              await persistQueuedPatches();
            }
          } catch (error) {
            listagemRetryTimerRef.current = setTimeout(() => {
              listagemRetryTimerRef.current = null;
              scheduleListagemSync({ immediate: true, reason: "listagem:retry" });
            }, PREFERENCES_SYNC_RETRY_MS);
            if (Number(error?.status) === 409) return;
          }
        };

        if (immediate) {
          void runner();
          return;
        }

        listagemSyncTimerRef.current = setTimeout(() => {
          listagemSyncTimerRef.current = null;
          void runner();
        }, PREFERENCES_SYNC_DEBOUNCE_MS);
      },
      [persistQueuedPatches, queueSectionsPatch]
    );

    useEffect(() => {
      if (!isPreferencesV2Enabled()) return undefined;
      registerMakPreferencesFlushHandler(moduleId, async () => {
        scheduleListagemSync({ immediate: true, reason: "listagem:flush-all" });
        await persistQueuedPatches();
      });
      return () => registerMakPreferencesFlushHandler(moduleId, null);
    }, [persistQueuedPatches, scheduleListagemSync]);

    useEffect(() => {
      if (!userId || !clienteId) return undefined;
      const flushNow = () => {
        scheduleListagemSync({ immediate: true, reason: "listagem:flush-all" });
      };
      const onVisibilityChange = () => {
        if (document.visibilityState === "hidden") flushNow();
      };
      window.addEventListener("beforeunload", flushNow);
      window.addEventListener("pagehide", flushNow);
      document.addEventListener("visibilitychange", onVisibilityChange);
      window.addEventListener(`${moduleId}-preferences-flush`, flushNow);
      return () => {
        window.removeEventListener("beforeunload", flushNow);
        window.removeEventListener("pagehide", flushNow);
        document.removeEventListener("visibilitychange", onVisibilityChange);
        window.removeEventListener(`${moduleId}-preferences-flush`, flushNow);
      };
    }, [clienteId, scheduleListagemSync, userId]);

    useEffect(
      () => () => {
        if (listagemSyncTimerRef.current) clearTimeout(listagemSyncTimerRef.current);
        if (listagemRetryTimerRef.current) clearTimeout(listagemRetryTimerRef.current);
      },
      []
    );

    useEffect(() => {
      if (!userId || !clienteId) return undefined;
      return subscribeMakPreferencesCrossTab(moduleId, (payload) => {
        if (!payload?.sectionsChanged?.length) return;
        const record = {
          preferencias: storage.buildListagemPreferencesFromStorage(),
          updatedAt: payload.timestamp,
          revision: payload.revision,
        };
        hydrateListagemRecord(record, {
          emitCrossTab: false,
          sectionsChanged: payload.sectionsChanged,
        });
      });
    }, [clienteId, hydrateListagemRecord, userId]);

    const flushListagemSync = useCallback(() => {
      scheduleListagemSync({ immediate: true, reason: "listagem:flush-all" });
    }, [scheduleListagemSync]);

    return {
      moduleId,
      isReady: preferencesReady,
      preferencesReady,
      bootstrapStatus,
      bootstrapGeneration,
      isLoading: false,
      error: bootstrapQuery.error || syncError,
      scheduleListagemSync,
      flushListagemSync,
      refresh: bootstrapQuery.refetch,
    };
  };
}

export const assertMakPreferencesSyncConflict = (error) => {
  if (Number(error?.status) !== 409) return false;
  throw withStatus("Conflito de preferência entre abas detectado.", 409);
};

export default createMakModulePreferencesBootstrapHook;
