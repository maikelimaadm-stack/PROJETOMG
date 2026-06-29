import { EVENT_CATEGORIES, EVENT_PRIORITIES } from "../eventArchitectureConstants.js";
import { validateEventManifest } from "../contracts/eventManifestContract.js";

const events = new Map();
const officialEventIds = new Set();

/**
 * Register an official Studio Event Hub event.
 * @param {string} eventId
 * @param {import("../contracts/eventManifestContract.js").StudioEventManifest} definition
 * @param {object} [options]
 * @param {boolean} [options.official=true]
 */
export function registerBusEvent(eventId, definition, options = {}) {
  if (!eventId) throw new Error("registerBusEvent: eventId is required.");
  const manifest = { eventId, ...definition };
  const validation = validateEventManifest(manifest);
  if (!validation.valid) {
    throw new Error(`registerBusEvent: ${validation.errors.join(" ")}`);
  }
  if (events.has(eventId) && options.official !== false) {
    throw new Error(`registerBusEvent: official event "${eventId}" already registered.`);
  }
  events.set(eventId, Object.freeze(manifest));
  if (options.official !== false) officialEventIds.add(eventId);
}

/** @param {string} eventId */
export function getBusEvent(eventId) {
  return events.get(eventId) ?? null;
}

/**
 * @param {object} [filter]
 * @param {string} [filter.category]
 * @param {string} [filter.origin]
 */
export function listBusEvents(filter = {}) {
  let result = [...events.values()];
  if (filter.category) result = result.filter((e) => e.category === filter.category);
  if (filter.origin) result = result.filter((e) => e.origin === filter.origin);
  return result;
}

export function hasBusEvent(eventId) {
  return events.has(eventId);
}

export function isOfficialBusEvent(eventId) {
  return officialEventIds.has(eventId);
}

export function getBusEventCount() {
  return events.size;
}

export function validateBusEventIntegrity(eventId) {
  const event = getBusEvent(eventId);
  if (!event) return { valid: false, errors: [`Event not found: ${eventId}`] };
  return validateEventManifest(event);
}

export function clearBusEvents() {
  events.clear();
  officialEventIds.clear();
}

export { EVENT_CATEGORIES, EVENT_PRIORITIES };
