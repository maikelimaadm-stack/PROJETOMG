import { ErpToaster } from "@/shared/feedback/ErpToaster";
import { ErpConfirmProvider } from "@/shared/feedback/ErpConfirmProvider";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/shared/contexts/queryClient";
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "@/shared/contexts/AuthContext";
import { MakPreferencesBootstrapProvider } from "@/framework/mak/preferences/PreferencesBootstrapProvider.jsx";
import "@/modules/makBootstrap/registerMakPreferencesBootstrapModules.js";
import { useAppPreferencesBootstrap } from "@/modules/makBootstrap/useAppPreferencesBootstrap.js";
import { ErpThemeProvider } from "@/shared/contexts/ErpThemeContext";
import { lazy, Suspense, useState } from "react";
import generatedModules from "@/modules/generatedModules.json";
import ErpShell from "@/shared/layouts/ErpShell";
import { GlobalErrorBoundary } from "@/shared/feedback/GlobalErrorBoundary";

const generatedPageLoaders = import.meta.glob("/src/modules/*/pages/PAG*.jsx");
const EmpresasPage = lazy(() => import("@/modules/empresas/pages/PAGEMP"));
const generatedModuleRoutes = generatedModules
  .filter((moduleConfig) => moduleConfig.moduleId !== "empresas")
  .map((moduleConfig) => {
    const key = `/src/${moduleConfig.pageFile}`;
    const loader = generatedPageLoaders[key];
    if (!loader) return null;
    return {
      ...moduleConfig,
      Component: lazy(loader),
    };
  })
  .filter(Boolean);

function LoginScreen({ onLogin, isLoading, errorMessage }) {
  const [cliente, setCliente] = useState("");
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await onLogin({ cliente, usuario, senha });
    } catch {
      // AuthContext já atualiza o estado de erro exibido na tela.
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h1 className="text-lg font-semibold text-slate-700">Login do Sistema</h1>
        <p className="mt-1 text-xs text-slate-500">
          Informe cliente, usuário e senha para acessar o ERP.
        </p>
        <div className="mt-5 space-y-3">
          <label className="block text-xs font-medium text-slate-600">
            Cliente
            <input
              className="mt-1 h-9 w-full border border-slate-300 px-2 text-sm"
              value={cliente}
              onChange={(event) => setCliente(event.target.value)}
              placeholder="Cliente"
              autoComplete="organization"
            />
          </label>
          <label className="block text-xs font-medium text-slate-600">
            Usuário
            <input
              className="mt-1 h-9 w-full border border-slate-300 px-2 text-sm"
              value={usuario}
              onChange={(event) => setUsuario(event.target.value)}
              placeholder="Usuário"
              autoComplete="username"
            />
          </label>
          <label className="block text-xs font-medium text-slate-600">
            Senha
            <input
              className="mt-1 h-9 w-full border border-slate-300 px-2 text-sm"
              type="password"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              placeholder="Senha"
              autoComplete="current-password"
            />
          </label>
        </div>
        {errorMessage ? (
          <div className="mt-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {errorMessage}
          </div>
        ) : null}
        <button
          type="submit"
          disabled={isLoading}
          className="mt-5 h-9 w-full border border-slate-700 bg-slate-700 text-sm text-white disabled:opacity-60"
        >
          {isLoading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}

function ModuleLoadingFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">
      Carregando módulo...
    </div>
  );
}

function ErpLayoutRoute() {
  const location = useLocation();
  const {
    logout,
    empresas,
    allowAllEmpresas,
    selectedEmpresaId,
    selectEmpresa,
  } = useAuth();

  return (
    <ErpShell
      pathname={location.pathname}
      onLogout={logout}
      empresas={empresas}
      allowAllEmpresas={allowAllEmpresas}
      selectedEmpresaId={selectedEmpresaId}
      onSelectEmpresa={selectEmpresa}
    >
      <Suspense fallback={<ModuleLoadingFallback />}>
        <Outlet />
      </Suspense>
    </ErpShell>
  );
}

const AuthenticatedApp = () => {
  const {
    isLoadingAuth,
    isLoadingPublicSettings,
    authError,
    isAuthenticated,
    login,
  } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
      </div>
    );
  }

  if (authError && !isAuthenticated) {
    return (
      <LoginScreen
        onLogin={login}
        isLoading={isLoadingAuth}
        errorMessage={authError.message}
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <LoginScreen
        onLogin={login}
        isLoading={isLoadingAuth}
        errorMessage={null}
      />
    );
  }

  return (
    <Routes>
      <Route element={<ErpLayoutRoute />}>
        <Route path="/" element={<EmpresasPage />} />
        <Route path="/CadastroEmpresas" element={<EmpresasPage />} />
        {generatedModuleRoutes.map((module) => (
          <Route
            key={module.moduleId}
            path={module.routePath}
            element={<module.Component />}
          />
        ))}
      </Route>
      <Route path="*" element={<Navigate to="/CadastroEmpresas" replace />} />
    </Routes>
  );
};

function AppWithErrorBoundary() {
  const location = useLocation();
  return (
    <GlobalErrorBoundary resetKey={location.pathname}>
      <AuthenticatedApp />
    </GlobalErrorBoundary>
  );
}

export default function App() {
  return (
    <ErpThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <MakPreferencesBootstrapProvider useBootstrapHook={useAppPreferencesBootstrap}>
            <ErpConfirmProvider>
              <Router>
                <AppWithErrorBoundary />
              </Router>
              <ErpToaster />
            </ErpConfirmProvider>
          </MakPreferencesBootstrapProvider>
        </QueryClientProvider>
      </AuthProvider>
    </ErpThemeProvider>
  );
}
