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
  SOURCE_SUCCESS_ELIGIBILITY_FIELDS, SOURCE_DECISION_KIND, SOURCE_DECISION_SUCCESS_STATUS, SOURCE_DIGEST_FIELD,
  DIGEST_PREIMAGE_ALLOWLIST, OUTPUT_CORE_ENVELOPE_FIELDS, OUTPUT_CORE_ENVELOPE_INVARIANTS, OUTPUT_CORE_ENVELOPE_KIND,
  OUTPUT_CORE_ENVELOPE_VERSION_TAG, BUILDER_PIPELINE_STAGES, BUILDER_ISSUE_CODES, BUILDER_ISSUE_SEVERITIES,
  BUILDER_DECISION_STATUSES, BUILDER_MAX_STRUCTURE_DEPTH, FORBIDDEN_PROTOTYPE_KEYS,
  SOURCE_CORE_ENVELOPE_CONTRACT_VERSION, SOURCE_ENVELOPE_V1_CONTRACT_VERSION, SOURCE_BRIDGE_RUNTIME_VERSION,
} from '../bridge-decision-core-envelope-builder-contract/index.js';
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

// ---- Resource limits (derived; conservative defaults for a synthetic dev builder). ----
export const RESOURCE_LIMITS = deepFreeze({
  maxSourceDecisionFields: SOURCE_FIELDS.length,        // 33
  maxCoreFields: CORE_FIELD_COUNT,                       // 32
  maxTargetDescriptorFields: 64,
  maxEnvelopeFields: ENVELOPE_FIELDS.length,             // 12
  maxIssues: 128,
  maxStringLength: 8192,
  maxStructureDepth: MAX_STRUCTURE_DEPTH,                // 64
  maxSourceDecisionBytes: 262144,
  maxCoreBytes: 262144,
});
export const RESOURCE_DIMENSIONS = deepFreeze(Object.keys(RESOURCE_LIMITS));

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

// ---- Default config (frozen). ----
export const DEFAULT_BUILDER_CONFIG = deepFreeze({
  strict: true,
  maxStructureDepth: MAX_STRUCTURE_DEPTH,
});
// Config keys whose override is FORBIDDEN (critical invariants come from upstream only).
export const FORBIDDEN_CONFIG_OVERRIDE_KEYS = deepFreeze([
  'sourceFields', 'coreAllowlist', 'digestPreimageFields', 'digestHelper', 'envelopeFields', 'envelopeInvariants',
  'envelopeVersion', 'coreEnvelopeVersion', 'identityLifecycle', 'securityInvariants', 'pipelineStages', 'issueCodes',
  'resourceLimits',
]);
