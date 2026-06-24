import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { userPreferencesApi } from "@/apis/preferences/userPreferencesApi";
import {
  EMPRESAS_FORM_SCOPE,
  EMPRESAS_LISTAGEM_SCOPE,
  applyFormLayoutPreferencesToStorage,
  applyListagemPreferencesToStorage,
  buildFormLayoutPreferencesFromStorage,
  buildListagemPreferencesFromStorage,
  isEmpPreferencesMigrated,
  mapBootstrapPreferences,
  markEmpPreferencesMigrated,
} from "@/modules/empresas/preferences/empresasPreferencesStorage";

const BOOTSTRAP_QUERY_PREFIX = "user-preferences-bootstrap";
const LISTAGEM_SCOPE_KEY = `${EMPRESAS_LISTAGEM_SCOPE.modulo}.${EMPRESAS_LISTAGEM_SCOPE.tela}`;
const FORM_SCOPE_KEY = `${EMPRESAS_FORM_SCOPE.modulo}.${EMPRESAS_FORM_SCOPE.tela}`;

const withStatus = (message, statusCode) => {
  const error = new Error(message);
  error.status = statusCode;
  return error;
};

export function useEmpresasPreferencesBootstrap(userId) {
  const queryClient = useQueryClient();
  const [isReady, setIsReady] = useState(false);
  const [syncError, setSyncError] = useState(null);
  const listagemUpdatedAtRef = useRef(null);
  const listagemSyncTimerRef = useRef(null);
  const syncInFlightRef = useRef(false);

  const bootstrapQuery = useQuery({
    queryKey: [BOOTSTRAP_QUERY_PREFIX, userId],
    queryFn: () => userPreferencesApi.bootstrap(),
    enabled: Boolean(userId),
    staleTime: 60_000,
    gcTime: 10 * 60_000,
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
          formRecord.updatedAt
        );
      }

      return mapped;
    },
    [userId]
  );

  const migrateLocalPreferencesIfNeeded = useCallback(
    async (mapped) => {
      if (!userId || isEmpPreferencesMigrated(userId)) return mapped;

      let shouldRefetch = false;
      if (!mapped[LISTAGEM_SCOPE_KEY]) {
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
        const formPayload = buildFormLayoutPreferencesFromStorage(userId);
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
        queryKey: [BOOTSTRAP_QUERY_PREFIX, userId],
        queryFn: () => userPreferencesApi.bootstrap(),
      });
      return mapBootstrapPreferences(refreshed);
    },
    [queryClient, userId]
  );

  useEffect(() => {
    if (!userId) {
      setIsReady(false);
      listagemUpdatedAtRef.current = null;
      return;
    }
    setIsReady(false);
    setSyncError(null);
  }, [userId]);

  useEffect(() => {
    if (!bootstrapQuery.isError) return;
    setIsReady(true);
  }, [bootstrapQuery.isError]);

  useEffect(() => {
    if (!userId || !bootstrapQuery.isSuccess) return;

    let isMounted = true;
    (async () => {
      try {
        const mapped = applyBootstrapToStorage(bootstrapQuery.data);
        const migratedMap = await migrateLocalPreferencesIfNeeded(mapped);
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
              formRecord.updatedAt
            );
          }
        }

        if (!isMounted) return;
        requestAnimationFrame(() => {
          if (!isMounted) return;
          setIsReady(true);
        });
      } catch (error) {
        if (!isMounted) return;
        setSyncError(error);
        setIsReady(true);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [applyBootstrapToStorage, bootstrapQuery.data, bootstrapQuery.isSuccess, migrateLocalPreferencesIfNeeded, userId]);

  const persistListagemPreferences = useCallback(async () => {
    if (!userId || syncInFlightRef.current) return;
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
      setSyncError(null);
    } catch (error) {
      if (Number(error?.status) === 409) {
        const refreshed = await queryClient.fetchQuery({
          queryKey: [BOOTSTRAP_QUERY_PREFIX, userId],
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
  }, [applyBootstrapToStorage, queryClient, userId]);

  const scheduleListagemSync = useCallback(
    ({ immediate = false } = {}) => {
      if (listagemSyncTimerRef.current) {
        clearTimeout(listagemSyncTimerRef.current);
        listagemSyncTimerRef.current = null;
      }

      const runner = async () => {
        try {
          await persistListagemPreferences();
        } catch {
          // Erro já capturado em syncError; UI permanece funcional.
        }
      };

      if (immediate) {
        void runner();
        return;
      }

      listagemSyncTimerRef.current = setTimeout(() => {
        listagemSyncTimerRef.current = null;
        void runner();
      }, 700);
    },
    [persistListagemPreferences]
  );

  useEffect(
    () => () => {
      if (listagemSyncTimerRef.current) {
        clearTimeout(listagemSyncTimerRef.current);
        listagemSyncTimerRef.current = null;
      }
    },
    []
  );

  return {
    isReady,
    isLoading: Boolean(userId) && (!isReady || bootstrapQuery.isLoading),
    error: bootstrapQuery.error || syncError,
    scheduleListagemSync,
    refresh: bootstrapQuery.refetch,
  };
}

export const empresasPreferencesBootstrapQueryKey = (userId) => [
  BOOTSTRAP_QUERY_PREFIX,
  userId,
];

export const assertPreferencesSyncConflict = (error) => {
  if (Number(error?.status) !== 409) return false;
  throw withStatus("Conflito de preferência entre abas detectado.", 409);
};

