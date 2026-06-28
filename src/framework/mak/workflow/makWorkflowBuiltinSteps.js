/**
 * Tipos de step e execução — Workflow Configuration Engine.
 * Delega Validation, Formula, Events e Actions sem duplicar lógica.
 */
import { runMakActionExecution } from "@/framework/mak/actions/runMakActionExecution.js";
import { evaluateMakActionCondition } from "@/framework/mak/actions/makActionBuiltinTypes.js";
import { runMakFormValidation } from "@/framework/mak/validation/runMakFormValidation.js";
import { runMakFormulaEvaluation } from "@/framework/mak/formula/runMakFormulaEvaluation.js";
import { runMakFormEvents } from "@/framework/mak/events/runMakFormEvents.js";

export const MAK_WORKFLOW_STEP_TYPES = Object.freeze([
  "action",
  "validate",
  "formula",
  "event",
  "sequence",
  "parallel",
  "branch",
  "when",
  "wait",
  "delay",
  "approval",
  "rejection",
  "rollback",
  "notification",
  "finish",
]);

async function executeWorkflowStep(step, context) {
  if (!step) return { ok: true };

  const type = step.type ?? step.step ?? null;
  const actionDef = step.action ? step : null;

  if (actionDef && !type) {
    const result = await runMakActionExecution({
      action: actionDef,
      moduleId: context.moduleId,
      actionDefinitions: context.actionDefinitions ?? [],
      context,
      options: context.options ?? {},
    });
    return { ok: result.ok !== false, ...result };
  }

  switch (type) {
    case "validate": {
      if (typeof context.runValidation === "function") {
        const valid = context.runValidation(step.parameters);
        return { ok: valid !== false, valid };
      }
      const result = runMakFormValidation({
        formData: context.formData,
        fieldDefinitions: context.fieldDefinitions ?? [],
        schema: context.schema,
        ...step.parameters,
      });
      return { ok: result.valid, result };
    }
    case "formula": {
      const result = runMakFormulaEvaluation({
        formData: context.formData,
        fieldDefinitions: context.fieldDefinitions ?? [],
        customFields: context.customFields ?? [],
        ...step.parameters,
      });
      if (result.changed && context.setFormData) {
        context.setFormData((prev) => {
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
      }
      return { ok: true, result };
    }
    case "event": {
      const eventResult = await runMakFormEvents({
        event: step.event ?? step.trigger,
        moduleId: context.moduleId,
        eventDefinitions: context.eventDefinitions ?? [],
        context,
        options: { async: true },
      });
      return {
        ok: !eventResult.cancelled,
        cancelled: eventResult.cancelled,
        ...eventResult,
      };
    }
    case "action": {
      return executeWorkflowStep(step.action ?? step, context);
    }
    case "sequence": {
      const list = step.steps ?? step.sequence ?? [];
      const results = [];
      for (const item of list) {
        const result = await executeWorkflowStep(item, context);
        results.push(result);
        if (result?.ok === false && !step.continueOnError) {
          return { ok: false, results };
        }
      }
      return { ok: results.every((r) => r?.ok !== false), results };
    }
    case "parallel": {
      const list = step.steps ?? step.parallel ?? [];
      const results = await Promise.all(list.map((item) => executeWorkflowStep(item, context)));
      return { ok: results.every((r) => r?.ok !== false), results };
    }
    case "branch":
    case "when": {
      const branch = evaluateMakActionCondition(step.when ?? step.condition, context)
        ? step.then ?? step.branch
        : step.else ?? [];
      const list = Array.isArray(branch) ? branch : [branch];
      return executeWorkflowStep({ type: "sequence", steps: list }, context);
    }
    case "wait":
    case "delay": {
      const ms = Number(step.delay ?? step.wait ?? step.ms ?? 0);
      if (ms > 0) await new Promise((resolve) => setTimeout(resolve, ms));
      return { ok: true };
    }
    case "approval":
      return { ok: true, approved: true, telemetry: { type: "approval" } };
    case "rejection":
      return { ok: true, rejected: true, telemetry: { type: "rejection" } };
    case "notification": {
      return executeWorkflowStep(
        {
          action: "dispatch",
          suffix: step.suffix ?? "workflow-notification",
          payload: step.payload ?? step,
        },
        context
      );
    }
    case "rollback": {
      const list = step.rollback ?? step.steps ?? [];
      return executeWorkflowStep({ type: "sequence", steps: list, continueOnError: true }, context);
    }
    case "finish":
      return { ok: true, finished: true };
    default:
      if (step.action) return executeWorkflowStep(step, context);
      return { ok: true, skipped: true };
  }
}

export async function executeMakWorkflowSteps(steps, context) {
  const list = Array.isArray(steps) ? steps : [steps];
  return executeWorkflowStep({ type: "sequence", steps: list, continueOnError: false }, context);
}

export default {
  MAK_WORKFLOW_STEP_TYPES,
  executeMakWorkflowSteps,
  executeWorkflowStep,
};
