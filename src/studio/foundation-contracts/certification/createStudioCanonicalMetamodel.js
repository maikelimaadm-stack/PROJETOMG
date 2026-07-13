import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { createStudioMetamodelContract } from '../createStudioMetamodelContract.js';
import { certificationDigest } from './createStudioBlueprintCertificationDigest.js';

/**
 * Certifies the canonical Studio metamodel: the 19 conceptual entities from the
 * foundation, annotated with safety rules and `contractOnly: true`. Pure. Generates
 * no schema/migration/backend/UI and registers no module.
 *
 * @param {Object} [options]
 * @returns {Object} canonical metamodel
 */
export function createStudioCanonicalMetamodel(options = {}) {
  void options;
  const base = createStudioMetamodelContract();
  const entities = base.entities.map((e) => ({
    entityName: e.entityName,
    purpose: e.purpose,
    requiredFields: [...e.requiredFields],
    optionalFields: [...(e.optionalFields || [])],
    relationships: [...e.relationships],
    safetyRules: ['no schema', 'no migration', 'no backend', 'no ui', 'no module registration'],
    allowedStatus: ['contract'],
    contractOnly: true,
  }));

  const body = {
    kind: 'studio-canonical-metamodel',
    entities,
    entityCount: entities.length,
    entityNames: entities.map((e) => e.entityName),
    generatesSchema: false,
    generatesMigration: false,
    generatesBackend: false,
    generatesUi: false,
    registersModule: false,
    contractOnly: true,
  };
  return safeCloneGenericModel({ ...body, canonicalMetamodelDigest: certificationDigest({ entities: entities.map((e) => [e.entityName, e.requiredFields]), contractOnly: true }) });
}

export default createStudioCanonicalMetamodel;
