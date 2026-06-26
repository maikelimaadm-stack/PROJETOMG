/**
 * Empresas — layout, view mode, scope CSS, cards visibility.
 */
import { buildModeloBase1ScopeCssClass } from "@/ModeloBase1/layout/modeloBase1ScopeCss.js";

export { getFieldsPerRowForLayout } from "@/modules/empresas/components/empSearchView.constants";

export const empresasLayoutConfig = {
  scopeCssClass: buildModeloBase1ScopeCssClass("empresas"),
  listMode: "infinite",
};
