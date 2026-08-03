import { SOURCE_FIELDS, REQUIRED_SOURCE_FIELDS } from './builderConfig.js';
import { makeIssue } from './normalizeIssues.js';
const STAGE = 'source_decision_shape_validation';
/** Rejects invented (non-real) and missing-required source fields against the real 33-field bridgeDecision shape. */
export function validateSourceDecisionShape(source) {
  const issues = [];
  const keys = Object.keys(source);
  for (const k of keys) { if (!SOURCE_FIELDS.includes(k)) issues.push(makeIssue('BUILDER_SOURCE_INVENTED_FIELD', STAGE)); }
  for (const req of REQUIRED_SOURCE_FIELDS) { if (!Object.prototype.hasOwnProperty.call(source, req)) issues.push(makeIssue('BUILDER_SOURCE_REQUIRED', STAGE)); }
  return issues;
}
export default validateSourceDecisionShape;
