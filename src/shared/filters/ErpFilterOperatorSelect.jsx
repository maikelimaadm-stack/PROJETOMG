import React, { useMemo } from "react";
import MgCmdSelect from "@/modules/empresas/layout/MgCmdSelect";
import {
  getErpFilterOperatorLabel,
  getErpListFilterOperators,
  normalizeErpFilterOperator,
} from "@/shared/filters/erpFilterOperators";

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
  const normalizedOperator = normalizeErpFilterOperator(operator, filterType);

  const options = useMemo(() => {
    if (filterType === "boolean") return BOOLEAN_OPERATOR_OPTIONS;
    const base = [
      { value: "", label: "Selecionar Operador" },
      ...getErpListFilterOperators(filterType).map((item) => ({
        value: item.value,
        label: item.label,
      })),
    ];
    if (
      normalizedOperator &&
      !base.some((item) => item.value === normalizedOperator)
    ) {
      base.push({
        value: normalizedOperator,
        label: getErpFilterOperatorLabel(normalizedOperator, filterType),
      });
    }
    return base;
  }, [filterType, normalizedOperator]);

  return (
    <div className="erp-filter-operator-field">
      <MgCmdSelect
        value={normalizedOperator}
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
