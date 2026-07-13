import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  EMPRESAS_CERTIFIED_BLUEPRINT_MIRROR_NAME,
  EMPRESAS_CERTIFIED_BLUEPRINT_MIRROR_VERSION,
  STUDIO_BLUEPRINT_CONTRACT_VERSION,
  EMPRESAS_READ_CONTRACT_VERSION,
  EMPRESAS_MIRROR_SOURCE_MODULE,
  EMPRESAS_MIRROR_MODEL_TYPE,
  EMPRESAS_MIRROR_MODEL_FAMILY,
  EMPRESAS_MIRROR_HEADLESS_CAPABILITIES,
  mirrorDigest,
} from './empresasBlueprintMirrorConfig.js';

/**
 * Builds the Empresas blueprint mirror manifest, aggregating every mirror digest into
 * an overallDigest. Pure. Readiness `blueprint_mirror_created` when no blockers.
 *
 * @param {Object} [options] the mirror parts
 * @returns {Object} manifest descriptor
 */
export function createEmpresasBlueprintMirrorManifest(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const get = (obj, key) => (isGenericModelPlainObject(obj) ? obj[key] : undefined) ?? null;

  const digests = {
    fieldDigest: get(o.fieldBlueprint, 'fieldDigest'),
    screenDigest: get(o.screenBlueprint, 'screenDigest'),
    tableFormDigest: get(o.tableFormBlueprint, 'tableFormDigest'),
    filterSortDigest: get(o.filterSortBlueprint, 'filterSortDigest'),
    permissionDigest: get(o.permissionBlueprint, 'permissionDigest'),
    tenantDigest: get(o.tenantBlueprint, 'tenantDigest'),
    persistenceBoundaryDigest: get(o.persistenceBoundary, 'persistenceBoundaryDigest'),
    runtimeBindingDigest: get(o.runtimeBinding, 'runtimeBindingDigest'),
    alignmentAuditDigest: get(o.alignmentAudit, 'alignmentAuditDigest'),
  };

  const blockers = [...(Array.isArray(o.blockers) ? o.blockers : [])];
  const warnings = [...(Array.isArray(o.warnings) ? o.warnings : [])];
  const readiness = blockers.length === 0 ? 'blueprint_mirror_created' : 'alignment_blocked';
  const overallDigest = mirrorDigest({ ...digests, readiness });

  return safeCloneGenericModel({
    kind: 'empresas-blueprint-mirror-manifest',
    manifestId: `${EMPRESAS_CERTIFIED_BLUEPRINT_MIRROR_NAME}@${EMPRESAS_CERTIFIED_BLUEPRINT_MIRROR_VERSION.split('@')[1]}#manifest`,
    mirrorName: EMPRESAS_CERTIFIED_BLUEPRINT_MIRROR_NAME,
    mirrorVersion: EMPRESAS_CERTIFIED_BLUEPRINT_MIRROR_VERSION,
    blueprintContractVersion: STUDIO_BLUEPRINT_CONTRACT_VERSION,
    empresasReadContractVersion: EMPRESAS_READ_CONTRACT_VERSION,
    sourceModule: EMPRESAS_MIRROR_SOURCE_MODULE,
    modelType: EMPRESAS_MIRROR_MODEL_TYPE,
    modelFamily: EMPRESAS_MIRROR_MODEL_FAMILY,
    ...digests,
    overallDigest,
    ...EMPRESAS_MIRROR_HEADLESS_CAPABILITIES,
    blockers,
    warnings,
    readiness,
  });
}

export default createEmpresasBlueprintMirrorManifest;
