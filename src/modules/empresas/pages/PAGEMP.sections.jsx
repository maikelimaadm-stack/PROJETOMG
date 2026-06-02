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
    <div className="relative flex min-h-0 flex-1 w-full overflow-hidden">
      <div className="flex min-h-0 flex-1 w-full flex-col overflow-hidden">
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
    className={hidden ? "hidden" : "emp-table-view min-h-0 flex-1 w-full"}
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
