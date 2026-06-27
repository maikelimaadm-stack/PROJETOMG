import { createCadastroModuleDefinition } from "@/framework/cadastro/moduleSchema";
import { __API_NAME__ } from "@/apis/__MODULE_ID__/__API_NAME__.js";
import __REPOSITORY_NAME__ from "@/modules/__MODULE_ID__/repositories/__REPOSITORY_NAME__.js";
import { __SCHEMA_NAME__ } from "@/modules/__MODULE_ID__/config/__SCHEMA_NAME__.js";

export const __MODULE_ID__ModuleDefinition = createCadastroModuleDefinition({
  moduleId: "__MODULE_ID__",
  entityName: "__ENTITY_NAME__",
  singularLabel: "__SINGULAR_LABEL__",
  pluralLabel: "__PLURAL_LABEL__",
  repository: __REPOSITORY_NAME__,
  api: __API_NAME__,
  schema: __SCHEMA_NAME__,
});
