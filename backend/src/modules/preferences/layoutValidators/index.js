import {
  EMPRESAS_FORM_LAYOUT_SCREEN_KEY,
  validateAndNormalizeEmpresasFormLayout,
} from "../../../../../shared/layout/empresasFormLayoutValidate.mjs";

const layoutValidators = {
  [EMPRESAS_FORM_LAYOUT_SCREEN_KEY]: validateAndNormalizeEmpresasFormLayout,
};

export const validatePreferenceConfig = (screenKey, config) => {
  const normalizedKey = String(screenKey || "").trim();
  const validator = layoutValidators[normalizedKey];
  if (!validator) return config;
  return validator(config);
};
