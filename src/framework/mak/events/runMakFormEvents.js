/**
 * Pipeline declarativo da Events Configuration Engine.
 */
import {
  evaluateMakEventCondition,
  executeMakEventAction,
} from "./makEventBuiltinActions.js";
import { normalizeMakEventDefinitions } from "./buildMakEventConfigMetadata.js";

const debounceTimers = new Map();
const throttleTimestamps = new Map();
const onceExecuted = new Set();

function buildExecutionKey(moduleId, definitionId) {
  return `${moduleId}::${definitionId}`;
}

function matchesFieldFilter(definition, context = {}) {
  if (!definition.field) return true;
  return definition.field === context.field;
}

function sortByPriority(definitions = []) {
  return [...definitions].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
}

async function runWithTimeout(fn, timeoutMs) {
  if (!timeoutMs || timeoutMs <= 0) return fn();
  return Promise.race([
    fn(),
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error("event-timeout")), timeoutMs);
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

async function executeDefinition(definition, context, options = {}) {
  const signal = { cancelled: false, stopped: false };
  const patch = {};
  const handlerResults = [];
  const handlers = definition.handlers ?? [];

  for (const handler of handlers) {
    if (signal.cancelled || signal.stopped) break;

    const handlerContext = {
      ...context,
      patch,
      signal,
      meta: {
        event: context.event,
        definitionId: definition.id,
        field: context.field,
        ...(context.meta ?? {}),
      },
    };

    const runHandler = async () => {
      const result = await executeMakEventAction(handler, handlerContext);
      if (result?.patch) {
        Object.assign(patch, result.patch);
      }
      return result;
    };

    try {
      const result = await runWithTimeout(
        () => runWithRetry(runHandler, handler.retry ?? definition.retry ?? options.retry ?? 0),
        handler.timeout ?? definition.timeout ?? options.timeout ?? 0
      );
      handlerResults.push(result);
    } catch (error) {
      handlerResults.push({ ok: false, error: error?.message ?? "handler-failed" });
      if (handler.stopOnError || definition.stopOnError) break;
    }

    if (handler.preventDefault || handler.action === "preventDefault") {
      signal.cancelled = true;
    }
    if (handler.stopPropagation || handler.action === "stopPropagation") {
      signal.stopped = true;
    }
  }

  return {
    definitionId: definition.id,
    cancelled: signal.cancelled,
    stopped: signal.stopped,
    patch,
    handlerResults,
  };
}

export function runMakFormEvents({
  event,
  moduleId,
  eventDefinitions = [],
  events = null,
  context = {},
  options = {},
} = {}) {
  if (!event || !moduleId) {
    return { executed: 0, cancelled: false, stopped: false, results: [], patch: {} };
  }

  const normalized = normalizeMakEventDefinitions(
    eventDefinitions.length ? eventDefinitions : events ?? []
  );

  const matching = sortByPriority(
    normalized.filter(
      (def) =>
        def.event === event &&
        matchesFieldFilter(def, context) &&
        evaluateMakEventCondition(def.when ?? def.condition, context)
    )
  );

  if (!matching.length) {
    return { executed: 0, cancelled: false, stopped: false, results: [], patch: {} };
  }

  const runSync = async () => {
    const results = [];
    const mergedPatch = {};
    let cancelled = false;
    let stopped = false;

    for (const definition of matching) {
      if (stopped) break;

      const execKey = buildExecutionKey(moduleId, definition.id);
      if (definition.once && onceExecuted.has(execKey)) continue;

      const debounceMs = definition.debounce ?? 0;
      const throttleMs = definition.throttle ?? 0;

      if (debounceMs > 0 && event === "onChange") {
        const timerKey = execKey;
        if (debounceTimers.has(timerKey)) {
          clearTimeout(debounceTimers.get(timerKey));
        }
        await new Promise((resolve) => {
          const timer = setTimeout(async () => {
            debounceTimers.delete(timerKey);
            const result = await executeDefinition(definition, { ...context, event, moduleId }, options);
            results.push(result);
            Object.assign(mergedPatch, result.patch ?? {});
            if (definition.once) onceExecuted.add(execKey);
            if (result.cancelled) cancelled = true;
            if (result.stopped) stopped = true;
            resolve();
          }, debounceMs);
          debounceTimers.set(timerKey, timer);
        });
        continue;
      }

      if (throttleMs > 0) {
        const lastRun = throttleTimestamps.get(execKey) ?? 0;
        const now = Date.now();
        if (now - lastRun < throttleMs) continue;
        throttleTimestamps.set(execKey, now);
      }

      const result = await executeDefinition(definition, { ...context, event, moduleId }, options);
      results.push(result);
      Object.assign(mergedPatch, result.patch ?? {});
      if (definition.once) onceExecuted.add(execKey);
      if (result.cancelled) cancelled = true;
      if (result.stopped) stopped = true;
    }

    return {
      executed: results.length,
      cancelled,
      stopped,
      results,
      patch: mergedPatch,
    };
  };

  if (options.async === false) {
    let output = { executed: 0, cancelled: false, stopped: false, results: [], patch: {} };
    runSync()
      .then((result) => {
        output = result;
      })
      .catch(() => {});
    return output;
  }

  return runSync();
}

export function clearMakFormEventRuntimeState(moduleId = null) {
  if (!moduleId) {
    debounceTimers.forEach((timer) => clearTimeout(timer));
    debounceTimers.clear();
    throttleTimestamps.clear();
    onceExecuted.clear();
    return;
  }
  const prefix = `${moduleId}::`;
  debounceTimers.forEach((timer, key) => {
    if (key.startsWith(prefix)) {
      clearTimeout(timer);
      debounceTimers.delete(key);
    }
  });
  throttleTimestamps.forEach((_, key) => {
    if (key.startsWith(prefix)) throttleTimestamps.delete(key);
  });
  onceExecuted.forEach((key) => {
    if (key.startsWith(prefix)) onceExecuted.delete(key);
  });
}

export default runMakFormEvents;
