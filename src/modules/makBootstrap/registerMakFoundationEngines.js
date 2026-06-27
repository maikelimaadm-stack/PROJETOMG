/**
 * Registro de engines Foundation para módulos certificados.
 */
import registry from "../../../config/cadastro-modules.registry.json";
import { registerMakImportModule } from "@/framework/mak/import/index.js";
import { registerMakHistoryModule } from "@/framework/mak/history/index.js";
import { buildMakImportMetadata } from "@/framework/mak/import/buildMakImportMetadata.js";
import { buildMakHistoryMetadata } from "@/framework/mak/history/buildMakHistoryMetadata.js";

registry
  .filter((module) => module.ativo !== false)
  .forEach((module) => {
    registerMakImportModule(module.moduleId, {
      entityName: module.entityName,
      metadata: buildMakImportMetadata({ entityName: module.entityName }),
    });
    registerMakHistoryModule(module.moduleId, {
      entityName: module.entityName,
      metadata: buildMakHistoryMetadata({ entityName: module.entityName }),
    });
  });
