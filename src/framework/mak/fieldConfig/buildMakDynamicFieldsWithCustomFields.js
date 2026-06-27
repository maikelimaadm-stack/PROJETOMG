import { buildMakDynamicFieldsFromMetadata } from "./buildMakDynamicFieldsFromMetadata.js";
import { appendMakCustomDynamicFields } from "./appendMakCustomDynamicFields.js";

/**
 * Metadata → dynamicFields nativos + campos personalizados (V15).
 * @param {object[]} fieldDefinitions
 */
export function buildMakDynamicFieldsWithCustomFields(fieldDefinitions = []) {
  const buildNativeFields = buildMakDynamicFieldsFromMetadata(fieldDefinitions);
  return function buildDynamicFields(ctx) {
    const nativeFields = buildNativeFields(ctx);
    return appendMakCustomDynamicFields(nativeFields, ctx);
  };
}

export default buildMakDynamicFieldsWithCustomFields;
