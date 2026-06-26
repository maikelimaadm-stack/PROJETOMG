import React, { memo } from "react";
import MakFormShell from "@/framework/mak/form/MakFormShell";
import MakTable from "@/framework/mak/table/MakTable";
import { useMakModuleRequired } from "@/framework/mak/runtime/MakModuleContext.jsx";

/**
 * Painéis reutilizáveis da Tela Mãe MAK.
 * Consomem runtime via MakModuleProvider (declarativo por módulo).
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
  const module = useMakModuleRequired();
  const SearchPanel = module.components?.SearchPanel;
  if (!SearchPanel) {
    throw new Error("MakSearchPanel: module.components.SearchPanel is required");
  }
  return (
    <div className="emp-cards-panel flex min-h-0 flex-1 flex-col overflow-hidden">
      <SearchPanel {...searchProps} />
    </div>
  );
});

/** @deprecated alias Empresas — use MakFormPanel */
export const EmpresasFormPanel = MakFormPanel;
/** @deprecated alias Empresas — use MakTablePanel */
export const EmpresasTablePanel = MakTablePanel;
/** @deprecated alias Empresas — use MakSearchPanel */
export const EmpresasSearchPanel = MakSearchPanel;
