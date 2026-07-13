import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../../runtime/generic-model/index.js';
import {
  EMPRESAS_STUDIO_COMPATIBILITY_SLICE_1_VERSION,
  EMPRESAS_MIRROR_VERSION,
  STUDIO_BLUEPRINT_CONTRACT_VERSION,
  EMPRESAS_READ_CONTRACT_VERSION,
  EMPRESAS_COMPAT_MODULE_ID,
  EMPRESAS_COMPAT_MODEL_TYPE,
  EMPRESAS_COMPAT_MODEL_FAMILY,
  EMPRESAS_COMPAT_MODE,
  EMPRESAS_COMPAT_HEADLESS_CAPABILITIES,
} from './empresasStudioCompatibilitySlice1Config.js';

const READINESS = new Set(['compatibility_slice_1_complete', 'needs_empresas_alignment', 'blocked', 'invalid', 'skipped']);

/**
 * Passive diagnostics for compatibility slice 1. Pure. Asserts headless/contract-only
 * invariants and never contains secrets.
 *
 * @param {Object} [options]
 * @returns {Object} diagnostics
 */
export function createEmpresasCompatibilitySlice1Diagnostics(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const blockers = [...(Array.isArray(o.blockers) ? o.blockers : [])];
  const warnings = [...(Array.isArray(o.warnings) ? o.warnings : [])];
  const st = (k) => (typeof o[k] === 'string' ? o[k] : 'unknown');

  let readiness = 'compatibility_slice_1_complete';
  if (blockers.length > 0) readiness = 'blocked';
  else if (warnings.length > 0) readiness = 'needs_empresas_alignment';

  return safeCloneGenericModel({
    kind: 'empresas-compatibility-slice1-diagnostics',
    diagnosticId: typeof o.diagnosticId === 'string' ? o.diagnosticId : 'empresas-studio-compatibility-slice-1',
    sliceVersion: EMPRESAS_STUDIO_COMPATIBILITY_SLICE_1_VERSION,
    mirrorVersion: EMPRESAS_MIRROR_VERSION,
    blueprintContractVersion: STUDIO_BLUEPRINT_CONTRACT_VERSION,
    empresasReadContractVersion: EMPRESAS_READ_CONTRACT_VERSION,
    moduleId: EMPRESAS_COMPAT_MODULE_ID,
    modelType: EMPRESAS_COMPAT_MODEL_TYPE,
    modelFamily: EMPRESAS_COMPAT_MODEL_FAMILY,
    mode: EMPRESAS_COMPAT_MODE,
    ...EMPRESAS_COMPAT_HEADLESS_CAPABILITIES,
    gapRegistryStatus: st('gapRegistryStatus'),
    detailPlanStatus: st('detailPlanStatus'),
    stateCoverageStatus: st('stateCoverageStatus'),
    writeCapabilityStatus: st('writeCapabilityStatus'),
    persistenceBridgeStatus: st('persistenceBridgeStatus'),
    backendPrismaReadinessStatus: st('backendPrismaReadinessStatus'),
    preferenceLayoutStatus: st('preferenceLayoutStatus'),
    compatibilityStatus: st('compatibilityStatus'),
    blockers,
    warnings,
    readiness: READINESS.has(readiness) ? readiness : 'skipped',
  });
}

export default createEmpresasCompatibilitySlice1Diagnostics;
