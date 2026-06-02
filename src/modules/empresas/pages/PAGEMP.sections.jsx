import React from "react";
import SankhyaListToolbar from "@/framework/cadastro/toolbars/EmpListToolbar";
import FORMEMP from "@/modules/empresas/components/FORMEMP";
import TBLEMP from "@/modules/empresas/components/TBLEMP";
import EmpConfiguracaoCamposDialog from "@/framework/cadastro/configurators/EmpConfiguracaoCamposDialog";
import EmpConfiguracaoExportacaoDialog from "@/framework/cadastro/configurators/EmpConfiguracaoExportacaoDialog";
import ConfirmDialog from "@/shared/components/ConfirmDialog";
import RegistroAnexosDialog from "@/framework/cadastro/attachments/RegistroAnexosDialog";

export const EmpresasFormPanel = ({
  showForm,
  showConfigCampos,
  formProps,
  configCamposProps,
}) => {
  if (!showForm) return null;
  return (
    <div className="relative flex min-h-0 h-full w-full overflow-hidden">
      <div className="min-w-0 flex-1 h-full overflow-hidden">
        <FORMEMP {...formProps} />
      </div>
      {showConfigCampos && (
        <section className="absolute inset-0 z-[80] flex min-h-0 flex-col overflow-hidden bg-white">
          <EmpConfiguracaoCamposDialog {...configCamposProps} />
        </section>
      )}
    </div>
  );
};

export const EmpresasCamposOnlyPanel = ({ showForm, showConfigCampos, configCamposProps }) => {
  if (showForm || !showConfigCampos) return null;
  return (
    <section className="flex min-h-0 flex-1 h-full w-full overflow-hidden bg-white">
      <EmpConfiguracaoCamposDialog {...configCamposProps} />
    </section>
  );
};

export const EmpresasTablePanel = ({
  hidden,
  toolbarProps,
  tableProps,
}) => (
  <div className={hidden ? "hidden" : "flex min-h-0 flex-1 w-full overflow-hidden"}>
    <div className="min-w-0 flex-1 min-h-0 overflow-hidden flex flex-col">
      <div className="flex-none shrink-0">
        <SankhyaListToolbar {...toolbarProps} />
      </div>
      <TBLEMP {...tableProps} />
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

