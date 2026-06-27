/**
 * Metadata declarativa da Field Configuration Engine — promovida do Cadastro de Empresas.
 */

/** Chaves suportadas em definições declarativas de campo. */
export const MAK_FIELD_METADATA_KEYS = Object.freeze([
  "id",
  "name",
  "type",
  "label",
  "placeholder",
  "required",
  "readOnly",
  "disabled",
  "hidden",
  "visible",
  "defaultValue",
  "mask",
  "validator",
  "formatter",
  "normalizer",
  "width",
  "height",
  "grid",
  "tab",
  "section",
  "group",
  "icon",
  "prefix",
  "suffix",
  "tooltip",
  "description",
  "lookup",
  "autocomplete",
  "options",
  "multiple",
  "accept",
  "maxLength",
  "minLength",
  "min",
  "max",
  "precision",
  "scale",
  "currency",
  "locale",
  "inputMode",
  "keyboard",
  "validation",
  "dependencies",
  "expressions",
  "rules",
  "permissions",
  "events",
  "uppercase",
  "wide",
  "compact",
  "medium",
  "rows",
  "autoCode",
  "resolveLabel",
  "resolvePlaceholder",
  "widthType",
  "errorKey",
  "displayField",
  "searchFields",
  "relation_entity",
  "options_source_entity",
  "decimal_places",
  "usar_decimal",
  "usar_mascara",
  "mascaras_text",
]);

/**
 * @param {object} fieldDef
 * @param {object} [defaults]
 */
export function normalizeMakFieldMetadata(fieldDef, defaults = {}) {
  if (!fieldDef?.id && !fieldDef?.name) {
    throw new Error("normalizeMakFieldMetadata: id ou name é obrigatório.");
  }
  const id = fieldDef.id ?? fieldDef.name;
  const name = fieldDef.name ?? id;
  const resolvedType = String(fieldDef.type || "text").toLowerCase();

  return Object.freeze({
    ...defaults,
    ...fieldDef,
    id,
    name,
    type: resolvedType,
    required: fieldDef.required ?? defaults.required ?? false,
    readOnly: fieldDef.readOnly ?? defaults.readOnly ?? false,
    disabled: fieldDef.disabled ?? defaults.disabled ?? false,
    hidden: fieldDef.hidden ?? defaults.hidden ?? false,
    visible: fieldDef.visible ?? defaults.visible ?? true,
    uppercase: fieldDef.uppercase ?? defaults.uppercase ?? false,
    wide: fieldDef.wide ?? defaults.wide ?? false,
    compact: fieldDef.compact ?? defaults.compact ?? false,
    medium: fieldDef.medium ?? defaults.medium ?? false,
    rows: fieldDef.rows ?? defaults.rows ?? 3,
    options: fieldDef.options ?? defaults.options ?? [],
    displayField: fieldDef.displayField ?? defaults.displayField ?? "nome",
    searchFields: fieldDef.searchFields ?? defaults.searchFields ?? ["nome"],
  });
}

/**
 * @param {object} options
 * @param {string} options.moduleId
 * @param {object[]} [options.fieldDefinitions]
 * @param {string} [options.renderEngineComponent]
 * @param {string} [options.customFieldRenderer]
 */
export function buildMakFieldConfigMetadata(options = {}) {
  const { moduleId, fieldDefinitions = [], renderEngineComponent = "RenderEngine", customFieldRenderer = "useCustomFieldRenderer" } = options;

  if (!moduleId) {
    throw new Error("buildMakFieldConfigMetadata: moduleId é obrigatório.");
  }

  const normalizedFields = fieldDefinitions.map((def) => normalizeMakFieldMetadata(def));

  return Object.freeze({
    moduleId,
    engineVersion: 1,
    renderEngineComponent,
    customFieldRenderer,
    fieldEngine: "FieldEngine",
    fieldRegistry: "FieldRegistry",
    fieldCount: normalizedFields.length,
    fieldDefinitions: normalizedFields,
    supportedMetadataKeys: MAK_FIELD_METADATA_KEYS,
  });
}

export default buildMakFieldConfigMetadata;
