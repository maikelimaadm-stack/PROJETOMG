import { buildModeloBase1ConfigFromMakModule } from "@/ModeloBase1/config/buildModeloBase1ConfigFromMakModule.js";
import { buildModeloBase1ScopeCssClass } from "@/ModeloBase1/layout/modeloBase1ScopeCss.js";
import { cadcpsMakModule } from "@/modules/cadcps/config/cadcpsMakModule.js";
import { createCadcpsModeloBase1BetaReadModel } from "@/runtime/modelobase1-direct-beta/createCadcpsModeloBase1BetaReadModel.js";
import { isCadcpsModeloBase1BetaEnabled } from "@/runtime/modelobase1-direct-beta/modeloBase1DirectBetaConfig.js";

// Direct-beta read model (runtime v2, read-only) — injected ONLY when
// `MAK_MODELOBASE1_CADCPS_BETA` (or the umbrella flag) is on (dev-only,
// fail-closed in production). Flag off → `null` → fallback to the current
// config, byte-identical to the pre-beta behavior. Reversible by flag.
const cadcpsBetaReadModel = isCadcpsModeloBase1BetaEnabled()
  ? createCadcpsModeloBase1BetaReadModel()
  : null;

export const cadcpsModeloBase1Config = buildModeloBase1ConfigFromMakModule(cadcpsMakModule, {
  scopeCssClass: buildModeloBase1ScopeCssClass("cadcps"),
  tableKey: "tbl-cadcps",
  runtimeReadModel: cadcpsBetaReadModel,
});

export default cadcpsModeloBase1Config;
