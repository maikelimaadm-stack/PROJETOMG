import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { createStudioCanonicalPersistenceBoundary } from '../../foundation-contracts/certification/createStudioCanonicalPersistenceBoundary.js';
import { mirrorDigest } from './empresasBlueprintMirrorConfig.js';

/**
 * Mirrors the Empresas persistence reality (real backend + Prisma + REST + JWT +
 * multi-tenant) as **reference-only**. Pure, headless. This slice accesses none of it:
 * no backend/Prisma/production, no mutation, no migration.
 *
 * @param {Object} [options]
 * @returns {Object} persistence boundary mirror
 */
export function createEmpresasPersistenceBoundaryMirror(options = {}) {
  void options;
  const canonical = createStudioCanonicalPersistenceBoundary();

  const currentReality = {
    existingProductionBackend: true,
    existingPrismaSchema: true,
    existingRestApi: true,
    existingJwt: true,
    existingMultiTenantScope: true,
  };

  const futurePossibleStates = [
    { state: 'localReadMirror', requires: 'headless mirror (this slice)' },
    { state: 'localAlignment', requires: 'contract-only fixes' },
    { state: 'controlledEmpresasModification', requires: 'dedicated Empresas slice + gates + rollback' },
    { state: 'stagingReadOnly', requires: 'future staging + environment gate' },
    { state: 'stagingWriteControlled', requires: 'future flag + rollback' },
    { state: 'productionWriteControlled', requires: 'explicit future production-write policy' },
  ];

  const body = {
    kind: 'empresas-persistence-boundary-mirror',
    ...currentReality,
    canonicalStates: [...canonical.states],
    currentState: 'existingProduction/referenceOnly',
    mirrorAccessMode: 'referenceOnly',
    mutationAllowed: false,
    migrationAllowed: false,
    schemaChangeAllowed: false,
    backendChangeAllowed: false,
    prismaAccessed: false,
    backendAccessed: false,
    productionAccessed: false,
    stagingAccessed: false,
    futurePossibleStates,
    changesPersistenceThisSlice: false,
    createsMigrationThisSlice: false,
    executesPrismaThisSlice: false,
    alignmentStatus: 'partially_aligned',
    alignmentNote: 'Empresas already has production persistence; Studio canonical default is noPersistence — alignment is a future controlled decision, not this slice.',
  };
  return safeCloneGenericModel({ ...body, persistenceBoundaryDigest: mirrorDigest({ currentReality, currentState: body.currentState, mirrorAccessMode: body.mirrorAccessMode }) });
}

export default createEmpresasPersistenceBoundaryMirror;
