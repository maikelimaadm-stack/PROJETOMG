import React, { createContext, useState, useContext, useEffect } from "react";
import { AuthApi } from "@/apis/auth/AuthApi";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
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
        type: "auth_not_configured",
        message: error.message || "Supabase Auth não configurado.",
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
      const currentUser = await AuthApi.getCurrentUser();
      setUser(currentUser);
      setIsAuthenticated(Boolean(currentUser));
      setIsLoadingAuth(false);
    } catch (error) {
      console.error("Unexpected auth error:", error);
      const message = String(error?.message || "").toLowerCase();
      if (message.includes("auth session missing")) {
        setAuthError(null);
        setIsLoadingAuth(false);
        setIsAuthenticated(false);
        setUser(null);
        return;
      }
      setAuthError({
        type: "auth_not_configured",
        message: error.message || "Falha ao validar autenticação",
      });
      setIsLoadingAuth(false);
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const logout = async () => {
    await AuthApi.logout().catch(() => null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const navigateToLogin = () => {
    window.location.reload();
  };

  return (
    <AuthContext.Provider
      value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      logout,
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