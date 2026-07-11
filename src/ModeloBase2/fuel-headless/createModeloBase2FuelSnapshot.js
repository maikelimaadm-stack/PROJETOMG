import { isGenericModelPlainObject, safeCloneGenericModel } from '../../runtime/generic-model/index.js';
import { createModeloBase2OperationalSnapshotBridge } from '../operational-runtime/createModeloBase2OperationalSnapshotBridge.js';
import { FUEL_DOMAIN, FUEL_OPERATION_TYPE, MODELOBASE2_DEFAULT_CREATED_AT } from './modeloBase2FuelHeadlessConfig.js';

/**
 * Builds a FUEL SNAPSHOT descriptor wrapping a generic-kernel snapshot (via the
 * operational snapshot bridge). Carries the fuel domain/operationType. Local-only;
 * persistenceReal:false; checksum fail-closed. Pure aside from the in-memory store
 * the underlying bridge owns.
 *
 * @param {Object} [options]
 * @param {string} [options.moduleId]
 * @param {Object} [options.draft] Operational draft (or { draft, eventLog }).
 * @param {Object} [options.eventLog]
 * @param {Object} [options.bridge] Injectable snapshot bridge.
 * @param {() => string} [options.clock]
 * @returns {Object} fuel snapshot descriptor or an error-bearing descriptor
 */
export function createModeloBase2FuelSnapshot(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const moduleId = typeof o.moduleId === 'string' ? o.moduleId : 'combustivel';
  const clock = typeof o.clock === 'function' ? o.clock : () => MODELOBASE2_DEFAULT_CREATED_AT;
  const bridge = isGenericModelPlainObject(o.bridge) ? o.bridge : createModeloBase2OperationalSnapshotBridge({ moduleId, clock });
  const snapshot = bridge.createSnapshotFromSession({ draft: o.draft, eventLog: o.eventLog });

  if (!isGenericModelPlainObject(snapshot) || snapshot.kind !== 'generic-model-snapshot') {
    return { kind: 'modelobase2-fuel-snapshot-error', ok: false, domain: FUEL_DOMAIN, errors: ['fuel snapshot creation failed'] };
  }

  return safeCloneGenericModel({
    kind: 'modelobase2-fuel-snapshot',
    ok: true,
    domain: FUEL_DOMAIN,
    operationType: FUEL_OPERATION_TYPE,
    moduleId,
    snapshot,
    snapshotId: snapshot.snapshotId,
    checksum: snapshot.checksum,
    localOnly: true,
    sent: false,
    persistenceReal: false,
    diagnostics: { domain: FUEL_DOMAIN, persistenceReal: false, localOnly: true },
  });
}

/**
 * Validates a fuel snapshot (checksum fail-closed).
 * @param {Object} [options]
 * @param {Object} [options.fuelSnapshot]
 * @param {Object} [options.bridge]
 * @returns {{ valid: boolean, errors: string[], warnings: string[], blockers: string[], score: number, safeToUse: boolean }}
 */
export function validateModeloBase2FuelSnapshot(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const bridge = isGenericModelPlainObject(o.bridge) ? o.bridge : createModeloBase2OperationalSnapshotBridge({ moduleId: 'combustivel' });
  const inner = isGenericModelPlainObject(o.fuelSnapshot) ? o.fuelSnapshot.snapshot : null;
  return bridge.validateSnapshot(inner);
}

/**
 * Restores a session state from a fuel snapshot WITHOUT mutating the snapshot.
 * @param {Object} [options]
 * @param {Object} [options.fuelSnapshot]
 * @param {Object} [options.bridge]
 * @returns {{ ok: boolean, session: Object|null, errors: string[] }}
 */
export function restoreModeloBase2FuelSnapshot(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const bridge = isGenericModelPlainObject(o.bridge) ? o.bridge : createModeloBase2OperationalSnapshotBridge({ moduleId: 'combustivel' });
  const inner = isGenericModelPlainObject(o.fuelSnapshot) ? o.fuelSnapshot.snapshot : null;
  return bridge.restoreSessionFromSnapshot(inner);
}

/**
 * Round-trips a fuel draft snapshot through the in-memory adapter.
 * @param {Object} [options]
 * @param {string} [options.moduleId]
 * @param {Object} [options.draft]
 * @param {Object} [options.eventLog]
 * @param {Object} [options.bridge]
 * @returns {Object}
 */
export function roundtripModeloBase2FuelSnapshot(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const bridge = isGenericModelPlainObject(o.bridge) ? o.bridge : createModeloBase2OperationalSnapshotBridge({ moduleId: typeof o.moduleId === 'string' ? o.moduleId : 'combustivel' });
  return bridge.roundtripSnapshot({ draft: o.draft, eventLog: o.eventLog });
}

export default createModeloBase2FuelSnapshot;
