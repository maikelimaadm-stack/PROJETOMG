import { safeCloneGenericModel } from '../../../../runtime/generic-model/index.js';
import { compatDigest } from './empresasStudioCompatibilitySlice1Config.js';

/**
 * Formalizes the bridge between the Studio canonical persistence boundary and the
 * Empresas existingProduction/referenceOnly reality. Pure, contract-only. This slice
 * accesses no backend/Prisma/production, creates no schema/migration, and never mutates.
 *
 * @param {Object} [options]
 * @returns {Object} persistence boundary alignment bridge
 */
export function createEmpresasPersistenceBoundaryAlignmentBridge(options = {}) {
  void options;
  const futureStates = [
    'referenceOnly',
    'contractOnlyAligned',
    'uiAlignmentReady',
    'runtimeBindingPilotReady',
    'backendPrismaReadinessDocumented',
    'stagingReadinessFuture',
    'productionWriteControlledFuture',
  ];

  const body = {
    kind: 'empresas-persistence-boundary-alignment-bridge',
    currentBoundary: 'existingProduction/referenceOnly',
    canonicalBoundaryEquivalent: 'productionRead/referenceOnly (Studio noPersistence default does not apply to an already-productive module)',
    allowedNow: ['read reference', 'contract-only alignment', 'documentation'],
    prohibitedNow: ['schema change', 'migration', 'backend call', 'prisma call', 'mutation', 'production write', 'staging access'],
    futureStates,
    requiredEvidenceForFutureChange: ['dedicated slice', 'controlled test plan', 'rollback/cleanup protocol', 'environment safety matrix'],
    requiredGatesForFutureChange: ['no-production-write gate', 'tenant-isolation gate', 'permission fail-closed gate'],
    requiredRollbackForFutureChange: ['testRunId cleanup', 'explicit id capture', 'non-consumption rollback'],
    schemaChangeAllowed: false,
    migrationAllowed: false,
    mutationAllowed: false,
    backendAccessed: false,
    prismaAccessed: false,
    productionAccessed: false,
    createsSchema: false,
    createsMigration: false,
    usesDatabaseUrl: false,
    alignmentStatus: 'bridged_reference_only',
  };
  return safeCloneGenericModel({ ...body, persistenceBridgeDigest: compatDigest({ currentBoundary: body.currentBoundary, futureStates }) });
}

export default createEmpresasPersistenceBoundaryAlignmentBridge;
