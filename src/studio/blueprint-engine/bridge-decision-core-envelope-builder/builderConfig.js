/**
 * STUDIO BRIDGE DECISION CORE ENVELOPE BUILDER — configuration + upstream capture.
 *
 * Headless, dev-only, in-memory, ephemeral, deterministic, immutable, fail-closed, side-effect-free. Consumes the
 * merged Builder Contract READ-ONLY — no divergent local list of source fields, allowlist, envelope fields, pipeline
 * stages, issue codes or resource dimensions. ARCHITECTURE 1: envelope.identityVerified stays false; builder
 * verification is recorded in the builder decision.
 */
import {
  BUILDER_CONTRACT_VERSION, REAL_SOURCE_BRIDGE_DECISION_FIELDS, REQUIRED_SOURCE_BRIDGE_DECISION_FIELDS,
  SOURCE_SUCCESS_ELIGIBILITY_FIELDS, SOURCE_SECURITY_FIELDS, SOURCE_DECISION_KIND, SOURCE_DECISION_SUCCESS_STATUS,
  SOURCE_DIGEST_FIELD, DIGEST_PREIMAGE_ALLOWLIST, OUTPUT_CORE_ENVELOPE_FIELDS, OUTPUT_CORE_ENVELOPE_INVARIANTS,
  OUTPUT_CORE_ENVELOPE_KIND, OUTPUT_CORE_ENVELOPE_VERSION_TAG, OUTPUT_TARGET_DESCRIPTOR_FIELDS,
  BUILDER_PIPELINE_STAGES, BUILDER_ISSUE_CODES, BUILDER_ISSUE_SEVERITIES, BUILDER_DECISION_STATUSES,
  BUILDER_MAX_STRUCTURE_DEPTH, FORBIDDEN_PROTOTYPE_KEYS, RESOURCE_LIMITS_CONTRACT, RESOURCE_DIMENSION_NAMES,
  ISSUE_MODEL_CONTRACT, SOURCE_CORE_ENVELOPE_CONTRACT_VERSION, SOURCE_ENVELOPE_V1_CONTRACT_VERSION,
  SOURCE_BRIDGE_RUNTIME_VERSION, SOURCE_PREVIEW_SANDBOX_CONTRACT_VERSION,
} from '../bridge-decision-core-envelope-builder-contract/index.js';
import {
  REAL_BRIDGE_TARGET_DESCRIPTOR_FIELDS, REQUIRED_BRIDGE_TARGET_DESCRIPTOR_FIELDS,
  SECURITY_BRIDGE_TARGET_DESCRIPTOR_FIELDS, VERSION_BRIDGE_TARGET_DESCRIPTOR_FIELDS,
  DIGEST_BRIDGE_TARGET_DESCRIPTOR_FIELDS, REAL_TARGET_DESCRIPTOR_INVARIANTS, SOURCE_TARGET_SANDBOX_KIND,
  SOURCE_TARGET_CONTRACT_VERSION as UPSTREAM_SOURCE_TARGET_CONTRACT_VERSION,
  SOURCE_AUTHORING_RUNTIME_VERSION as UPSTREAM_AUTHORING_RUNTIME_VERSION,
  SOURCE_PREVIEW_SANDBOX_CONTRACT_VERSION as UPSTREAM_PREVIEW_SANDBOX_CONTRACT_VERSION,
} from '../bridge-to-preview-sandbox-runtime-contract/index.js';
import {
  SOURCE_HANDOFF_KIND as UPSTREAM_SOURCE_HANDOFF_KIND,
  SOURCE_HANDOFF_VERSION as UPSTREAM_SOURCE_HANDOFF_VERSION,
  createTargetPreviewSandboxDescriptor,
} from '../authoring-runtime-to-preview-bridge/index.js';
import { deepFreeze } from './deepFreeze.js';

export const BUILDER_NAME = 'studio-bridge-decision-core-envelope-builder';
export const BUILDER_SEMVER = '1.0.0';
export const BUILDER_VERSION = `${BUILDER_NAME}@${BUILDER_SEMVER}`;
export const BUILDER_MODE = 'headless_bridge_decision_core_envelope_builder';
export const FUTURE_BUILDER_FACTORY = 'createBridgeDecisionCoreEnvelopeBuilder';

