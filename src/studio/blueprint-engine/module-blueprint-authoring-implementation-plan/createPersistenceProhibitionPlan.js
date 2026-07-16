import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { authoringPlanDigest } from './authoringImplementationPlanConfig.js';

/**
 * Persistence prohibition PLAN — declares persistence permanently prohibited for the authoring
 * foundation/runtime: no storage, database, filesystem write, backend, or Prisma. Metadata only.
 * @returns {Object}
 */
export function createPersistenceProhibitionPlan() {
  const core = {
    kind: 'authoring-persistence-prohibition-plan',
    persistenceProhibitionActive: true,
    persistenceImplemented: false,
    storageAllowed: false,
    databaseAllowed: false,
    filesystemWriteAllowed: false,
    backendAllowed: false,
    prismaAllowed: false,
  };
  return safeCloneGenericModel({ ...core, persistenceProhibitionPlanDigest: authoringPlanDigest(core) });
}

export default createPersistenceProhibitionPlan;
