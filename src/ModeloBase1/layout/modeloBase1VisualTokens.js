/**
 * SSOT visual — Cadastro de Empresas é a referência oficial.
 * Todos os módulos ModeloBase1 devem consumir estes tokens.
 */
export const MAK_FORM_INPUT_CLASS =
  "emp-form-input border-0 shadow-none focus-visible:ring-0 bg-white uppercase w-full";

/** Alias para campos em grid com min-width zero (mesma base visual de Empresas). */
export const MAK_FORM_INPUT_CLASS_GRID =
  "emp-form-input w-full min-w-0 border-0 shadow-none focus-visible:ring-0 bg-white uppercase";

export const MAK_FORM_FIELD_LAYOUT_CONFIG = Object.freeze({
  mode: "corporate",
  columns: 12,
});

export const MAK_FORM_DEFAULT_CONFIG_SHELL = Object.freeze({
  version: 3,
  hiddenFieldIds: [],
  lockedFieldIds: [],
  requiredFieldIds: [],
  clearOnDuplicateFieldIds: [],
  fieldDefaultValues: {},
  aggregationConfig: {},
  visibilityRules: {},
  fieldLayoutConfig: MAK_FORM_FIELD_LAYOUT_CONFIG,
  fieldSizes: {},
});

/**
 * Monta config padrão de formulário com paridade visual Empresas.
 */
export function buildModeloBase1FormDefaultConfig({ panels, layout, fieldSizes = {} }) {
  return {
    ...MAK_FORM_DEFAULT_CONFIG_SHELL,
    panels: panels.map((panel) => ({ ...panel })),
    layout: { ...layout },
    fieldLayoutConfig: { ...MAK_FORM_FIELD_LAYOUT_CONFIG },
    fieldSizes: { ...fieldSizes },
  };
}

export default {
  MAK_FORM_INPUT_CLASS,
  MAK_FORM_INPUT_CLASS_GRID,
  MAK_FORM_FIELD_LAYOUT_CONFIG,
  MAK_FORM_DEFAULT_CONFIG_SHELL,
  buildModeloBase1FormDefaultConfig,
};
