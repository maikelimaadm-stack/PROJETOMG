import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FolderOpen, Pin } from "lucide-react";
import { ERP_MENU_SECTIONS, isRouteActive } from "@/shared/navigation/erpMenuConfig";
import { useMgEmpresasChrome } from "./MgEmpresasChromeContext";

export default function MgPrototypeSidebar({
  floating = false,
  open = false,
  onMouseEnter,
  onMouseLeave,
}) {
  const { pathname } = useLocation();
  const { sidebarPinned, toggleSidebarPinned } = useMgEmpresasChrome();
  const floatingClass = floating ? " erp-sidebar--floating flex" : " hidden shrink-0 md:flex";
  const openClass = floating && open ? " is-open" : "";

  return (
    <nav
      data-template-id="sidebar-nav"
      id="sidebar"
      className={`erp-sidebar flex-col${floatingClass}${sidebarPinned ? " pinned" : ""}${openClass}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="erp-scrollbar flex-1 space-y-0.5 overflow-y-auto px-2 py-2">
        {ERP_MENU_SECTIONS.map((section) => (
          <React.Fragment key={section.id}>
            <div
              className="ng px-3 pb-1 pt-3 text-[10px] font-semibold uppercase"
              style={{ color: "var(--text-3)", letterSpacing: "0.08em" }}
            >
              {section.label}
            </div>
            {(section.items ?? []).map((item) => {
              const active = isRouteActive(pathname, item.routePath);
              return (
                <Link
                  key={item.id}
                  to={item.routePath}
                  className={`ni${active ? " active" : ""}`}
                >
                  <FolderOpen className="h-4 w-4 shrink-0" />
                  <span className="nl">{item.label}</span>
                </Link>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      <div className="shrink-0 border-t p-2" style={{ borderColor: "var(--mg-divider, var(--border))" }}>
        <button type="button" className="ni ios-btn w-full" onClick={toggleSidebarPinned}>
          <Pin className="h-3.5 w-3.5 shrink-0" />
          <span className="nl">{sidebarPinned ? "Desfixar menu" : "Fixar menu"}</span>
        </button>
      </div>
    </nav>
  );
}
