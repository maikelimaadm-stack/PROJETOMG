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
  <EmpSplitToolbarLayout
    className={hidden ? "hidden" : "emp-table-view min-h-0 flex-1 h-full w-full"}
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
