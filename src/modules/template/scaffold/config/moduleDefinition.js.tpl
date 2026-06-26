import { createCadastroModuleDefinition } from "@/framework/cadastro/moduleSchema";
import { assertMakModuleConfig } from "@/framework/mak/module/MakModuleConfig.js";
import { __API_NAME__ } from "@/modules/__MODULE_ID__/apis/__API_NAME__";
import __REPOSITORY_NAME__ from "@/modules/__MODULE_ID__/repositories/__REPOSITORY_NAME__";
import { __SCHEMA_NAME__ } from "@/modules/__MODULE_ID__/config/__SCHEMA_NAME__";

export const __MODULE_ID_PASCAL__ModuleDefinition = createCadastroModuleDefinition({
  moduleId: "__MODULE_ID__",
  entityName: "__ENTITY_NAME__",
  singularLabel: "__SINGULAR_LABEL__",
  pluralLabel: "__PLURAL_LABEL__",
  repository: __REPOSITORY_NAME__,
  api: __API_NAME__,
  schema: __SCHEMA_NAME__,
});

assertMakModuleConfig(__MODULE_ID_PASCAL__ModuleDefinition);
