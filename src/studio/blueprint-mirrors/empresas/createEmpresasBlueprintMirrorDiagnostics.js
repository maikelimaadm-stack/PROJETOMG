import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  EMPRESAS_CERTIFIED_BLUEPRINT_MIRROR_VERSION,
  STUDIO_BLUEPRINT_CONTRACT_VERSION,
  EMPRESAS_READ_CONTRACT_VERSION,
  EMPRESAS_MIRROR_SOURCE_MODULE,
  EMPRESAS_MIRROR_MODEL_TYPE,
  EMPRESAS_MIRROR_MODEL_FAMILY,
  EMPRESAS_MIRROR_HEADLESS_CAPABILITIES,
} from './empresasBlueprintMirrorConfig.js';

const READINESS = new Set(['blueprint_mirror_created', 'needs_alignment', 'blocked', 'invalid', 'skipped']);

/**
 * Passive diagnostics for the Empresas blueprint mirror. Pure. Asserts headless/
 * reference-only invariants and never contains secrets.
 *
 * @param {Object} [options]
 * @returns {Object} diagnostics
 */
export function createEmpresasBlueprintMirrorDiagnostics(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const blockers = [...(Array.isArray(o.blockers) ? o.blockers : [])];
  const warnings = [...(Array.isArray(o.warnings) ? o.warnings : [])];
  const st = (k) => (typeof o[k] === 'string' ? o[k] : 'unknown');

  let readiness = 'blueprint_mirror_created';
  if (blockers.length > 0) readiness = 'blocked';
  else if (warnings.length > 0) readiness = 'needs_alignment';

  return safeCloneGenericModel({
    kind: 'empresas-blueprint-mirror-diagnostics',
    diagnosticId: typeof o.diagnosticId === 'string' ? o.diagnosticId : 'empresas-certified-blueprint-mirror',
    mirrorVersion: EMPRESAS_CERTIFIED_BLUEPRINT_MIRROR_VERSION,
    blueprintContractVersion: STUDIO_BLUEPRINT_CONTRACT_VERSION,
    empresasReadContractVersion: EMPRESAS_READ_CONTRACT_VERSION,
    sourceModule: EMPRESAS_MIRROR_SOURCE_MODULE,
    modelType: EMPRESAS_MIRROR_MODEL_TYPE,
    modelFamily: EMPRESAS_MIRROR_MODEL_FAMILY,
    ...EMPRESAS_MIRROR_HEADLESS_CAPABILITIES,
    fieldStatus: st('fieldStatus'),
    screenStatus: st('screenStatus'),
    tableFormStatus: st('tableFormStatus'),
    filterSortStatus: st('filterSortStatus'),
    permissionStatus: st('permissionStatus'),
    tenantStatus: st('tenantStatus'),
    persistenceStatus: st('persistenceStatus'),
    runtimeBindingStatus: st('runtimeBindingStatus'),
    alignmentStatus: st('alignmentStatus'),
    compatibilityStatus: st('compatibilityStatus'),
    blockers,
    warnings,
    readiness: READINESS.has(readiness) ? readiness : 'skipped',
  });
}

export default createEmpresasBlueprintMirrorDiagnostics;
