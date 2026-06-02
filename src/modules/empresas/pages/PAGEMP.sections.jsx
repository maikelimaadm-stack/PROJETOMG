import React from "react";
import SankhyaListToolbar from "@/framework/cadastro/toolbars/EmpListToolbar";
import FORMEMP from "@/modules/empresas/components/FORMEMP";
import TBLEMP from "@/modules/empresas/components/TBLEMP";
import EmpConfiguracaoExportacaoDialog from "@/framework/cadastro/configurators/EmpConfiguracaoExportacaoDialog";
import ConfirmDialog from "@/shared/components/ConfirmDialog";
import RegistroAnexosDialog from "@/framework/cadastro/attachments/RegistroAnexosDialog";

export const EmpresasFormPanel = ({ showForm, formProps }) => {
  if (!showForm) return null;
  return (
    <div className="relative flex min-h-0 h-full w-full overflow-hidden">
      <div className="min-w-0 flex-1 h-full overflow-hidden">
        <FORMEMP {...formProps} />
      </div>
    </div>
  );
};

export const EmpresasTablePanel = ({
  hidden,
  toolbarProps,
  tableProps,
}) => (
  <div className={hidden ? "hidden" : "flex min-h-0 flex-1 w-full flex-col overflow-hidden bg-white"}>
    <div className="min-w-0 flex-1 min-h-0 overflow-hidden flex flex-col bg-white">
      <div className="flex-none shrink-0 bg-white">
        <SankhyaListToolbar {...toolbarProps} />
      </div>
      <div className="emp-table-panel min-h-0 flex-1 overflow-hidden bg-white">
        <TBLEMP {...tableProps} />
      </div>
    </div>
  </div>
);

export const EmpresasDialogs = ({
  exportPdfProps,
  exportExcelProps,
  anexosProps,
  confirmDeleteProps,
}) => (
  <>
    <EmpConfiguracaoExportacaoDialog {...exportPdfProps} />
    <EmpConfiguracaoExportacaoDialog {...exportExcelProps} />
    <RegistroAnexosDialog {...anexosProps} />
    <ConfirmDialog {...confirmDeleteProps} />
  </>
);
