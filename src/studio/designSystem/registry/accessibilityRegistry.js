import { A11Y_CATEGORIES } from "../designSystemConstants.js";

const profiles = new Map();

/**
 * @param {string} a11yId
 * @param {object} definition
 */
export function registerAccessibilityProfile(a11yId, definition) {
  if (!a11yId) throw new Error("registerAccessibilityProfile: a11yId is required.");
  if (!definition?.category || !A11Y_CATEGORIES.includes(definition.category)) {
    throw new Error(`registerAccessibilityProfile: invalid category for ${a11yId}.`);
  }
  profiles.set(a11yId, Object.freeze({ a11yId, ...definition }));
}

/** @param {string} a11yId */
export function getAccessibilityProfile(a11yId) {
  return profiles.get(a11yId) ?? null;
}

export function listAccessibilityProfiles(filter = {}) {
  let result = [...profiles.values()];
  if (filter.category) result = result.filter((p) => p.category === filter.category);
  return result;
}

export function getAccessibilityProfileCount() {
  return profiles.size;
}

export function clearAccessibilityProfiles() {
  profiles.clear();
}
