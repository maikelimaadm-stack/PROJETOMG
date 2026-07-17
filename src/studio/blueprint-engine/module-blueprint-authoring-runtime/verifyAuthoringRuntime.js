import { AUTHORING_RUNTIME_CAPABILITIES } from './authoringRuntimeConfig.js';
import { isPlainObject } from './normalizeAuthoringInput.js';
import { stableSerialize } from './stableSerialize.js';
import { createDeterministicDigest } from './createDeterministicDigest.js';

const FORBIDDEN_LC = ['published', 'production', 'registered', 'generated', 'deployed', 'persisted', 'certified'];

/**
 * Verifies a produced authoring runtime for headless / synthetic / deterministic / immutable /
 * fail-closed safety invariants. Pure — returns a report; never throws, never mutates, never performs
 * I/O. Any violated invariant is a blocker.
 *
 * @param {Object} [options] @param {Object} [options.runtime] @returns {Object}
 */
export function verifyAuthoringRuntime(options = {}) {
  const o = isPlainObject(options) ? options : {};
  const runtime = isPlainObject(o.runtime) ? o.runtime : {};
  const caps = isPlainObject(runtime.capabilities) ? runtime.capabilities : AUTHORING_RUNTIME_CAPABILITIES;

  const blockers = [];
  const mustBeFalse = [
    'certificationPerformed', 'authoringUiImplemented', 'editorImplemented', 'persistenceImplemented',
    'storageUsed', 'filesystemWritesUsed', 'moduleGenerated', 'filesWrittenToModule', 'moduleRegistered',
    'backendAccessed', 'prismaAccessed', 'productionAccessed', 'stagingAccessed', 'fetchUsed', 'networkUsed',
    'mutationExternalAllowed', 'realDataRead', 'realDataWrite', 'rewriteEmpresas', 'prototypeRelinked',
    'productExposed', 'menuCreated', 'routeCreated', 'permissionModelIntegrated', 'tenantModelIntegrated',
    'serverSideAuthorizationIntegrated', 'draftIsCanonical', 'candidateIsCanonical',
  ];
  for (const k of mustBeFalse) {
    if (caps[k] === true) blockers.push(`capability_${k}_must_be_false`);
  }
  const mustBeTrue = [
    'headless', 'devOnly', 'syntheticOnly', 'inMemoryOnly', 'ephemeralOnly', 'deterministic',
    'immutableSnapshots', 'failClosed', 'sideEffectFree', 'ssotPreserved',
  ];
  for (const k of mustBeTrue) {
    if (caps[k] !== true) blockers.push(`capability_${k}_must_be_true`);
  }

  // SSOT boundary.
  const ss = isPlainObject(runtime.ssotBoundary) ? runtime.ssotBoundary : {};
  if (ss.draftIsCanonical === true || ss.candidateIsCanonical === true) blockers.push('unsafe_ssot_inversion');
  if (ss.certifiedBlueprintRemainsSsot === false) blockers.push('unsafe_ssot_not_preserved');
  if (ss.selfCertificationAllowed === true) blockers.push('unsafe_self_certification');
  if (ss.authoringMayOverwriteCertifiedBlueprint === true || ss.authoringMayBypassCertification === true) blockers.push('unsafe_ssot_overwrite_or_bypass');
  if (ss.secondSsotCreated === true) blockers.push('unsafe_second_ssot');

  // Lifecycle executor.
  const lc = isPlainObject(runtime.lifecycle) ? runtime.lifecycle : {};
  if (Array.isArray(lc.states) && lc.states.some((s) => FORBIDDEN_LC.includes(s))) blockers.push('unsafe_forbidden_lifecycle_state');
  if (lc.unknownTransitionFailClosed === false) blockers.push('unsafe_unknown_transition_accepted');

  // Operation executor.
  const oe = isPlainObject(runtime.operations) ? runtime.operations : {};
  if (oe.allowlistOnly === false) blockers.push('unsafe_operations_not_allowlist_only');
  if (oe.unknownOperationsFailClosed === false) blockers.push('unsafe_unknown_operation_accepted');
  if (oe.sideEffectsAllowed === true || oe.persistenceAllowed === true || oe.moduleWriteAllowed === true) blockers.push('unsafe_operation_effects');

  // Revision engine.
  const re = isPlainObject(runtime.revisions) ? runtime.revisions : {};
  if (re.negativeRevisionAllowed === true) blockers.push('unsafe_revision_negative');
  if (re.inPlaceCanonicalMutationAllowed === true || re.historyPersistenceAllowed === true) blockers.push('unsafe_revision_mutation_or_persistence');

  // Validation pipeline.
  const vp = isPlainObject(runtime.validation) ? runtime.validation : {};
  if (vp.failClosed === false) blockers.push('unsafe_validation_not_fail_closed');

  // Preview / candidate.
  const pv = isPlainObject(runtime.previewHandoff) ? runtime.previewHandoff : {};
  if (pv.previewMounted === true || pv.realDataAttached === true || pv.productExposed === true) blockers.push('unsafe_preview');
  const cc = isPlainObject(runtime.candidatePreparation) ? runtime.candidatePreparation : {};
  if (cc.certified === true || cc.canonical === true || cc.registered === true || cc.published === true || cc.moduleGenerated === true) blockers.push('unsafe_candidate');
  if (cc.selfCertificationAllowed === true) blockers.push('unsafe_candidate_self_certification');

  // Permission/tenancy.
  const pt = isPlainObject(runtime.permissionTenancy) ? runtime.permissionTenancy : {};
  if (pt.permissionModelIntegrated === true) blockers.push('unsafe_permission_model_integrated_without_foundation');
  if (pt.tenantModelIntegrated === true) blockers.push('unsafe_tenant_model_integrated_without_foundation');
  if (pt.serverSideAuthorizationIntegrated === true) blockers.push('unsafe_server_side_authorization_integrated');

  // Manual gate.
  const mg = isPlainObject(runtime.manualGate) ? runtime.manualGate : {};
  if (mg.manualGateRequired !== true) blockers.push('missing_manual_gate');
  if (mg.authorizesAuthoringUi === true || mg.authorizesModuleGeneration === true || mg.authorizesProductExposure === true) blockers.push('unsafe_manual_gate_authorizes_real');

  // Safety.
  const sc = isPlainObject(runtime.safety) ? runtime.safety : {};
  if (sc.anyForbiddenSideEffect === true) blockers.push('unsafe_safety_side_effect');

  // Static nondeterminism scan over any embedded source string (defensive; the gate is authoritative).
  const serialized = stableSerialize(runtime);
  if (/Date\.now|new Date\(|Math\.random|crypto\.randomUUID|\brandomUUID\b/.test(serialized)) blockers.push('unsafe_nondeterministic_source');

  const ok = blockers.length === 0;
  const core = {
    kind: 'authoring-runtime-verification',
    ok,
    valid: ok,
    headless: caps.headless === true,
    deterministic: caps.deterministic === true,
    immutableSnapshots: caps.immutableSnapshots === true,
    ssotPreserved: caps.ssotPreserved === true,
    authoringUiImplemented: caps.authoringUiImplemented === true,
    persistenceImplemented: caps.persistenceImplemented === true,
    moduleGenerated: caps.moduleGenerated === true,
    productExposed: caps.productExposed === true,
    blockers,
    blockerCount: blockers.length,
    checkedCapabilities: mustBeFalse.length + mustBeTrue.length,
  };
  return Object.freeze({ ...core, verificationDigest: createDeterministicDigest(core) });
}

/**
 * Runtime-behavior verifier: given a session, an operation and the resulting session+receipt, detects
 * input mutation, revision regression, and unknown-op acceptance. Pure. @param {Object} options
 * @returns {{ ok: boolean, blockers: string[] }}
 */
export function verifyAuthoringOperationOutcome(options = {}) {
  const o = isPlainObject(options) ? options : {};
  const beforeSerialized = typeof o.beforeSessionSerialized === 'string' ? o.beforeSessionSerialized : null;
  const afterInputSerialized = typeof o.afterInputSessionSerialized === 'string' ? o.afterInputSessionSerialized : null;
  const receipt = isPlainObject(o.receipt) ? o.receipt : {};
  const blockers = [];
  if (beforeSerialized !== null && afterInputSerialized !== null && beforeSerialized !== afterInputSerialized) blockers.push('input_session_mutated');
  if (receipt.previousRevision !== null && receipt.nextRevision !== null
    && Number.isFinite(receipt.previousRevision) && Number.isFinite(receipt.nextRevision)
    && receipt.nextRevision < receipt.previousRevision) blockers.push('revision_regression');
  return { ok: blockers.length === 0, blockers };
}

export default verifyAuthoringRuntime;
