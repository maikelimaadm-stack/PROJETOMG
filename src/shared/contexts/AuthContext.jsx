import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from "react";
import { AuthApi } from "@/apis/auth/AuthApi";
import { resetAllLayoutPreferencesSync } from "@/framework/cadastro-engine/preferences/LayoutPreferencesEngine.js";
import { resetEmpPreferencesMemoryCache } from "@/modules/empresas/preferences/empresasPreferencesCache";
import {
  clearActiveUserPreferencesScope,
  getActiveUserPreferencesScope,
  setActiveUserPreferencesScope,
} from "@/shared/preferences/userPreferencesScope.js";
import { queryClientInstance } from "@/shared/contexts/queryClient";
import { empresasModuleDefinition } from "@/modules/empresas/config/moduleDefinition";
import { cadcpsModuleDefinition } from "@/modules/cadcps/config/moduleDefinition";
import { CADCPS_LIST_QUERY_KEY } from "@/modules/cadcps/data/cadcpsListCache.js";
import { MetricsApi } from "@/apis/metrics/MetricsApi";
import { LIST_DEFAULT_PAGE_SIZE } from "@/shared/listing/listQueryConfig";
import { flushEmpPreferencesNow } from "@/modules/empresas/preferences/empresasPreferencesFlush";
import { prefetchEmpresasPreferencesAtLogin } from "@/modules/empresas/preferences/prefetchEmpresasPreferencesAtLogin";
import {
  bindEmpPreferencesScopeState,
  resetEmpPreferencesScopeState,
} from "@/modules/empresas/preferences/empresasPreferencesScopeState";

const prefetchEmpresasCadastro = async (userId, clienteId) => {
  void queryClientInstance.prefetchQuery({
    queryKey: ["emp-cadastro", 1, LIST_DEFAULT_PAGE_SIZE, "", "codempresa", "asc", "{}"],
    queryFn: () =>
      empresasModuleDefinition.repository.listPage({
        page: 1,
        pageSize: LIST_DEFAULT_PAGE_SIZE,
        search: "",
        sortBy: "codempresa",
        sortDir: "asc",
      }),
    staleTime: 60_000,
  });
  void queryClientInstance.prefetchQuery({
    queryKey: ["metrics-contadores"],
    queryFn: () => MetricsApi.getContadores(),
    staleTime: Number.POSITIVE_INFINITY,
  });
  void queryClientInstance.prefetchQuery({
    queryKey: [...CADCPS_LIST_QUERY_KEY, "infinite", 50, "", "codigo", "asc", "{}"],
    queryFn: () =>
      cadcpsModuleDefinition.repository.listPage({
        page: 1,
        pageSize: 50,
        search: "",
        sortBy: "codigo",
        sortDir: "asc",
      }),
    staleTime: 60_000,
  });
  void queryClientInstance.prefetchQuery({
    queryKey: ["emp-campos-personalizados", AuthApi.getSelectedEmpresaId() || "global"],
    queryFn: () => empresasModuleDefinition.repository.listCamposPersonalizados("aplicavel"),
    staleTime: 5 * 60_000,
  });
  if (clienteId && userId) {
    void prefetchEmpresasPreferencesAtLogin(clienteId, userId);
  }
};

const AuthContext = createContext();

const isDevAutoLoginEnabled = () =>
  import.meta.env.DEV && String(import.meta.env.VITE_DEV_AUTO_LOGIN || "").toLowerCase() === "true";

