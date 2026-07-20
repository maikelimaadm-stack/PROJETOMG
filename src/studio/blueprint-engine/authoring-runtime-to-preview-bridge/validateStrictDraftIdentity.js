import { createBridgeIssue } from './createBridgeIssue.js';
import { isNonEmptyString, isPlainObject } from './normalizeBridgeInput.js';

/** Strict draft identity policy metadata (all enforced, no fallback). */
export const STRICT_DRAFT_IDENTITY_POLICY = Object.freeze({
  strictDraftIdentityRequired: true,
  explicitDraftIdRequired: true,
  singleDraftFallbackAllowed: false,
  missingDraftIdFailsClosed: true,
  unknownDraftIdFailsClosed: true,
  ambiguousDraftSelectionAllowed: false,
  bridgeMustValidateDraftIdBeforeAnyRuntimeHelperCall: true,
  bridgeMayInvokeSingleDraftFallback: false,
  bridgeImplementationMustNeverCallFindDraftWithoutExplicitId: true,
});

/**
 * Validates strict draft identity BEFORE any other processing. Requires an explicit non-empty
 * `expectedDraftId`, a non-empty `sourceHandoff.draftId`, and exact equality. No single-draft fallback, no
 * draft lookup. Fails closed. Pure. @param {Object} options @returns {Object}
 */
export function validateStrictDraftIdentity(options = {}) {
  const o = isPlainObject(options) ? options : {};
  const expectedDraftId = o.expectedDraftId;
  const handoff = isPlainObject(o.sourceHandoff) ? o.sourceHandoff : {};
  const issues = [];

  if (!isNonEmptyString(expectedDraftId)) {
    issues.push(createBridgeIssue({ issueCode: 'BRIDGE_EXPECTED_DRAFT_ID_REQUIRED', severity: 'blocker', stage: 'source_identity_validation', path: 'expectedDraftId', message: 'expectedDraftId is required and must be a non-empty string.' }));
  }
  if (!isNonEmptyString(handoff.draftId)) {
    issues.push(createBridgeIssue({ issueCode: 'BRIDGE_SOURCE_DRAFT_ID_REQUIRED', severity: 'blocker', stage: 'source_identity_validation', path: 'source.draftId', message: 'sourceHandoff.draftId is required and must be a non-empty string.' }));
  }
  if (isNonEmptyString(expectedDraftId) && isNonEmptyString(handoff.draftId) && expectedDraftId !== handoff.draftId) {
    issues.push(createBridgeIssue({ issueCode: 'BRIDGE_SOURCE_DRAFT_ID_MISMATCH', severity: 'blocker', stage: 'source_identity_validation', path: 'source.draftId', message: 'sourceHandoff.draftId does not equal the explicit expectedDraftId.' }));
  }
  return { ok: issues.length === 0, issues, policy: STRICT_DRAFT_IDENTITY_POLICY };
}

export default validateStrictDraftIdentity;
