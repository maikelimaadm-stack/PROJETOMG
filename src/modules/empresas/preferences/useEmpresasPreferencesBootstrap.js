import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { userPreferencesApi } from "@/apis/preferences/userPreferencesApi";
import { showInfo } from "@/shared/feedback";
import { empresasPreferencesBootstrapQueryKey } from "@/modules/empresas/preferences/empresasPreferencesQueryKeys";
import {
  EMPRESAS_FORM_SCOPE,
  EMPRESAS_LISTAGEM_SCOPE,
  applyFormLayoutPreferencesToStorage,
  applyListagemPreferencesPatchToStorage,
  applyListagemPreferencesToStorage,
  applyRemoteListagemPreferencesToStorage,
  buildFormLayoutPreferencesFromStorage,
  buildListagemPreferencesFromStorage,
  hasScopedListagemPreferences,
  isEmpPreferencesMigrated,
  mapBootstrapPreferences,
  markEmpPreferencesMigrated,
} from "@/modules/empresas/preferences/empresasPreferencesStorage";
import { dispatchEmpPreferencesBootstrapApplied } from "@/modules/empresas/preferences/empresasPreferencesBootstrapEvents";
import {
  broadcastEmpPreferencesCrossTab,
  subscribeEmpPreferencesCrossTab,
} from "@/modules/empresas/preferences/empresasPreferencesCrossTab";
import { registerEmpPreferencesFlushHandler } from "@/modules/empresas/preferences/empresasPreferencesFlush";
import {
  clearEmpPreferencesSectionDirty,
  setEmpPreferencesHydrationSource,
  setEmpPreferencesRemoteRevision,
  setEmpPreferencesSyncStatus,
} from "@/modules/empresas/preferences/empresasPreferencesScopeState";
import {
  EMPRESAS_PREFERENCES_BOOTSTRAP_TIMEOUT_MS,
  isEmpresasPreferencesV2Enabled,
} from "@/modules/empresas/preferences/empresasPreferencesFeatureFlags";
import { markEmpPreferencesPerf } from "@/modules/empresas/preferences/empresasPreferencesPerfMarks";
import { useAuth } from "@/shared/contexts/AuthContext";

const LISTAGEM_SCOPE_KEY = `${EMPRESAS_LISTAGEM_SCOPE.modulo}.${EMPRESAS_LISTAGEM_SCOPE.tela}`;
const FORM_SCOPE_KEY = `${EMPRESAS_FORM_SCOPE.modulo}.${EMPRESAS_FORM_SCOPE.tela}`;
const LISTAGEM_SECTIONS = ["table", "cards", "filtersConfig"];
const PREFERENCES_SYNC_DEBOUNCE_MS = 350;
const PREFERENCES_SYNC_RETRY_MS = 1_500;
const MAX_CONFLICT_RETRIES = 3;

const withStatus = (message, statusCode) => {
  const error = /** @type {any} */ (new Error(message));
  error.status = statusCode;
  return error;
};

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
    if (next === undefined) {
      delete merged[key];
      return;
    }
    merged[key] = next;
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
  if (normalized.includes("view-mode") || normalized.includes("panel-style")) return [];
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

