import { buildModeloBase1ConfigFromMakModule } from "@/ModeloBase1/config/buildModeloBase1ConfigFromMakModule.js";
import { marcasMakModule } from "@/modules/marcas/config/marcasMakModule.js";

export const marcasModeloBase1Config = buildModeloBase1ConfigFromMakModule(marcasMakModule, {
  scopeCssClass: "cadastro-marcas-scope mg-empresas-scope",
  tableKey: "tbl-marcas",
});

export default marcasModeloBase1Config;
