import { isGenericModelPlainObject, safeCloneGenericModel, GENERIC_MODEL_DANGEROUS_CAPABILITIES } from '../../../runtime/generic-model/index.js';
import { MODELOBASE2_FUEL_DEV_PREVIEW_ROUTE_PATH } from './modeloBase2FuelDevPreviewConfig.js';

const READINESS = new Set(['ready', 'fallback', 'blocked', 'needs_fixes', 'skipped']);

/**
 * Passive diagnostics for the fuel dev preview route. Pure; React-free. Asserts the
 * dev-only / no-side-effect invariants and reflects the access decision.
 *
 * @param {Object} [options]
 * @param {string} [options.previewId]
 * @param {Object} [options.access] Access descriptor.
 * @param {string} [options.fixtureMode]
 * @param {string[]} [options.warnings]
 * @param {string[]} [options.blockers]
 * @returns {Object} diagnostics
 */
export function createModeloBase2FuelDevPreviewDiagnostics(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const access = isGenericModelPlainObject(o.access) ? o.access : {};
  const allowed = access.allowed === true;
  const environment = typeof access.environment === 'string' ? access.environment : 'development';
  const blockers = [...(Array.isArray(o.blockers) ? o.blockers : []), ...(Array.isArray(access.blockers) ? access.blockers : [])];
  const warnings = [...(Array.isArray(o.warnings) ? o.warnings : []), ...(Array.isArray(access.warnings) ? access.warnings : [])];

  let readiness = 'ready';
  if (!allowed) readiness = 'blocked';
  else if (warnings.length > 0) readiness = 'needs_fixes';

  return safeCloneGenericModel({
    kind: 'modelobase2-fuel-dev-preview-diagnostics',
    previewId: typeof o.previewId === 'string' ? o.previewId : null,
    routePath: MODELOBASE2_FUEL_DEV_PREVIEW_ROUTE_PATH,
    allowed,
    devOnly: true,
    environment,
    flags: isGenericModelPlainObject(access.flags) ? access.flags : null,
    uiMountedInApp: allowed,
    routeRegistered: allowed,
    menuRegistered: false,
    localOnly: true,
    sent: false,
    persistenceReal: false,
    backendTouched: false,
    prismaTouched: false,
    runtimeBridgeTouched: false,
    dangerousCapabilities: Object.fromEntries(GENERIC_MODEL_DANGEROUS_CAPABILITIES.map((c) => [c, false])),
    fixtureMode: typeof o.fixtureMode === 'string' ? o.fixtureMode : null,
    noSideEffects: true,
    warnings,
    blockers,
    readiness: READINESS.has(readiness) ? readiness : 'skipped',
  });
}

export default createModeloBase2FuelDevPreviewDiagnostics;
