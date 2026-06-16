import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FolderOpen, X } from "lucide-react";
import { isRouteActive } from "@/shared/navigation/erpMenuConfig";
import { useMgEmpresasChrome } from "@/modules/empresas/layout/MgEmpresasChromeContext";
import { getErpFlatMenuItems } from "@/modules/empresas/layout/mgMenuItems";

export default function MgMobileMenu() {
  const { pathname } = useLocation();
  const { mobileMenuOpen, closeMobileMenu } = useMgEmpresasChrome();
  const menuItems = getErpFlatMenuItems();

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
          className="ios-btn flex min-h-11 min-w-11 items-center justify-center"
          onClick={closeMobileMenu}
          style={{ background: "none", color: "var(--text-2)" }}
          aria-label="Fechar menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="space-y-0.5 p-2">
        {menuItems.map((item) => {
          const active = isRouteActive(pathname, item.path);
          return (
            <Link
              key={item.id}
              to={item.path}
              onClick={closeMobileMenu}
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-[13px]"
              style={
                active
                  ? { background: "var(--accent-light)", color: "var(--accent)", fontWeight: 600 }
                  : { color: "var(--text-2)" }
              }
            >
              <FolderOpen className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