export function useEmpresasPreferencesBootstrap(userId) {
  const { cliente } = useAuth();
  const clienteId = cliente?.id || null;
  const queryClient = useQueryClient();
  const bootstrapQueryKey = empresasPreferencesBootstrapQueryKey(clienteId, userId);

  const [bootstrapStatus, setBootstrapStatus] = useState("idle");
  const [preferencesReady, setPreferencesReady] = useState(false);
  const [bootstrapGeneration, setBootstrapGeneration] = useState(0);
  const [syncError, setSyncError] = useState(null);

  const listagemUpdatedAtRef = useRef(null);
  const listagemRevisionRef = useRef(0);
  const listagemSyncTimerRef = useRef(null);
  const listagemRetryTimerRef = useRef(null);
  const syncInFlightRef = useRef(false);
  const pendingPatchRef = useRef({});
  const conflictRetryCountRef = useRef(0);
  const lastSyncedPreferencesRef = useRef({});
  const hadLocalSnapshotRef = useRef(false);
  const remoteConflictNoticeRef = useRef("");

  const bumpBootstrapGeneration = useCallback(
    (status) => {
      if (!isEmpresasPreferencesV2Enabled()) return;
      setBootstrapGeneration((current) => {
        const next = current + 1;
        dispatchEmpPreferencesBootstrapApplied({
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

  const markPreferencesReady = useCallback((status, { emitGeneration = false } = {}) => {
    setBootstrapStatus(status);
    setPreferencesReady(true);
    if (emitGeneration && isEmpresasPreferencesV2Enabled()) {
      bumpBootstrapGeneration(status);
    }
  }, [bumpBootstrapGeneration]);

  const bootstrapQuery = useQuery({
    queryKey: bootstrapQueryKey,
    queryFn: () => {
      markEmpPreferencesPerf("PREF_REMOTE_GET_START", {
        section: "table",
        source: "remote",
        tela: "listagem",
      });
      return userPreferencesApi.bootstrap().then((payload) => {
        markEmpPreferencesPerf("PREF_REMOTE_GET_END", {
          section: "table",
          source: "remote",
          tela: "listagem",
        });
        return payload;
      });
    },
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
      const currentSnapshot = buildListagemPreferencesFromStorage();
      const incoming = toObject(record.preferencias);
      const mergedPreview = deepMergeObjects(currentSnapshot, incoming);
      if (sameJson(currentSnapshot, mergedPreview)) {
        listagemUpdatedAtRef.current = record.updatedAt || listagemUpdatedAtRef.current;
        listagemRevisionRef.current = extractRevision(record);
        lastSyncedPreferencesRef.current = toObject(record.preferencias);
        return false;
      }
      const hasLocalSnapshot = hasScopedListagemPreferences();
      const visualChange = hasLocalSnapshot
        ? applyRemoteListagemPreferencesToStorage(record.preferencias)
        : applyListagemPreferencesToStorage(record.preferencias, { reason: "listagem:hydrate" });
      listagemUpdatedAtRef.current = record.updatedAt || null;
      listagemRevisionRef.current = extractRevision(record);
      lastSyncedPreferencesRef.current = toObject(record.preferencias);
      setEmpPreferencesRemoteRevision(listagemRevisionRef.current, listagemUpdatedAtRef.current);
      if (!visualChange) return false;
      if (emitCrossTab && isEmpresasPreferencesV2Enabled()) {
        broadcastEmpPreferencesCrossTab({
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
        const records = Array.isArray(previousData.preferences)
          ? [...previousData.preferences]
          : [];
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
      const mapped = mapBootstrapPreferences(payload);
      const listagemRecord = mapped[LISTAGEM_SCOPE_KEY];
      const formRecord = mapped[FORM_SCOPE_KEY];

      if (listagemRecord?.preferencias) {
        hydrateListagemRecord(listagemRecord);
      }

      if (formRecord?.preferencias) {
        applyFormLayoutPreferencesToStorage(
          userId,
          formRecord.preferencias,
          formRecord.updatedAt,
          clienteId,
          formRecord.revision
        );
      }

      return mapped;
    },
    [clienteId, hydrateListagemRecord, userId]
  );

  const migrateScopedLocalPreferencesIfNeeded = useCallback(
    async (mapped) => {
      if (!userId || !clienteId || isEmpPreferencesMigrated(userId)) return mapped;

      let shouldRefetch = false;

      if (!mapped[LISTAGEM_SCOPE_KEY] && hasScopedListagemPreferences()) {
        const listagemPayload = buildListagemPreferencesFromStorage();
        await userPreferencesApi.saveByScope(
          EMPRESAS_LISTAGEM_SCOPE.modulo,
          EMPRESAS_LISTAGEM_SCOPE.tela,
          {
            versao_schema: Number(listagemPayload?.version) || 1,
            preferencias: listagemPayload,
          }
        );
        shouldRefetch = true;
      }

      if (!mapped[FORM_SCOPE_KEY]) {
        const formPayload = buildFormLayoutPreferencesFromStorage(userId, clienteId);
        if (formPayload) {
          await userPreferencesApi.saveByScope(
            EMPRESAS_FORM_SCOPE.modulo,
            EMPRESAS_FORM_SCOPE.tela,
            {
              versao_schema: Number(formPayload?.version) || 1,
              preferencias: formPayload,
            }
          );
          shouldRefetch = true;
        }
      }

      markEmpPreferencesMigrated(userId);
      if (!shouldRefetch) return mapped;

      const refreshed = await queryClient.fetchQuery({
        queryKey: bootstrapQueryKey,
        queryFn: () => userPreferencesApi.bootstrap(),
      });
      return mapBootstrapPreferences(refreshed);
    },
    [bootstrapQueryKey, clienteId, queryClient, userId]
  );

  useEffect(() => {
    if (!userId || !clienteId) {
      setBootstrapStatus("idle");
      setPreferencesReady(false);
      setBootstrapGeneration(0);
      setSyncError(null);
      listagemUpdatedAtRef.current = null;
      listagemRevisionRef.current = 0;
      pendingPatchRef.current = {};
      hadLocalSnapshotRef.current = false;
      lastSyncedPreferencesRef.current = {};
      return;
    }

    const hasLocal = hasScopedListagemPreferences();
    hadLocalSnapshotRef.current = hasLocal;
    if (hasLocal) {
      lastSyncedPreferencesRef.current = buildListagemPreferencesFromStorage();
    }
    setEmpPreferencesHydrationSource(hasLocal ? "local" : "defaults");
    setEmpPreferencesSyncStatus("idle");
    markEmpPreferencesPerf("PREF_SCOPE_READY", {
      source: hasLocal ? "local" : "defaults",
      dirty: false,
    });
    if (!hasLocal) {
      markEmpPreferencesPerf("PREF_DEFAULTS_CREATED", {
        source: "defaults",
      });
    }
    // P0: nunca bloquear a UI — liberar imediatamente com snapshot local ou defaults.
    markPreferencesReady(hasLocal ? "local_applied" : "defaults", {
      emitGeneration: isEmpresasPreferencesV2Enabled() && hasLocal,
    });
    if (!hasLocal) {
      setBootstrapStatus("remote_loading");
    }
    setSyncError(null);
  }, [bootstrapQueryKey, clienteId, markPreferencesReady, userId]);

  useEffect(() => {
    if (!userId || !clienteId || !bootstrapQuery.isSuccess) return;

    let isMounted = true;
    (async () => {
      try {
        setBootstrapStatus((current) =>
          current === "local_applied" ? current : "remote_loading"
        );
        const mappedPreview = mapBootstrapPreferences(bootstrapQuery.data);
        const previewListagem = mappedPreview[LISTAGEM_SCOPE_KEY];
        const remoteListagemChanged = Boolean(
          previewListagem?.preferencias &&
            !sameJson(
              buildListagemPreferencesFromStorage(),
              deepMergeObjects(
                buildListagemPreferencesFromStorage(),
                previewListagem.preferencias
              )
            )
        );
        const mapped = applyBootstrapToStorage(bootstrapQuery.data);
        const migratedMap = await migrateScopedLocalPreferencesIfNeeded(mapped);
        if (migratedMap !== mapped) {
          const listagemRecord = migratedMap[LISTAGEM_SCOPE_KEY];
          const formRecord = migratedMap[FORM_SCOPE_KEY];
          if (listagemRecord?.preferencias) {
            hydrateListagemRecord(listagemRecord);
          }
          if (formRecord?.preferencias) {
            applyFormLayoutPreferencesToStorage(
              userId,
              formRecord.preferencias,
              formRecord.updatedAt,
              clienteId,
              formRecord.revision
            );
          }
        }

        if (!isMounted) return;
        markPreferencesReady("remote_applied", {
          emitGeneration:
            isEmpresasPreferencesV2Enabled() &&
            remoteListagemChanged &&
            !hadLocalSnapshotRef.current,
        });
        setEmpPreferencesHydrationSource(hadLocalSnapshotRef.current ? "local" : "remote");
        if (userId && !mapped[FORM_SCOPE_KEY]) {
          window.dispatchEvent(
            new CustomEvent("cadastro-layout-hydrated:empresas", {
              detail: { userId, clienteId, moduleId: "empresas" },
            })
          );
        }
      } catch (error) {
        if (!isMounted) return;
        setSyncError(error);
        markPreferencesReady(hadLocalSnapshotRef.current ? "fallback_local" : "defaults", {
          emitGeneration:
            isEmpresasPreferencesV2Enabled() && !hadLocalSnapshotRef.current,
        });
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [
    applyBootstrapToStorage,
    bootstrapQuery.data,
    bootstrapQuery.isSuccess,
    clienteId,
    hydrateListagemRecord,
    markPreferencesReady,
    migrateScopedLocalPreferencesIfNeeded,
    userId,
  ]);

  useEffect(() => {
    if (!userId || !clienteId || preferencesReady) return undefined;
    const timeoutId = window.setTimeout(() => {
      markPreferencesReady(hadLocalSnapshotRef.current ? "fallback_local" : "defaults", {
        emitGeneration: isEmpresasPreferencesV2Enabled(),
      });
    }, EMPRESAS_PREFERENCES_BOOTSTRAP_TIMEOUT_MS);
    return () => window.clearTimeout(timeoutId);
  }, [clienteId, markPreferencesReady, preferencesReady, userId]);

  useEffect(() => {
    if (!bootstrapQuery.isError) return;
    if (!preferencesReady) {
      markPreferencesReady(hadLocalSnapshotRef.current ? "fallback_local" : "defaults", {
        emitGeneration:
          isEmpresasPreferencesV2Enabled() && !hadLocalSnapshotRef.current,
      });
    }
    setSyncError(bootstrapQuery.error);
  }, [bootstrapQuery.error, bootstrapQuery.isError, markPreferencesReady, preferencesReady]);

  useEffect(() => {
    if (!isEmpresasPreferencesV2Enabled() || !userId || !clienteId) return undefined;
    return subscribeEmpPreferencesCrossTab(async (payload = {}) => {
      try {
        const remoteRevision = Number(payload.revision);
        if (
          Number.isFinite(remoteRevision) &&
          remoteRevision <= listagemRevisionRef.current &&
          remoteRevision > 0
        ) {
          return;
        }
        const refreshed = await queryClient.fetchQuery({
          queryKey: bootstrapQueryKey,
          queryFn: () => userPreferencesApi.bootstrap(),
          staleTime: 0,
        });
        const mapped = mapBootstrapPreferences(refreshed);
        const listagemRecord = mapped[LISTAGEM_SCOPE_KEY];
        if (!listagemRecord?.preferencias) return;
        const changed = hydrateListagemRecord(listagemRecord, {
          emitCrossTab: false,
          sectionsChanged: payload.sectionsChanged || LISTAGEM_SECTIONS,
        });
        if (!changed) return;
        bumpBootstrapGeneration("remote_applied");
        const noticeKey = `${payload.revision || "remote"}:${(payload.sectionsChanged || []).join(",")}`;
        if (remoteConflictNoticeRef.current !== noticeKey) {
          remoteConflictNoticeRef.current = noticeKey;
          showInfo("Preferência atualizada em outra aba.");
        }
      } catch {
        // Falha de sync entre abas não deve bloquear a UI local.
      }
    });
  }, [
    bootstrapQueryKey,
    bumpBootstrapGeneration,
    clienteId,
    hydrateListagemRecord,
    queryClient,
    userId,
  ]);

  const queueSectionsPatch = useCallback((sections = []) => {
    const normalizedSections = normalizeSections(sections);
    if (normalizedSections.length === 0) return;
    const snapshot = buildListagemPreferencesFromStorage();
    const nextPatch = normalizedSections.reduce((acc, section) => {
      if (snapshot?.[section] === undefined) return acc;
      if (sameJson(snapshot[section], lastSyncedPreferencesRef.current?.[section])) return acc;
      acc[section] = snapshot[section];
      return acc;
    }, {});
    if (Object.keys(nextPatch).length === 0) return;
    pendingPatchRef.current = mergePatchState(pendingPatchRef.current, nextPatch);
  }, []);

  const persistQueuedPatches = useCallback(async () => {
    if (!userId || !clienteId) return;
    if (syncInFlightRef.current) return;

    const queuedPatch = toObject(pendingPatchRef.current);
    const patchToSend = Object.entries(queuedPatch).reduce((acc, [section, value]) => {
      if (sameJson(value, lastSyncedPreferencesRef.current?.[section])) return acc;
      acc[section] = value;
      return acc;
    }, {});
    if (Object.keys(patchToSend).length === 0) {
      pendingPatchRef.current = {};
      return;
    }
    pendingPatchRef.current = {};
    syncInFlightRef.current = true;

    try {
      markEmpPreferencesPerf("PREF_REMOTE_PATCH_START", {
        section: Object.keys(patchToSend).join(","),
        source: "remote",
      });
      const response = await userPreferencesApi.saveByScope(
        EMPRESAS_LISTAGEM_SCOPE.modulo,
        EMPRESAS_LISTAGEM_SCOPE.tela,
        {
          versao_schema: 2,
          preferencias: patchToSend,
          expectedUpdatedAt: listagemUpdatedAtRef.current,
          expectedRevision: listagemRevisionRef.current,
        }
      );

      const normalizedRecord = {
        modulo: EMPRESAS_LISTAGEM_SCOPE.modulo,
        tela: EMPRESAS_LISTAGEM_SCOPE.tela,
        versao_schema: Number(response?.versao_schema) || 2,
        preferencias: response?.preferencias || buildListagemPreferencesFromStorage(),
        updatedAt: response?.updatedAt || new Date().toISOString(),
        revision: Number(response?.revision) || listagemRevisionRef.current + 1,
      };

      listagemUpdatedAtRef.current = normalizedRecord.updatedAt;
      listagemRevisionRef.current = extractRevision(normalizedRecord);
      lastSyncedPreferencesRef.current = toObject(normalizedRecord.preferencias);
      setEmpPreferencesRemoteRevision(listagemRevisionRef.current, listagemUpdatedAtRef.current);
      Object.keys(patchToSend).forEach((section) => clearEmpPreferencesSectionDirty(section));
      setEmpPreferencesSyncStatus("saved");
      patchBootstrapCache(normalizedRecord);
      conflictRetryCountRef.current = 0;
      setSyncError(null);
      markEmpPreferencesPerf("PREF_REMOTE_PATCH_END", {
        section: Object.keys(patchToSend).join(","),
        source: "remote",
        changed: false,
      });
      if (isEmpresasPreferencesV2Enabled()) {
        broadcastEmpPreferencesCrossTab({
          clienteId,
          userId,
          revision: listagemRevisionRef.current,
          sectionsChanged: Object.keys(patchToSend),
          reason: "remote-sync",
        });
      }
    } catch (error) {
      pendingPatchRef.current = mergePatchState(patchToSend, pendingPatchRef.current);

      if (Number(error?.status) === 409) {
        const currentPreferences = toObject(error?.data?.currentPreferences);
        const currentRevision = Number(error?.data?.currentRevision);
        const currentUpdatedAt = error?.data?.currentUpdatedAt;

        if (Object.keys(currentPreferences).length > 0) {
          const reconciled = toObject(deepMergeObjects(currentPreferences, patchToSend));
          applyRemoteListagemPreferencesToStorage(reconciled);
          pendingPatchRef.current = mergePatchState(patchToSend, pendingPatchRef.current);

          const nextRevision = Number.isFinite(currentRevision)
            ? Math.max(0, Math.floor(currentRevision))
            : Number(reconciled?.meta?.revision) || 0;

          listagemRevisionRef.current = nextRevision;
          listagemUpdatedAtRef.current = currentUpdatedAt || reconciled?.meta?.updatedAt || null;
          lastSyncedPreferencesRef.current = reconciled;
          patchBootstrapCache({
            modulo: EMPRESAS_LISTAGEM_SCOPE.modulo,
            tela: EMPRESAS_LISTAGEM_SCOPE.tela,
            versao_schema: Number(reconciled?.version) || 2,
            preferencias: reconciled,
            updatedAt: listagemUpdatedAtRef.current,
            revision: listagemRevisionRef.current,
          });
          if (isEmpresasPreferencesV2Enabled()) {
            bumpBootstrapGeneration("remote_applied");
          }
        }

        conflictRetryCountRef.current += 1;
        if (conflictRetryCountRef.current <= MAX_CONFLICT_RETRIES) {
          setSyncError(null);
          return;
        }
      }

      setSyncError(error);
      if (isEmpresasPreferencesV2Enabled()) throw error;
    } finally {
      syncInFlightRef.current = false;
    }
  }, [
    bumpBootstrapGeneration,
    clienteId,
    hydrateListagemRecord,
    patchBootstrapCache,
    userId,
  ]);

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
    if (!isEmpresasPreferencesV2Enabled()) return undefined;
    registerEmpPreferencesFlushHandler(async () => {
      scheduleListagemSync({ immediate: true, reason: "listagem:flush-all" });
      await persistQueuedPatches();
    });
    return () => registerEmpPreferencesFlushHandler(null);
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
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("emp-preferences-flush", flushNow);

    return () => {
      window.removeEventListener("beforeunload", flushNow);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("emp-preferences-flush", flushNow);
    };
  }, [clienteId, scheduleListagemSync, userId]);

  useEffect(
    () => () => {
      if (listagemSyncTimerRef.current) {
        clearTimeout(listagemSyncTimerRef.current);
        listagemSyncTimerRef.current = null;
      }
      if (listagemRetryTimerRef.current) {
        clearTimeout(listagemRetryTimerRef.current);
        listagemRetryTimerRef.current = null;
      }
    },
    []
  );

  const flushListagemSync = useCallback(() => {
    scheduleListagemSync({ immediate: true, reason: "listagem:flush-all" });
  }, [scheduleListagemSync]);

  const isLoading = false;

  return {
    isReady: preferencesReady,
    preferencesReady,
    bootstrapStatus,
    bootstrapGeneration,
    isLoading,
    error: bootstrapQuery.error || syncError,
    scheduleListagemSync,
    flushListagemSync,
    refresh: bootstrapQuery.refetch,
  };
}

export const assertPreferencesSyncConflict = (error) => {
  if (Number(error?.status) !== 409) return false;
  throw withStatus("Conflito de preferência entre abas detectado.", 409);
};
