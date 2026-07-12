import { isGenericModelPlainObject, safeCloneGenericModel } from '../../runtime/generic-model/index.js';
import { createStudioContractDigest } from './createStudioContractDigest.js';

/** The 19 conceptual metamodel entities. Contracts only — never real schema. */
const ENTITIES = [
  { entityName: 'StudioProject', purpose: 'groups models/modules', requiredFields: ['id', 'name', 'version', 'status'], relationships: ['StudioModel', 'StudioModule'], firstSliceRequired: true },
  { entityName: 'StudioModel', purpose: 'abstract data model', requiredFields: ['id', 'name', 'modelFamily', 'modelType', 'fields'], relationships: ['StudioField', 'StudioModule'], firstSliceRequired: true },
  { entityName: 'StudioModule', purpose: 'configurable module', requiredFields: ['id', 'moduleId', 'modelRef', 'permissions'], relationships: ['StudioModel', 'StudioScreen', 'StudioPermission'], firstSliceRequired: true },
  { entityName: 'StudioField', purpose: 'field of a model', requiredFields: ['id', 'name', 'type', 'required'], relationships: ['StudioFieldType', 'StudioValidation'], firstSliceRequired: true },
  { entityName: 'StudioFieldType', purpose: 'field type catalog', requiredFields: ['id', 'kind'], relationships: ['StudioField'], firstSliceRequired: true },
  { entityName: 'StudioScreen', purpose: 'screen (table/form)', requiredFields: ['id', 'kind'], relationships: ['StudioTable', 'StudioForm'], firstSliceRequired: false },
  { entityName: 'StudioTable', purpose: 'table config', requiredFields: ['columns'], relationships: ['StudioField'], firstSliceRequired: false },
  { entityName: 'StudioForm', purpose: 'form config', requiredFields: ['sections'], relationships: ['StudioField', 'StudioValidation'], firstSliceRequired: false },
  { entityName: 'StudioValidation', purpose: 'validation rule', requiredFields: ['id', 'kind', 'target'], relationships: ['StudioField'], firstSliceRequired: true },
  { entityName: 'StudioRelationship', purpose: 'relation between models', requiredFields: ['id', 'from', 'to', 'kind'], relationships: ['StudioModel'], firstSliceRequired: false },
  { entityName: 'StudioPermission', purpose: 'planned permission', requiredFields: ['id', 'action', 'scope'], relationships: ['StudioModule'], firstSliceRequired: true },
  { entityName: 'StudioRoutePlan', purpose: 'planned route (never auto-registered)', requiredFields: ['routePath', 'guardRequired', 'productionAllowed'], relationships: ['StudioModule'], firstSliceRequired: true },
  { entityName: 'StudioMenuPlan', purpose: 'planned menu (never auto-registered)', requiredFields: ['label', 'visibilityPolicy'], relationships: ['StudioModule'], firstSliceRequired: true },
  { entityName: 'StudioPersistenceBoundary', purpose: 'persistence limit', requiredFields: ['state', 'allowed', 'blocked'], relationships: ['StudioModule'], firstSliceRequired: true },
  { entityName: 'StudioRuntimeBinding', purpose: 'binding to runtime', requiredFields: ['runtime', 'readModel'], relationships: ['StudioModule'], firstSliceRequired: true },
  { entityName: 'StudioDiagnostics', purpose: 'passive diagnostics', requiredFields: ['status', 'blockers'], relationships: [], firstSliceRequired: true },
  { entityName: 'StudioGatePlan', purpose: 'gates for a generated module', requiredFields: ['gateIds', 'scope'], relationships: ['StudioModule'], firstSliceRequired: true },
  { entityName: 'StudioBlueprint', purpose: 'versioned blueprint', requiredFields: ['blueprintId', 'blueprintVersion', 'status'], relationships: ['StudioModule'], firstSliceRequired: true },
  { entityName: 'StudioVersion', purpose: 'semver versioning', requiredFields: ['major', 'minor', 'patch'], relationships: [], firstSliceRequired: true },
];

/**
 * The Studio metamodel contract — conceptual entities only. Never generates schema/
 * migration/backend/module/UI. Pure. Deterministic digest.
 *
 * @param {Object} [options]
 * @returns {Object} metamodel contract descriptor
 */
export function createStudioMetamodelContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const entities = ENTITIES.map((e) => ({
    entityName: e.entityName,
    purpose: e.purpose,
    requiredFields: [...e.requiredFields],
    optionalFields: ['status', 'notes'],
    relationships: [...e.relationships],
    status: 'contract',
    firstSliceRequired: e.firstSliceRequired,
    risks: ['must not become real schema', 'must not auto-generate module/UI'],
    notes: 'contract-only; no persistence',
  }));

  const body = {
    kind: 'studio-metamodel-contract',
    entities,
    entityCount: entities.length,
    entityNames: entities.map((e) => e.entityName),
    generatesSchema: false,
    generatesMigration: false,
    generatesBackend: false,
    generatesModule: false,
    generatesUi: false,
    isContract: true,
    isPersistence: false,
  };
  return safeCloneGenericModel({ ...body, metamodelDigest: createStudioContractDigest({ value: entities.map((e) => [e.entityName, e.requiredFields]) }) });
}

export default createStudioMetamodelContract;
