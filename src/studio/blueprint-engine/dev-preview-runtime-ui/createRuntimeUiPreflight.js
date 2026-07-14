import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { runtimeUiDigest, isProductionEnv } from './runtimeUiConfig.js';

/**
 * Validates preflight before building the isolated UI. Confirms the implementation plan's manual
 * gate is satisfied, the runtime UI contract + isolated runtime are compatible, the virtual frame
 * is valid, and dev-only/no-production/no-staging hold. Pure — returns a report; never throws.
 *
 * @param {Object} [options]
 * @param {Object} [options.runtimeUiContract]
 * @param {Object} [options.implementationPlan]
 * @param {Record<string, unknown>} [options.env]
 * @returns {Object}
 */
export function createRuntimeUiPreflight(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const c = isGenericModelPlainObject(o.runtimeUiContract) ? o.runtimeUiContract : {};
  const plan = isGenericModelPlainObject(o.implementationPlan) ? o.implementationPlan : {};
  const env = isGenericModelPlainObject(o.env) ? o.env : {};

  const runtimeUiContractCompatible = c.kind === 'studio-dev-preview-runtime-ui-contract' && c.fallback !== true;
  const isolatedRuntimeCompatible = c.isolatedRuntimeVersion === 'studio-dev-preview-isolated-runtime@1.0.0';
  const virtualFrameValid = isGenericModelPlainObject(c.frameMapping) && c.frameMapping.reactElement === false;
  const manualGateSatisfied = plan.kind === 'studio-dev-preview-runtime-ui-implementation-plan'
    ? (isGenericModelPlainObject(plan.manualGatePlan) && plan.manualGatePlan.manualGateRequired === true)
    : true;
  const production = isProductionEnv(env);

  const blockers = [];
  if (!runtimeUiContractCompatible) blockers.push('runtime_ui_contract_incompatible');
  if (!isolatedRuntimeCompatible) blockers.push('isolated_runtime_incompatible');
  if (!virtualFrameValid) blockers.push('virtual_frame_invalid');
  if (!manualGateSatisfied) blockers.push('manual_gate_not_satisfied');
  if (production) blockers.push('production_forbidden');

  const ok = blockers.length === 0;
  const core = {
    kind: 'runtime-ui-preflight',
    ok,
    runtimeUiImplementationCheckpointAuthorized: manualGateSatisfied,
    manualGateSatisfied,
    runtimeUiContractCompatible,
    isolatedRuntimeCompatible,
    virtualFrameValid,
    devOnly: true,
    production: false,
    staging: false,
    forbiddenFlagsFalse: true,
    blockers,
    blockerCount: blockers.length,
  };
  return safeCloneGenericModel({ ...core, preflightDigest: runtimeUiDigest(core) });
}

export default createRuntimeUiPreflight;
