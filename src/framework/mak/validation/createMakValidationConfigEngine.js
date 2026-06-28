/**
 * Validation Configuration Engine — integração natural ao ModeloBase1.
 */
import { ValidationEngine } from "@/framework/cadastro-engine/validation/ValidationEngine.js";
import { buildMakValidationConfigMetadata } from "./buildMakValidationConfigMetadata.js";
import { runMakFormValidation } from "./runMakFormValidation.js";
import { evaluateMakFieldValidation } from "./makValidationBuiltinRules.js";

export function createMakValidationConfigEngine(moduleId, options = {}) {
  const {
    fieldDefinitions = [],
    schema = null,
    cadastroConfig = null,
    nativeRequiredFieldNames = cadastroConfig?.nativeRequiredFieldNames ?? [],
    validatorProvider = cadastroConfig?.validatorProvider ?? null,
  } = options;

  const metadata = buildMakValidationConfigMetadata({
    moduleId,
    fieldDefinitions,
    schema,
    nativeRequiredFieldNames,
    validatorProvider,
  });

  const validateForm = (params) =>
    runMakFormValidation({
      ...params,
      fieldDefinitions,
      schema,
      nativeRequiredFieldNames,
    });

  const validateField = (fieldDef, value, formData = {}) =>
    evaluateMakFieldValidation(fieldDef, value, formData);

  const safeParse = (data) => {
    if (schema?.safeParse) return schema.safeParse(data);
    if (typeof validatorProvider === "function") {
      return validatorProvider(fieldDefinitions).safeParse(data);
    }
    return { success: true, data };
  };

  return Object.freeze({
    moduleId,
    metadata,
    schema,
    validation: ValidationEngine,
    validateForm,
    validateField,
    safeParse,
    parse: (data) => {
      const result = safeParse(data);
      if (!result.success) throw result.error;
      return result.data;
    },
    hasSchema: () => Boolean(schema) || typeof validatorProvider === "function",
  });
}

export default createMakValidationConfigEngine;
