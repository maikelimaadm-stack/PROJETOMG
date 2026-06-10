import React from "react";
import { Bell, ChevronRight } from "lucide-react";
import { useAuth } from "@/shared/contexts/AuthContext";

function getUserInitials(user) {
  const name = String(user?.nome || user?.usuario || user?.email || "AR").trim();
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function MgDesktopHeader() {
  const { user } = useAuth();
  const initials = getUserInitials(user);

  return (
    <header
      data-template-id="header-bar"
      className="mg-desktop-header hidden shrink-0 items-center justify-between border-b px-5 md:flex"
      style={{ height: 44, borderColor: "var(--border)", background: "var(--bg-card)" }}
    >
      <nav className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--text-3)" }}>
        <span>Cadastro</span>
        <ChevronRight className="h-2.5 w-2.5" />
        <span style={{ color: "var(--text-1)", fontWeight: 600 }}>Empresas</span>
      </nav>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="ios-btn flex h-7 w-7 items-center justify-center rounded-lg"
          style={{ background: "var(--gray-fill)", color: "var(--text-2)" }}
          aria-label="Notificações"
        >
          <Bell className="h-3.5 w-3.5" />
        </button>
        <div
          className="flex h-7 w-7 items-center justify-center rounded-lg text-[9px] font-bold text-white"
          style={{ background: "linear-gradient(135deg, var(--accent), #60A5FA)" }}
        >
          {initials}
        </div>
      </div>
    </header>
  );
}
