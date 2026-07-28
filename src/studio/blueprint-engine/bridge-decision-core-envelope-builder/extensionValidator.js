import { SOURCE_FIELDS } from './builderConfig.js';
import { makeIssue } from './normalizeIssues.js';
import { hasPrototypePollutionKey } from './prototypePollutionGuard.js';
const STAGE = 'extension_validation';
/**
 * Rejects source-level extensions and pollution: any top-level key outside the real 33-field shape is an invented
 * extension; prototype-pollution keys at any depth are rejected. Core/envelope/version/digest overrides are impossible
 * by construction (the builder derives them from upstream), and asserted here as a boundary.
 */
export function validateNoForbiddenExtensions(source) {
  const issues = [];
  for (const k of Object.keys(source)) { if (!SOURCE_FIELDS.includes(k)) issues.push(makeIssue('BUILDER_EXTENSION_CRITICAL_OVERRIDE_FORBIDDEN', STAGE)); }
  if (hasPrototypePollutionKey(source)) issues.push(makeIssue('BUILDER_PROTOTYPE_POLLUTION_KEY_FORBIDDEN', STAGE));
  return issues;
}
export default validateNoForbiddenExtensions;
