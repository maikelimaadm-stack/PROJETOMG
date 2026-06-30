import { Suspense } from "react";
import { useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/shared/contexts/AuthContext";
import BosShell from "@/bos/shell/BosShell";

function BosLoadingFallback() {
  return (
    <div className="flex h-40 items-center justify-center text-sm text-slate-500">
      Carregando Business Operating Shell...
    </div>
  );
}

export function BosLayoutRoute() {
  const location = useLocation();
  const {
    logout,
    empresas,
    allowAllEmpresas,
    selectedEmpresaId,
    selectEmpresa,
    user,
    cliente,
  } = useAuth();

  return (
    <BosShell
      key={location.pathname}
      user={user}
      cliente={cliente}
      empresas={empresas}
      allowAllEmpresas={allowAllEmpresas}
      selectedEmpresaId={selectedEmpresaId}
      onSelectEmpresa={selectEmpresa}
      onLogout={logout}
    >
      <Suspense fallback={<BosLoadingFallback />}>
        <Outlet />
      </Suspense>
    </BosShell>
  );
}

export default BosLayoutRoute;
