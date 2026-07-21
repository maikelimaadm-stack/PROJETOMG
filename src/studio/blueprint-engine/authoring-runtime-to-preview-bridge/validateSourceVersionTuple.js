import { FORBIDDEN_LEGACY_SOURCE_FIELDS } from './bridgeRuntimeConfig.js';
import { createBridgeIssue } from './createBridgeIssue.js';
import { isPlainObject, isNonEmptyString } from './normalizeBridgeInput.js';

/**
 * Validates the EXPLICIT version tuple against the expected versions. Exact match required; unknown fails
 * closed; no aggregated `upstreamVersions`; no downgrade; no assumed-compatible upgrade. Each mismatch
 * emits a distinct issue code. Pure. @param {Object} options @returns {Object}
 */
export function validateSourceVersionTuple(options = {}) {
  const o = isPlainObject(options) ? options : {};
  const handoff = isPlainObject(o.sourceHandoff) ? o.sourceHandoff : {};
  const expected = isPlainObject(o.expectedVersions) ? o.expectedVersions : {};
  const issues = [];

  // Aggregated upstreamVersions must never be present (it is a forbidden legacy source alias).
  if (FORBIDDEN_LEGACY_SOURCE_FIELDS.includes('upstreamVersions') && Object.prototype.hasOwnProperty.call(handoff, 'upstreamVersions')) {
    issues.push(createBridgeIssue({ issueCode: 'BRIDGE_AGGREGATED_UPSTREAM_VERSIONS_FORBIDDEN', severity: 'blocker', stage: 'source_version_validation', path: 'source.upstreamVersions', message: 'Aggregated upstreamVersions field is forbidden; an explicit version tuple is required.' }));
  }

  const pair = (field, code, path) => {
    const actual = handoff[field];
    const want = expected[field];
    if (!isNonEmptyString(actual)) {
      issues.push(createBridgeIssue({ issueCode: 'BRIDGE_VERSION_MISSING', severity: 'blocker', stage: 'source_version_validation', path, message: `${field} is missing on the source handoff.` }));
      return;
    }
    if (isNonEmptyString(want) && actual !== want) {
      issues.push(createBridgeIssue({ issueCode: code, severity: 'blocker', stage: 'source_version_validation', path, message: `${field} "${actual}" does not exactly match the expected "${want}".` }));
    }
  };
  pair('handoffVersion', 'BRIDGE_HANDOFF_VERSION_MISMATCH', 'source.handoffVersion');
  pair('runtimeVersion', 'BRIDGE_SOURCE_RUNTIME_VERSION_MISMATCH', 'source.runtimeVersion');
  pair('targetSandboxVersion', 'BRIDGE_TARGET_SANDBOX_VERSION_MISMATCH', 'source.targetSandboxVersion');

  return {
    ok: issues.length === 0,
    issues,
    policy: {
      exactVersionMatchRequired: true,
      aggregatedUpstreamVersionsFieldRequired: false,
      unknownVersionFailsClosed: true,
      versionDowngradeAllowed: false,
      versionUpgradeAssumedCompatible: false,
      bidirectionalCompatibilityCheckRequired: true,
    },
  };
}

export default validateSourceVersionTuple;
