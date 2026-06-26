import React, { useCallback, useState } from "react";
import { useLocation } from "react-router-dom";
import { Bell, ChevronRight, CircleHelp, Grid3x3, Hexagon, Menu, User } from "lucide-react";
import { useAuth } from "@/shared/contexts/AuthContext";
import { buildErpBreadcrumbs } from "@/shared/navigation/erpMenuConfig";
import { useMgEmpresasChrome } from "./MgEmpresasChromeContext";
import ErpThemeToggle from "@/shared/components/ErpThemeToggle";
import MgPrototypeSidebar from "./MgPrototypeSidebar";

function getUserInitials(user) {
  const name = String(user?.nome || user?.usuario || user?.email || "AR").trim();
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function MgDesktopHeader() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { breadcrumbSuffix, sidebarPinned, toggleSidebarPinned } = useMgEmpresasChrome();
  const [menuHoverOpen, setMenuHoverOpen] = useState(false);
  const initials = getUserInitials(user);
  const crumbs = buildErpBreadcrumbs(pathname);
  const desktopMenuOpen = sidebarPinned || menuHoverOpen;

  const handleMenuHoverEnter = useCallback(() => {
    if (!sidebarPinned) setMenuHoverOpen(true);
  }, [sidebarPinned]);

  const handleMenuHoverLeave = useCallback(() => {
    if (!sidebarPinned) setMenuHoverOpen(false);
  }, [sidebarPinned]);

  const handleMenuButtonClick = useCallback(() => {
    if (sidebarPinned) {
      toggleSidebarPinned();
      setMenuHoverOpen(false);
      return;
    }
    toggleSidebarPinned();
    setMenuHoverOpen(true);
  }, [sidebarPinned, toggleSidebarPinned]);

  if (breadcrumbSuffix) {
    crumbs.push({ label: breadcrumbSuffix, isPageTitle: true });
  }

  return (
    <header data-template-id="header-bar" className="mg-desktop-header hidden shrink-0 md:flex">
      <div className="mg-desktop-header__left">
        <div
          className={`mg-desktop-menu-anchor${desktopMenuOpen ? " is-open" : ""}${sidebarPinned ? " is-pinned" : ""}`}
          onMouseEnter={handleMenuHoverEnter}
          onMouseLeave={handleMenuHoverLeave}
        >
          <button
            type="button"
            className={`mg-topbar-icon-btn ios-btn mg-desktop-menu-trigger${sidebarPinned ? " is-active" : ""}`}
            aria-label={sidebarPinned ? "Desfixar menu" : "Fixar menu"}
            aria-haspopup="menu"
            aria-expanded={desktopMenuOpen}
            onClick={handleMenuButtonClick}
          >
            <Menu className="h-3.5 w-3.5" />
          </button>

          <MgPrototypeSidebar
            floating
            open={desktopMenuOpen}
            onMouseEnter={handleMenuHoverEnter}
            onMouseLeave={handleMenuHoverLeave}
          />
        </div>

        <nav className="mg-desktop-header__crumbs" aria-label="Navegação">
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1;
            const key = `${typeof crumb.label === "string" ? crumb.label : "crumb"}-${index}`;
            return (
              <React.Fragment key={key}>
                {index > 0 ? <ChevronRight className="mg-desktop-header__sep" aria-hidden="true" /> : null}
                <span
                  className={`mg-desktop-header__crumb${isLast ? " mg-desktop-header__crumb--current" : ""}`}
                >
                  {crumb.label}
                </span>
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      <div className="mg-desktop-header__actions">
        <ErpThemeToggle />
        <button type="button" className="mg-topbar-icon-btn ios-btn" aria-label="Notificações">
          <Bell className="h-3.5 w-3.5" />
        </button>
        <button type="button" className="mg-topbar-icon-btn ios-btn" aria-label="Ajuda">
          <CircleHelp className="h-3.5 w-3.5" />
        </button>
        <button type="button" className="mg-topbar-icon-btn ios-btn" aria-label="Aplicativos">
          <Grid3x3 className="h-3.5 w-3.5" />
        </button>
        <button type="button" className="mg-topbar-icon-btn ios-btn" aria-label="Usuário">
          {initials ? <span className="mg-topbar-user-initials">{initials}</span> : <User className="h-3.5 w-3.5" />}
        </button>
        <div className="mg-desktop-header__logo" aria-hidden="true">
          <Hexagon className="h-4 w-4 text-white" strokeWidth={2.2} />
        </div>
      </div>
    </header>
  );
}
