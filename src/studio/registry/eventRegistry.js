const events = new Map();

/**
 * @param {string} eventId
 * @param {object} definition
 */
export function registerStudioEvent(eventId, definition) {
  if (!eventId) throw new Error("registerStudioEvent: eventId is required.");
  events.set(eventId, Object.freeze({ eventId, ...definition }));
}

/** @param {string} eventId */
export function getStudioEvent(eventId) {
  return events.get(eventId) ?? null;
}

/**
 * @param {object} [filter]
 * @param {string} [filter.category]
 */
export function listStudioEvents(filter = {}) {
  let result = [...events.values()];
  if (filter.category) result = result.filter((e) => e.category === filter.category);
  return result;
}

export function hasStudioEvent(eventId) {
  return events.has(eventId);
}

export function getStudioEventCount() {
  return events.size;
}

export function clearStudioEvents() {
  events.clear();
}
