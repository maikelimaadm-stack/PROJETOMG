import {
  SOURCE_HANDOFF_KIND, SOURCE_HANDOFF_REQUIRED_FIELDS, FORBIDDEN_LEGACY_SOURCE_FIELDS, REAL_HANDOFF_FIELDS,
} from './bridgeRuntimeConfig.js';
import { createBridgeIssue } from './createBridgeIssue.js';
import { isPlainObject, isNonEmptyString, isNonNegativeInteger } from './normalizeBridgeInput.js';

/**
 * Validates the REAL source handoff shape, types, required fields, security boundary and legacy-alias
 * prohibition. Real field names only — `upstreamVersions` / generic `digest` are rejected. No
 * auto-correction, no field filling, no silent discard. Pure. @param {Object} handoff @returns {Object}
 */
export function validateSourceHandoffShape(handoff) {
  const issues = [];
  if (!isPlainObject(handoff)) {
    issues.push(createBridgeIssue({ issueCode: 'BRIDGE_SOURCE_NOT_OBJECT', severity: 'blocker', stage: 'source_shape_validation', path: 'source', message: 'sourceHandoff must be a plain object.' }));
    return { ok: false, issues };
  }
  // Legacy alias prohibition.
  for (const alias of FORBIDDEN_LEGACY_SOURCE_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(handoff, alias)) {
      issues.push(createBridgeIssue({ issueCode: 'BRIDGE_SOURCE_LEGACY_ALIAS_FORBIDDEN', severity: 'blocker', stage: 'source_shape_validation', path: `source.${alias}`, message: `Legacy source field alias "${alias}" is forbidden (real handoff field names required).` }));
    }
  }
  // Handoff kind.
  if (handoff.handoffKind !== SOURCE_HANDOFF_KIND) {
    issues.push(createBridgeIssue({ issueCode: 'BRIDGE_SOURCE_WRONG_HANDOFF_KIND', severity: 'blocker', stage: 'source_shape_validation', path: 'source.handoffKind', message: `handoffKind must be "${SOURCE_HANDOFF_KIND}".` }));
  }
  // Required fields present.
  for (const f of SOURCE_HANDOFF_REQUIRED_FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(handoff, f)) {
      issues.push(createBridgeIssue({ issueCode: 'BRIDGE_SOURCE_MISSING_REQUIRED_FIELD', severity: 'blocker', stage: 'source_shape_validation', path: `source.${f}`, message: `Required source field "${f}" is missing.` }));
    }
  }
  // Unknown critical fields (fields not in the real handoff set are rejected).
  for (const k of Object.keys(handoff)) {
    if (!REAL_HANDOFF_FIELDS.includes(k) && !FORBIDDEN_LEGACY_SOURCE_FIELDS.includes(k)) {
      issues.push(createBridgeIssue({ issueCode: 'BRIDGE_SOURCE_UNKNOWN_CRITICAL_FIELD', severity: 'error', stage: 'source_shape_validation', path: `source.${k}`, message: `Unknown source field "${k}" is not part of the real handoff shape.` }));
    }
  }
  // Types + assertions.
  const t = (cond, code, sev, p, msg) => { if (!cond) issues.push(createBridgeIssue({ issueCode: code, severity: sev, stage: 'source_shape_validation', path: p, message: msg })); };
  t(handoff.synthetic === true, 'BRIDGE_SOURCE_NOT_SYNTHETIC', 'blocker', 'source.synthetic', 'synthetic must be true.');
  t(handoff.immutable === true, 'BRIDGE_SOURCE_NOT_IMMUTABLE', 'blocker', 'source.immutable', 'immutable must be true.');
  t(handoff.validated === true, 'BRIDGE_SOURCE_NOT_VALIDATED', 'blocker', 'source.validated', 'validated must be true.');
  t(handoff.previewPayloadCreated === true, 'BRIDGE_SOURCE_PREVIEW_PAYLOAD_NOT_CREATED', 'blocker', 'source.previewPayloadCreated', 'previewPayloadCreated must be true.');
  t(handoff.ok === true, 'BRIDGE_SOURCE_NOT_OK', 'blocker', 'source.ok', 'ok must be true.');
  t(isNonNegativeInteger(handoff.draftRevision), 'BRIDGE_SOURCE_REVISION_INVALID', 'blocker', 'source.draftRevision', 'draftRevision must be a non-negative integer.');
  t(isPlainObject(handoff.payload), 'BRIDGE_SOURCE_PAYLOAD_INVALID', 'blocker', 'source.payload', 'payload must be a plain object.');
  t(isNonEmptyString(handoff.draftDigest), 'BRIDGE_SOURCE_WRONG_TYPE', 'error', 'source.draftDigest', 'draftDigest must be a non-empty string.');
  return { ok: !issues.some((i) => i.blocksBridge), issues };
}

/**
 * Validates the source SECURITY boundary — the security flags must all be false (validated, not copied).
 * Pure. @param {Object} handoff @returns {Object}
 */
export function validateSourceSecurityFlags(handoff) {
  const src = isPlainObject(handoff) ? handoff : {};
  const issues = [];
  const check = (field, code) => { if (src[field] !== false) issues.push(createBridgeIssue({ issueCode: code, severity: 'blocker', stage: 'source_synthetic_boundary_validation', path: `source.${field}`, message: `${field} must be false on a synthetic handoff.` })); };
  check('previewMounted', 'BRIDGE_SOURCE_PREVIEW_MOUNTED_FORBIDDEN');
  check('realDataAttached', 'BRIDGE_SOURCE_REAL_DATA_ATTACHED_FORBIDDEN');
  check('routeCreated', 'BRIDGE_SOURCE_ROUTE_CREATED_FORBIDDEN');
  check('menuCreated', 'BRIDGE_SOURCE_MENU_CREATED_FORBIDDEN');
  check('productExposed', 'BRIDGE_SOURCE_PRODUCT_EXPOSED_FORBIDDEN');
  return { ok: issues.length === 0, issues };
}

export default validateSourceHandoffShape;
