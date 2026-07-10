import {
  isPlainObject,
  redactSensitive,
  safeClone,
} from '../../shadow/pilots/tableFormProjection.js';
import { BLOCKED_WRITE_OPERATIONS } from '../empresas-readonly/empresasReadOnlyWriteGuard.js';
import { EmpresasReadSlotError } from './errors.js';

/**
 * Builds the deterministic, plain READ-ONLY SLOT PAYLOAD — the serializable
 * package a future read slot would receive. Built from the runtime v2 read-only
 * view model + parity/diagnostics. It contains NO function, NO React element, NO
 * handler, NO executable write action — the write guard is included only as a
 * plain SUMMARY. Sensitive keys are masked, the result is a safe deep copy. Same
 * input → same output (the timestamp source is a stable injectable value).
 *
 * @param {Object} [options]
 * @param {import('../../types/empresas-readonly-runtime-v2.js').EmpresasReadOnlyViewModel} [options.viewModel]
 * @param {Record<string, unknown>} [options.diagnostics]
 * @param {{ parityStatus?: string, totalDifferences?: number, blockingCount?: number, criticalCount?: number }} [options.parity]
 * @param {string} [options.slotId]
 * @param {string} [options.generatedAtSource] Stable, injectable value (never a live clock).
 * @param {Record<string, unknown>} [options.flags]
 * @returns {import('../../types/empresas-runtime-bridge-read-slot-candidate.js').EmpresasReadSlotPayload}
 */
export function createEmpresasRuntimeBridgeReadSlotPayload(options = {}) {
  if (!isPlainObject(options)) {
    throw new EmpresasReadSlotError('MAK-L3-EMP-READ-SLOT-003', 'createEmpresasRuntimeBridgeReadSlotPayload() options must be a plain object');
  }
  const vm = isPlainObject(options.viewModel) ? options.viewModel : {};
  const t = isPlainObject(vm.table) ? vm.table : { columns: [], visibleColumns: [], rows: [], rowCount: 0 };
  const f = isPlainObject(vm.form) ? vm.form : { fields: [], visibleFields: [], permissionsApplied: false };
  const parity = isPlainObject(options.parity) ? options.parity : {};
  const slotId = typeof options.slotId === 'string' && options.slotId.trim() ? options.slotId.trim() : 'empresas-runtime-bridge-read-slot';
  const generatedAtSource = typeof options.generatedAtSource === 'string' && options.generatedAtSource.trim()
    ? options.generatedAtSource.trim()
    : 'deterministic-source';

  const payload = {
    kind: 'empresas-runtime-bridge-read-slot-payload',
    payloadId: 'empresas-runtime-bridge-read-slot-payload-v1',
    slotId,
    moduleId: 'empresas',
    mode: 'read_only',
    source: 'runtime-v2',
    generatedAtSource,
    table: {
      columns: Array.isArray(t.columns) ? t.columns : [],
      visibleColumns: Array.isArray(t.visibleColumns) ? t.visibleColumns : [],
      rows: Array.isArray(t.rows) ? t.rows : [],
      rowCount: typeof t.rowCount === 'number' ? t.rowCount : (Array.isArray(t.rows) ? t.rows.length : 0),
    },
    form: {
      fields: Array.isArray(f.fields) ? f.fields : [],
      visibleFields: Array.isArray(f.visibleFields) ? f.visibleFields : [],
      permissionsApplied: Boolean(f.permissionsApplied),
    },
    diagnostics: isPlainObject(options.diagnostics) ? options.diagnostics : (isPlainObject(vm.diagnostics) ? vm.diagnostics : {}),
    // Write guard as a PLAIN summary — never the live guard (no function in the payload).
    writeGuard: {
      readOnly: true,
      writeBlocked: true,
      blockedOperations: [...BLOCKED_WRITE_OPERATIONS],
      blockedOperationCount: BLOCKED_WRITE_OPERATIONS.length,
    },
    parity: {
      parityStatus: typeof parity.parityStatus === 'string' ? parity.parityStatus : 'unknown',
      totalDifferences: typeof parity.totalDifferences === 'number' ? parity.totalDifferences : 0,
      blockingCount: typeof parity.blockingCount === 'number' ? parity.blockingCount : 0,
      criticalCount: typeof parity.criticalCount === 'number' ? parity.criticalCount : 0,
    },
    flags: isPlainObject(options.flags) ? options.flags : {},
    safety: {
      readOnly: true,
      noSideEffects: true,
      noBackend: true,
      noPrismaMmm: true,
      noStorage: true,
      noFunctions: true,
      noReactElements: true,
      usesRealData: false,
    },
    rollback: { strategy: 'flag-off reversal', featureFlagDefault: 'off', destructive: false },
  };
  // Mask sensitive keys then deep-copy — functions/elements cannot survive JSON clone anyway.
  return /** @type {any} */ (safeClone(redactSensitive(payload)));
}
