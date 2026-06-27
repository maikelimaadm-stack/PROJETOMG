import { buildMakStandardDynamicFields } from "@/framework/mak/metadata/buildMakStandardDynamicFields.jsx";
import { normalizeMakFieldMetadata } from "./buildMakFieldConfigMetadata.js";
import { getFieldTypeDefinition } from "@/framework/cadastro-engine/field/FieldRegistry.js";
import { ensureBuiltinFieldTypes } from "@/framework/cadastro-engine/field/registerBuiltinFieldTypes.js";

/**
 * Resolve tipo declarativo para tipo canônico do FieldRegistry (sem reimplementar render).
 * @param {object} fieldDef
 */
export function resolveMakFieldType(fieldDef) {
  ensureBuiltinFieldTypes();
  const def = getFieldTypeDefinition(fieldDef?.type);
  return def?.type ?? String(fieldDef?.type || "text").toLowerCase();
}

/**
 * Constrói buildDynamicFields a partir de metadata — delega para buildMakStandardDynamicFields
 * e RenderEngine/CustomFieldRenderer existentes (EmpDynamicFormRenderer).
 * @param {object[]} fieldDefinitions
 */
export function buildMakDynamicFieldsFromMetadata(fieldDefinitions = []) {
  const normalized = fieldDefinitions.map((def) => ({
    ...normalizeMakFieldMetadata(def),
    type: resolveMakFieldType(def),
  }));
  return buildMakStandardDynamicFields(normalized);
}

export default buildMakDynamicFieldsFromMetadata;