// ---- Real upstream, captured READ-ONLY. ----
export const SOURCE_FIELDS = deepFreeze([...REAL_SOURCE_BRIDGE_DECISION_FIELDS]);
export const REQUIRED_SOURCE_FIELDS = deepFreeze([...REQUIRED_SOURCE_BRIDGE_DECISION_FIELDS]);
export const ELIGIBILITY_FIELDS = deepFreeze([...SOURCE_SUCCESS_ELIGIBILITY_FIELDS]);
export const DECISION_KIND = SOURCE_DECISION_KIND;
export const DECISION_SUCCESS_STATUS = SOURCE_DECISION_SUCCESS_STATUS;
export const DIGEST_FIELD = SOURCE_DIGEST_FIELD;
export const CORE_ALLOWLIST = deepFreeze([...DIGEST_PREIMAGE_ALLOWLIST]);
export const CORE_FIELD_COUNT = DIGEST_PREIMAGE_ALLOWLIST.length; // 32
export const ENVELOPE_FIELDS = deepFreeze([...OUTPUT_CORE_ENVELOPE_FIELDS]);
export const ENVELOPE_INVARIANTS = deepFreeze({ ...OUTPUT_CORE_ENVELOPE_INVARIANTS });
export const ENVELOPE_KIND = OUTPUT_CORE_ENVELOPE_KIND;
export const ENVELOPE_VERSION_TAG = OUTPUT_CORE_ENVELOPE_VERSION_TAG;
export const PIPELINE_STAGES = deepFreeze([...BUILDER_PIPELINE_STAGES]);
export const ISSUE_CODES = deepFreeze([...BUILDER_ISSUE_CODES]);
export const ISSUE_SEVERITIES = deepFreeze([...BUILDER_ISSUE_SEVERITIES]);
export const DECISION_STATUSES = deepFreeze([...BUILDER_DECISION_STATUSES]);
export const MAX_STRUCTURE_DEPTH = BUILDER_MAX_STRUCTURE_DEPTH;
export const PROTOTYPE_POLLUTION_KEYS = deepFreeze([...FORBIDDEN_PROTOTYPE_KEYS]);
export const SOURCE_BUILDER_CONTRACT_VERSION = BUILDER_CONTRACT_VERSION;
export const SOURCE_CORE_ENVELOPE_V2_VERSION = SOURCE_CORE_ENVELOPE_CONTRACT_VERSION;
export const SOURCE_ENVELOPE_V1_VERSION = SOURCE_ENVELOPE_V1_CONTRACT_VERSION;
export const SOURCE_BRIDGE_VERSION = SOURCE_BRIDGE_RUNTIME_VERSION;

// ---- Issue model (exact shape from the contract; no local divergence). ----
export const ISSUE_SHAPE_FIELDS = deepFreeze([...ISSUE_MODEL_CONTRACT.issueShapeFields]);

// ---- Target descriptor SSOT: EVERY list/value derived READ-ONLY from the real upstreams (no local arrays). ----
export const TARGET_DESCRIPTOR_FIELDS = deepFreeze([...REAL_BRIDGE_TARGET_DESCRIPTOR_FIELDS]);           // 23
export const TARGET_DESCRIPTOR_REQUIRED_FIELDS = deepFreeze([...REQUIRED_BRIDGE_TARGET_DESCRIPTOR_FIELDS]); // 16
export const TARGET_DESCRIPTOR_SECURITY_FIELDS = deepFreeze([...SECURITY_BRIDGE_TARGET_DESCRIPTOR_FIELDS]); // 7
export const TARGET_DESCRIPTOR_VERSION_FIELDS = deepFreeze([...VERSION_BRIDGE_TARGET_DESCRIPTOR_FIELDS]);   // 4
export const TARGET_DESCRIPTOR_DIGEST_FIELDS = deepFreeze([...DIGEST_BRIDGE_TARGET_DESCRIPTOR_FIELDS]);     // 2
export const TARGET_DESCRIPTOR_INVARIANTS = deepFreeze({ ...REAL_TARGET_DESCRIPTOR_INVARIANTS });
/**
 * The string-typed subset of the 16 required fields, DERIVED (never hand-listed): required minus every field whose
 * upstream invariant is a boolean, minus the two non-string required fields the upstream shape defines
 * (`candidateDraftRevision` is a non-negative integer, `syntheticPayload` is a plain object). Only this subset is
 * checked for "present and non-empty string"; the rest are checked for presence plus their own typed rule.
 */
const NON_STRING_REQUIRED_FIELDS = deepFreeze([
  ...Object.keys(REAL_TARGET_DESCRIPTOR_INVARIANTS).filter((k) => typeof REAL_TARGET_DESCRIPTOR_INVARIANTS[k] === 'boolean'),
  'candidateDraftRevision', 'syntheticPayload',
]);
export const TARGET_DESCRIPTOR_REQUIRED_STRING_FIELDS = deepFreeze(
  REQUIRED_BRIDGE_TARGET_DESCRIPTOR_FIELDS.filter((f) => !NON_STRING_REQUIRED_FIELDS.includes(f)),
); // 10
export const TARGET_DESCRIPTOR_TARGET_KIND = SOURCE_TARGET_SANDBOX_KIND;              // upstream
export const SOURCE_TARGET_CONTRACT_VERSION = UPSTREAM_SOURCE_TARGET_CONTRACT_VERSION; // upstream
export const PREVIEW_SANDBOX_CONTRACT_VERSION_REF = UPSTREAM_PREVIEW_SANDBOX_CONTRACT_VERSION; // upstream
export const AUTHORING_RUNTIME_VERSION_REF = UPSTREAM_AUTHORING_RUNTIME_VERSION;       // upstream
export const SOURCE_HANDOFF_KIND_REF = UPSTREAM_SOURCE_HANDOFF_KIND;                   // upstream
export const SOURCE_HANDOFF_VERSION_REF = UPSTREAM_SOURCE_HANDOFF_VERSION;             // upstream
/**
 * The descriptor's own `kind` is DERIVED from the pure upstream factory that emits it — there is no local literal
 * and no documented exception. `createTargetPreviewSandboxDescriptor` is pure, synchronous, side-effect-free and
 * deep-freezes its result, so probing it with an empty mapping is a safe read of the single source of truth.
 */
