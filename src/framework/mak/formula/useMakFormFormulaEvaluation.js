/**
 * Hook — recalcula campos derivados via Formula Configuration Engine.
 */
import { useEffect, useRef } from "react";
import { runMakFormulaEvaluation } from "./runMakFormulaEvaluation.js";
import { FieldEngine } from "@/framework/cadastro-engine/field/FieldEngine.js";

export function useMakFormFormulaEvaluation({
  formData,
  setFormData,
  fieldDefinitions = [],
  customFields = [],
  enabled = true,
}) {
  const applyingRef = useRef(false);

  useEffect(() => {
    if (!enabled || !fieldDefinitions?.length) return;
    if (applyingRef.current) return;

    const result = runMakFormulaEvaluation({
      formData,
      fieldDefinitions,
      customFields,
      customFieldCalculator: (scope, campo) => FieldEngine.calcularCampo(scope, campo),
    });

    if (!result.changed) return;

    applyingRef.current = true;
    setFormData((prev) => {
      const next = { ...prev };
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
    });
    applyingRef.current = false;
  }, [formData, fieldDefinitions, customFields, enabled, setFormData]);
}

export default useMakFormFormulaEvaluation;
