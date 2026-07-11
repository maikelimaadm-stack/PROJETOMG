import {
  isGenericModelPlainObject,
  safeCloneGenericModel,
  createGenericModelDiagnostics,
} from '../../runtime/generic-model/index.js';
import { MODELOBASE1_MODEL_ID, MODELOBASE1_MODEL_TYPE } from './mapModeloBase1RuntimeReadToGenericModel.js';

/**
 * Transforms ModeloBase1 read/diagnostics state into a generic-kernel diagnostics
 * object, preserving ModeloBase1 signals (betaApplied/fallbackApplied/
 * writeBlocked). Pure. Safe defaults assert no IO/side effects.
 *
 * @param {Object} [options]
 * @param {string} [options.moduleId]
 * @param {Object} [options.runtimeReadState] The ModeloBase1 read state.
 * @param {string[]} [options.warnings]
 * @param {string[]} [options.blockers]
 * @returns {Object}
 */
export function createModeloBase1GenericDiagnosticsBridge(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const rs = isGenericModelPlainObject(o.runtimeReadState) ? o.runtimeReadState : {};
  const moduleId = typeof o.moduleId === 'string' ? o.moduleId : (typeof rs.moduleId === 'string' ? rs.moduleId : 'unknown');
  const betaApplied = rs.betaApplied === true;

  const generic = createGenericModelDiagnostics({
    modelId: MODELOBASE1_MODEL_ID,
    moduleId,
    modelType: MODELOBASE1_MODEL_TYPE,
    phase: 'modelobase1-adapter',
    enabled: betaApplied,
    source: typeof rs.source === 'string' ? rs.source : null,
    warnings: Array.isArray(o.warnings) ? o.warnings : [],
    blockers: Array.isArray(o.blockers) ? o.blockers : [],
    readiness: betaApplied ? 'ready' : 'fallback',
  });

  return safeCloneGenericModel({
    ...generic,
    kind: 'modelobase1-generic-diagnostics',
    betaApplied,
    fallbackApplied: rs.fallbackApplied === true || !betaApplied,
    writeBlocked: rs.writeBlocked !== false,
    // Safe invariants (inherited from the generic diagnostics).
    localOnly: true,
    persistenceReal: false,
    backendTouched: false,
    prismaTouched: false,
    runtimeBridgeTouched: false,
  });
}

export default createModeloBase1GenericDiagnosticsBridge;
