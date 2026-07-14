import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { runtimeDigest } from './isolatedRuntimeConfig.js';

/**
 * Loads the upstream contracts from an already-resolved implementation plan. Pure — it does NOT
 * perform any dynamic/remote import, fetch, filesystem read, Prisma, backend, or window/document
 * access. It simply extracts the contract references/digests that the plan already carries and
 * exposes them as a loaded-contracts descriptor.
 *
 * @param {Object} [options]
 * @param {Object} [options.implementationPlan]
 * @returns {Object} loaded contracts descriptor
 */
export function createIsolatedRuntimeContractLoader(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const plan = isGenericModelPlainObject(o.implementationPlan) ? o.implementationPlan : {};

  const loaded = {
    implementationPlan: typeof plan.implementationPlanVersion === 'string' ? plan.implementationPlanVersion : null,
    runtimeShellContract: typeof plan.runtimeShellContractVersion === 'string' ? plan.runtimeShellContractVersion : null,
    visualContract: typeof plan.visualContractVersion === 'string' ? plan.visualContractVersion : null,
    bridgeContract: typeof plan.bridgeVersion === 'string' ? plan.bridgeVersion : null,
    sandboxContract: typeof plan.sandboxVersion === 'string' ? plan.sandboxVersion : null,
    plannerContract: typeof plan.plannerVersion === 'string' ? plan.plannerVersion : null,
    engineContract: typeof plan.engineVersion === 'string' ? plan.engineVersion : null,
  };

  const core = {
    kind: 'isolated-runtime-contract-loader',
    moduleId: String(plan.moduleId ?? 'plannedModule'),
    loaded,
    allLoaded: Object.values(loaded).every((v) => typeof v === 'string' && v.length > 0),
    usedDynamicImport: false,
    usedFetch: false,
    usedFilesystem: false,
    usedPrisma: false,
    usedBackend: false,
    usedWindowOrDocument: false,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, contractLoaderDigest: runtimeDigest(core) });
}

export default createIsolatedRuntimeContractLoader;
