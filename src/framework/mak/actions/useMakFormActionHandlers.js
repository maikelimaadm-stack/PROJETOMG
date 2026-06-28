/**
 * Hook — executa ações declarativas via Actions Configuration Engine.
 */
import { useCallback, useMemo } from "react";
import { runMakActionExecution } from "./runMakActionExecution.js";

function applyActionPatch(setFormData, patch = {}) {
  if (!patch || !Object.keys(patch).length || typeof setFormData !== "function") return;
  setFormData((prev) => ({
    ...prev,
    ...patch,
    campos_personalizados: {
      ...(prev.campos_personalizados || {}),
      ...(patch.campos_personalizados || {}),
    },
  }));
}

export function useMakFormActionHandlers({
  moduleId,
  actionDefinitions = [],
  actions = null,
  formData,
  setFormData,
  ui = {},
  services = {},
  fieldDefinitions = [],
  schema = null,
  customFields = [],
  runValidation = null,
  runWorkflow = null,
  enabled = true,
}) {
  const baseContext = useMemo(
    () => ({
      formData,
      setFormData,
      fieldDefinitions,
      schema,
      customFields,
      ui,
      services,
      runValidation,
      runWorkflow,
    }),
    [formData, setFormData, fieldDefinitions, schema, customFields, ui, services, runValidation, runWorkflow]
  );

  const runAction = useCallback(
    async (actionId, extraContext = {}, options = {}) => {
      if (!enabled || !moduleId) {
        return { ok: false, executed: 0, results: [], patch: {} };
      }

      const result = await runMakActionExecution({
        actionId,
        moduleId,
        actionDefinitions,
        actions,
        context: { ...baseContext, ...extraContext },
        options,
      });

      if (result.patch && Object.keys(result.patch).length) {
        applyActionPatch(setFormData, result.patch);
      }

      return result;
    },
    [enabled, moduleId, actionDefinitions, actions, baseContext, setFormData]
  );

  const executeAction = useCallback(
    async (action, extraContext = {}, options = {}) => {
      if (!enabled || !moduleId) {
        return { ok: false, executed: 0, results: [], patch: {} };
      }

      const result = await runMakActionExecution({
        action,
        moduleId,
        actionDefinitions,
        actions,
        context: { ...baseContext, ...extraContext },
        options,
      });

      if (result.patch && Object.keys(result.patch).length) {
        applyActionPatch(setFormData, result.patch);
      }

      return result;
    },
    [enabled, moduleId, actionDefinitions, actions, baseContext, setFormData]
  );

  return { runAction, executeAction };
}

export default useMakFormActionHandlers;
