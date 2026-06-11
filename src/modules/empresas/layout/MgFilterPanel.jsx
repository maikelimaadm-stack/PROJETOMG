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

export default function MgFilterPanel({
  open,
  values = {},
  onChange,
  onClose,
  onClear,
  onApply,
  status = "Todos",
  onStatusChange,
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

        <div className="filter-panel__body">
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

        <div className="filter-panel__footer">
          <button type="button" className="tb-btn tb-btn-ghost" onClick={onClear}>
            Limpar
          </button>
          <button type="button" className="tb-btn tb-btn-blue" onClick={onApply}>
            Aplicar
          </button>
        </div>
      </div>
    </aside>
  );
}
