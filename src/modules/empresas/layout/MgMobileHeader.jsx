import React from "react";
import { Filter, Menu } from "lucide-react";
import { SidebarTrigger } from "@/shared/ui/sidebar";

export default function MgMobileHeader({ title = "Empresas", onToggleFilter }) {
  return (
    <header className="mobile-header md:hidden">
      <SidebarTrigger
        className="ios-btn flex h-9 w-9 items-center justify-center"
        style={{ color: "var(--text-2)" }}
      >
        <Menu className="h-5 w-5" />
      </SidebarTrigger>
      <div className="min-w-0 flex-1">
        <h1
          className="truncate text-[15px] font-bold"
          style={{ color: "var(--text-1)" }}
        >
          {title}
        </h1>
      </div>
      {onToggleFilter ? (
        <button
          type="button"
          className="ios-btn flex h-9 w-9 items-center justify-center"
          style={{ color: "var(--text-3)" }}
          onClick={onToggleFilter}
          aria-label="Filtros"
        >
          <Filter className="h-5 w-5" />
        </button>
      ) : null}
    </header>
  );
}
