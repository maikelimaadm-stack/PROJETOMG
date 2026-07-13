import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION,
  MODULE_PREVIEW_SANDBOX_MODE,
  ALLOWED_PREVIEW_KINDS,
  PROHIBITED_EFFECTS,
  sandboxDigest,
} from './modulePreviewSandboxConfig.js';

/**
 * Builds a pure, deterministic preview sandbox SESSION descriptor from a module reference
 * plan. Pure metadata — no real storage, no localStorage/IndexedDB, no fetch. The
 * `deterministicSeed` is derived from the source digests so it is stable across runs.
 *
 * @param {Object} [options]
 * @param {Object} [options.plan] a module reference plan (from the planner)
 * @returns {Object} sandbox session descriptor
 */
export function createModulePreviewSandboxSession(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const plan = isGenericModelPlainObject(o.plan) ? o.plan : {};
  const moduleId = String(plan.moduleId ?? 'plannedModule').trim();
  const sourceBlueprintDigest = typeof plan.sourceBlueprintDigest === 'string' ? plan.sourceBlueprintDigest : null;
  const sourcePlannerDigest = typeof plan.overallDigest === 'string' ? plan.overallDigest : null;
  const deterministicSeed = sandboxDigest({ moduleId, sourceBlueprintDigest, sourcePlannerDigest });

  const core = {
    kind: 'module-preview-sandbox-session',
    sessionId: `${moduleId}#preview-sandbox`,
    sandboxVersion: MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION,
    moduleId,
    sourceBlueprintId: typeof plan.sourceBlueprintId === 'string' ? plan.sourceBlueprintId : (isGenericModelPlainObject(plan.identityPlan) ? plan.identityPlan.sourceBlueprintId : null) ?? `${moduleId}#normalized`,
    sourceBlueprintDigest,
    sourcePlannerDigest,
    mode: MODULE_PREVIEW_SANDBOX_MODE,
    createdFrom: 'studio-blueprint-module-reference-planner',
    previewScope: 'single-module-headless-metadata',
    allowedPreviewKinds: [...ALLOWED_PREVIEW_KINDS],
    prohibitedEffects: [...PROHIBITED_EFFECTS],
    expiresPolicy: 'ephemeral_in_memory_metadata_only',
    deterministicSeed,
    usesRealStorage: false,
    usesLocalStorage: false,
    usesIndexedDb: false,
    usesFetch: false,
    diagnostics: { passive: true },
  };

  return safeCloneGenericModel({ ...core, sessionDigest: sandboxDigest(core) });
}

export default createModulePreviewSandboxSession;
