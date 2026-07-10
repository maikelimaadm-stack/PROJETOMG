import { isPlainObject, findUnsafeContent, safeClone } from '../../safety.js';
import { persistenceError } from './errors.js';
import {
  createModeloBase1LocalDraftVersion,
  MODELOBASE1_LOCAL_DRAFT_SCHEMA_VERSION,
} from './createModeloBase1LocalDraftVersion.js';

const SENSITIVE_KEY_PATTERN = /password|token|secret|api[-_]?key|authorization|cookie|credential/i;
const SENSITIVE_MASK = '[REDACTED]';
export const MODELOBASE1_LOCAL_DRAFT_SOURCE = 'modeloBase1-local-write';

/**
 * Deterministic, dependency-free checksum (FNV-1a → 8-hex). Stable across runs
 * for the same canonical JSON. Not cryptographic — a lightweight integrity hash.
 * @param {unknown} value
 * @returns {string}
 */
export function computeModeloBase1DraftChecksum(value) {
  const json = JSON.stringify(value ?? null);
  let hash = 0x811c9dc5;
  for (let i = 0; i < json.length; i += 1) {
    hash ^= json.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `fnv1a-${hash.toString(16).padStart(8, '0')}`;
}

/** Recursively mask sensitive values in a plain structure (safe copy in). */
function maskSensitive(value) {
  if (Array.isArray(value)) return value.map(maskSensitive);
  if (isPlainObject(value)) {
    /** @type {Record<string, unknown>} */
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = SENSITIVE_KEY_PATTERN.test(k) && typeof v !== 'object' ? SENSITIVE_MASK : maskSensitive(v);
    }
    return out;
  }
  return value;
}

/**
 * Serializes a ModeloBase1 local draft into a PLAIN, SAFE snapshot suitable for
 * (future) persistence. It strips functions/handlers/React elements (they make
 * the draft unsafe), masks sensitive values, blocks prototype pollution, and
 * stamps version/schemaVersion/source/localOnly/persistenceReal + a deterministic
 * checksum. Pure; never mutates the input; never persists anything.
 *
 * @param {Object} options
 * @param {string} [options.moduleId]
 * @param {Object} [options.localDraft] The controller's local draft (has table/form).
 * @param {Array<Object>} [options.localRows] Rows (alternative to localDraft.table.rows).
 * @param {Object} [options.formState]
 * @param {number} [options.draftVersion]
 * @param {() => string} [options.clock]
 * @returns {Object} snapshot
 */
export function serializeModeloBase1LocalDraft(options = {}) {
  if (!isPlainObject(options)) {
    throw persistenceError('MAK-MB1-LP-001', 'serializeModeloBase1LocalDraft() options must be a plain object');
  }
  const draft = isPlainObject(options.localDraft) ? options.localDraft : null;
  const moduleId = typeof options.moduleId === 'string'
    ? options.moduleId
    : (draft && typeof draft.moduleId === 'string' ? draft.moduleId : 'unknown');

  const table = draft && isPlainObject(draft.table) ? draft.table : null;
  const rawRows = Array.isArray(options.localRows)
    ? options.localRows
    : (table && Array.isArray(table.rows) ? table.rows : []);
  const rawForm = isPlainObject(options.formState)
    ? options.formState
    : (draft && isPlainObject(draft.form) ? draft.form : null);

  // Reject unsafe content in the source (functions/handlers/React/pollution).
  const unsafe = findUnsafeContent({ rows: rawRows, form: rawForm });
  if (unsafe) {
    throw persistenceError('MAK-MB1-LP-003', `cannot serialize unsafe draft: ${unsafe}`);
  }

  const rows = /** @type {any} */ (maskSensitive(safeClone(rawRows) ?? []));
  const form = rawForm ? /** @type {any} */ (maskSensitive(safeClone(rawForm))) : null;
  const version = createModeloBase1LocalDraftVersion({ moduleId, draftVersion: options.draftVersion, clock: options.clock });

  const content = {
    moduleId,
    version: version.versionId,
    schemaVersion: MODELOBASE1_LOCAL_DRAFT_SCHEMA_VERSION,
    source: MODELOBASE1_LOCAL_DRAFT_SOURCE,
    localOnly: true,
    persistenceReal: false,
    rows,
    form,
  };
  const checksum = computeModeloBase1DraftChecksum(content);

  return safeClone({
    kind: 'modelobase1-local-draft-snapshot',
    snapshotId: `snap-${moduleId}-${version.schemaVersion}-${version.draftVersion}-${checksum}`,
    ...content,
    metadata: {
      createdAt: version.createdAt,
      rowCount: rows.length,
      origin: 'serializeModeloBase1LocalDraft',
      draftVersion: version.draftVersion,
    },
    diagnostics: {
      backendTouched: false,
      prismaTouched: false,
      runtimeBridgeTouched: false,
      persistenceReal: false,
      masked: true,
    },
    checksum,
  });
}

export default serializeModeloBase1LocalDraft;
