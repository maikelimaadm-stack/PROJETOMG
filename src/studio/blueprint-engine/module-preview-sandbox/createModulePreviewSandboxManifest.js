import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  MODULE_PREVIEW_SANDBOX_CONTRACT_NAME,
  MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION,
  MODULE_PREVIEW_SANDBOX_MODE,
  STUDIO_BLUEPRINT_ENGINE_VERSION,
  MODULE_REFERENCE_PLANNER_VERSION,
  STUDIO_BLUEPRINT_CONTRACT_VERSION,
  MODULE_PREVIEW_SANDBOX_HEADLESS_CAPABILITIES,
  sandboxDigest,
} from './modulePreviewSandboxConfig.js';

/**
 * Builds the preview sandbox manifest, aggregating every metadata digest into an
 * `overallDigest`. Pure. Readiness `module_preview_sandbox_contract_ready` when there are
 * no blockers; `blocked` otherwise. `readyForRealModuleGeneration`/`readyForProduction`
 * are always false.
 *
 * @param {Object} [options]
 * @returns {Object} manifest descriptor
 */
export function createModulePreviewSandboxManifest(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const get = (obj, key) => (isGenericModelPlainObject(obj) ? obj[key] : undefined) ?? null;

  const digests = {
    sourceBlueprintDigest: typeof o.sourceBlueprintDigest === 'string' ? o.sourceBlueprintDigest : null,
    sourcePlannerDigest: typeof o.sourcePlannerDigest === 'string' ? o.sourcePlannerDigest : null,
    sessionDigest: get(o.session, 'sessionDigest'),
    tablePreviewDigest: get(o.tablePreview, 'tablePreviewDigest'),
    formPreviewDigest: get(o.formPreview, 'formPreviewDigest'),
    detailPreviewDigest: get(o.detailPreview, 'detailPreviewDigest'),
    fieldPreviewDigest: get(o.fieldPreview, 'fieldPreviewDigest'),
    actionPreviewDigest: get(o.actionPreview, 'actionPreviewDigest'),
    permissionPreviewDigest: get(o.permissionPreview, 'permissionPreviewDigest'),
    routeMenuBlockedDigest: get(o.routeMenuBlocked, 'routeMenuBlockedDigest'),
    persistenceBlockedDigest: get(o.persistenceBlocked, 'persistenceBlockedDigest'),
    runtimeBindingDigest: get(o.runtimeBinding, 'runtimeBindingDigest'),
    readinessDecisionDigest: get(o.readinessDecision, 'readinessDecisionDigest'),
  };

  const blockers = [...(Array.isArray(o.blockers) ? o.blockers : [])];
  const warnings = [...(Array.isArray(o.warnings) ? o.warnings : [])];
  const readyForPreviewSandbox = get(o.readinessDecision, 'readyForPreviewSandbox') === true;
  const readyForDevPreviewContract = get(o.readinessDecision, 'readyForDevPreviewContract') === true;
  const readiness = blockers.length === 0 ? 'module_preview_sandbox_contract_ready' : 'blocked';
  const overallDigest = sandboxDigest({ ...digests, readiness });

  return safeCloneGenericModel({
    kind: 'module-preview-sandbox-manifest',
    manifestId: `${MODULE_PREVIEW_SANDBOX_CONTRACT_NAME}@${MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION.split('@')[1]}#manifest`,
    sandboxName: MODULE_PREVIEW_SANDBOX_CONTRACT_NAME,
    sandboxVersion: MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION,
    engineVersion: STUDIO_BLUEPRINT_ENGINE_VERSION,
    plannerVersion: MODULE_REFERENCE_PLANNER_VERSION,
    blueprintContractVersion: STUDIO_BLUEPRINT_CONTRACT_VERSION,
    mode: MODULE_PREVIEW_SANDBOX_MODE,
    moduleId: get(o.session, 'moduleId'),
    ...digests,
    overallDigest,
    ...MODULE_PREVIEW_SANDBOX_HEADLESS_CAPABILITIES,
    readyForPreviewSandbox,
    readyForDevPreviewContract,
    readyForRealModuleGeneration: false,
    readyForProduction: false,
    blockers,
    warnings,
    readiness,
    nextSteps: 'studio-dev-preview-contract-bridge',
  });
}

export default createModulePreviewSandboxManifest;
