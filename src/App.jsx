import { ErpToaster } from "@/shared/feedback/ErpToaster";
import { ErpConfirmProvider } from "@/shared/feedback/ErpConfirmProvider";
import { ErpFloatingInput } from "@/shared/forms";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/shared/contexts/queryClient";
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "@/shared/contexts/AuthContext";
import { lazy, Suspense, useState } from "react";
import generatedModules from "@/modules/generatedModules.json";
import PAGEMP from "@/modules/empresas/pages/PAGEMP";
import ErpShell from "@/shared/layouts/ErpShell";

const generatedPageLoaders = import.meta.glob("/src/modules/*/pages/PAG*.jsx");
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
    <div className="erp-ui cadastro-emp-scope erp-login-screen">
      <form onSubmit={handleSubmit} className="erp-login-card">
        <h1>Login do Sistema</h1>
        <p>Informe cliente, usuário e senha para acessar o ERP.</p>
        <div className="erp-login-fields">
          <ErpFloatingInput
            label="Cliente"
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
            autoComplete="organization"
          />
          <ErpFloatingInput
            label="Usuário"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            autoComplete="username"
          />
          <ErpFloatingInput
            label="Senha"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        {errorMessage ? (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {errorMessage}
          </div>
        ) : null}
        <button type="submit" disabled={isLoading} className="erp-login-submit">
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
        <Route
          path="/"
          element={<PAGEMP />}
        />
        <Route
          path="/CadastroEmpresas"
          element={<PAGEMP />}
        />
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

export default function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <ErpConfirmProvider>
          <Router>
            <AuthenticatedApp />
          </Router>
          <ErpToaster />
        </ErpConfirmProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}
