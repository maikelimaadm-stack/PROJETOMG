import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { userPreferencesApi } from "@/apis/preferences/userPreferencesApi";
import { empresasPreferencesBootstrapQueryKey } from "@/modules/empresas/preferences/empresasPreferencesQueryKeys";
import {
  EMPRESAS_FORM_SCOPE,
  EMPRESAS_LISTAGEM_SCOPE,
  applyFormLayoutPreferencesToStorage,
  applyListagemPreferencesToStorage,
  buildFormLayoutPreferencesFromStorage,
  buildListagemPreferencesFromStorage,
  hasScopedListagemPreferences,
  isEmpPreferencesMigrated,
  mapBootstrapPreferences,
  markEmpPreferencesMigrated,
} from "@/modules/empresas/preferences/empresasPreferencesStorage";
import { useAuth } from "@/shared/contexts/AuthContext";

const LISTAGEM_SCOPE_KEY = `${EMPRESAS_LISTAGEM_SCOPE.modulo}.${EMPRESAS_LISTAGEM_SCOPE.tela}`;
const FORM_SCOPE_KEY = `${EMPRESAS_FORM_SCOPE.modulo}.${EMPRESAS_FORM_SCOPE.tela}`;

const withStatus = (message, statusCode) => {
  const error = new Error(message);
  error.status = statusCode;
  return error;
};

export function useEmpresasPreferencesBootstrap(userId) {
  const { cliente } = useAuth();
  const clienteId = cliente?.id || null;
  const queryClient = useQueryClient();
  const bootstrapQueryKey = empresasPreferencesBootstrapQueryKey(clienteId, userId);

  const [isReady, setIsReady] = useState(() =>
    Boolean(userId && clienteId) &&
    Boolean(queryClient.getQueryData(bootstrapQueryKey))
  );
  const [syncError, setSyncError] = useState(null);
  const listagemUpdatedAtRef = useRef(null);
  const listagemSyncTimerRef = useRef(null);
  const listagemRetryTimerRef = useRef(null);
  const syncInFlightRef = useRef(false);

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

  const applyBootstrapToStorage = useCallback(
    (payload) => {
      const mapped = mapBootstrapPreferences(payload);
      const listagemRecord = mapped[LISTAGEM_SCOPE_KEY];
      const formRecord = mapped[FORM_SCOPE_KEY];

      if (listagemRecord?.preferencias) {
        applyListagemPreferencesToStorage(listagemRecord.preferencias);
        listagemUpdatedAtRef.current = listagemRecord.updatedAt || null;
      }

      if (formRecord?.preferencias) {
        applyFormLayoutPreferencesToStorage(
          userId,
          formRecord.preferencias,
          formRecord.updatedAt,
          clienteId
        );
      }

      return mapped;
    },
    [clienteId, userId]
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
      setIsReady(false);
      listagemUpdatedAtRef.current = null;
      return;
    }
    const hasWarmCache = Boolean(queryClient.getQueryData(bootstrapQueryKey));
    setIsReady(hasWarmCache);
    setSyncError(null);
  }, [bootstrapQueryKey, clienteId, queryClient, userId]);

  useEffect(() => {
    if (!bootstrapQuery.isError) return;
    setIsReady(true);
  }, [bootstrapQuery.isError]);

  useEffect(() => {
    if (!userId || !clienteId || !bootstrapQuery.isSuccess) return;

    let isMounted = true;
    (async () => {
      try {
        const mapped = applyBootstrapToStorage(bootstrapQuery.data);
        const migratedMap = await migrateScopedLocalPreferencesIfNeeded(mapped);
        if (migratedMap !== mapped) {
          const listagemRecord = migratedMap[LISTAGEM_SCOPE_KEY];
          const formRecord = migratedMap[FORM_SCOPE_KEY];
          if (listagemRecord?.preferencias) {
            applyListagemPreferencesToStorage(listagemRecord.preferencias);
            listagemUpdatedAtRef.current = listagemRecord.updatedAt || null;
          }
          if (formRecord?.preferencias) {
            applyFormLayoutPreferencesToStorage(
              userId,
              formRecord.preferencias,
              formRecord.updatedAt,
              clienteId
            );
          }
        }

        if (!isMounted) return;
        setIsReady(true);
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
        setIsReady(true);
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
    migrateScopedLocalPreferencesIfNeeded,
    userId,
  ]);

  const persistListagemPreferences = useCallback(async () => {
    if (!userId || !clienteId || syncInFlightRef.current) return;
    syncInFlightRef.current = true;
    try {
      const payload = buildListagemPreferencesFromStorage();
      const response = await userPreferencesApi.saveByScope(
        EMPRESAS_LISTAGEM_SCOPE.modulo,
        EMPRESAS_LISTAGEM_SCOPE.tela,
        {
          versao_schema: Number(payload?.version) || 1,
          preferencias: payload,
          expectedUpdatedAt: listagemUpdatedAtRef.current,
        }
      );
      listagemUpdatedAtRef.current = response?.updatedAt || null;
      queryClient.setQueryData(bootstrapQueryKey, (previous) => {
        const records = Array.isArray(previous?.preferences)
          ? [...previous.preferences]
          : [];
        const key = `${EMPRESAS_LISTAGEM_SCOPE.modulo}.${EMPRESAS_LISTAGEM_SCOPE.tela}`;
        const index = records.findIndex(
          (record) => `${record?.modulo}.${record?.tela}` === key
        );
        const nextRecord = {
          modulo: EMPRESAS_LISTAGEM_SCOPE.modulo,
          tela: EMPRESAS_LISTAGEM_SCOPE.tela,
          versao_schema: Number(payload?.version) || 1,
          preferencias: payload,
          updatedAt: response?.updatedAt || new Date().toISOString(),
        };
        if (index >= 0) records[index] = nextRecord;
        else records.push(nextRecord);
        return { ...(previous || {}), preferences: records };
      });
      setSyncError(null);
    } catch (error) {
      if (Number(error?.status) === 409) {
        const refreshed = await queryClient.fetchQuery({
          queryKey: bootstrapQueryKey,
          queryFn: () => userPreferencesApi.bootstrap(),
        });
        const mapped = mapBootstrapPreferences(refreshed);
        const remoteListagem = mapped[LISTAGEM_SCOPE_KEY];
        listagemUpdatedAtRef.current = remoteListagem?.updatedAt || null;
      }
      setSyncError(error);
      throw error;
    } finally {
      syncInFlightRef.current = false;
    }
  }, [bootstrapQueryKey, clienteId, queryClient, userId]);

  const scheduleListagemSync = useCallback(
    ({ immediate = false } = {}) => {
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
          await persistListagemPreferences();
        } catch (error) {
          if (Number(error?.status) === 409) return;
          listagemRetryTimerRef.current = setTimeout(() => {
            listagemRetryTimerRef.current = null;
            scheduleListagemSync();
          }, 2_500);
        }
      };

      if (immediate) {
        void runner();
        return;
      }

      listagemSyncTimerRef.current = setTimeout(() => {
        listagemSyncTimerRef.current = null;
        void runner();
      }, 800);
    },
    [persistListagemPreferences]
  );

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

  return {
    isReady,
    isLoading: Boolean(userId && clienteId) && (!isReady || bootstrapQuery.isLoading),
    error: bootstrapQuery.error || syncError,
    scheduleListagemSync,
    refresh: bootstrapQuery.refetch,
  };
}

export const assertPreferencesSyncConflict = (error) => {
  if (Number(error?.status) !== 409) return false;
  throw withStatus("Conflito de preferência entre abas detectado.", 409);
};
