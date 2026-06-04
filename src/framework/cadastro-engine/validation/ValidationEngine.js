import { FieldEngine } from "../field/FieldEngine.js";

export const ValidationEngine = {
  buildSchema(campos) {
    return FieldEngine.buildValidationSchema(campos);
  },
  validateRequired(values, requiredFieldNames = []) {
    const errors = {};
    requiredFieldNames.forEach((field) => {
      if (!String(values?.[field] || "").trim()) errors[field] = true;
    });
    return errors;
  },
  validateCustomFields(values, campos = []) {
    const schema = FieldEngine.buildValidationSchema(campos);
    const result = schema.safeParse(values?.campos_personalizados || values || {});
    const errors = {};
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0];
        if (fieldName) errors[`campos_personalizados.${fieldName}`] = true;
      });
    }
    return errors;
  },
};

export default ValidationEngine;