const getDevAutoLoginCredentials = () => ({
  cliente: String(import.meta.env.VITE_DEV_AUTO_LOGIN_CLIENTE || "maike").trim(),
  usuario: String(import.meta.env.VITE_DEV_AUTO_LOGIN_USUARIO || "maike").trim(),
  senha: String(import.meta.env.VITE_DEV_AUTO_LOGIN_SENHA || "123"),
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [empresas, setEmpresas] = useState([]);
  const [allowAllEmpresas, setAllowAllEmpresas] = useState(false);
  const [selectedEmpresaId, setSelectedEmpresaId] = useState(AuthApi.getSelectedEmpresaId());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState(null);

  const checkAppState = useCallback(async () => {
    const applySession = async (session) => {
      if (!session?.user) {
        setUser(null);
        setCliente(null);
        setEmpresas([]);
        setAllowAllEmpresas(false);
        clearActiveUserPreferencesScope();
        resetEmpPreferencesMemoryCache();
        resetEmpPreferencesScopeState();
        setIsAuthenticated(false);
        setIsLoadingAuth(false);
        return false;
      }
      setUser(session.user);
      setCliente(session.cliente || null);
      setEmpresas(session.empresas || []);
      setAllowAllEmpresas(Boolean(session.allowAllEmpresas));
      const previousScope = getActiveUserPreferencesScope();
      const nextScope = {
        clienteId: session.cliente?.id,
        userId: session.user?.id,
      };
      if (
        String(previousScope.userId || "") !== String(nextScope.userId || "") ||
        String(previousScope.clienteId || "") !== String(nextScope.clienteId || "")
      ) {
        queryClientInstance.removeQueries({ queryKey: ["user-screen-preferences"] });
        resetEmpPreferencesMemoryCache();
      }
      setActiveUserPreferencesScope(nextScope);
      bindEmpPreferencesScopeState(nextScope);
      const persistedEmpresaId = AuthApi.getSelectedEmpresaId();
      const normalizedPersistedEmpresaId =
        persistedEmpresaId != null && String(persistedEmpresaId).trim() !== ""
          ? String(persistedEmpresaId).trim()
          : null;
      const canUsePersistedSelection =
        normalizedPersistedEmpresaId &&
        (normalizedPersistedEmpresaId === "all"
          ? Boolean(session.allowAllEmpresas)
          : (session.empresas || []).some((empresa) => empresa.id === normalizedPersistedEmpresaId));
      const nextEmpresaId = canUsePersistedSelection
        ? normalizedPersistedEmpresaId
        : session.selectedEmpresaId ?? null;
      AuthApi.setSelectedEmpresaId(nextEmpresaId);
      setSelectedEmpresaId(nextEmpresaId);
      await prefetchEmpresasCadastro(session.user?.id, session.cliente?.id);
      setIsAuthenticated(true);
      setIsLoadingAuth(false);
      return true;
    };

    try {
      setIsLoadingAuth(true);
      setAuthError(null);
      setAppPublicSettings(null);

      if (isDevAutoLoginEnabled() && !AuthApi.getToken()) {
        await AuthApi.login(getDevAutoLoginCredentials());
      }

      try {
        const session = await AuthApi.getSession();
        if (await applySession(session)) return;
        return;
      } catch (sessionError) {
        if (!isDevAutoLoginEnabled()) throw sessionError;
        AuthApi.clearSession();
        await AuthApi.login(getDevAutoLoginCredentials());
        const session = await AuthApi.getSession();
        if (await applySession(session)) return;
      }
    } catch (error) {
      setAuthError({
        type: "auth_error",
        message: error.message || "Falha ao validar sessão",
      });
      setIsLoadingAuth(false);
      setIsAuthenticated(false);
      setUser(null);
      setCliente(null);
      setEmpresas([]);
      setAllowAllEmpresas(false);
    }
  }, []);

  useEffect(() => {
    checkAppState();
    let subscription = { unsubscribe: () => {} };
    try {
      subscription = AuthApi.onAuthStateChange(async () => {
        await checkAppState();
      });
    } catch (error) {
      setAuthError({
        type: "auth_error",
        message: error.message || "Falha ao iniciar autenticação.",
      });
      setIsLoadingAuth(false);
    }
    return () => subscription.unsubscribe?.();
  }, [checkAppState]);

  const login = useCallback(async ({ cliente: clienteCodigo, usuario, senha }) => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      const payload = await AuthApi.login({
        cliente: clienteCodigo,
        usuario,
        senha,
      });
      queryClientInstance.removeQueries({ queryKey: ["user-screen-preferences"] });
      resetEmpPreferencesMemoryCache();
      setActiveUserPreferencesScope({
        clienteId: payload.cliente?.id,
        userId: payload.user?.id,
      });
      bindEmpPreferencesScopeState({
        clienteId: payload.cliente?.id,
        userId: payload.user?.id,
      });
      setUser(payload.user || null);
      setCliente(payload.cliente || null);
      setEmpresas(payload.empresas || []);
      setAllowAllEmpresas(Boolean(payload.allowAllEmpresas));
      const nextEmpresaId = payload.selectedEmpresaId || null;
      AuthApi.setSelectedEmpresaId(nextEmpresaId);
      setSelectedEmpresaId(nextEmpresaId);
      setIsAuthenticated(Boolean(payload.user));
      setIsLoadingAuth(false);
      if (payload.user) {
        await prefetchEmpresasCadastro(payload.user.id, payload.cliente?.id);
      }
      return payload;
    } catch (error) {
      setAuthError({ type: "auth_error", message: error.message || "Falha no login." });
      setIsLoadingAuth(false);
      throw error;
    }
  }, []);

  const selectEmpresa = useCallback((empresaId) => {
    const normalizedEmpresaId =
      empresaId === "__AUTHORIZED_SCOPE__"
        ? null
        : empresaId === "all"
          ? "all"
          : String(empresaId).trim();
    AuthApi.setSelectedEmpresaId(normalizedEmpresaId);
    setSelectedEmpresaId(normalizedEmpresaId);
    void queryClientInstance.invalidateQueries({ queryKey: ["emp-cadastro"] });
    void queryClientInstance.invalidateQueries({ queryKey: ["emp-campos-personalizados"] });
  }, []);

  const mapEmpresaForSelector = useCallback((empresa) => ({
    id: empresa.id,
    codempresa: Number(empresa.codempresa || 0),
    nome_empresa: empresa.nome_empresa || empresa.razao_social || "",
    razao_social: empresa.razao_social || empresa.nome_empresa || "",
    status: empresa.status || "Ativa",
  }), []);

  const upsertEmpresaInSelector = useCallback((empresa) => {
    if (!empresa?.id) return;
    const mapped = mapEmpresaForSelector(empresa);
    setEmpresas((previous) => {
      const index = previous.findIndex((item) => item.id === mapped.id);
      if (index >= 0) {
        const next = [...previous];
        next[index] = { ...next[index], ...mapped };
        return next;
      }
      return [...previous, mapped].sort(
        (a, b) => Number(a.codempresa || 0) - Number(b.codempresa || 0)
      );
    });
  }, [mapEmpresaForSelector]);

  const removeEmpresasFromSelector = useCallback((ids = []) => {
    const idSet = new Set(ids.filter(Boolean));
    if (idSet.size === 0) return;

    setEmpresas((previous) => previous.filter((item) => !idSet.has(item.id)));
    setSelectedEmpresaId((previous) => {
      if (previous && idSet.has(previous)) {
        const nextSelection = allowAllEmpresas ? "all" : null;
        AuthApi.setSelectedEmpresaId(nextSelection);
        return nextSelection;
      }
      return previous;
    });
  }, [allowAllEmpresas]);

  const replaceEmpresasInSelector = useCallback((nextEmpresas = []) => {
    setEmpresas(Array.isArray(nextEmpresas) ? nextEmpresas : []);
  }, []);

  const logout = useCallback(async () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("emp-preferences-flush"));
      void flushEmpPreferencesNow();
    }
    await AuthApi.logout().catch(() => null);
    queryClientInstance.removeQueries({ queryKey: ["user-screen-preferences"] });
    queryClientInstance.clear();
    resetAllLayoutPreferencesSync();
    resetEmpPreferencesMemoryCache();
    resetEmpPreferencesScopeState();
    clearActiveUserPreferencesScope();
    setUser(null);
    setCliente(null);
    setEmpresas([]);
    setAllowAllEmpresas(false);
    setSelectedEmpresaId(null);
    setIsAuthenticated(false);
  }, []);

  const navigateToLogin = useCallback(async () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("emp-preferences-flush"));
      void flushEmpPreferencesNow();
    }
    queryClientInstance.removeQueries({ queryKey: ["user-screen-preferences"] });
    resetEmpPreferencesMemoryCache();
    resetEmpPreferencesScopeState();
    clearActiveUserPreferencesScope();
    setIsAuthenticated(false);
    setUser(null);
    setCliente(null);
    setEmpresas([]);
    setAllowAllEmpresas(false);
    setSelectedEmpresaId(null);
  }, []);

  const contextValue = useMemo(
    () => ({
      user,
      cliente,
      empresas,
      allowAllEmpresas,
      selectedEmpresaId,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      login,
      logout,
      selectEmpresa,
      upsertEmpresaInSelector,
      removeEmpresasFromSelector,
      replaceEmpresasInSelector,
      navigateToLogin,
      checkAppState,
    }),
    [
      user,
      cliente,
      empresas,
      allowAllEmpresas,
      selectedEmpresaId,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      login,
      logout,
      selectEmpresa,
      upsertEmpresaInSelector,
      removeEmpresasFromSelector,
      replaceEmpresasInSelector,
      navigateToLogin,
      checkAppState,
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};