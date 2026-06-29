/** Side-effect imports — registram bootstrap de preferências por módulo certificado. */
import "@/modules/empresas/preferences/registerEmpresasPreferencesBootstrap.js";
import "@/modules/cadcps/preferences/registerCadcpsPreferencesBootstrap.js";
import "@/modules/makBootstrap/registerRuntimeBridge.js";

export { listMakPreferencesBootstrapModuleIds } from "@/framework/mak/preferences/bootstrapRegistry.js";
