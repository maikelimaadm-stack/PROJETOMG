import { isGenericModelPlainObject, safeCloneGenericModel } from '../../runtime/generic-model/index.js';
import { computeFuelSummary } from './createModeloBase2FuelReadState.js';
import {
  MODELOBASE2_MODEL_ID,
  MODELOBASE2_MODEL_TYPE,
  FUEL_DOMAIN,
} from './modeloBase2FuelHeadlessConfig.js';

/**
 * Builds a FUEL DRAFT projection (headless) from an operational draft (or fresh).
 * Overlays the fuel summary (totalLiters, machinesCount, …). Pure; never mutates
 * input; returns safe copies.
 *
 * @param {Object} [options]
 * @param {string} [options.moduleId]
 * @param {Object} [options.operationalDraft] The ModeloBase2 operational draft.
 * @param {string} [options.status]
 * @returns {Object} fuel draft
 */
export function createModeloBase2FuelDraft(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const opDraft = isGenericModelPlainObject(o.operationalDraft) ? o.operationalDraft : {};
  const moduleId = typeof o.moduleId === 'string' ? o.moduleId : (typeof opDraft.moduleId === 'string' ? opDraft.moduleId : 'combustivel');
  const entries = Array.isArray(opDraft.entries) ? opDraft.entries : [];
  const events = Array.isArray(opDraft.events) ? opDraft.events : [];
  const status = typeof o.status === 'string' ? o.status : (typeof opDraft.status === 'string' ? opDraft.status : 'draft');

  return safeCloneGenericModel({
    kind: 'modelobase2-fuel-draft',
    draftId: typeof opDraft.draftId === 'string' ? `fuel-${opDraft.draftId}` : `fuel-draft-${moduleId}`,
    domain: FUEL_DOMAIN,
    modelId: MODELOBASE2_MODEL_ID,
    moduleId,
    modelType: MODELOBASE2_MODEL_TYPE,
    status,
    entries,
    events,
    summary: computeFuelSummary(entries),
    localOnly: true,
    sent: false,
    persistenceReal: false,
    backendTouched: false,
    prismaTouched: false,
    runtimeBridgeTouched: false,
    diagnostics: { domain: FUEL_DOMAIN, entriesCount: entries.length, eventsCount: events.length },
    version: isGenericModelPlainObject(opDraft.version) ? opDraft.version : null,
  });
}

export default createModeloBase2FuelDraft;
