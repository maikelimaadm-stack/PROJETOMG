import React from "react";
import { X } from "lucide-react";
import MgFilterPills from "@/modules/empresas/layout/MgFilterPills";

export default function MgFilterPanel({
  open,
  values = {},
  appliedValues = {},
  empresas = [],
  onChange,
  onClose,
  onClear,
  onApply,
  disabled = false,
}) {
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

        <div className="filter-panel__body mg-filter-panel__body">
          <MgFilterPills
            values={values}
            appliedValues={appliedValues}
            empresas={empresas}
            onChange={onChange}
            onClear={onClear}
            onApply={onApply}
            disabled={disabled}
            className="mg-filter-pills--drawer"
          />
        </div>

        <div className="filter-panel__footer">
          <button type="button" className="tb-btn tb-btn-ghost" onClick={onClear} disabled={disabled}>
            Limpar
          </button>
          <button type="button" className="tb-btn tb-btn-blue" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </aside>
  );
}
