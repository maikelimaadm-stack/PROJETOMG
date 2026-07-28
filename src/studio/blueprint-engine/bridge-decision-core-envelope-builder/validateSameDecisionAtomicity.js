import { stableSerialize } from '../module-blueprint-authoring-runtime/index.js';
import { DIGEST_FIELD } from './builderConfig.js';
import { makeIssue } from './normalizeIssues.js';
const STAGE = 'same_decision_atomicity_validation';
/**
 * Confirms the digest and core come from the SAME decision: serialize(core) must equal serialize(source minus the
 * digest field). This rejects any cross-decision core/digest mixing. Same-decision atomicity is structural — the
 * builder never accepts a core or digest separately.
 */
export function validateSameDecisionAtomicity(source, core) {
  const issues = [];
  const withoutDigest = {};
  for (const k of Object.keys(source)) { if (k !== DIGEST_FIELD) withoutDigest[k] = source[k]; }
  if (stableSerialize(core) !== stableSerialize(withoutDigest)) issues.push(makeIssue('BUILDER_CROSS_DECISION_MIX_FORBIDDEN', STAGE));
  return issues;
}
export default validateSameDecisionAtomicity;
