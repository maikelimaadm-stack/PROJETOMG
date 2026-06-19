import React from "react";
import { FileText, LayoutDashboard, TableProperties } from "lucide-react";

const ITEMS = [
  { id: "registro", label: "Registro", icon: FileText },
  { id: "tabela", label: "Tabela", icon: TableProperties },
  { id: "cards", label: "Cards", icon: LayoutDashboard },
];

export default function MgMobileViewBar({ value, onChange, disabled = false }) {
  return (
    <div className="mobile-bottom-bar md:hidden">
      {ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            className={value === item.id ? "active" : ""}
            disabled={disabled}
            onClick={() => onChange?.(item.id)}
          >
            <Icon className="h-5 w-5" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
