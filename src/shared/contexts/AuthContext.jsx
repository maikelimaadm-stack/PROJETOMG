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
    const subscription = AuthApi.onAuthStateChange(async () => {
      await checkAppState();
    });
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
      setAuthError({
        type: "auth_required",
        message: error.message || "Falha ao validar autenticação",
      });
      setIsLoadingAuth(false);
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const logout = async () => {
    await AuthApi.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const navigateToLogin = () => {
    // O app segue operável em modo local quando auth externa não estiver configurada.
    setAuthError(null);
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