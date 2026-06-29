const actions = new Map();

/**
 * @param {string} actionId
 * @param {object} definition
 */
export function registerStudioAction(actionId, definition) {
  if (!actionId) throw new Error("registerStudioAction: actionId is required.");
  actions.set(actionId, Object.freeze({ actionId, ...definition }));
}

/** @param {string} actionId */
export function getStudioAction(actionId) {
  return actions.get(actionId) ?? null;
}

/**
 * @param {object} [filter]
 * @param {string} [filter.category]
 */
export function listStudioActions(filter = {}) {
  let result = [...actions.values()];
  if (filter.category) result = result.filter((a) => a.category === filter.category);
  return result;
}

export function hasStudioAction(actionId) {
  return actions.has(actionId);
}

export function getStudioActionCount() {
  return actions.size;
}

export function clearStudioActions() {
  actions.clear();
}
