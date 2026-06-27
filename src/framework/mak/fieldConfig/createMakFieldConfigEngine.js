import { ensureBuiltinFieldTypes, registerBuiltinFieldTypes } from "@/framework/cadastro-engine/field/registerBuiltinFieldTypes.js";
import { getFieldTypeDefinition, listFieldTypes, registerFieldType } from "@/framework/cadastro-engine/field/FieldRegistry.js";
import { FieldEngine } from "@/framework/cadastro-engine/field/FieldEngine.js";
import { CustomFieldEngine } from "@/framework/cadastro-engine/custom-field/CustomFieldEngine.js";
import { buildMakFieldConfigMetadata } from "./buildMakFieldConfigMetadata.js";
import { buildMakDynamicFieldsFromMetadata } from "./buildMakDynamicFieldsFromMetadata.js";

/**
 * Instancia a Field Configuration Engine existente — campoEngine + FieldRegistry + RenderEngine.
 * @param {string} moduleId
 * @param {object} [options]
 * @param {import("@/framework/cadastro-engine/core/CadastroModuleConfig.js").CadastroModuleConfig} [options.cadastroConfig]
 * @param {object[]} [options.fieldDefinitions]
 */
export function createMakFieldConfigEngine(moduleId, options = {}) {
  ensureBuiltinFieldTypes();
  const { cadastroConfig = null, fieldDefinitions = [] } = options;
  const metadata = buildMakFieldConfigMetadata({
    moduleId,
    fieldDefinitions,
  });

  const customFields = cadastroConfig ? new CustomFieldEngine(cadastroConfig) : null;
  const buildDynamicFields =
    fieldDefinitions.length > 0 ? buildMakDynamicFieldsFromMetadata(fieldDefinitions) : null;

  return Object.freeze({
    moduleId,
    metadata,
    fieldEngine: FieldEngine,
    customFieldEngine: customFields,
    registry: {
      getFieldTypeDefinition,
      listFieldTypes,
      registerFieldType,
      registerBuiltinFieldTypes,
    },
    buildDynamicFields,
  });
}

export default createMakFieldConfigEngine;
