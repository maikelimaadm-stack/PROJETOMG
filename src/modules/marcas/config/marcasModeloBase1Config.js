import { buildModeloBase1ConfigFromMakModule } from "@/ModeloBase1/config/buildModeloBase1ConfigFromMakModule.js";
import { buildModeloBase1ScopeCssClass } from "@/ModeloBase1/layout/modeloBase1ScopeCss.js";
import { marcasMakModule } from "@/modules/marcas/config/marcasMakModule.js";

export const marcasModeloBase1Config = buildModeloBase1ConfigFromMakModule(marcasMakModule, {
  scopeCssClass: buildModeloBase1ScopeCssClass("marcas"),
  tableKey: "tbl-marcas",
});

export default marcasModeloBase1Config;
