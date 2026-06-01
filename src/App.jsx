import { Toaster } from "@/shared/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/shared/contexts/queryClient";
import { BrowserRouter as Router, Route, Routes, Link, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/shared/contexts/AuthContext";
import UserNotRegisteredError from "@/shared/components/UserNotRegisteredError";
import PAGEMP from "@/modules/empresas/pages/PAGEMP";

function MinimalLayout({ children, onLogout }) {
  const location = useLocation();

  return (
    <div className="h-[100dvh] overflow-hidden bg-white flex flex-col" style={{ "--app-content-offset": "73px" }}>
      <header className="flex-none border-b border-slate-200 bg-white">
        <div className="px-4 py-2 flex items-center justify-between">
          <div>
            <h1 className="text-sm font-semibold text-slate-700 leading-tight">Cadastro de Empresas</h1>
            <p className="text-xs text-slate-600">Sistema de gestão</p>
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
        </nav>
      </header>
      <main className="flex-1 min-h-0 overflow-hidden">{children}</main>
    </div>
  );
}

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin, logout } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (authError) {
    if (authError.type === "user_not_registered") return <UserNotRegisteredError />;
    if (authError.type === "auth_required") { navigateToLogin(); return null; }
    if (authError.type === "auth_not_configured") {
      const shouldShowEnvHint = String(authError.message || "").toLowerCase().includes("não configurado");
      return (
        <div className="fixed inset-0 flex items-center justify-center bg-white px-6">
          <div className="max-w-xl rounded border border-red-200 bg-red-50 p-5 text-sm text-red-800">
            <h2 className="mb-2 text-base font-semibold">Falha na autenticação</h2>
            <p>{authError.message}</p>
            {shouldShowEnvHint ? (
              <p className="mt-2">Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env para autenticação.</p>
            ) : null}
          </div>
        </div>
      );
    }
  }

  return (
    <Routes>
      <Route path="/" element={<MinimalLayout onLogout={logout}><PAGEMP /></MinimalLayout>} />
      <Route path="/CadastroEmpresas" element={<MinimalLayout onLogout={logout}><PAGEMP /></MinimalLayout>} />
      <Route path="*" element={<MinimalLayout onLogout={logout}><PAGEMP /></MinimalLayout>} />
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