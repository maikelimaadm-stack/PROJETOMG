/** Layout Validation Engine contracts — Program 2.2 (no AI) */

export const LAYOUT_VALIDATION_VERSION = "mak-layout-validation-v1";

/**
 * @typedef {object} LayoutValidationIssue
 * @property {"error"|"warning"|"suggestion"|"optimization"} severity
 * @property {string} code
 * @property {string} message
 * @property {string} [targetId]
 */

/**
 * @param {import("../document/layoutDocumentContracts.js").LayoutDocument} document
 * @returns {{ ok: boolean, errors: LayoutValidationIssue[], warnings: LayoutValidationIssue[], suggestions: LayoutValidationIssue[], optimizations: LayoutValidationIssue[] }}
 */
export function validateLayoutDocumentStructure(document) {
  /** @type {LayoutValidationIssue[]} */
  const errors = [];
  /** @type {LayoutValidationIssue[]} */
  const warnings = [];
  /** @type {LayoutValidationIssue[]} */
  const suggestions = [];
  /** @type {LayoutValidationIssue[]} */
  const optimizations = [];

  if (!document?.pages?.length) {
    errors.push({ severity: "error", code: "LAYOUT_NO_PAGES", message: "Layout deve conter ao menos uma página." });
  }

  const componentIds = new Set();
  (document?.pages ?? []).forEach((page) => {
    (page.sections ?? []).forEach((section) => {
      if (!section.sectionId) {
        errors.push({ severity: "error", code: "SECTION_ID", message: "Seção sem sectionId.", targetId: page.pageId });
      }
      (section.containers ?? []).forEach((container) => {
        (container.components ?? []).forEach((component) => {
          if (componentIds.has(component.componentId)) {
            errors.push({
              severity: "error",
              code: "DUPLICATE_COMPONENT",
              message: `Componente duplicado: ${component.componentId}`,
              targetId: component.componentId,
            });
          }
          componentIds.add(component.componentId);
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

  if (componentIds.size === 0) {
    suggestions.push({
      severity: "suggestion",
      code: "EMPTY_LAYOUT",
      message: "Adicione componentes ao layout para compor o formulário.",
    });
  }

  if (componentIds.size > 24) {
    optimizations.push({
      severity: "optimization",
      code: "MANY_COMPONENTS",
      message: "Layout com muitos componentes — considere agrupar em seções.",
    });
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    suggestions,
    optimizations,
    errorCount: errors.length,
    warningCount: warnings.length,
  };
}

export default validateLayoutDocumentStructure;
