import {
  isGenericModelPlainObject,
  safeCloneGenericModel,
  createGenericModelDiagnostics,
  GENERIC_MODEL_DANGEROUS_CAPABILITIES,
} from '../../runtime/generic-model/index.js';
import {
  MODELOBASE2_MODEL_ID,
  MODELOBASE2_MODEL_FAMILY,
  MODELOBASE2_MODEL_TYPE,
  FUEL_DOMAIN,
} from './modeloBase2FuelUiSandboxConfig.js';

const READINESS = new Set(['ready', 'fallback', 'blocked', 'needs_fixes', 'skipped']);

/**
 * Passive diagnostics for the fuel UI sandbox. Pure; React-free. Asserts the
 * sandbox is never mounted / route-registered / menu-registered, and the local-only
 * / no-side-effect invariants. Wraps the generic diagnostics.
 *
 * @param {Object} [options]
 * @param {string} [options.sandboxId]
 * @param {string} [options.moduleId]
 * @param {boolean} [options.enabled]
 * @param {Object} [options.readState]
 * @param {Array} [options.timeline]
 * @param {string} [options.status]
 * @param {string[]} [options.warnings]
 * @param {string[]} [options.blockers]
 * @returns {Object} diagnostics
 */
export function createModeloBase2FuelSandboxDiagnostics(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const moduleId = typeof o.moduleId === 'string' ? o.moduleId : 'combustivel';
  const readState = isGenericModelPlainObject(o.readState) ? o.readState : {};
  const summary = isGenericModelPlainObject(readState.summary) ? readState.summary : {};
  const entriesCount = Array.isArray(readState.entries) ? readState.entries.length : 0;
  const eventsCount = Array.isArray(o.timeline) ? o.timeline.length : (isGenericModelPlainObject(readState.timeline) && Array.isArray(readState.timeline.events) ? readState.timeline.events.length : 0);
  const status = typeof o.status === 'string' ? o.status : (typeof readState.status === 'string' ? readState.status : 'idle');
  const blockers = Array.isArray(o.blockers) ? o.blockers : [];
  const warnings = Array.isArray(o.warnings) ? o.warnings : [];

  const generic = createGenericModelDiagnostics({
    modelId: MODELOBASE2_MODEL_ID,
    moduleId,
    modelType: MODELOBASE2_MODEL_TYPE,
    phase: 'modelobase2-fuel-beta-ui-sandbox',
    enabled: o.enabled === true,
    source: 'modeloBase2-operational-runtime',
    warnings,
    blockers,
  });

  let readiness = 'ready';
  if (blockers.length > 0 || status === 'blocked') readiness = 'blocked';
  else if (status === 'fallback') readiness = 'fallback';
  else if (status === 'idle') readiness = 'skipped';
  else if (warnings.length > 0) readiness = 'needs_fixes';
  if (typeof o.readiness === 'string' && READINESS.has(o.readiness)) readiness = o.readiness;

  return safeCloneGenericModel({
    ...generic,
    kind: 'modelobase2-fuel-sandbox-diagnostics',
    sandboxId: typeof o.sandboxId === 'string' ? o.sandboxId : null,
    domain: FUEL_DOMAIN,
    modelFamily: MODELOBASE2_MODEL_FAMILY,
    modelType: MODELOBASE2_MODEL_TYPE,
    enabled: o.enabled === true,
    entriesCount,
    eventsCount,
    totalLiters: typeof summary.totalLiters === 'number' ? summary.totalLiters : 0,
    dangerousCapabilities: Object.fromEntries(GENERIC_MODEL_DANGEROUS_CAPABILITIES.map((c) => [c, false])),
    // Structural: the sandbox is NEVER mounted / route-registered / menu-registered.
    uiMountedInApp: false,
    routeRegistered: false,
    menuRegistered: false,
    localOnly: true,
    sent: false,
    persistenceReal: false,
    backendTouched: false,
    prismaTouched: false,
    runtimeBridgeTouched: false,
    noSideEffects: true,
    warnings,
    blockers,
    readiness,
  });
}

export default createModeloBase2FuelSandboxDiagnostics;
