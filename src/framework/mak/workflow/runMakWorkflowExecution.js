/**
 * Pipeline declarativo da Workflow Configuration Engine — máquina de estados.
 */
import { evaluateMakActionCondition } from "@/framework/mak/actions/makActionBuiltinTypes.js";
import { normalizeMakWorkflowDefinitions } from "./buildMakWorkflowConfigMetadata.js";
import { executeMakWorkflowSteps } from "./makWorkflowBuiltinSteps.js";

async function runWithTimeout(fn, timeoutMs) {
  if (!timeoutMs || timeoutMs <= 0) return fn();
  return Promise.race([
    fn(),
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error("workflow-timeout")), timeoutMs);
    }),
  ]);
}

async function runWithRetry(fn, retries = 0) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

function findTransition(workflow, currentState, trigger, context = {}) {
  const transitions = workflow.transitions ?? [];
  return transitions.find(
    (t) =>
      (t.trigger === trigger || t.event === trigger) &&
      (t.from === currentState || t.from === "*" || !t.from) &&
      evaluateMakActionCondition(t.when ?? t.condition, context)
  );
}

export async function runMakWorkflowExecution({
  workflowId = null,
  workflow = null,
  trigger = "start",
  moduleId,
  workflowDefinitions = [],
  workflows = null,
  context = {},
  options = {},
} = {}) {
  const normalized = normalizeMakWorkflowDefinitions(
    workflowDefinitions.length ? workflowDefinitions : workflows ?? []
  );

  let target = workflow;
  if (!target && workflowId) {
    target = normalized.find((w) => w.id === workflowId) ?? null;
  }

  if (!target) {
    return {
      ok: false,
      reason: "workflow-not-found",
      currentState: context.workflowState ?? null,
      history: context.workflowHistory ?? [],
    };
  }

  const startState = target.start ?? target.initialState ?? "draft";
  const currentState = context.workflowState ?? startState;
  const history = [...(context.workflowHistory ?? [])];

  const execContext = {
    ...context,
    moduleId,
    workflowId: target.id,
    workflowState: currentState,
    workflow: target,
    trigger,
    options,
  };

  const runStart = trigger === "start" && currentState === startState;
  let transition = runStart
    ? { from: startState, to: startState, steps: target.onStart ?? target.steps?.onStart ?? [] }
    : findTransition(target, currentState, trigger, execContext);

  if (!transition && trigger === "start") {
    transition = { from: startState, to: startState, steps: target.onStart ?? [] };
  }

  if (!transition) {
    return {
      ok: false,
      reason: "transition-not-found",
      currentState,
      trigger,
      history,
    };
  }

  const run = async () => {
    const stepResults = [];
    let cancelled = false;

    const beforeSteps = transition.before ?? [];
    if (beforeSteps.length) {
      const beforeResult = await executeMakWorkflowSteps(beforeSteps, execContext);
      stepResults.push({ phase: "before", ...beforeResult });
      if (beforeResult?.ok === false) {
        if (transition.rollback) {
          await executeMakWorkflowSteps(transition.rollback, execContext);
        }
        return {
          ok: false,
          currentState,
          previousState: currentState,
          trigger,
          stepResults,
          history,
          cancelled: true,
        };
      }
    }

    const steps = transition.steps ?? transition.after ?? [];
    let stepsResult = { ok: true };
    if (transition.parallel) {
      stepsResult = await executeMakWorkflowSteps({ type: "parallel", steps }, execContext);
    } else if (steps.length) {
      stepsResult = await executeMakWorkflowSteps(steps, execContext);
    }
    stepResults.push({ phase: "steps", ...stepsResult });

    if (stepsResult?.ok === false || stepsResult?.cancelled) {
      cancelled = stepsResult.cancelled ?? false;
      if (transition.rollback) {
        const rollbackResult = await executeMakWorkflowSteps(transition.rollback, execContext);
        stepResults.push({ phase: "rollback", ...rollbackResult });
      }
      return {
        ok: false,
        currentState,
        previousState: currentState,
        trigger,
        stepResults,
        history,
        cancelled,
        patch: stepsResult.patch ?? {},
      };
    }

    const nextState = transition.to ?? transition.next ?? currentState;
    const historyEntry = {
      at: Date.now(),
      from: currentState,
      to: nextState,
      trigger,
      workflowId: target.id,
    };
    history.push(historyEntry);

    const afterSteps = transition.after ?? target.states?.[nextState]?.onEnter ?? [];
    if (afterSteps.length && !transition.steps) {
      const afterResult = await executeMakWorkflowSteps(afterSteps, execContext);
      stepResults.push({ phase: "after", ...afterResult });
    } else if (target.states?.[nextState]?.onEnter) {
      const enterResult = await executeMakWorkflowSteps(target.states[nextState].onEnter, execContext);
      stepResults.push({ phase: "onEnter", ...enterResult });
    }

    const finishStates = target.finish ?? target.finalStates ?? [];
    const isFinished = finishStates.includes(nextState);

    return {
      ok: true,
      currentState: nextState,
      previousState: currentState,
      trigger,
      stepResults,
      history,
      patch: stepsResult.patch ?? {},
      finished: isFinished,
      audit: historyEntry,
    };
  };

  try {
    return await runWithTimeout(
      () => runWithRetry(run, options.retry ?? transition.retry ?? 0),
      options.timeout ?? transition.timeout ?? 0
    );
  } catch (error) {
    if (transition.rollback) {
      await executeMakWorkflowSteps(transition.rollback, execContext);
    }
    return {
      ok: false,
      currentState,
      previousState: currentState,
      trigger,
      history,
      error: error?.message ?? "workflow-failed",
    };
  }
}

export default runMakWorkflowExecution;
