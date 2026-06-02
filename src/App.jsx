import { Toaster } from "@/shared/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/shared/contexts/queryClient";
import { BrowserRouter as Router, Route, Routes, Link, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/shared/contexts/AuthContext";
import { lazy, Suspense, useState } from "react";
import generatedModules from "@/modules/generatedModules.json";

const PAGEMP = lazy(() => import("@/modules/empresas/pages/PAGEMP"));
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

function MinimalLayout({
  children,
  onLogout,
  empresas,
  selectedEmpresaId,
  onSelectEmpresa,
  allowAllEmpresas,
  modulesNavigation = [],
}) {
  const location = useLocation();
  const AUTHORIZED_SCOPE_OPTION = "__AUTHORIZED_SCOPE__";
  const selectorValue =
    selectedEmpresaId || (allowAllEmpresas ? "all" : AUTHORIZED_SCOPE_OPTION);

  return (
    <div className="h-[100dvh] overflow-hidden bg-white flex flex-col" style={{ "--app-content-offset": "73px" }}>
      <header className="flex-none border-b border-slate-200 bg-white">
        <div className="px-4 py-2 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-sm font-semibold text-slate-700 leading-tight">MAK Gestão ERP</h1>
            <p className="text-xs text-slate-600">Sistema de gestão</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-600">Empresa:</label>
            <select
              value={selectorValue}
              onChange={(event) => onSelectEmpresa(event.target.value)}
              className="h-7 min-w-[170px] border border-slate-300 bg-white px-2 text-xs text-slate-700"
            >
              {allowAllEmpresas ? (
                <option value="all">Todas as Empresas</option>
              ) : (
                <option value={AUTHORIZED_SCOPE_OPTION}>Empresas autorizadas</option>
              )}
              {empresas.map((empresa) => (
                <option key={empresa.id} value={empresa.id}>
                  {empresa.codempresa} - {empresa.nome_empresa}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="h-7 px-3 rounded-none border border-slate-300 bg-white text-xs text-slate-600 hover:text-slate-700 hover:bg-slate-50"
          >
            Sair
          </button>
        </div>
        <nav className="h-8 px-4 flex items-center border-t border-slate-200">
          <Link
            to="/CadastroEmpresas"
            className={`h-7 px-3 inline-flex items-center text-xs border-x border-slate-200 ${location.pathname === "/CadastroEmpresas" || location.pathname === "/" ? "font-semibold text-slate-700 bg-slate-50" : "text-slate-600 bg-white"}`}
          >
            Cadastro de Empresas
          </Link>
          {modulesNavigation
            .filter((module) => module.moduleId !== "empresas")
            .map((module) => (
            <Link
              key={module.moduleId}
              to={module.routePath}
              className={`h-7 px-3 inline-flex items-center text-xs border-r border-slate-200 ${location.pathname === module.routePath ? "font-semibold text-slate-700 bg-slate-50" : "text-slate-600 bg-white"}`}
            >
              {module.menuLabel}
            </Link>
          ))}
        </nav>
      </header>
      <main className="flex-1 min-h-0 overflow-hidden">{children}</main>
    </div>
  );
}

const AuthenticatedApp = () => {
  const {
    isLoadingAuth,
    isLoadingPublicSettings,
    authError,
    logout,
    isAuthenticated,
    login,
    empresas,
    allowAllEmpresas,
    selectedEmpresaId,
    selectEmpresa,
  } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (authError) {
    if (!isAuthenticated) {
      return (
        <LoginScreen
          onLogin={login}
          isLoading={isLoadingAuth}
          errorMessage={authError.message}
        />
      );
    }
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
      <Route
        path="/"
        element={
          <MinimalLayout
            onLogout={logout}
            empresas={empresas}
            allowAllEmpresas={allowAllEmpresas}
            selectedEmpresaId={selectedEmpresaId}
            onSelectEmpresa={selectEmpresa}
            modulesNavigation={generatedModuleRoutes}
          >
            <Suspense fallback={<div className="h-full w-full flex items-center justify-center text-xs text-slate-500">Carregando módulo...</div>}>
              <PAGEMP />
            </Suspense>
          </MinimalLayout>
        }
      />
      <Route
        path="/CadastroEmpresas"
        element={
          <MinimalLayout
            onLogout={logout}
            empresas={empresas}
            allowAllEmpresas={allowAllEmpresas}
            selectedEmpresaId={selectedEmpresaId}
            onSelectEmpresa={selectEmpresa}
            modulesNavigation={generatedModuleRoutes}
          >
            <Suspense fallback={<div className="h-full w-full flex items-center justify-center text-xs text-slate-500">Carregando módulo...</div>}>
              <PAGEMP />
            </Suspense>
          </MinimalLayout>
        }
      />
      {generatedModuleRoutes.map((module) => (
        <Route
          key={module.moduleId}
          path={module.routePath}
          element={
            <MinimalLayout
              onLogout={logout}
              empresas={empresas}
              allowAllEmpresas={allowAllEmpresas}
              selectedEmpresaId={selectedEmpresaId}
              onSelectEmpresa={selectEmpresa}
              modulesNavigation={generatedModuleRoutes}
            >
              <Suspense fallback={<div className="h-full w-full flex items-center justify-center text-xs text-slate-500">Carregando módulo...</div>}>
                <module.Component />
              </Suspense>
            </MinimalLayout>
          }
        />
      ))}
      <Route path="*" element={<Navigate to="/CadastroEmpresas" replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}