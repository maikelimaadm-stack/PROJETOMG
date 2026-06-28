/**
 * Hook — executa workflows declarativos via Workflow Configuration Engine.
 */
import { useCallback, useMemo, useState } from "react";
import { runMakWorkflowExecution } from "./runMakWorkflowExecution.js";
import { normalizeMakWorkflowDefinitions } from "./buildMakWorkflowConfigMetadata.js";

function applyWorkflowPatch(setFormData, patch = {}, stateField = "wf_state", nextState) {
  if (typeof setFormData !== "function") return;
  setFormData((prev) => ({
    ...prev,
    ...(patch ?? {}),
    ...(nextState && stateField ? { [stateField]: nextState } : {}),
    campos_personalizados: {
      ...(prev.campos_personalizados || {}),
      ...(patch?.campos_personalizados || {}),
    },
  }));
}

export function useMakFormWorkflowHandlers({
  moduleId,
  workflowDefinitions = [],
  workflows = null,
  actionDefinitions = [],
  eventDefinitions = [],
  formData,
  setFormData,
  ui = {},
  services = {},
  fieldDefinitions = [],
  schema = null,
  customFields = [],
  runValidation = null,
  stateField = "wf_state",
  enabled = true,
}) {
  const normalized = useMemo(
    () => normalizeMakWorkflowDefinitions(workflowDefinitions.length ? workflowDefinitions : workflows ?? []),
    [workflowDefinitions, workflows]
  );

  const defaultStart = normalized[0]?.start ?? "draft";
  const [workflowState, setWorkflowState] = useState(
    () => formData?.[stateField] ?? defaultStart
  );
  const [workflowHistory, setWorkflowHistory] = useState([]);

  const baseContext = useMemo(
    () => ({
      formData,
      setFormData,
      fieldDefinitions,
      schema,
      customFields,
      actionDefinitions,
      eventDefinitions,
      ui,
      services,
      runValidation,
      workflowState,
      workflowHistory,
      stateField,
    }),
    [
      formData,
      setFormData,
      fieldDefinitions,
      schema,
      customFields,
      actionDefinitions,
      eventDefinitions,
      ui,
      services,
      runValidation,
      workflowState,
      workflowHistory,
      stateField,
    ]
  );

  const runWorkflow = useCallback(
    async (workflowId, trigger = "start", extraContext = {}, options = {}) => {
      if (!enabled || !moduleId) {
        return { ok: false, reason: "disabled" };
      }

      const result = await runMakWorkflowExecution({
        workflowId,
        trigger,
        moduleId,
        workflowDefinitions: normalized,
        context: { ...baseContext, ...extraContext, workflowState, workflowHistory },
        options,
      });

      if (result.currentState && result.currentState !== workflowState) {
        setWorkflowState(result.currentState);
      }
      if (result.history?.length) {
        setWorkflowHistory(result.history);
      }
      if (result.patch && Object.keys(result.patch).length) {
        applyWorkflowPatch(setFormData, result.patch, stateField, result.currentState);
      } else if (result.currentState && result.currentState !== workflowState) {
        applyWorkflowPatch(setFormData, {}, stateField, result.currentState);
      }

      return result;
    },
    [enabled, moduleId, normalized, baseContext, workflowState, workflowHistory, setFormData, stateField]
  );

  return { workflowState, workflowHistory, runWorkflow, setWorkflowState };
}

export default useMakFormWorkflowHandlers;
