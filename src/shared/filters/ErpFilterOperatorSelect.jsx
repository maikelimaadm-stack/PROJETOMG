import React from "react";
import MgCmdSelect from "@/modules/empresas/layout/MgCmdSelect";
import { getErpFilterOperators } from "@/shared/filters/erpFilterOperators";

const BOOLEAN_OPERATOR_OPTIONS = [
  { value: "", label: "Selecionar Operador" },
  { value: "Sim", label: "Sim" },
  { value: "Não", label: "Não" },
];

/** Seletor de operador no padrão cmd-select do ERP. */
export default function ErpFilterOperatorSelect({
  filterType,
  operator,
  onChange,
  disabled = false,
}) {
  const options =
    filterType === "boolean"
      ? BOOLEAN_OPERATOR_OPTIONS
      : [
          { value: "", label: "Selecionar Operador" },
          ...getErpFilterOperators(filterType).map((item) => ({
            value: item.value,
            label: item.label,
          })),
        ];

  return (
    <div className="erp-filter-operator-field">
      <MgCmdSelect
        value={operator || ""}
        options={options}
        onChange={onChange}
        placeholder="Selecionar Operador"
        disabled={disabled}
        closeSiblingsOnOpen={false}
        panelClassName="cmd-panel erp-filter-operator-panel"
      />
    </div>
  );
}
