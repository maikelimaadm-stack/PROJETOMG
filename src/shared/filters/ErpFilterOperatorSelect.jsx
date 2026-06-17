import React from "react";
import MgCmdSelect from "@/modules/empresas/layout/MgCmdSelect";
import { getErpFilterOperators } from "@/shared/filters/erpFilterOperators";

/** Seletor de operador no padrão cmd-select do ERP. */
export default function ErpFilterOperatorSelect({ filterType, operator, onChange, disabled = false }) {
  const operators = getErpFilterOperators(filterType);
  const options = [
    { value: "", label: "Selecionar Operador" },
    ...operators.map((item) => ({ value: item.value, label: item.label })),
  ];

  return (
    <div className="erp-filter-operator-field">
      <MgCmdSelect
        label="Operador"
        value={operator || ""}
        options={options}
        onChange={onChange}
        placeholder="Pesquisar operador..."
        disabled={disabled}
      />
    </div>
  );
}
