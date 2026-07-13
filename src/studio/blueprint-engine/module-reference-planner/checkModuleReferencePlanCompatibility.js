import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/** Flags whose presence as `true` on the plan is an accidental exposure → blocked. */
const EXPOSURE_FLAGS = [
  ['moduleGenerated', 'module generation'],
  ['filesWrittenToModule', 'file write'],
  ['routeCreated', 'route exposure'],
  ['menuCreated', 'menu exposure'],
  ['moduleRegistered', 'module registration'],
  ['backendAccessed', 'backend access'],
  ['prismaAccessed', 'prisma access'],
  ['productionAccessed', 'production access'],
  ['stagingAccessed', 'staging access'],
  ['fetchUsed', 'fetch used'],
  ['mutationAllowed', 'mutation exposure'],
  ['persistenceCreated', 'persistence exposure'],
  ['rewriteEmpresas', 'rewrite Empresas'],
];

/**
 * Classifies a module reference plan. Pure. Any accidental exposure (module generation /
 * file write / route / menu / backend / prisma / persistence / mutation / rewrite),
 * invalid blueprint/safety, invalid field, open permission, missing tenant, or a route/
 * menu marked created → `blocked`. Otherwise the status reflects the next safe step.
 * `compatibleForRealModuleGeneration` is always false.
 *
 * @param {Object} [options]
 * @param {Object} [options.plan]
 * @returns {Object} compatibility result
 */
export function checkModuleReferencePlanCompatibility(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const p = o.plan;

  if (!isGenericModelPlainObject(p)) {
    return safeCloneGenericModel({
      kind: 'module-reference-planner-compatibility',
      compatibilityStatus: 'invalid',
      compatibleForPreviewSandbox: false,
      compatibleForRealModuleGeneration: false,
      blockers: ['plan must be a plain object'],
      warnings: [],
      recommendedNextSlice: 'STUDIO MODULE PREVIEW SANDBOX CONTRACT',
    });
  }

  /** @type {string[]} */ const blockers = [];
  for (const [flag, label] of EXPOSURE_FLAGS) if (p[flag] === true) blockers.push(`${label} detected`);

  if (p.blueprintValid === false) blockers.push('blueprint invalid');
  if (p.safetyOk === false) blockers.push('safety invalid');

  const field = isGenericModelPlainObject(p.fieldTableFormPlan) ? p.fieldTableFormPlan : {};
  if (field.hasInvalidField === true) blockers.push('invalid field');

  const perm = isGenericModelPlainObject(p.permissionPlan) ? p.permissionPlan : {};
  if (perm.defaultDeny === false || perm.failClosed === false) blockers.push('open permission');
  if (perm.tenantRequired === false) blockers.push('tenant missing');

  const rm = isGenericModelPlainObject(p.routeMenuPlan) ? p.routeMenuPlan : {};
  if (rm.routeCreated === true || rm.menuCreated === true) blockers.push('route/menu exposed');

  const persistence = isGenericModelPlainObject(p.persistencePlan) ? p.persistencePlan : {};
  if (persistence.realPersistenceBlocked === false) blockers.push('persistence real exposed');
  if (persistence.migrationCreated === true) blockers.push('migration exposed');

  const needsEmpresasAlignment = p.moduleId === 'empresas' && p.sourceModuleReferenceOnly === false;
  const needsRegistry = isGenericModelPlainObject(p.readinessDecision) ? p.readinessDecision.needsRegistry === true : true;
  const readyPreview = isGenericModelPlainObject(p.readinessDecision) ? p.readinessDecision.readyForPreviewSandbox === true : false;

  let compatibilityStatus;
  let recommendedNextSlice;
  if (blockers.length > 0) { compatibilityStatus = 'blocked'; recommendedNextSlice = 'resolve blockers'; }
  else if (needsEmpresasAlignment) { compatibilityStatus = 'needs_empresas_alignment'; recommendedNextSlice = 'EMPRESAS STUDIO COMPATIBILITY SLICE'; }
  else if (readyPreview) { compatibilityStatus = 'ready_for_preview_sandbox'; recommendedNextSlice = 'STUDIO MODULE PREVIEW SANDBOX CONTRACT'; }
  else if (needsRegistry) { compatibilityStatus = 'needs_registry'; recommendedNextSlice = 'STUDIO MODULE REGISTRY CONTRACT'; }
  else { compatibilityStatus = 'compatible'; recommendedNextSlice = 'STUDIO MODULE PREVIEW SANDBOX CONTRACT'; }

  return safeCloneGenericModel({
    kind: 'module-reference-planner-compatibility',
    compatibilityStatus,
    compatibleForPreviewSandbox: blockers.length === 0 && readyPreview,
    compatibleForRealModuleGeneration: false,
    blockers,
    warnings: [],
    recommendedNextSlice,
  });
}

export default checkModuleReferencePlanCompatibility;
