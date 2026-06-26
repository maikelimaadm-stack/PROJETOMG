/**
 * Empresas — toolbar, panels, search (componentes visuais injetados no motor).
 */
import {
  EmpresasDialogs,
  EmpresasFormPanel,
  EmpresasSearchPanel,
  EmpresasTablePanel,
} from "@/ModeloBase1/render/ModeloBase1PanelSections.jsx";

export const empresasToolbarComponents = {
  FormPanel: EmpresasFormPanel,
  SearchPanel: EmpresasSearchPanel,
  TablePanel: EmpresasTablePanel,
  Dialogs: EmpresasDialogs,
};

export { default as EmpLoadBatchControls } from "@/modules/empresas/components/EmpLoadBatchControls.jsx";
