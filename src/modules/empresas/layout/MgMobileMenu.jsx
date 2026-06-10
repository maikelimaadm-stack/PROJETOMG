import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Building2, LayoutDashboard, TrendingUp, Wallet, X } from "lucide-react";
import { useMgEmpresasChrome } from "@/modules/empresas/layout/MgEmpresasChromeContext";

const MOBILE_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/", active: false },
  { label: "Cadastros", icon: Building2, path: "/CadastroEmpresas", active: true },
  { label: "Financeiro", icon: Wallet, path: "/CadastroEmpresas", active: false },
  { label: "Vendas", icon: TrendingUp, path: "/CadastroEmpresas", active: false },
];

export default function MgMobileMenu() {
  const { mobileMenuOpen, closeMobileMenu } = useMgEmpresasChrome();

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") closeMobileMenu();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileMenuOpen, closeMobileMenu]);

  return (
    <div id="mobile-menu" className={`mobile-menu md:hidden${mobileMenuOpen ? " open" : ""}`}>
        <div className="flex items-center justify-between border-b p-4" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>
            Menu
          </h2>
          <button
            type="button"
            className="ios-btn"
            onClick={closeMobileMenu}
            style={{ background: "none", color: "var(--text-2)" }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-0.5 p-2">
          {MOBILE_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                to={item.path}
                onClick={closeMobileMenu}
                className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[13px]"
                style={
                  item.active
                    ? { background: "var(--accent-light)", color: "var(--accent)", fontWeight: 600 }
                    : { color: "var(--text-2)" }
                }
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
    </div>
  );
}
