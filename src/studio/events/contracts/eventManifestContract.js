import { EVENT_MANIFEST_SCHEMA_VERSION, EVENT_CATEGORIES, EVENT_PRIORITIES } from "../eventArchitectureConstants.js";

/**
 * @typedef {object} StudioEventManifest
 * @property {string} eventId
 * @property {string} name
 * @property {string} category
 * @property {string} description
 * @property {object} payload
 * @property {string} origin
 * @property {string[]} consumers
 * @property {string} priority
 * @property {string} version
 * @property {object} [documentation]
 * @property {object[]} [examples]
 * @property {object} [compatibility]
 * @property {string[]} [breakingChanges]
 * @property {string[]} [notes]
 */

/**
 * @param {StudioEventManifest} manifest
 */
export function validateEventManifest(manifest) {
  const errors = [];
  if (!manifest?.eventId) errors.push("eventId is required.");
  if (!manifest?.name) errors.push("name is required.");
  if (!manifest?.category || !EVENT_CATEGORIES.includes(manifest.category)) {
    errors.push("category must be an official EVENT_CATEGORIES value.");
  }
  if (!manifest?.description) errors.push("description is required.");
  if (!manifest?.payload || typeof manifest.payload !== "object") {
    errors.push("payload contract object is required.");
  }
  if (!manifest?.origin) errors.push("origin is required.");
  if (!Array.isArray(manifest?.consumers)) errors.push("consumers must be an array.");
  if (!manifest?.priority || !EVENT_PRIORITIES.includes(manifest.priority)) {
    errors.push("priority must be an official EVENT_PRIORITIES value.");
  }
  if (!manifest?.version) errors.push("version is required.");
  return { valid: errors.length === 0, errors };
}

/**
 * @param {StudioEventManifest} manifest
 */
export function defineEventManifest(manifest) {
  const validation = validateEventManifest(manifest);
  if (!validation.valid) {
    throw new Error(`defineEventManifest: ${validation.errors.join(" ")}`);
  }
  return Object.freeze({
    schemaVersion: EVENT_MANIFEST_SCHEMA_VERSION,
    ...manifest,
    consumers: Object.freeze([...manifest.consumers]),
    examples: manifest.examples ? Object.freeze([...manifest.examples]) : [],
    breakingChanges: manifest.breakingChanges ? Object.freeze([...manifest.breakingChanges]) : [],
    notes: manifest.notes ? Object.freeze([...manifest.notes]) : [],
  });
}

export default validateEventManifest;
