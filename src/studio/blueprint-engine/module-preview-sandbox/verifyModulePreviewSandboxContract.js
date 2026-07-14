import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION,
  STUDIO_BLUEPRINT_ENGINE_VERSION,
  MODULE_REFERENCE_PLANNER_VERSION,
  STUDIO_BLUEPRINT_CONTRACT_VERSION,
  sandboxDigest,
} from './modulePreviewSandboxConfig.js';

const DIGEST_KEYS = [
  'sourceBlueprintDigest', 'sourcePlannerDigest', 'sessionDigest', 'tablePreviewDigest',
  'formPreviewDigest', 'detailPreviewDigest', 'fieldPreviewDigest', 'actionPreviewDigest',
  'permissionPreviewDigest', 'routeMenuBlockedDigest', 'persistenceBlockedDigest',
  'runtimeBindingDigest', 'readinessDecisionDigest',
];

const CAPABILITY_INVARIANTS = [
  'reactComponentCreated', 'uiCreated', 'routeCreated', 'menuCreated', 'moduleGenerated',
  'filesWrittenToModule', 'moduleRegistered', 'backendAccessed', 'prismaAccessed',
  'productionAccessed', 'stagingAccessed', 'fetchUsed', 'mutationAllowed', 'persistenceCreated',
  'rewriteEmpresas',
];

/**
 * Verifies a preview sandbox contract: re-derives the overall digest (tamper detection),
 * checks every metadata digest is present, and asserts the headless/preview-only
 * invariants — `headless` and `previewMetadataOnly` true, all side-effect/UI/generation
 * flags false, `readyForRealModuleGeneration`/`readyForProduction` false. Any altered
 * digest → not safe. Pure.
 *
 * @param {Object} [options]
 * @param {Object} [options.contract] the full contract package (or its .manifest)
 * @returns {Object} verification result
 */
export function verifyModulePreviewSandboxContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const c = isGenericModelPlainObject(o.contract) ? o.contract : {};
  const m = isGenericModelPlainObject(c.manifest) ? c.manifest : (isGenericModelPlainObject(o.manifest) ? o.manifest : {});

  /** @type {{name: string, ok: boolean}[]} */ const checks = [];
  const check = (name, ok) => { checks.push({ name, ok: Boolean(ok) }); return Boolean(ok); };

  check('sandbox-version-known', m.sandboxVersion === MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION);
  check('engine-version-known', m.engineVersion === STUDIO_BLUEPRINT_ENGINE_VERSION);
  check('planner-version-known', m.plannerVersion === MODULE_REFERENCE_PLANNER_VERSION);
  check('blueprint-contract-version-certified', m.blueprintContractVersion === STUDIO_BLUEPRINT_CONTRACT_VERSION);
  check('manifest-present', m.kind === 'module-preview-sandbox-manifest');
  for (const k of DIGEST_KEYS) check(`${k}-present`, typeof m[k] === 'string' && m[k].length > 0);

  const recomputed = sandboxDigest({
    sourceBlueprintDigest: m.sourceBlueprintDigest, sourcePlannerDigest: m.sourcePlannerDigest, sessionDigest: m.sessionDigest,
    tablePreviewDigest: m.tablePreviewDigest, formPreviewDigest: m.formPreviewDigest, detailPreviewDigest: m.detailPreviewDigest,
    fieldPreviewDigest: m.fieldPreviewDigest, actionPreviewDigest: m.actionPreviewDigest, permissionPreviewDigest: m.permissionPreviewDigest,
    routeMenuBlockedDigest: m.routeMenuBlockedDigest, persistenceBlockedDigest: m.persistenceBlockedDigest,
    runtimeBindingDigest: m.runtimeBindingDigest, readinessDecisionDigest: m.readinessDecisionDigest, readiness: m.readiness,
  });
  check('overall-digest-matches', recomputed === m.overallDigest);

  check('headless', m.headless === true);
  check('preview-metadata-only', m.previewMetadataOnly === true);
  for (const flag of CAPABILITY_INVARIANTS) check(`no-${flag}`, m[flag] === false);
  check('not-ready-for-real-generation', m.readyForRealModuleGeneration === false);
  check('not-ready-for-production', m.readyForProduction === false);
  check('blockers-zero', Array.isArray(m.blockers) && m.blockers.length === 0);

  const failures = checks.filter((ck) => !ck.ok).map((ck) => ck.name);
  const valid = failures.length === 0;
  const safe = valid && m.readiness === 'module_preview_sandbox_contract_ready';

  return safeCloneGenericModel({
    kind: 'module-preview-sandbox-verification',
    valid,
    safeToUseAsPreviewSandboxContract: safe,
    readiness: safe ? 'module_preview_sandbox_contract_ready' : 'blocked',
    readyForPreviewSandbox: m.readyForPreviewSandbox === true && valid,
    readyForDevPreviewContract: m.readyForDevPreviewContract === true && valid,
    readyForRealModuleGeneration: false,
    readyForProduction: false,
    checks,
    failures,
    warnings: Array.isArray(m.warnings) ? m.warnings : [],
    blockers: valid ? [] : failures,
  });
}

export default verifyModulePreviewSandboxContract;
