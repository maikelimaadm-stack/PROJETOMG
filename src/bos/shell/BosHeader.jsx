import { Link, useLocation } from "react-router-dom";
import ErpEmpresaSelector from "@/shared/layouts/ErpEmpresaSelector";
import ErpThemeToggle from "@/shared/components/ErpThemeToggle";
import ErpGlobalTopProgress from "@/shared/components/ErpGlobalTopProgress";
import { Button } from "@/shared/ui/button";
import { BOS_PRIMARY_NAV } from "@/bos/config/bosNavConfig";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { LogOut } from "lucide-react";

const AUTHORIZED_SCOPE_OPTION = "__AUTHORIZED_SCOPE__";

function resolveCompanySelectorValue(selectedEmpresaId, allowAllEmpresas) {
  if (selectedEmpresaId === "all") return "all";
  const normalizedId = selectedEmpresaId != null ? String(selectedEmpresaId).trim() : "";
  if (normalizedId) return normalizedId;
  return allowAllEmpresas ? "all" : AUTHORIZED_SCOPE_OPTION;
}

export function BosHeader({
  user,
  cliente,
  empresas,
  selectedEmpresaId,
  allowAllEmpresas,
  onSelectEmpresa,
  onLogout,
}) {
  const location = useLocation();
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const selectorValue = resolveCompanySelectorValue(selectedEmpresaId, allowAllEmpresas);

  return (
    <header className="bos-header sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <ErpGlobalTopProgress active={isFetching > 0 || isMutating > 0} />
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 lg:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link to="/" className="bos-brand flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-600 to-indigo-600 text-sm font-bold text-white">
              M
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-slate-900">MAK Business OS</div>
              <div className="truncate text-[11px] text-slate-500">Operação de negócio</div>
            </div>
          </Link>
        </div>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Navegação principal">
          {BOS_PRIMARY_NAV.map((item) => {
            const isHome = item.route === "/";
            const active = isHome
              ? location.pathname === "/" || location.pathname === "/bos"
              : location.hash && item.route.endsWith(location.hash);
            return (
              <Link
                key={item.id}
                to={item.route}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  active ? "bg-sky-50 text-sky-800" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <label className="hidden text-xs text-slate-600 sm:inline">Empresa:</label>
          <ErpEmpresaSelector
            value={selectorValue}
            allowAllEmpresas={allowAllEmpresas}
            empresas={empresas}
            onChange={onSelectEmpresa}
          />
          <ErpThemeToggle />
          <div className="hidden text-right lg:block">
            <div className="text-xs font-medium text-slate-800">{user?.nome ?? user?.usuario ?? "Usuário"}</div>
            <div className="text-[10px] text-slate-500">{cliente?.nome ?? cliente?.codigo ?? "Tenant"}</div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1 px-2 text-xs"
            onClick={onLogout}
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

export default BosHeader;
