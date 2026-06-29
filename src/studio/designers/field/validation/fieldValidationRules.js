/** Field validation rules — registered on Studio Core Validation Engine */

export function registerFieldValidationRules(validationEngine) {
  validationEngine.registerRule({
    id: "field.groups.required",
    severity: "error",
    validate: (document) => {
      if (!document?.groups?.length) {
        return [{ severity: "error", code: "FIELD_NO_GROUPS", message: "Documento deve conter ao menos um grupo." }];
      }
      return [];
    },
  });

  validationEngine.registerRule({
    id: "field.names.unique",
    severity: "error",
    validate: (document) => {
      const issues = [];
      const names = new Set();
      (document?.groups ?? []).forEach((group) => {
        (group.fields ?? []).forEach((field) => {
          if (field._pendingDelete) return;
          if (names.has(field.fieldName)) {
            issues.push({
              severity: "error",
              code: "DUPLICATE_FIELD",
              message: `Campo duplicado: ${field.fieldName}`,
              targetId: field.fieldNodeId,
            });
          }
          names.add(field.fieldName);
        });
      });
      return issues;
    },
  });

  validationEngine.registerRule({
    id: "field.label.suggestion",
    severity: "suggestion",
    validate: (document) => {
      const suggestions = [];
      (document?.groups ?? []).forEach((group) => {
        (group.fields ?? []).forEach((field) => {
          if (!field.label || field.label === field.fieldName) {
            suggestions.push({
              severity: "suggestion",
              code: "FIELD_LABEL",
              message: `Defina um rótulo amigável para ${field.fieldName}`,
              targetId: field.fieldNodeId,
            });
          }
        });
      });
      return suggestions;
    },
  });
}

export default registerFieldValidationRules;
