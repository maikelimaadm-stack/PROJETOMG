/**
 * Pipeline declarativo da Actions Configuration Engine.
 */
import { executeMakAction, evaluateMakActionCondition } from "./makActionBuiltinTypes.js";
import { normalizeMakActionDefinitions } from "./buildMakActionConfigMetadata.js";

async function runWithTimeout(fn, timeoutMs) {
  if (!timeoutMs || timeoutMs <= 0) return fn();
  return Promise.race([
    fn(),
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error("action-timeout")), timeoutMs);
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

function sortByPriority(definitions = []) {
  return [...definitions].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
}

function buildActionRegistry(definitions = []) {
  const registry = {};
  definitions.forEach((def) => {
    if (def?.id) registry[def.id] = def;
  });
  return registry;
}

export async function runMakActionExecution({
  actionId = null,
  action = null,
  moduleId,
  actionDefinitions = [],
  actions = null,
  context = {},
  options = {},
} = {}) {
  const normalized = normalizeMakActionDefinitions(
    actionDefinitions.length ? actionDefinitions : actions ?? []
  );
  const registry = buildActionRegistry(normalized);
  const signal = { cancelled: false, stopped: false };
  const patch = {};
  const rollbackStack = [];

  const runNestedAction = (def, ctx) =>
    executeMakAction(def, {
      ...ctx,
      patch,
      signal,
      rollbackStack,
      actionRegistry: registry,
      runNestedAction,
    });

  const baseContext = {
    ...context,
    moduleId,
    patch,
    signal,
    rollbackStack,
    actionRegistry: registry,
    runNestedAction,
    meta: { moduleId, actionId, ...(context.meta ?? {}) },
  };

  let target = action;
  if (!target && actionId) {
    target = registry[actionId] ?? null;
  }

  if (!target) {
    return {
      ok: false,
      executed: 0,
      cancelled: false,
      stopped: false,
      results: [],
      patch: {},
      reason: "action-not-found",
    };
  }

  if (target.when || target.condition) {
    if (!evaluateMakActionCondition(target.when ?? target.condition, baseContext)) {
      return { ok: true, executed: 0, skipped: true, patch: {}, results: [] };
    }
  }

  const run = async () => {
    const result = await runNestedAction(target, baseContext);
    const results = [result];

    if (result?.ok === false && target.rollback) {
      const rollbackResult = await runNestedAction(
        { action: "rollback", rollback: target.rollback },
        baseContext
      );
      results.push(rollbackResult);
    }

    return {
      ok: result?.ok !== false,
      executed: 1,
      cancelled: signal.cancelled,
      stopped: signal.stopped,
      results,
      patch: { ...patch },
      response: result?.response ?? null,
    };
  };

  try {
    return await runWithTimeout(
      () => runWithRetry(run, options.retry ?? target.retry ?? 0),
      options.timeout ?? target.timeout ?? 0
    );
  } catch (error) {
    if (target.rollback) {
      await runNestedAction({ action: "rollback", rollback: target.rollback }, baseContext);
    }
    return {
      ok: false,
      executed: 0,
      cancelled: signal.cancelled,
      stopped: signal.stopped,
      results: [],
      patch: { ...patch },
      error: error?.message ?? "action-failed",
    };
  }
}

export default runMakActionExecution;
