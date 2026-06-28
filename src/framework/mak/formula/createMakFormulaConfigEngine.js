/**
 * Formula Configuration Engine — integração natural ao ModeloBase1.
 */
import { FieldEngine } from "@/framework/cadastro-engine/field/FieldEngine.js";
import { buildMakFormulaConfigMetadata } from "./buildMakFormulaConfigMetadata.js";
import { runMakFormulaEvaluation } from "./runMakFormulaEvaluation.js";

export function createMakFormulaConfigEngine(moduleId, options = {}) {
  const { fieldDefinitions = [] } = options;
  const metadata = buildMakFormulaConfigMetadata({ moduleId, fieldDefinitions });

  const evaluate = (params) =>
    runMakFormulaEvaluation({
      ...params,
      fieldDefinitions,
      customFieldCalculator: (scope, campo) => FieldEngine.calcularCampo(scope, campo),
    });

  const apply = (formData, params = {}) => {
    const result = evaluate({ formData, ...params });
    if (!result.changed) return formData;

    const next = { ...formData };
    Object.entries(result.values).forEach(([key, value]) => {
      if (key.startsWith("campos_personalizados.")) {
        const fieldKey = key.replace("campos_personalizados.", "");
        next.campos_personalizados = {
          ...(next.campos_personalizados || {}),
          [fieldKey]: value,
        };
      } else {
        next[key] = value;
      }
    });
    return next;
  };

  return Object.freeze({
    moduleId,
    metadata,
    fieldEngine: FieldEngine,
    evaluate,
    apply,
    hasFormulas: () => metadata.formulaFieldCount > 0,
  });
}

export default createMakFormulaConfigEngine;