export const TARGET_DESCRIPTOR_KIND = createTargetPreviewSandboxDescriptor({ mapped: {} }).kind;
export const SOURCE_SECURITY_DECISION_FIELDS = deepFreeze([...SOURCE_SECURITY_FIELDS]);

/**
 * Resource limits derived STRICTLY from RESOURCE_LIMITS_CONTRACT — no local divergent table. Fails closed (throws at
 * module load, which the factory boundary converts into a sanitized rejection) on a missing, duplicated, unknown or
 * invalid dimension. Every one of the real dimensions must be present exactly once with a positive integer limit.
 */
function deriveResourceLimits() {
  const dims = Array.isArray(RESOURCE_LIMITS_CONTRACT.dimensions) ? RESOURCE_LIMITS_CONTRACT.dimensions : [];
  const names = [...RESOURCE_DIMENSION_NAMES];
  const out = {};
  const seen = new Set();
  for (const d of dims) {
    if (!d || typeof d !== 'object') throw new Error('BUILDER_UNKNOWN_RESOURCE_DIMENSION');
    const name = d.dimension;
    if (!names.includes(name)) throw new Error('BUILDER_UNKNOWN_RESOURCE_DIMENSION');
    if (seen.has(name)) throw new Error('BUILDER_UNKNOWN_RESOURCE_DIMENSION');
    const limit = d.builderLimit;
    if (!Number.isInteger(limit) || limit <= 0) throw new Error('BUILDER_UNKNOWN_RESOURCE_DIMENSION');
    seen.add(name);
    out[name] = limit;
  }
  for (const n of names) { if (!seen.has(n)) throw new Error('BUILDER_UNKNOWN_RESOURCE_DIMENSION'); }
  return deepFreeze(out);
}
export const RESOURCE_LIMITS = deriveResourceLimits();
export const RESOURCE_DIMENSIONS = deepFreeze([...RESOURCE_DIMENSION_NAMES]);
export const RESOURCE_LIMITS_UNKNOWN_DIMENSION_REJECTED = RESOURCE_LIMITS_CONTRACT.unknownDimensionRejected === true;
export const RESOURCE_LIMITS_SILENT_TRUNCATION_ALLOWED = RESOURCE_LIMITS_CONTRACT.silentTruncationAllowed === true;

// ---- Statuses. ----
export const STATUS_READY = 'core_envelope_ready';
export const STATUS_REJECTED = 'core_envelope_rejected';

export const MAK_STUDIO_CORE_ENVELOPE_BUILDER_FLAG = 'MAK_STUDIO_CORE_ENVELOPE_BUILDER';
/** @returns {boolean} */
export function isProductionEnv() {
  try {
    const env = (typeof globalThis !== 'undefined' && globalThis.process && globalThis.process.env) ? globalThis.process.env : {};
    return env.NODE_ENV === 'production' || env.VITE_ENV === 'production';
  } catch { return true; }
}
/** @returns {boolean} */
export function isStudioCoreEnvelopeBuilderEnabled() {
  if (isProductionEnv()) return false;
  try { return globalThis.process.env[MAK_STUDIO_CORE_ENVELOPE_BUILDER_FLAG] === '1'; } catch { return false; }
}

/**
 * Default config (frozen). The builder is ALWAYS strict — the contract declares `silentCorrectionAllowed:false` and
 * `permissiveFallbackAllowed:false`, so there is no `strict` option to turn off and none is accepted. The only
 * configurable knob is `maxStructureDepth`, and it must be an integer in 1..MAX_STRUCTURE_DEPTH.
 */
export const DEFAULT_BUILDER_CONFIG = deepFreeze({
  maxStructureDepth: MAX_STRUCTURE_DEPTH,
});
/** The EXACT set of accepted config keys. Anything else is rejected; nothing is silently defaulted over. */
export const BUILDER_CONFIG_ALLOWED_KEYS = deepFreeze(Object.keys(DEFAULT_BUILDER_CONFIG));
/** The builder never runs in a non-strict mode; this is a fact, not an option. */
export const BUILDER_ALWAYS_STRICT = true;
// Config keys whose override is FORBIDDEN (critical invariants come from upstream only).
export const FORBIDDEN_CONFIG_OVERRIDE_KEYS = deepFreeze([
  'sourceFields', 'coreAllowlist', 'digestPreimageFields', 'digestHelper', 'envelopeFields', 'envelopeInvariants',
  'envelopeVersion', 'coreEnvelopeVersion', 'identityLifecycle', 'securityInvariants', 'pipelineStages', 'issueCodes',
  'resourceLimits',
]);
