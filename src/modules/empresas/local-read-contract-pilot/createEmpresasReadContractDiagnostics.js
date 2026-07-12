import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { EMPRESAS_LOCAL_READ_ENVIRONMENT } from './empresasLocalReadContractConfig.js';

const READINESS = new Set(['ready', 'blocked', 'fallback', 'needs_fixes', 'skipped']);

/**
 * Passive diagnostics for the read-only pilot. Pure. Asserts the local/read-only/
 * no-side-effect invariants. Never contains secrets.
 *
 * @param {Object} [options]
 * @returns {Object} diagnostics
 */
export function createEmpresasReadContractDiagnostics(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const parity = isGenericModelPlainObject(o.parity) ? o.parity : {};
  const permissionStatus = typeof o.permissionStatus === 'string' ? o.permissionStatus : 'unknown';
  const queryStatus = typeof o.queryStatus === 'string' ? o.queryStatus : 'unknown';
  const warnings = [...(Array.isArray(o.warnings) ? o.warnings : []), ...(Array.isArray(parity.warnings) ? parity.warnings : [])];
  const blockers = [...(Array.isArray(o.blockers) ? o.blockers : []), ...(Array.isArray(parity.blockers) ? parity.blockers : [])];

  let readiness = 'ready';
  if (blockers.length > 0) readiness = 'blocked';
  else if (warnings.length > 0) readiness = 'needs_fixes';

  return safeCloneGenericModel({
    kind: 'empresas-read-contract-diagnostics',
    pilotId: typeof o.pilotId === 'string' ? o.pilotId : null,
    environment: EMPRESAS_LOCAL_READ_ENVIRONMENT,
    synthetic: true,
    localOnly: true,
    readOnly: true,
    mutationAllowed: false,
    productionAccessed: false,
    backendAccessed: false,
    prismaAccessed: false,
    fetchUsed: false,
    datasetSize: Number.isInteger(o.datasetSize) ? o.datasetSize : 0,
    tenantId: typeof o.tenantId === 'string' ? o.tenantId : null,
    erpEmpresaId: typeof o.erpEmpresaId === 'string' ? o.erpEmpresaId : null,
    permissionStatus,
    queryStatus,
    parityStatus: parity.equal === true ? 'equal' : (parity.kind ? 'divergent' : 'skipped'),
    fallbackStatus: typeof o.fallbackStatus === 'string' ? o.fallbackStatus : 'not_triggered',
    warnings,
    blockers,
    readiness: READINESS.has(readiness) ? readiness : 'skipped',
  });
}

export default createEmpresasReadContractDiagnostics;
