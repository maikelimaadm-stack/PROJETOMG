/** Layout validation rules — registered on Studio Core Validation Engine */

export function registerLayoutValidationRules(validationEngine) {
  validationEngine.registerRule({
    id: "layout.pages.required",
    severity: "error",
    validate: (document) => {
      if (!document?.pages?.length) {
        return [{ severity: "error", code: "LAYOUT_NO_PAGES", message: "Layout deve conter ao menos uma página." }];
      }
      return [];
    },
  });

  validationEngine.registerRule({
    id: "layout.components.unique",
    severity: "error",
    validate: (document) => {
      const issues = [];
      const componentIds = new Set();
      (document?.pages ?? []).forEach((page) => {
        (page.sections ?? []).forEach((section) => {
          if (!section.sectionId) {
            issues.push({
              severity: "error",
              code: "SECTION_ID",
              message: "Seção sem sectionId.",
              targetId: page.pageId,
            });
          }
          (section.containers ?? []).forEach((container) => {
            (container.components ?? []).forEach((component) => {
              if (componentIds.has(component.componentId)) {
                issues.push({
                  severity: "error",
                  code: "DUPLICATE_COMPONENT",
                  message: `Componente duplicado: ${component.componentId}`,
                  targetId: component.componentId,
                });
              }
              componentIds.add(component.componentId);
            });
          });
        });
      });
      return issues;
    },
  });

  validationEngine.registerRule({
    id: "layout.bindings.warning",
    severity: "warning",
    validate: (document) => {
      const warnings = [];
      (document?.pages ?? []).forEach((page) => {
        (page.sections ?? []).forEach((section) => {
          (section.containers ?? []).forEach((container) => {
            (container.components ?? []).forEach((component) => {
              if (!component.bindings?.length && component.type === "field") {
                warnings.push({
                  severity: "warning",
                  code: "MISSING_BINDING",
                  message: `Campo sem binding: ${component.componentId}`,
                  targetId: component.componentId,
                });
              }
            });
          });
        });
      });
      return warnings;
    },
  });

  validationEngine.registerRule({
    id: "layout.empty.suggestion",
    severity: "suggestion",
    validate: (document) => {
      let count = 0;
      (document?.pages ?? []).forEach((page) => {
        (page.sections ?? []).forEach((section) => {
          (section.containers ?? []).forEach((container) => {
            count += (container.components ?? []).length;
          });
        });
      });
      if (count === 0) {
        return [{
          severity: "suggestion",
          code: "EMPTY_LAYOUT",
          message: "Adicione componentes ao layout para compor o formulário.",
        }];
      }
      return [];
    },
  });

  validationEngine.registerRule({
    id: "layout.many-components.optimization",
    severity: "optimization",
    validate: (document) => {
      let count = 0;
      (document?.pages ?? []).forEach((page) => {
        (page.sections ?? []).forEach((section) => {
          (section.containers ?? []).forEach((container) => {
            count += (container.components ?? []).length;
          });
        });
      });
      if (count > 24) {
        return [{
          severity: "optimization",
          code: "MANY_COMPONENTS",
          message: "Layout com muitos componentes — considere agrupar em seções.",
        }];
      }
      return [];
    },
  });
}

export default registerLayoutValidationRules;
