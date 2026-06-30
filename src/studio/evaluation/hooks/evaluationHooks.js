/** Evaluation Hooks — lifecycle hooks (Program 2.3.5) */

export function createEvaluationHooks() {
  const hooks = { before: [], after: [], error: [] };

  return Object.freeze({
    onBefore(fn) {
      hooks.before.push(fn);
    },
    onAfter(fn) {
      hooks.after.push(fn);
    },
    onError(fn) {
      hooks.error.push(fn);
    },
    runBefore(payload) {
      hooks.before.forEach((fn) => fn(payload));
    },
    runAfter(payload) {
      hooks.after.forEach((fn) => fn(payload));
    },
    runError(payload) {
      hooks.error.forEach((fn) => fn(payload));
    },
  });
}

export default createEvaluationHooks;
