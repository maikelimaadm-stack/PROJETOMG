import { buildModeloBase1ConfigFromMakModule } from "@/ModeloBase1/config/buildModeloBase1ConfigFromMakModule.js";
import { buildModeloBase1ScopeCssClass } from "@/ModeloBase1/layout/modeloBase1ScopeCss.js";
import { produtosMakModule } from "@/modules/produtos/config/produtosMakModule.js";

export const produtosModeloBase1Config = buildModeloBase1ConfigFromMakModule(produtosMakModule, {
  scopeCssClass: buildModeloBase1ScopeCssClass("produtos"),
  tableKey: "tbl-produtos",
});

export default produtosModeloBase1Config;
