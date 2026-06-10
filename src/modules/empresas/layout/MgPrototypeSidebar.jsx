import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BarChart2,
  Building2,
  FileText,
  Hexagon,
  LayoutDashboard,
  Package,
  Pin,
  Settings,
  ShoppingCart,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { useMgEmpresasChrome } from "@/modules/empresas/layout/MgEmpresasChromeContext";

const MODULES = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { id: "cadastros", label: "Cadastros", icon: Building2, path: "/CadastroEmpresas", active: true },
  { id: "financeiro", label: "Financeiro", icon: Wallet, path: "/CadastroEmpresas" },
  { id: "compras", label: "Compras", icon: ShoppingCart, path: "/CadastroEmpresas" },
  { id: "vendas", label: "Vendas", icon: TrendingUp, path: "/CadastroEmpresas" },
  { id: "estoque", label: "Estoque", icon: Package, path: "/CadastroEmpresas" },
  { id: "fiscal", label: "Fiscal", icon: FileText, path: "/CadastroEmpresas" },
  { id: "rh", label: "RH", icon: Users, path: "/CadastroEmpresas" },
  { id: "relatorios", label: "Relatórios", icon: BarChart2, path: "/CadastroEmpresas" },
  { id: "config", label: "Configurações", icon: Settings, path: "/CadastroEmpresas" },
];

export default function MgPrototypeSidebar() {
  const { pathname } = useLocation();
  const { sidebarPinned, toggleSidebarPinned } = useMgEmpresasChrome();

  const isEmpresas =
    pathname === "/" || pathname === "/CadastroEmpresas";

  return (
    <nav
      data-template-id="sidebar-nav"
      id="sidebar"
      className={`erp-sidebar hidden shrink-0 flex-col md:flex${sidebarPinned ? " pinned" : ""}`}
      style={{ background: "var(--bg-surface)" }}
    >
      <div
        className="flex h-12 shrink-0 items-center justify-center border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <div
          className="flex h-8 w-8 items-center justify-center rounded-xl"
          style={{ background: "linear-gradient(135deg, var(--accent), #60A5FA)" }}
        >
          <Hexagon className="h-4 w-4 text-white" />
        </div>
      </div>

      <div className="flex-1 space-y-0.5 overflow-y-auto px-2 py-2">
        <div className="ng px-3 pb-1 pt-3 text-[10px] font-semibold" style={{ color: "var(--text-3)", letterSpacing: "0.08em" }}>
          MÓDULOS
        </div>
        {MODULES.map((item) => {
          const Icon = item.icon;
          const active = item.id === "cadastros" && isEmpresas;
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`ni${active ? " active" : ""}`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="nl">{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="shrink-0 border-t p-2" style={{ borderColor: "var(--border)" }}>
        <button type="button" className="ni ios-btn w-full" onClick={toggleSidebarPinned}>
          <Pin className="h-3.5 w-3.5 shrink-0" />
          <span className="nl text-[11px]">Fixar menu</span>
        </button>
      </div>
    </nav>
  );
}
