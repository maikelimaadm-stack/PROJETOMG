import React from "react";
import MgDatePicker from "@/modules/empresas/layout/MgDatePicker";

/** Campo de data compacto para filtros ERP — alterações ficam em rascunho até OK. */
export default function ErpFilterDateInput({
  value = "",
  onChange,
  inputId,
  disabled = false,
}) {
  return (
    <div className="erp-filter-date-input">
      <MgDatePicker
        value={value}
        onChange={onChange}
        disabled={disabled}
        inputId={inputId}
      />
    </div>
  );
}
