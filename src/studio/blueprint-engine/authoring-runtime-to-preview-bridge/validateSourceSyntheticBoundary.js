import { validateSourceSecurityFlags } from './validateSourceHandoffShape.js';
import { createBridgeIssue } from './createBridgeIssue.js';
import { isPlainObject } from './normalizeBridgeInput.js';

/**
 * Validates the SOURCE SYNTHETIC boundary — synthetic/immutable/validated true and every security flag
 * (previewMounted/realDataAttached/routeCreated/menuCreated/productExposed) false. Delegates security-flag
 * checks to the shape module. Pure. @param {Object} handoff @returns {Object}
 */
export function validateSourceSyntheticBoundary(handoff) {
  const src = isPlainObject(handoff) ? handoff : {};
  const issues = [];
  if (src.synthetic !== true) issues.push(createBridgeIssue({ issueCode: 'BRIDGE_SOURCE_NOT_SYNTHETIC', severity: 'blocker', stage: 'source_synthetic_boundary_validation', path: 'source.synthetic', message: 'synthetic must be true.' }));
  const sec = validateSourceSecurityFlags(src);
  issues.push(...sec.issues);
  return { ok: issues.length === 0, issues };
}

export default validateSourceSyntheticBoundary;
