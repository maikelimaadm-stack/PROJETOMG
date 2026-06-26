import React, { memo } from "react";
import MakFormShell from "@/framework/mak/form/MakFormShell";
import MakTable from "@/framework/mak/table/MakTable";
import SRCHEMP from "@/modules/empresas/components/SRCHEMP";

/**
 * Painéis reutilizáveis da futura Tela Mãe MAK.
 * Empresas usa estes wrappers; novos módulos substituem renderers via config futura.
 */

export const MakFormPanel = memo(function MakFormPanel({ formProps }) {
  const { key: formKey, ...rest } = formProps || {};
  return <MakFormShell formKey={formKey} {...rest} />;
});

export const MakTablePanel = memo(function MakTablePanel({ tableProps }) {
  const { key: tableKey, ...restTableProps } = tableProps || {};
  return (
    <div className="emp-table-panel flex min-h-0 flex-1 flex-col overflow-hidden">
      <MakTable key={tableKey} {...restTableProps} />
    </div>
  );
});

export const MakSearchPanel = memo(function MakSearchPanel({ searchProps }) {
  return (
    <div className="emp-cards-panel flex min-h-0 flex-1 flex-col overflow-hidden">
      <SRCHEMP {...searchProps} />
    </div>
  );
});

/** @deprecated alias Empresas — use MakFormPanel */
export const EmpresasFormPanel = MakFormPanel;
/** @deprecated alias Empresas — use MakTablePanel */
export const EmpresasTablePanel = MakTablePanel;
/** @deprecated alias Empresas — use MakSearchPanel */
export const EmpresasSearchPanel = MakSearchPanel;
