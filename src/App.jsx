import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import { BrowserRouter as Router, Route, Routes, Link, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import UserNotRegisteredError from "@/components/UserNotRegisteredError";
import PAGEMP from "./pages/emp/PAGEMP";
import { base44 } from "@/api/base44Client";

function MinimalLayout({ children }) {
  const location = useLocation();

  return (
    <div className="h-[100dvh] overflow-hidden bg-white flex flex-col" style={{ "--app-content-offset": "73px" }}>
      <header className="flex-none border-b border-slate-200 bg-white">
        <div className="px-4 py-2 flex items-center justify-between">
          <div>
            <h1 className="text-sm font-semibold text-slate-600 leading-tight">Cadastro de Empresas</h1>
            <p className="text-xs text-slate-500">Sistema de gestão</p>
          </div>
          <button
            type="button"
            onClick={() => base44.auth.logout()}
            className="h-7 px-3 rounded-none border border-slate-300 bg-white text-xs text-slate-500 hover:text-slate-600 hover:bg-slate-50"
          >
            Sair
          </button>
        </div>
        <nav className="h-8 px-4 flex items-center border-t border-slate-200">
          <Link
            to="/CadastroEmpresas"
            className={`h-7 px-3 inline-flex items-center text-xs border-x border-slate-200 ${location.pathname === "/CadastroEmpresas" || location.pathname === "/" ? "font-semibold text-slate-600 bg-slate-50" : "text-slate-500 bg-white"}`}
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
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (authError) {
    if (authError.type === "user_not_registered") return <UserNotRegisteredError />;
    if (authError.type === "auth_required") {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/" element={<MinimalLayout><PAGEMP /></MinimalLayout>} />
      <Route path="/CadastroEmpresas" element={<MinimalLayout><PAGEMP /></MinimalLayout>} />
      <Route path="*" element={<MinimalLayout><PAGEMP /></MinimalLayout>} />
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