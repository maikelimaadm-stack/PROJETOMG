/**
 * Empresas — toolbar, panels, search (componentes visuais injetados no motor ModeloBase1).
 */
import {
  EmpresasDialogs,
  EmpresasFormPanel,
  EmpresasSearchPanel,
  EmpresasTablePanel,
} from "@/ModeloBase1/render/ModeloBase1PanelSections.jsx";
import MakLoadBatchControls from "@/ModeloBase1/components/MakLoadBatchControls.jsx";

export const empresasToolbarComponents = {
  FormPanel: EmpresasFormPanel,
  SearchPanel: EmpresasSearchPanel,
  TablePanel: EmpresasTablePanel,
  Dialogs: EmpresasDialogs,
  LoadBatchControls: MakLoadBatchControls,
};

export { MakLoadBatchControls as EmpLoadBatchControls };
