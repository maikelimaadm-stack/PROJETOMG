import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  AUTHORING_FOUNDATION_CONTRACT_VERSION,
  AUTHORING_FOUNDATION_CONTRACT_MODE,
  BLUEPRINT_CONTRACT_VERSION,
  BLUEPRINT_ENGINE_VERSION,
  MODULE_REFERENCE_PLANNER_VERSION,
  PREVIEW_SANDBOX_CONTRACT_VERSION,
  authoringFoundationDigest,
} from './authoringFoundationContractConfig.js';

/**
 * Builds the deterministic authoring-foundation contract session from a certified blueprint contract.
 * Pure — no storage, no fetch, no persistence, no external side-effects. Same input -> same session +
 * digest. The session merely references the upstream SSOT read-only; it authors nothing.
 *
 * @param {Object} [options]
 * @param {Object} [options.certifiedBlueprint] the certified blueprint contract (read-only SSOT)
 * @returns {Object}
 */
export function createAuthoringFoundationContractSession(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const b = isGenericModelPlainObject(o.certifiedBlueprint) ? o.certifiedBlueprint : {};
  const moduleId = String(b.moduleId ?? 'plannedModule');

  const core = {
    kind: 'authoring-foundation-contract-session',
    sessionKind: 'module-blueprint-authoring-foundation-contract-session',
    sessionId: `${moduleId}#module-blueprint-authoring-foundation-contract`,
    authoringFoundationContractVersion: AUTHORING_FOUNDATION_CONTRACT_VERSION,
    sourceBlueprintContract: BLUEPRINT_CONTRACT_VERSION,
    sourceBlueprintContractVersion: BLUEPRINT_CONTRACT_VERSION,
    sourceBlueprintEngine: BLUEPRINT_ENGINE_VERSION,
    sourceBlueprintEngineVersion: BLUEPRINT_ENGINE_VERSION,
    sourceModuleReferencePlanner: MODULE_REFERENCE_PLANNER_VERSION,
    sourcePreviewSandbox: PREVIEW_SANDBOX_CONTRACT_VERSION,
    mode: AUTHORING_FOUNDATION_CONTRACT_MODE,
    createdFrom: 'studio-certified-blueprint-contract',
    createdFromSyntheticSeed: true,
    seed: `authoring-foundation-contract:${moduleId}`,
    ephemeral: true,
    persistent: false,
    canonical: false,
    sideEffectFree: true,
    consumesUpstreamReadOnly: true,
    authorsAnything: false,
    usesStorage: false,
    usesFetch: false,
    usesPersistence: false,
    runtimeSideEffects: false,
  };
  return safeCloneGenericModel({ ...core, sessionDigest: authoringFoundationDigest(core) });
}

export default createAuthoringFoundationContractSession;
