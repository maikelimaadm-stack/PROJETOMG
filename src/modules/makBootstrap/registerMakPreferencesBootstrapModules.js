/** Side-effect imports — registram bootstrap de preferências por módulo certificado. */
import "@/modules/empresas/preferences/registerEmpresasPreferencesBootstrap.js";
import "@/modules/produtos/preferences/registerProdutosPreferencesBootstrap.js";
import "@/modules/marcas/preferences/registerMarcasPreferencesBootstrap.js";
import "@/modules/cadcps/preferences/registerCadcpsPreferencesBootstrap.js";
import "@/modules/makBootstrap/registerMakFoundationEngines.js";
import "@/modules/makBootstrap/registerMakLayoutConfigEngine.js";
import "@/modules/makBootstrap/registerMakFieldConfigEngine.js";
import "@/modules/makBootstrap/registerMakValidationConfigEngine.js";
import "@/modules/makBootstrap/registerMakFormulaConfigEngine.js";
import "@/modules/makBootstrap/registerMakEventConfigEngine.js";
import "@/modules/makBootstrap/registerMakActionConfigEngine.js";
import "@/modules/makBootstrap/registerMakWorkflowConfigEngine.js";

export { listMakPreferencesBootstrapModuleIds } from "@/framework/mak/preferences/bootstrapRegistry.js";
