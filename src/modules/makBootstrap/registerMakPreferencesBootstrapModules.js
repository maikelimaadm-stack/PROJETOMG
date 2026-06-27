/** Side-effect imports — registram bootstrap de preferências por módulo certificado. */
import "@/modules/empresas/preferences/registerEmpresasPreferencesBootstrap.js";
import "@/modules/produtos/preferences/registerProdutosPreferencesBootstrap.js";
import "@/modules/marcas/preferences/registerMarcasPreferencesBootstrap.js";
import "@/modules/cadcps/preferences/registerCadcpsPreferencesBootstrap.js";

export { listMakPreferencesBootstrapModuleIds } from "@/framework/mak/preferences/bootstrapRegistry.js";
