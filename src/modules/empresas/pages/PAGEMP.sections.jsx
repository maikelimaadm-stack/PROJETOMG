import React from "react";
import EmpConfiguracaoExportacaoDialog from "@/framework/cadastro/configurators/EmpConfiguracaoExportacaoDialog";
import ConfirmDialog from "@/shared/components/ConfirmDialog";
import RegistroAnexosDialog from "@/framework/cadastro/attachments/RegistroAnexosDialog";
import {
  MakFormPanel,
  MakTablePanel,
  MakSearchPanel,
} from "@/framework/mak/page/MakCadastroPage";

export {
  MakFormPanel,
  MakTablePanel,
  MakSearchPanel,
  MakFormPanel as EmpresasFormPanel,
  MakTablePanel as EmpresasTablePanel,
  MakSearchPanel as EmpresasSearchPanel,
} from "@/framework/mak/page/MakCadastroPage";

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
