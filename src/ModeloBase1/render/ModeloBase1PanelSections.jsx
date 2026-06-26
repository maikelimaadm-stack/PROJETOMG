/**
 * Seções promovidas do Cadastro de Empresas — única implementação de panels/dialogs.
 * Empresas e demais módulos consomem estes exports (sem cópia local).
 */
export {
  MakFormPanel,
  MakTablePanel,
  MakSearchPanel,
  MakFormPanel as ModeloBase1FormPanel,
  MakTablePanel as ModeloBase1TablePanel,
  MakSearchPanel as ModeloBase1SearchPanel,
  MakFormPanel as EmpresasFormPanel,
  MakTablePanel as EmpresasTablePanel,
  MakSearchPanel as EmpresasSearchPanel,
} from "@/framework/mak/page/MakCadastroPage";

import React from "react";
import EmpConfiguracaoExportacaoDialog from "@/framework/cadastro/configurators/EmpConfiguracaoExportacaoDialog";
import ConfirmDialog from "@/shared/components/ConfirmDialog";
import RegistroAnexosDialog from "@/framework/cadastro/attachments/RegistroAnexosDialog";

/**
 * Dialogs extras do cadastro (export, anexos, confirmação).
 * Promovido do PAGEMP master — injetado via config.components.Dialogs.
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

/** @deprecated alias Empresas — use ModeloBase1ExtraDialogs */
export const EmpresasDialogs = ModeloBase1ExtraDialogs;
