import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../../runtime/generic-model/index.js';
import {
  EMPRESAS_STUDIO_COMPATIBILITY_SLICE_1_NAME,
  EMPRESAS_STUDIO_COMPATIBILITY_SLICE_1_VERSION,
  EMPRESAS_MIRROR_VERSION,
  STUDIO_BLUEPRINT_CONTRACT_VERSION,
  EMPRESAS_READ_CONTRACT_VERSION,
  EMPRESAS_COMPAT_MODULE_ID,
  EMPRESAS_COMPAT_MODEL_TYPE,
  EMPRESAS_COMPAT_MODEL_FAMILY,
  EMPRESAS_COMPAT_HEADLESS_CAPABILITIES,
  compatDigest,
} from './empresasStudioCompatibilitySlice1Config.js';

/**
 * Builds the compatibility slice 1 manifest, aggregating every plan/registry digest
 * into an overallDigest. Pure. Readiness `compatibility_slice_1_complete` when there
 * are no blockers and no untracked critical gaps.
 *
 * @param {Object} [options] the slice parts
 * @returns {Object} manifest descriptor
 */
export function createEmpresasCompatibilitySlice1Manifest(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const get = (obj, key) => (isGenericModelPlainObject(obj) ? obj[key] : undefined) ?? null;

  const digests = {
    gapRegistryDigest: get(o.gapRegistry, 'gapRegistryDigest'),
    detailPlanDigest: get(o.detailPlan, 'detailPlanDigest'),
    stateCoverageDigest: get(o.stateCoverage, 'stateCoverageDigest'),
    writeCapabilityDigest: get(o.writeCapability, 'writeCapabilityDigest'),
    persistenceBridgeDigest: get(o.persistenceBridge, 'persistenceBridgeDigest'),
    backendPrismaReadinessDigest: get(o.backendPrismaReadiness, 'backendPrismaReadinessDigest'),
    preferenceLayoutDigest: get(o.preferenceLayout, 'preferenceLayoutDigest'),
  };

  const untrackedCriticalGaps = typeof get(o.gapRegistry, 'untrackedCriticalGaps') === 'number' ? o.gapRegistry.untrackedCriticalGaps : 0;
  const knownGapsTracked = get(o.gapRegistry, 'knownGapsTracked') === true;

  const blockers = [...(Array.isArray(o.blockers) ? o.blockers : [])];
  const warnings = [...(Array.isArray(o.warnings) ? o.warnings : [])];
  if (untrackedCriticalGaps > 0) blockers.push('untracked critical gap');
  if (!knownGapsTracked) blockers.push('gaps not tracked');

  const readiness = blockers.length === 0 ? 'compatibility_slice_1_complete' : 'blocked';
  const overallDigest = compatDigest({ ...digests, readiness });

  return safeCloneGenericModel({
    kind: 'empresas-compatibility-slice1-manifest',
    manifestId: `${EMPRESAS_STUDIO_COMPATIBILITY_SLICE_1_NAME}@${EMPRESAS_STUDIO_COMPATIBILITY_SLICE_1_VERSION.split('@')[1]}#manifest`,
    sliceName: EMPRESAS_STUDIO_COMPATIBILITY_SLICE_1_NAME,
    sliceVersion: EMPRESAS_STUDIO_COMPATIBILITY_SLICE_1_VERSION,
    mirrorVersion: EMPRESAS_MIRROR_VERSION,
    blueprintContractVersion: STUDIO_BLUEPRINT_CONTRACT_VERSION,
    empresasReadContractVersion: EMPRESAS_READ_CONTRACT_VERSION,
    moduleId: EMPRESAS_COMPAT_MODULE_ID,
    modelType: EMPRESAS_COMPAT_MODEL_TYPE,
    modelFamily: EMPRESAS_COMPAT_MODEL_FAMILY,
    ...digests,
    overallDigest,
    ...EMPRESAS_COMPAT_HEADLESS_CAPABILITIES,
    knownGapsTracked,
    untrackedCriticalGaps,
    blockers,
    warnings,
    readiness,
    nextSteps: 'studio-blueprint-engine-foundation OR empresas-studio-compatibility-slice-2',
  });
}

export default createEmpresasCompatibilitySlice1Manifest;
