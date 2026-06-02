import React from "react";
import SankhyaListToolbar from "@/framework/cadastro/toolbars/EmpListToolbar";
import EmpSplitToolbarLayout from "@/framework/cadastro/layouts/EmpSplitToolbarLayout";
import FORMEMP from "@/modules/empresas/components/FORMEMP";
import TBLEMP from "@/modules/empresas/components/TBLEMP";
import EmpConfiguracaoExportacaoDialog from "@/framework/cadastro/configurators/EmpConfiguracaoExportacaoDialog";
import ConfirmDialog from "@/shared/components/ConfirmDialog";
import RegistroAnexosDialog from "@/framework/cadastro/attachments/RegistroAnexosDialog";

export const EmpresasFormPanel = ({ showForm, formProps }) => {
  if (!showForm) return null;
  return (
    <div className="relative flex h-full min-h-0 w-full flex-1 overflow-hidden">
      <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden">
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
  <EmpSplitToolbarLayout
    className={hidden ? "hidden" : "emp-table-view flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden"}
    contentClassName="emp-table-card"
    toolbar={<SankhyaListToolbar {...toolbarProps} />}
  >
    <div className="emp-table-panel flex min-h-0 flex-1 flex-col overflow-hidden">
      <TBLEMP {...tableProps} />
    </div>
  </EmpSplitToolbarLayout>
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
