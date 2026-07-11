import {
  isGenericModelPlainObject,
  safeCloneGenericModel,
  createGenericModelDiagnostics,
  GENERIC_MODEL_DANGEROUS_CAPABILITIES,
} from '../../runtime/generic-model/index.js';
import { computeFuelSummary } from './createModeloBase2FuelReadState.js';
import {
  MODELOBASE2_MODEL_ID,
  MODELOBASE2_MODEL_FAMILY,
  MODELOBASE2_MODEL_TYPE,
  FUEL_DOMAIN,
  FUEL_OPERATION_TYPE,
} from './modeloBase2FuelHeadlessConfig.js';

const READINESS = new Set(['ready', 'partial', 'blocked', 'needs_fixes', 'skipped']);

/**
 * Passive diagnostics for the fuel headless candidate. Pure; asserts the local-only
 * / no-side-effect invariants. Wraps the generic diagnostics.
 *
 * @param {Object} [options]
 * @param {string} [options.candidateId]
 * @param {string} [options.moduleId]
 * @param {Object} [options.draft]
 * @param {string} [options.status]
 * @param {string} [options.validationStatus]
 * @param {string[]} [options.warnings]
 * @param {string[]} [options.blockers]
 * @returns {Object} diagnostics
 */
export function createModeloBase2FuelDiagnostics(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const moduleId = typeof o.moduleId === 'string' ? o.moduleId : 'combustivel';
  const draft = isGenericModelPlainObject(o.draft) ? o.draft : {};
  const entries = Array.isArray(draft.entries) ? draft.entries : [];
  const summary = computeFuelSummary(entries);
  const status = typeof o.status === 'string' ? o.status : (typeof draft.status === 'string' ? draft.status : 'idle');
  const blockers = Array.isArray(o.blockers) ? o.blockers : [];
  const warnings = Array.isArray(o.warnings) ? o.warnings : [];

  const generic = createGenericModelDiagnostics({
    modelId: MODELOBASE2_MODEL_ID,
    moduleId,
    modelType: MODELOBASE2_MODEL_TYPE,
    phase: 'modelobase2-fuel-headless-candidate',
    enabled: status !== 'idle',
    source: 'modeloBase2-operational-runtime',
    warnings,
    blockers,
  });

  let readiness = 'ready';
  if (blockers.length > 0 || status === 'blocked') readiness = 'blocked';
  else if (status === 'fallback') readiness = 'needs_fixes';
  else if (status === 'idle') readiness = 'skipped';
  else if (warnings.length > 0) readiness = 'partial';
  if (typeof o.readiness === 'string' && READINESS.has(o.readiness)) readiness = o.readiness;

  return safeCloneGenericModel({
    ...generic,
    kind: 'modelobase2-fuel-diagnostics',
    candidateId: typeof o.candidateId === 'string' ? o.candidateId : null,
    domain: FUEL_DOMAIN,
    modelFamily: MODELOBASE2_MODEL_FAMILY,
    modelType: MODELOBASE2_MODEL_TYPE,
    operationType: FUEL_OPERATION_TYPE,
    status,
    entriesCount: entries.length,
    totalLiters: summary.totalLiters,
    machinesCount: summary.machinesCount,
    operatorsCount: summary.operatorsCount,
    validationStatus: typeof o.validationStatus === 'string' ? o.validationStatus : 'ok',
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

export default createModeloBase2FuelDiagnostics;
