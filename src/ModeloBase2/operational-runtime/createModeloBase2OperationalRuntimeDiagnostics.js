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
} from './modeloBase2OperationalRuntimeConfig.js';

const READINESS = new Set(['ready', 'partial', 'blocked', 'needs_fixes', 'skipped']);

/**
 * Passive diagnostics for the operational runtime/session. Pure; asserts the
 * local-only / no-side-effect invariants. Wraps the generic diagnostics.
 *
 * @param {Object} [options]
 * @param {string} [options.runtimeId]
 * @param {string} [options.sessionId]
 * @param {string} [options.moduleId]
 * @param {string} [options.currentState]
 * @param {Object} [options.draft]
 * @param {Object|Array} [options.eventLog]
 * @param {string} [options.conformanceStatus]
 * @param {string[]} [options.warnings]
 * @param {string[]} [options.blockers]
 * @returns {Object} diagnostics
 */
export function createModeloBase2OperationalRuntimeDiagnostics(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const moduleId = typeof o.moduleId === 'string' ? o.moduleId : 'operacional-runtime';
  const draft = isGenericModelPlainObject(o.draft) ? o.draft : {};
  const events = Array.isArray(o.eventLog) ? o.eventLog : (o.eventLog && typeof o.eventLog.list === 'function' ? o.eventLog.list() : (Array.isArray(draft.events) ? draft.events : []));
  const entriesCount = Array.isArray(draft.entries) ? draft.entries.length : 0;
  const currentState = typeof o.currentState === 'string' ? o.currentState : 'idle';
  const blockers = Array.isArray(o.blockers) ? o.blockers : [];
  const warnings = Array.isArray(o.warnings) ? o.warnings : [];

  const generic = createGenericModelDiagnostics({
    modelId: MODELOBASE2_MODEL_ID,
    moduleId,
    modelType: MODELOBASE2_MODEL_TYPE,
    phase: 'modelobase2-operational-runtime',
    enabled: currentState !== 'idle',
    source: 'modeloBase2-operational-runtime',
    warnings,
    blockers,
  });

  let readiness = 'ready';
  if (blockers.length > 0 || currentState === 'blocked') readiness = 'blocked';
  else if (currentState === 'fallback') readiness = 'needs_fixes';
  else if (currentState === 'idle') readiness = 'skipped';
  else if (warnings.length > 0) readiness = 'partial';
  if (typeof o.readiness === 'string' && READINESS.has(o.readiness)) readiness = o.readiness;

  return safeCloneGenericModel({
    ...generic,
    kind: 'modelobase2-operational-runtime-diagnostics',
    runtimeId: typeof o.runtimeId === 'string' ? o.runtimeId : null,
    sessionId: typeof o.sessionId === 'string' ? o.sessionId : null,
    modelFamily: MODELOBASE2_MODEL_FAMILY,
    modelType: MODELOBASE2_MODEL_TYPE,
    currentState,
    eventCount: events.length,
    entriesCount,
    conformanceStatus: typeof o.conformanceStatus === 'string' ? o.conformanceStatus : 'ok',
    stateMachineStatus: currentState === 'blocked' ? 'blocked' : 'ok',
    snapshotStatus: 'local',
    dangerousCapabilities: Object.fromEntries(GENERIC_MODEL_DANGEROUS_CAPABILITIES.map((c) => [c, false])),
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

export default createModeloBase2OperationalRuntimeDiagnostics;
