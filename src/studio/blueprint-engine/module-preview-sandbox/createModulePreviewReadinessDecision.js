import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { sandboxDigest } from './modulePreviewSandboxConfig.js';

/**
 * Computes the readiness decision for the preview sandbox contract. Pure. Real module
 * generation and production are NEVER allowed here. `readyForPreviewSandbox` is true when
 * the planner is valid and metadata is safe; `readyForDevPreviewContract` may be true but
 * only names the next (future) slice.
 *
 * @param {Object} [options]
 * @returns {Object} readiness decision
 */
export function createModulePreviewReadinessDecision(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const plannerValid = o.plannerValid === true;
  const metadataSafe = o.metadataSafe === true;
  const field = isGenericModelPlainObject(o.fieldPreview) ? o.fieldPreview : {};
  const routeMenu = isGenericModelPlainObject(o.routeMenuBlocked) ? o.routeMenuBlocked : {};
  const persistence = isGenericModelPlainObject(o.persistenceBlocked) ? o.persistenceBlocked : {};
  const permission = isGenericModelPlainObject(o.permission) ? o.permission : {};
  const blockers = [...(Array.isArray(o.blockers) ? o.blockers : [])];
  const warnings = [...(Array.isArray(o.warnings) ? o.warnings : [])];

  if (!plannerValid) blockers.push('reference plan not valid');
  if (!metadataSafe) blockers.push('preview metadata unsafe');
  if (field.hasUnsafeField === true) blockers.push('unsafe field in preview');
  if (routeMenu.routeCreated === true || routeMenu.menuCreated === true) blockers.push('route/menu exposed');
  if (persistence.blockedNow === false) blockers.push('persistence not blocked');
  if (permission.defaultDeny === false || permission.failClosed === false) blockers.push('permissions not fail-closed');
  if (permission.tenantRequired === false) blockers.push('tenant not required');

  const noBlockers = blockers.length === 0;
  const readyForPreviewSandbox = noBlockers && plannerValid && metadataSafe;

  let readiness;
  if (!noBlockers) readiness = 'blocked';
  else if (readyForPreviewSandbox) readiness = 'module_preview_sandbox_contract_ready';
  else readiness = 'needs_reference_plan_fix';

  const core = {
    kind: 'module-preview-readiness-decision',
    readyForPreviewSandbox,
    // A dev preview CONTRACT bridge is the next allowed slice — still no real UI.
    readyForDevPreviewContract: readyForPreviewSandbox,
    readyForRealModuleGeneration: false,
    readyForProduction: false,
    needsRegistry: true,
    blockers,
    warnings,
    readiness,
    recommendedNextSlice: readyForPreviewSandbox
      ? 'STUDIO DEV PREVIEW CONTRACT BRIDGE'
      : 'fix reference plan / blueprint before proceeding',
  };

  return safeCloneGenericModel({ ...core, readinessDecisionDigest: sandboxDigest(core) });
}

export default createModulePreviewReadinessDecision;
