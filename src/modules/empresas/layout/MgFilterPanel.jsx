import React from "react";
import { X } from "lucide-react";
import MgCmdSelect from "@/modules/empresas/layout/MgCmdSelect";

const FILTER_FIELDS = [
  { key: "razao_social", label: "Razão Social" },
  { key: "nome_fantasia", label: "Nome Fantasia" },
  { key: "cnpj", label: "CNPJ" },
  { key: "telefone", label: "Telefone" },
  { key: "cidade", label: "Cidade" },
  { key: "uf", label: "UF" },
];

export default function MgFilterPanel({ open, values = {}, onChange, onClose, status = "Todos", onStatusChange }) {
  return (
    <aside id="filter-panel" className={`filter-panel${open ? " open" : ""}`}>
      <div className="space-y-3 p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold" style={{ color: "var(--text-1)" }}>
            Filtros
          </span>
          <button type="button" className="ios-btn" onClick={onClose} style={{ background: "none", color: "var(--text-3)" }}>
            <X className="h-4 w-4" />
          </button>
        </div>

        {FILTER_FIELDS.map((field) => (
          <div key={field.key} className="fg">
            <label className="fg-label">{field.label}</label>
            <input
              type="text"
              value={values[field.key] || ""}
              onChange={(event) => onChange?.(field.key, event.target.value)}
            />
          </div>
        ))}

        <MgCmdSelect
          label="Status"
          value={status}
          onChange={onStatusChange}
          options={[
            { value: "Todos", label: "Todos" },
            { value: "Ativo", label: "Ativo" },
            { value: "Inativo", label: "Inativo" },
          ]}
        />
      </div>
    </aside>
  );
}
