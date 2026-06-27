import { buildModeloBase1ConfigFromMakModule } from "@/ModeloBase1/config/buildModeloBase1ConfigFromMakModule.js";
import { buildModeloBase1ScopeCssClass } from "@/ModeloBase1/layout/modeloBase1ScopeCss.js";
import { cadcpsMakModule } from "@/modules/cadcps/config/cadcpsMakModule.js";

export const cadcpsModeloBase1Config = buildModeloBase1ConfigFromMakModule(cadcpsMakModule, {
  scopeCssClass: buildModeloBase1ScopeCssClass("cadcps"),
  tableKey: "tbl-cadcps",
});

export default cadcpsModeloBase1Config;
