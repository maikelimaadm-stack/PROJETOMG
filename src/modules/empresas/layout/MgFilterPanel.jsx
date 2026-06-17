import React, { useMemo } from "react";
import { X } from "lucide-react";
import MgCmdSelect from "@/modules/empresas/layout/MgCmdSelect";
import { MG_FILTER_SIDEBAR_FIELDS } from "@/modules/empresas/layout/mgFilterFields";

const STATUS_OPTIONS = [
  { value: "Todos", label: "Todos" },
  { value: "Ativa", label: "Ativa" },
  { value: "Inativa", label: "Inativa" },
];

export default function MgFilterPanel({
  open,
  values = {},
  onChange,
  onClose,
  onClear,
  onApply,
  disabled = false,
}) {
  const statusValue = useMemo(() => {
    const current = values.status;
    if (Array.isArray(current) && current.length > 0) {
      if (current[0] === "Ativo") return "Ativa";
      if (current[0] === "Inativo") return "Inativa";
      return current[0];
    }
    return "Todos";
  }, [values.status]);

  return (
    <aside id="filter-panel" className={`filter-panel${open ? " open" : ""}`} aria-hidden={!open}>
      <div className="filter-panel__inner">
        <div className="filter-panel__header">
          <span className="filter-panel__title">Filtros</span>
          <button
            type="button"
            className="filter-panel__close ios-btn"
            onClick={onClose}
            aria-label="Fechar filtros"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="filter-panel__body">
          {MG_FILTER_SIDEBAR_FIELDS.map((field) => {
            const fieldValue = Array.isArray(values[field.key]) ? values[field.key][0] || "" : "";
            return (
              <div key={field.key} className="fg">
                <label className="fg-label">{field.label}</label>
                <input
                  type="text"
                  value={fieldValue}
                  disabled={disabled}
                  onChange={(event) => {
                    const next = event.target.value;
                    onChange?.(field.key, next ? [next] : []);
                  }}
                />
              </div>
            );
          })}

          <MgCmdSelect
            label="Status"
            value={statusValue}
            onChange={(nextValue) => onChange?.("status", nextValue === "Todos" ? [] : [nextValue])}
            options={STATUS_OPTIONS}
            disabled={disabled}
          />
        </div>

        <div className="filter-panel__footer">
          <button type="button" className="tb-btn tb-btn-ghost" onClick={onClear} disabled={disabled}>
            Limpar
          </button>
          <button type="button" className="tb-btn tb-btn-blue" onClick={() => onApply?.()} disabled={disabled}>
            Aplicar
          </button>
        </div>
      </div>
    </aside>
  );
}
