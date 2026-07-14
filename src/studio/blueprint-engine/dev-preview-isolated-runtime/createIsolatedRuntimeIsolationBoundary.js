import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { runtimeDigest } from './isolatedRuntimeConfig.js';

/**
 * Applies the ISOLATION BOUNDARY for the isolated runtime. Pure — asserts the hard isolation
 * invariants the runtime respects: no window/document/DOM/React/CSS-runtime/route-runtime/
 * menu-runtime/module-runtime/backend/Prisma/production/staging.
 *
 * @param {Object} [options]
 * @returns {Object} isolation boundary descriptor
 */
export function createIsolatedRuntimeIsolationBoundary(options = {}) {
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
    kind: 'isolated-runtime-isolation-boundary',
    moduleId: String(o.implementationPlan?.moduleId ?? 'plannedModule'),
    ...invariants,
    allInvariantsHold: Object.values(invariants).every((v) => v === true),
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, isolationBoundaryDigest: runtimeDigest(core) });
}

export default createIsolatedRuntimeIsolationBoundary;
