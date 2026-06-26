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
  MakFormPanel as ModeloBase1FormPanel,
  MakTablePanel as ModeloBase1TablePanel,
  MakSearchPanel as ModeloBase1SearchPanel,
} from "@/framework/mak/page/MakCadastroPage";

/**
 * Dialogs extras do cadastro (export, anexos, confirmação).
 * Componentes injetados via config.components.Dialogs quando necessário.
 */
export const ModeloBase1ExtraDialogs = ({
  exportPdfProps,
  exportExcelProps,
  anexosProps,
  confirmDeleteProps,
}) => (
  <>
    <EmpConfiguracaoExportacaoDialog {...exportPdfProps} />
    <EmpConfiguracaoExportacaoDialog {...exportExcelProps} />
    <RegistroAnexosDialog {...anexosProps} />
    {confirmDeleteProps ? <ConfirmDialog {...confirmDeleteProps} /> : null}
  </>
);
