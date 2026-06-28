/**
 * Metadata declarativa da Validation Configuration Engine.
 */
import { MAK_VALIDATION_RULE_TYPES } from "./makValidationBuiltinRules.js";

export const MAK_VALIDATION_METADATA_KEYS = Object.freeze([
  "required",
  "readOnly",
  "disabled",
  "visible",
  "hidden",
  "validation",
  "rules",
  "validator",
  "asyncValidator",
  "dependsOn",
  "when",
  "messages",
  "severity",
  "blocking",
  "permissions",
  "min",
  "max",
  "minLength",
  "maxLength",
  "precision",
  "scale",
  "regex",
  "mask",
  "email",
  "url",
  "cep",
  "cpf",
  "cnpj",
  "cpf_cnpj",
  "tel",
]);

export function buildMakValidationConfigMetadata({
  moduleId,
  fieldDefinitions = [],
  schema = null,
  nativeRequiredFieldNames = [],
  validatorProvider = null,
} = {}) {
  if (!moduleId) {
    throw new Error("buildMakValidationConfigMetadata: moduleId é obrigatório.");
  }

  const fieldsWithValidation = fieldDefinitions.filter(
    (field) =>
      field?.required ||
      field?.validation ||
      field?.rules ||
      field?.validator ||
      field?.asyncValidator
  );

  return Object.freeze({
    moduleId,
    engineVersion: 1,
    supportedRuleTypes: MAK_VALIDATION_RULE_TYPES,
    supportedMetadataKeys: MAK_VALIDATION_METADATA_KEYS,
    hasSchema: Boolean(schema),
    hasValidatorProvider: typeof validatorProvider === "function",
    nativeRequiredFieldNames: [...nativeRequiredFieldNames],
    fieldCount: fieldDefinitions.length,
    validatedFieldCount: fieldsWithValidation.length,
    fieldDefinitions: fieldDefinitions.map((field) => ({
      id: field.id ?? field.name,
      name: field.name ?? field.id,
      required: Boolean(field.required),
      validation: field.validation ?? null,
      rules: field.rules ?? null,
      validator: field.validator ?? null,
      asyncValidator: field.asyncValidator ?? null,
    })),
  });
}

export default buildMakValidationConfigMetadata;
