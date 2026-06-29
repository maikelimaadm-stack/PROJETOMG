import { MANIFEST_SCHEMA_VERSION } from "../designSystemConstants.js";

/**
 * @typedef {object} ComponentManifest
 * @property {string} componentId
 * @property {string} schemaVersion
 * @property {string[]} properties
 * @property {string[]} events
 * @property {string[]} actions
 * @property {string[]} tokens
 * @property {string[]} themes
 * @property {string[]} permissions
 * @property {object} runtime
 * @property {object} preview
 * @property {object} [marketplace]
 * @property {object} [documentation]
 * @property {object} [examples]
 * @property {string[]} [limitations]
 * @property {string[]} [dependencies]
 * @property {string[]} [capabilities]
 * @property {object} [ai]
 * @property {string[]} [accessibility]
 */

/**
 * @param {ComponentManifest} manifest
 */
export function validateComponentManifest(manifest) {
  const errors = [];
  if (!manifest?.componentId) errors.push("componentId is required.");
  if (!manifest?.schemaVersion) errors.push("schemaVersion is required.");
  if (!Array.isArray(manifest?.properties)) errors.push("properties must be an array.");
  if (!Array.isArray(manifest?.events)) errors.push("events must be an array.");
  if (!Array.isArray(manifest?.actions)) errors.push("actions must be an array.");
  if (!manifest?.runtime || typeof manifest.runtime !== "object") {
    errors.push("runtime object is required.");
  }
  if (!manifest?.preview || typeof manifest.preview !== "object") {
    errors.push("preview object is required.");
  }
  return { valid: errors.length === 0, errors };
}

/**
 * @param {ComponentManifest} manifest
 */
export function defineComponentManifest(manifest) {
  const validation = validateComponentManifest(manifest);
  if (!validation.valid) {
    throw new Error(`defineComponentManifest: ${validation.errors.join(" ")}`);
  }
  return Object.freeze({
    schemaVersion: MANIFEST_SCHEMA_VERSION,
    ...manifest,
  });
}

export default validateComponentManifest;
