import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  MODULE_REFERENCE_PLANNER_VERSION,
  STUDIO_BLUEPRINT_ENGINE_VERSION,
  STUDIO_BLUEPRINT_CONTRACT_VERSION,
  plannerDigest,
} from './moduleReferencePlannerConfig.js';

const DIGEST_KEYS = [
  'sourceBlueprintDigest', 'identityPlanDigest', 'filePlanDigest', 'screenPlanDigest',
  'fieldTableFormPlanDigest', 'permissionPlanDigest', 'routeMenuPlanDigest', 'persistencePlanDigest',
  'runtimeBindingPlanDigest', 'testGatePlanDigest', 'evidencePlanDigest', 'riskPlanDigest',
  'readinessDecisionDigest',
];

const CAPABILITY_INVARIANTS = [
  'moduleGenerated', 'filesWrittenToModule', 'routeCreated', 'menuCreated', 'moduleRegistered',
  'backendAccessed', 'prismaAccessed', 'productionAccessed', 'stagingAccessed', 'fetchUsed',
  'mutationAllowed', 'persistenceCreated', 'rewriteEmpresas',
];

/**
 * Verifies a module reference plan: re-derives the overall digest (tamper detection),
 * checks every plan digest is present, and asserts the headless/contract-only invariants
 * — all side-effect / generation flags false, `readyForRealModuleGeneration` false. Any
 * altered digest → not safe. Pure.
 *
 * @param {Object} [options]
 * @param {Object} [options.plan] the full planner package (or its manifest under .manifest)
 * @returns {Object} verification result
 */
export function verifyModuleReferencePlan(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const p = isGenericModelPlainObject(o.plan) ? o.plan : {};
  const m = isGenericModelPlainObject(p.manifest) ? p.manifest : (isGenericModelPlainObject(o.manifest) ? o.manifest : {});

  /** @type {{name: string, ok: boolean}[]} */ const checks = [];
  const check = (name, ok) => { checks.push({ name, ok: Boolean(ok) }); return Boolean(ok); };

  check('planner-version-known', m.plannerVersion === MODULE_REFERENCE_PLANNER_VERSION);
  check('engine-version-known', m.engineVersion === STUDIO_BLUEPRINT_ENGINE_VERSION);
  check('blueprint-contract-version-certified', m.blueprintContractVersion === STUDIO_BLUEPRINT_CONTRACT_VERSION);
  check('manifest-present', m.kind === 'module-reference-planner-manifest');
  for (const k of DIGEST_KEYS) check(`${k}-present`, typeof m[k] === 'string' && m[k].length > 0);

  const recomputed = plannerDigest({
    sourceBlueprintDigest: m.sourceBlueprintDigest, identityPlanDigest: m.identityPlanDigest, filePlanDigest: m.filePlanDigest,
    screenPlanDigest: m.screenPlanDigest, fieldTableFormPlanDigest: m.fieldTableFormPlanDigest, permissionPlanDigest: m.permissionPlanDigest,
    routeMenuPlanDigest: m.routeMenuPlanDigest, persistencePlanDigest: m.persistencePlanDigest, runtimeBindingPlanDigest: m.runtimeBindingPlanDigest,
    testGatePlanDigest: m.testGatePlanDigest, evidencePlanDigest: m.evidencePlanDigest, riskPlanDigest: m.riskPlanDigest,
    readinessDecisionDigest: m.readinessDecisionDigest, readiness: m.readiness,
  });
  check('overall-digest-matches', recomputed === m.overallDigest);

  check('headless', m.headless === true);
  for (const flag of CAPABILITY_INVARIANTS) check(`no-${flag}`, m[flag] === false);
  check('not-ready-for-real-generation', m.readyForRealModuleGeneration === false);
  check('blockers-zero', Array.isArray(m.blockers) && m.blockers.length === 0);

  const failures = checks.filter((c) => !c.ok).map((c) => c.name);
  const valid = failures.length === 0;
  const safe = valid && m.readiness === 'module_reference_plan_ready';

  return safeCloneGenericModel({
    kind: 'module-reference-planner-verification',
    valid,
    safeToUseAsModuleReferencePlan: safe,
    readiness: safe ? 'module_reference_plan_ready' : 'blocked',
    readyForPreviewSandbox: m.readyForPreviewSandbox === true && valid,
    readyForRealModuleGeneration: false,
    checks,
    failures,
    warnings: Array.isArray(m.warnings) ? m.warnings : [],
    blockers: valid ? [] : failures,
  });
}

export default verifyModuleReferencePlan;
