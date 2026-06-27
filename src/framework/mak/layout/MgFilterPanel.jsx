import React, { useMemo } from "react";
import { X } from "lucide-react";
import MgCmdSelect from "./MgCmdSelect";

const DEFAULT_STATUS_OPTIONS = [
  { value: "Todos", label: "Todos" },
  { value: "Ativo", label: "Ativo" },
  { value: "Inativo", label: "Inativo" },
];

export default function MgFilterPanel({
  open,
  values = {},
  onChange,
  onClose,
  onClear,
  onApply,
  disabled = false,
  textFields = [],
  statusField = null,
}) {
  const resolvedStatusField = statusField ?? {
    key: "status",
    label: "Status",
    options: DEFAULT_STATUS_OPTIONS,
  };

  const statusOptions = resolvedStatusField.options ?? DEFAULT_STATUS_OPTIONS;

  const statusValue = useMemo(() => {
    if (typeof resolvedStatusField.normalizeRead === "function") {
      return resolvedStatusField.normalizeRead(values);
    }
    const current = values[resolvedStatusField.key];
    if (Array.isArray(current) && current.length > 0) {
      return current[0];
    }
    return "Todos";
  }, [values, resolvedStatusField]);

  const handleStatusChange = (nextValue) => {
    const normalized =
      typeof resolvedStatusField.normalizeWrite === "function"
        ? resolvedStatusField.normalizeWrite(nextValue)
        : nextValue;
    onChange?.(
      resolvedStatusField.key,
      normalized === "Todos" || !normalized ? [] : [normalized]
    );
  };

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
          {textFields.map((field) => {
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

          {resolvedStatusField ? (
            <MgCmdSelect
              label={resolvedStatusField.label ?? "Status"}
              value={statusValue}
              onChange={handleStatusChange}
              options={statusOptions}
              disabled={disabled}
            />
          ) : null}
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
