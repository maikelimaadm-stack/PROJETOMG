/**
 * Empresas — toolbar, panels, search (componentes visuais injetados no motor).
 */
import {
  EmpresasDialogs,
  EmpresasFormPanel,
  EmpresasSearchPanel,
  EmpresasTablePanel,
} from "@/modules/empresas/pages/PAGEMP.sections";

export const empresasToolbarComponents = {
  FormPanel: EmpresasFormPanel,
  SearchPanel: EmpresasSearchPanel,
  TablePanel: EmpresasTablePanel,
  Dialogs: EmpresasDialogs,
};

export { default as EmpLoadBatchControls } from "@/modules/empresas/components/EmpLoadBatchControls.jsx";
