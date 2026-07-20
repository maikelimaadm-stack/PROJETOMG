import { stableSerialize } from '../module-blueprint-authoring-runtime/index.js';
import { DEFAULT_BRIDGE_RESOURCE_LIMITS, BRIDGE_RESOURCE_LIMIT_DIMENSIONS } from './bridgeRuntimeConfig.js';
import { createBridgeIssue } from './createBridgeIssue.js';
import { isPlainObject } from './normalizeBridgeInput.js';

/** Validates a limits override object; unknown dimensions rejected; non-integers ignored (default kept). */
export function resolveBridgeLimits(overrides) {
  const o = isPlainObject(overrides) ? overrides : {};
  const issues = [];
  /** @type {Record<string, number>} */
  const limits = {};
  for (const dim of BRIDGE_RESOURCE_LIMIT_DIMENSIONS) {
    const v = o[dim];
    limits[dim] = Number.isInteger(v) && v >= 0 ? v : DEFAULT_BRIDGE_RESOURCE_LIMITS[dim];
  }
  for (const k of Object.keys(o)) {
    if (!BRIDGE_RESOURCE_LIMIT_DIMENSIONS.includes(k)) {
      issues.push(createBridgeIssue({ issueCode: 'BRIDGE_UNKNOWN_RESOURCE_DIMENSION', severity: 'blocker', stage: 'source_shape_validation', path: `limits.${k}`, message: `Unknown resource-limit dimension "${k}".` }));
    }
  }
  return { limits, issues };
}

/**
 * Enforces the (intentionally stricter) bridge resource limits against a real handoff. Limit-exceeded fails
 * closed with a deterministic blocker (no silent truncation, no partial target). Pure. @param {Object} options
 * @returns {Object}
 */
export function enforceBridgeResourceLimits(options = {}) {
  const o = isPlainObject(options) ? options : {};
  const handoff = isPlainObject(o.sourceHandoff) ? o.sourceHandoff : {};
  const limits = isPlainObject(o.limits) ? o.limits : DEFAULT_BRIDGE_RESOURCE_LIMITS;
  const payload = isPlainObject(handoff.payload) ? handoff.payload : {};
  const issues = [];

  const payloadBytes = stableSerialize(payload).length;
  const fields = Array.isArray(payload.fields) ? payload.fields.length : 0;
  const layout = Array.isArray(payload.layout) ? payload.layout.length : 0;
  const relationships = Array.isArray(payload.relationships) ? payload.relationships.length : 0;

  const over = (actual, dim, code, path) => { if (Number.isFinite(limits[dim]) && actual > limits[dim]) issues.push(createBridgeIssue({ issueCode: code, severity: 'blocker', stage: 'source_shape_validation', path, message: `${path} (${actual}) exceeds bridge limit ${dim} (${limits[dim]}).` })); };
  over(payloadBytes, 'maxSourcePayloadBytes', 'BRIDGE_SOURCE_PAYLOAD_TOO_LARGE', 'source.payload.bytes');
  over(fields, 'maxSourceFields', 'BRIDGE_SOURCE_FIELDS_TOO_MANY', 'source.payload.fields');
  over(layout, 'maxSourceLayoutSections', 'BRIDGE_SOURCE_LAYOUT_SECTIONS_TOO_MANY', 'source.payload.layout');
  over(relationships, 'maxSourceRelationships', 'BRIDGE_SOURCE_RELATIONSHIPS_TOO_MANY', 'source.payload.relationships');

  // Longest string in the payload.
  const longest = longestString(payload);
  over(longest, 'maxStringLength', 'BRIDGE_STRING_TOO_LONG', 'source.payload.string');

  return {
    ok: issues.length === 0,
    issues,
    measured: { payloadBytes, fields, layout, relationships, longestString: longest },
    limits: { ...limits },
    policy: {
      unknownResourceDimensionRejected: true,
      silentTruncationAllowed: false,
      limitExceededFailsClosed: true,
      bridgeLimitsMayRejectRuntimeValidHandoff: true,
      stricterBridgeLimitsAreIntentional: true,
      sourceAcceptanceDoesNotGuaranteeBridgeAcceptance: true,
      limitMismatchIsNotSilent: true,
      partialTargetDescriptorAllowed: false,
    },
  };
}

/** @param {unknown} v @returns {number} */
function longestString(v) {
  if (typeof v === 'string') return v.length;
  if (Array.isArray(v)) return v.reduce((m, e) => Math.max(m, longestString(e)), 0);
  if (isPlainObject(v)) return Object.keys(v).reduce((m, k) => Math.max(m, longestString(v[k])), 0);
  return 0;
}

export default enforceBridgeResourceLimits;
