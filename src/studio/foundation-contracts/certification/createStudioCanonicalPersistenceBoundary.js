import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { STUDIO_PERSISTENCE_STATES } from '../createStudioPersistenceBoundaryContract.js';
import { certificationDigest } from './createStudioBlueprintCertificationDigest.js';

/**
 * Certifies the canonical persistence boundary. Pure. Default noPersistence; schema/
 * migration/prisma/backend/mutation off by default; real data is never a fixture;
 * production requires an explicit future policy; no automatic schema/migration.
 *
 * @param {Object} [options]
 * @returns {Object} canonical persistence boundary
 */
export function createStudioCanonicalPersistenceBoundary(options = {}) {
  void options;
  const defaults = {
    schemaAllowed: false,
    migrationAllowed: false,
    prismaAllowed: false,
    backendAllowed: false,
    mutationAllowed: false,
  };

  const body = {
    kind: 'studio-canonical-persistence-boundary',
    states: [...STUDIO_PERSISTENCE_STATES],
    defaultState: 'noPersistence',
    defaults,
    realDataAsFixture: false,
    automaticSchemaOrMigration: false,
    productionWriteRequiresExplicitFuturePlan: true,
  };
  return safeCloneGenericModel({ ...body, canonicalPersistenceBoundaryDigest: certificationDigest({ states: STUDIO_PERSISTENCE_STATES, defaults }) });
}

export default createStudioCanonicalPersistenceBoundary;
