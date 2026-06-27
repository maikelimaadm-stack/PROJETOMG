/**
 * Toolbar/panels padrão ModeloBase1 — paridade visual com Cadastro de Empresas.
 */
import {
  MakFormPanel,
  MakTablePanel,
  MakSearchPanel,
  ModeloBase1ExtraDialogs,
} from "@/ModeloBase1/render/ModeloBase1PanelSections.jsx";
import MakLoadBatchControls from "@/ModeloBase1/components/MakLoadBatchControls.jsx";

export function buildModeloBase1ToolbarComponents() {
  return {
    FormPanel: MakFormPanel,
    SearchPanel: MakSearchPanel,
    TablePanel: MakTablePanel,
    Dialogs: ModeloBase1ExtraDialogs,
    LoadBatchControls: MakLoadBatchControls,
  };
}

export const modeloBase1ToolbarComponents = buildModeloBase1ToolbarComponents();

export default modeloBase1ToolbarComponents;
