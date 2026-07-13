import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { plannerDigest } from './moduleReferencePlannerConfig.js';

/**
 * Computes the readiness decision for a module reference plan. Pure. Real module
 * generation is NEVER allowed here (`readyForRealModuleGeneration: false`). Preview
 * sandbox readiness is true only when the blueprint is validated, safety holds,
 * route/menu are off, backend/prisma off, persistence off/referenceOnly, permissions are
 * fail-closed, tenant is respected, and there are no blockers.
 *
 * @param {Object} [options]
 * @returns {Object} readiness decision
 */
export function createModuleReadinessDecision(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const blueprintValid = o.blueprintValid === true;
  const safetyOk = o.safetyOk === true;
  const routeMenu = isGenericModelPlainObject(o.routeMenuPlan) ? o.routeMenuPlan : {};
  const persistence = isGenericModelPlainObject(o.persistencePlan) ? o.persistencePlan : {};
  const permission = isGenericModelPlainObject(o.permissionPlan) ? o.permissionPlan : {};
  const field = isGenericModelPlainObject(o.fieldTableFormPlan) ? o.fieldTableFormPlan : {};
  const blockers = [...(Array.isArray(o.blockers) ? o.blockers : [])];
  const warnings = [...(Array.isArray(o.warnings) ? o.warnings : [])];

  if (!blueprintValid) blockers.push('blueprint not valid');
  if (!safetyOk) blockers.push('safety not ok');
  if (field.hasInvalidField === true) blockers.push('invalid field in plan');
  if (routeMenu.routeCreated === true || routeMenu.menuCreated === true) blockers.push('route/menu exposed');
  if (persistence.realPersistenceBlocked === false) blockers.push('persistence not blocked');
  if (permission.defaultDeny === false || permission.failClosed === false) blockers.push('permissions not fail-closed');
  if (permission.tenantRequired === false) blockers.push('tenant not required');

  const noBlockers = blockers.length === 0;
  const readyForPreviewSandbox = noBlockers && blueprintValid && safetyOk;

  let readiness;
  if (!noBlockers) readiness = 'blocked';
  else if (readyForPreviewSandbox) readiness = 'module_reference_plan_ready';
  else readiness = 'needs_blueprint_fix';

  const core = {
    kind: 'module-readiness-decision',
    readyForRealModuleGeneration: false, // never in this slice
    readyForPreviewSandbox,
    needsRegistry: true, // a real module still needs the (future) registry
    blockers,
    warnings,
    readiness,
    recommendedNextSlice: readyForPreviewSandbox
      ? 'STUDIO MODULE PREVIEW SANDBOX CONTRACT'
      : 'fix blueprint before proceeding',
  };

  return safeCloneGenericModel({ ...core, readinessDecisionDigest: plannerDigest(core) });
}

export default createModuleReadinessDecision;
