import { buildModeloBase1ConfigFromMakModule } from "@/ModeloBase1/config/buildModeloBase1ConfigFromMakModule.js";
import { buildModeloBase1ScopeCssClass } from "@/ModeloBase1/layout/modeloBase1ScopeCss.js";
import { __MODULE_ID__MakModule } from "@/modules/__MODULE_ID__/config/__MODULE_ID__MakModule.js";

export const __MODULE_ID__ModeloBase1Config = buildModeloBase1ConfigFromMakModule(__MODULE_ID__MakModule, {
  scopeCssClass: buildModeloBase1ScopeCssClass("__MODULE_ID__"),
  tableKey: "tbl-__MODULE_ID__",
});

export default __MODULE_ID__ModeloBase1Config;
