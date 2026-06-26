import { registerMakPreferencesBootstrapModule } from "@/framework/mak/preferences/bootstrapRegistry.js";
import { useEmpresasPreferencesBootstrap } from "@/modules/empresas/preferences/useEmpresasPreferencesBootstrap";

registerMakPreferencesBootstrapModule("empresas", useEmpresasPreferencesBootstrap);
