/**
 * Typed error catalog for the STUDIO AUTHORING RUNTIME-TO-PREVIEW BRIDGE CONTRACT.
 *
 * Minimal, headless, contract-only, metadata-only, fail-closed: no bridge/adapter/payload, no UI, no
 * persistence, no backend/Prisma/network, no module generation, no certification, no product exposure.
 * Descriptors are sanitized and side-effect-free.
 */

export const BRIDGE_CONTRACT_ERROR_CODES = [
  'BRIDGE_INVALID_SOURCE_HANDOFF',
  'BRIDGE_INVALID_CONTRACT',
  'BRIDGE_SESSION_FAILED',
  'BRIDGE_SOURCE_SHAPE_INVALID',
  'BRIDGE_SOURCE_HANDOFF_KIND_INVALID',
  'BRIDGE_SOURCE_MISSING_DRAFT_ID',
  'BRIDGE_SOURCE_UNKNOWN_DRAFT_ID',
  'BRIDGE_SOURCE_NON_STRICT_IDENTITY',
  'BRIDGE_SOURCE_SINGLE_DRAFT_FALLBACK_BLOCKED',
  'BRIDGE_SOURCE_NOT_SYNTHETIC',
  'BRIDGE_SOURCE_NOT_VALIDATED',
  'BRIDGE_SOURCE_NOT_IMMUTABLE',
  'BRIDGE_SOURCE_DIGEST_MISSING',
  'BRIDGE_SOURCE_VERSION_MISMATCH',
  'BRIDGE_TARGET_VERSION_MISMATCH',
  'BRIDGE_TARGET_SHAPE_INVALID',
  'BRIDGE_MAPPING_CRITICAL_FIELD_MISSING',
  'BRIDGE_MAPPING_UNKNOWN_TRANSFORM',
  'BRIDGE_MAPPING_LOSSY_CRITICAL',
  'BRIDGE_MAPPING_CRITICAL_DEFAULT',
  'BRIDGE_MAPPING_SILENT_RENAME',
  'BRIDGE_VERSION_UNKNOWN',
  'BRIDGE_VERSION_DOWNGRADE_BLOCKED',
  'BRIDGE_VERSION_PERMISSIVE_BLOCKED',
  'BRIDGE_DIGEST_TREATED_AS_CRYPTOGRAPHIC',
  'BRIDGE_DIGEST_AUTHORIZES_CERTIFICATION_BLOCKED',
  'BRIDGE_DIGEST_AUTHORIZES_MODULE_GENERATION_BLOCKED',
  'BRIDGE_DIGEST_AUTHORIZES_PRODUCTION_BLOCKED',
  'BRIDGE_CANONICALIZATION_NONDETERMINISTIC',
  'BRIDGE_EXTENSION_UNKNOWN_CRITICAL_FIELD',
  'BRIDGE_EXTENSION_UNKNOWN_CAPABILITY_FLAG',
  'BRIDGE_EXTENSION_UNNAMESPACED',
  'BRIDGE_EXTENSION_OVERRIDES_CRITICAL',
  'BRIDGE_REPLAY_SIDE_EFFECT_BLOCKED',
  'BRIDGE_IMPLEMENTATION_BLOCKED',
  'BRIDGE_ADAPTER_BLOCKED',
  'BRIDGE_TARGET_PAYLOAD_BLOCKED',
  'BRIDGE_PREVIEW_MOUNT_BLOCKED',
  'BRIDGE_APP_TOUCH_BLOCKED',
  'BRIDGE_ROUTE_MENU_BLOCKED',
  'BRIDGE_PERSISTENCE_BLOCKED',
  'BRIDGE_FILESYSTEM_BLOCKED',
  'BRIDGE_STORAGE_BLOCKED',
  'BRIDGE_BACKEND_BLOCKED',
  'BRIDGE_PRISMA_BLOCKED',
  'BRIDGE_NETWORK_BLOCKED',
  'BRIDGE_REAL_DATA_BLOCKED',
  'BRIDGE_MODULE_GENERATION_BLOCKED',
  'BRIDGE_CERTIFICATION_BLOCKED',
  'BRIDGE_SELF_CERTIFICATION_BLOCKED',
  'BRIDGE_SSOT_OVERWRITE_BLOCKED',
  'BRIDGE_PRODUCT_EXPOSURE_BLOCKED',
  'BRIDGE_PRODUCTION_BLOCKED',
  'BRIDGE_STAGING_BLOCKED',
  'BRIDGE_PROTOTYPE_RELINK_BLOCKED',
  'BRIDGE_PERMISSION_MODEL_INTEGRATED_BLOCKED',
  'BRIDGE_TENANT_MODEL_INTEGRATED_BLOCKED',
  'BRIDGE_MANUAL_GATE_MISSING',
  'BRIDGE_DIGEST_MISMATCH',
  'BRIDGE_VERIFIER_FAILED',
  'BRIDGE_COMPATIBILITY_BLOCKED',
];

/** Typed error for the bridge contract layer. */
export class BridgeContractError extends Error {
  /**
   * @param {string} code one of BRIDGE_CONTRACT_ERROR_CODES
   * @param {string} message sanitized message (no secrets)
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'BridgeContractError';
    this.code = BRIDGE_CONTRACT_ERROR_CODES.includes(code) ? code : 'BRIDGE_INVALID_CONTRACT';
    if (meta) this.meta = meta;
  }
}

/**
 * Builds a sanitized, side-effect-free error descriptor. Never contains secrets, JWT, DATABASE_URL,
 * API_URL, stack, or personal data. @param {string} code @param {Object} [options] @returns {Object}
 */
export function createBridgeContractError(code, options = {}) {
  const o = options && typeof options === 'object' ? options : {};
  const known = BRIDGE_CONTRACT_ERROR_CODES.includes(code);
  return {
    kind: 'bridge-contract-error',
    code: known ? code : 'BRIDGE_INVALID_CONTRACT',
    type: typeof o.type === 'string' ? o.type : 'bridge-contract',
    message: typeof o.message === 'string' && o.message.length > 0 ? o.message : `Bridge contract error: ${code}`,
    safe: true,
    sideEffects: false,
    noStackLeak: true,
    withoutSecrets: true,
    bridgeImplemented: false,
    targetPayloadCreated: false,
    previewMounted: false,
    certificationPerformed: false,
    moduleGenerated: false,
    productExposed: false,
    persistenceUsed: false,
    backendAccessed: false,
    prismaAccessed: false,
    fetchUsed: false,
    realDataRead: false,
    prototypeRelinked: false,
  };
}

/** @param {string} code @param {string} message @param {Object} [meta] */
export function bridgeContractError(code, message, meta) {
  return new BridgeContractError(code, message, meta);
}

export default BridgeContractError;
