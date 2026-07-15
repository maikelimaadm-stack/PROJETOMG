import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { REQUIRED_CHECKPOINT_RECEIPT, isDevelopmentEnvironment, isProductionOrStaging, routeMenuDigest } from './routeMenuConfig.js';

/**
 * Validates preflight before building the isolated route/menu runtime. Confirms the checkpoint
 * receipt, the implementation plan's manual gate, the route/menu contract + runtime UI
 * compatibility, a valid synthetic virtual frame, an explicit feature flag, and a development-only
 * environment (production/staging denied). Fails closed. Pure — never throws.
 *
 * @param {Object} [options]
 * @param {Object} [options.routeMenuContract]
 * @param {Object} [options.implementationPlan]
 * @param {Object} [options.runtimeUi]
 * @param {Object} [options.virtualFrame]
 * @param {boolean} [options.enabled]
 * @param {string} [options.environment]
 * @param {string} [options.checkpointReceipt]
 * @returns {Object}
 */
export function createRouteMenuPreflight(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const c = isGenericModelPlainObject(o.routeMenuContract) ? o.routeMenuContract : {};
  const plan = isGenericModelPlainObject(o.implementationPlan) ? o.implementationPlan : {};
  const ui = isGenericModelPlainObject(o.runtimeUi) ? o.runtimeUi : {};
  const vf = isGenericModelPlainObject(o.virtualFrame) ? o.virtualFrame : {};
  const environment = String(o.environment ?? 'unknown');

  const checkpointApproved = o.checkpointReceipt === REQUIRED_CHECKPOINT_RECEIPT;
  const manualGateSatisfied = plan.kind === 'studio-dev-preview-route-menu-implementation-plan'
    ? (isGenericModelPlainObject(plan.manualGate) && plan.manualGate.manualGateRequired === true)
    : true;
  const routeMenuContractCompatible = c.kind === 'studio-dev-preview-route-menu-contract' && c.fallback !== true;
  const runtimeUiCompatible = ui.kind === 'studio-dev-preview-runtime-ui' ? (ui.fallback !== true) : true;
  const featureFlagExplicit = o.enabled === true;
  const dev = isDevelopmentEnvironment(environment);
  const prodOrStaging = isProductionOrStaging(environment);
  const virtualFrameValid = isGenericModelPlainObject(vf) && vf.syntheticDataOnly !== false;

  const blockers = [];
  if (!checkpointApproved) blockers.push('checkpoint_not_approved');
  if (!manualGateSatisfied) blockers.push('manual_gate_not_satisfied');
  if (!routeMenuContractCompatible) blockers.push('route_menu_contract_incompatible');
  if (!runtimeUiCompatible) blockers.push('runtime_ui_incompatible');
  if (!featureFlagExplicit) blockers.push('feature_flag_not_explicit');
  if (!dev) blockers.push('environment_not_development');
  if (prodOrStaging) blockers.push('production_or_staging_forbidden');
  if (!virtualFrameValid) blockers.push('virtual_frame_invalid');

  const ok = blockers.length === 0;
  const core = {
    kind: 'route-menu-preflight',
    ok,
    checkpointApproved,
    manualGateSatisfied,
    routeMenuContractCompatible,
    runtimeUiCompatible,
    featureFlagExplicit,
    environment,
    isDevelopment: dev,
    production: false,
    staging: false,
    virtualFrameValid,
    blockers,
    blockerCount: blockers.length,
  };
  return safeCloneGenericModel({ ...core, preflightDigest: routeMenuDigest(core) });
}

export default createRouteMenuPreflight;
