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
      <div className="min-w-0 flex-1 min-h-0 overflow-hidden flex flex-col">
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
    <TBLEMP {...tableProps} />
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
