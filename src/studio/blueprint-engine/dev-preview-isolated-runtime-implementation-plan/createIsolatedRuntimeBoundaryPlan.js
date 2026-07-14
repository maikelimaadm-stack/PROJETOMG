import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { planDigest } from './isolatedRuntimeImplementationPlanConfig.js';

/**
 * Declares the ISOLATION BOUNDARY plan. Pure, metadata-only. Asserts the hard boundaries any
 * future isolated runtime must respect: no window/document/DOM/React/CSS-runtime/route-runtime/
 * menu-runtime/module-runtime/backend/Prisma/production/staging.
 *
 * @param {Object} [options]
 * @returns {Object} isolation boundary plan
 */
export function createIsolatedRuntimeBoundaryPlan(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};

  const invariants = {
    noWindow: true,
    noDocument: true,
    noDOM: true,
    noReact: true,
    noCSSRuntime: true,
    noRouteRuntime: true,
    noMenuRuntime: true,
    noModuleRuntime: true,
    noBackend: true,
    noPrisma: true,
    noProduction: true,
    noStaging: true,
  };

  const core = {
    kind: 'isolated-runtime-boundary-plan',
    moduleId: String(o.runtimeShellContract?.moduleId ?? 'plannedModule'),
    ...invariants,
    allInvariantsHold: Object.values(invariants).every((v) => v === true),
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, boundaryPlanDigest: planDigest(core) });
}

export default createIsolatedRuntimeBoundaryPlan;
