import React, { createContext, useState, useContext, useEffect } from "react";
import { AuthApi } from "@/apis/auth/AuthApi";

const AuthContext = createContext();

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
  }, []);

  const checkAppState = async () => {
    try {
      setIsLoadingAuth(true);
      setAuthError(null);
      setAppPublicSettings(null);
      const session = await AuthApi.getSession();
      if (!session?.user) {
        setUser(null);
        setCliente(null);
        setEmpresas([]);
        setAllowAllEmpresas(false);
        setIsAuthenticated(false);
        setIsLoadingAuth(false);
        return;
      }
      setUser(session.user);
      setCliente(session.cliente || null);
      setEmpresas(session.empresas || []);
      setAllowAllEmpresas(Boolean(session.allowAllEmpresas));
      setSelectedEmpresaId(session.selectedEmpresaId || AuthApi.getSelectedEmpresaId());
      setIsAuthenticated(true);
      setIsLoadingAuth(false);
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
  };

  const login = async ({ cliente: clienteCodigo, usuario, senha }) => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      const payload = await AuthApi.login({
        cliente: clienteCodigo,
        usuario,
        senha,
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
      return payload;
    } catch (error) {
      setAuthError({ type: "auth_error", message: error.message || "Falha no login." });
      setIsLoadingAuth(false);
      throw error;
    }
  };

  const selectEmpresa = (empresaId) => {
    const normalizedEmpresaId =
      empresaId === "__AUTHORIZED_SCOPE__" ? null : empresaId;
    AuthApi.setSelectedEmpresaId(normalizedEmpresaId);
    setSelectedEmpresaId(normalizedEmpresaId);
  };

  const logout = async () => {
    await AuthApi.logout().catch(() => null);
    setUser(null);
    setCliente(null);
    setEmpresas([]);
    setAllowAllEmpresas(false);
    setSelectedEmpresaId(null);
    setIsAuthenticated(false);
  };

  const navigateToLogin = () => {
    setIsAuthenticated(false);
    setUser(null);
    setCliente(null);
    setEmpresas([]);
    setAllowAllEmpresas(false);
    setSelectedEmpresaId(null);
  };

  return (
    <AuthContext.Provider
      value={{
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
      navigateToLogin,
      checkAppState,
    }}>
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