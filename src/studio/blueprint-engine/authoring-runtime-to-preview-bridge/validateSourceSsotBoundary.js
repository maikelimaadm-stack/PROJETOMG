import { createBridgeIssue } from './createBridgeIssue.js';
import { isPlainObject } from './normalizeBridgeInput.js';

/**
 * Validates the SOURCE SSOT boundary — the source draft/candidate is non-canonical and non-certified; the
 * certified blueprint remains the canonical SSOT. Any `canonical: true` / `certified: true` on the source
 * (or its payload) is an SSOT inversion. Pure. @param {Object} handoff @returns {Object}
 */
export function validateSourceSsotBoundary(handoff) {
  const src = isPlainObject(handoff) ? handoff : {};
  const payload = isPlainObject(src.payload) ? src.payload : {};
  const issues = [];
  if (src.canonical === true || payload.canonical === true) {
    issues.push(createBridgeIssue({ issueCode: 'BRIDGE_SOURCE_CANONICAL_FORBIDDEN', severity: 'blocker', stage: 'source_ssot_boundary_validation', path: 'source.canonical', message: 'A synthetic source may not be canonical (certified blueprint remains SSOT).' }));
  }
  if (src.certified === true || payload.certified === true) {
    issues.push(createBridgeIssue({ issueCode: 'BRIDGE_SOURCE_CERTIFIED_FORBIDDEN', severity: 'blocker', stage: 'source_ssot_boundary_validation', path: 'source.certified', message: 'A synthetic source may not be certified.' }));
  }
  if (src.moduleGenerated === true || payload.moduleGenerated === true) {
    issues.push(createBridgeIssue({ issueCode: 'BRIDGE_SSOT_INVERSION_FORBIDDEN', severity: 'blocker', stage: 'source_ssot_boundary_validation', path: 'source.moduleGenerated', message: 'A synthetic source may not claim module generation (SSOT inversion).' }));
  }
  return {
    ok: issues.length === 0,
    issues,
    boundary: {
      draftIsCanonical: false,
      candidateIsCanonical: false,
      certifiedBlueprintRemainsSsot: true,
    },
  };
}

export default validateSourceSsotBoundary;
