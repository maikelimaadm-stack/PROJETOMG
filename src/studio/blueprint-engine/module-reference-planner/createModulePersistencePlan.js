import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { MODULE_PERSISTENCE_STATES, plannerDigest } from './moduleReferencePlannerConfig.js';

/**
 * Plans the PERSISTENCE boundary a module WOULD progress through. Pure. For THIS slice
 * every real capability is off: no schema, no migration, no backend, no Prisma, no
 * mutation, no production, no staging. Real persistence is `blocked/futureOnly`. Real
 * data is never a fixture.
 *
 * @param {Object} [options]
 * @param {Object} [options.blueprint] normalized blueprint
 * @returns {Object} persistence plan
 */
export function createModulePersistencePlan(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const b = isGenericModelPlainObject(o.blueprint) ? o.blueprint : {};
  const moduleId = String(b.moduleId ?? 'plannedModule').trim();

  const states = MODULE_PERSISTENCE_STATES.map((state, i) => ({
    state,
    order: i,
    allowedNow: state === 'noPersistence', // only noPersistence is the current boundary
    futureSlice: state === 'noPersistence' ? null : 'STUDIO MODULE PERSISTENCE READINESS / BACKEND SLICE',
  }));

  const core = {
    kind: 'module-persistence-plan',
    moduleId,
    states,
    currentBoundary: 'noPersistence',
    plannedProgression: MODULE_PERSISTENCE_STATES.slice(0, 3), // noPersistence → memoryOnly → localReadOnly
    schemaAllowedNow: false,
    migrationAllowedNow: false,
    backendAllowedNow: false,
    prismaAllowedNow: false,
    mutationAllowedNow: false,
    productionAllowedNow: false,
    stagingAllowedNow: false,
    schemaCreated: false,
    migrationCreated: false,
    backendCreated: false,
    prismaAccessed: false,
    realPersistenceBlocked: true,
    realDataUsedAsFixture: false,
    persistenceRealFutureOnly: true,
  };

  return safeCloneGenericModel({ ...core, persistencePlanDigest: plannerDigest(core) });
}

export default createModulePersistencePlan;
