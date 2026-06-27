/**
 * Empresas — layout, view mode, scope CSS, cards visibility.
 * Layout Configuration Engine promovida para ModeloBase1 via cadastroConfig.
 */
import { buildModeloBase1ScopeCssClass } from "@/ModeloBase1/layout/modeloBase1ScopeCss.js";
import { buildMakLayoutConfigMetadata } from "@/framework/mak/layoutConfig/buildMakLayoutConfigMetadata.js";
import { empresasCadastroConfig } from "@/modules/empresas/config/empresasCadastroConfig.js";

export { getFieldsPerRowForLayout } from "@/modules/empresas/components/empSearchView.constants";

export const empresasLayoutConfig = {
  scopeCssClass: buildModeloBase1ScopeCssClass("empresas"),
  listMode: "infinite",
  layoutEngine: buildMakLayoutConfigMetadata(empresasCadastroConfig),
};
