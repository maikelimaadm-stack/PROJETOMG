import React from "react";
import { FileText, LayoutGrid, Table } from "lucide-react";

const ITEMS = [
  { id: "registro", label: "Registro", icon: FileText },
  { id: "tabela", label: "Tabela", icon: Table },
  { id: "cards", label: "Cards", icon: LayoutGrid },
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
