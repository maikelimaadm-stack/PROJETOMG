import { TransactionError } from './errors.js';

/** Hard caps — guard against pathological transaction/participant usage. */
const MAX_ACTIVE_TRANSACTIONS = 50;
const MAX_PARTICIPANTS = 50;
const MAX_METADATA_KEYS = 100;
const MAX_METADATA_DEPTH = 8;
const MAX_TRANSACTION_ID_LENGTH = 100;

/** Never allowed as a participant/transaction name, or nested inside metadata — prototype-pollution guard. */
const BLOCKED_NAMES = new Set(['__proto__', 'constructor', 'prototype']);

/** Generic codes for business-outcome failures (never thrown — always returned in a `TransactionResult`). */
const PREPARE_FAILED_CODE = 'MAK-L3-TRANSACTION-PREPARE-FAILED';
const COMMIT_FAILED_CODE = 'MAK-L3-TRANSACTION-COMMIT-FAILED';
const RUN_FAILED_CODE = 'MAK-L3-TRANSACTION-RUN-FAILED';

/** @param {unknown} value */
function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date);
}

/** @param {unknown} value */
function deepClone(value) {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}

/**
 * @param {unknown} value
 * @param {number} depth
 * @returns {number} total key count
 */
function countKeysGuarded(value, depth) {
  if (depth > MAX_METADATA_DEPTH) {
    throw new TransactionError('MAK-L3-TRANSACTION-006', `Transaction metadata exceeds maximum depth (${MAX_METADATA_DEPTH})`);
  }
  if (Array.isArray(value)) {
    let count = 0;
    for (const item of value) count += countKeysGuarded(item, depth + 1);
    return count;
  }
  if (isPlainObject(value)) {
    let count = 0;
    for (const key of Object.keys(value)) {
      if (BLOCKED_NAMES.has(key)) {
        throw new TransactionError('MAK-L3-TRANSACTION-006', `Transaction metadata contains a forbidden key: "${key}"`);
      }
      count += 1;
      count += countKeysGuarded(/** @type {Record<string, unknown>} */ (value)[key], depth + 1);
    }
    return count;
  }
  return 0;
}

/** @param {unknown} metadata */
function validateMetadata(metadata) {
  if (metadata === undefined) return;
  if (!isPlainObject(metadata)) {
    throw new TransactionError('MAK-L3-TRANSACTION-006', 'Transaction metadata must be a plain object');
  }
  const totalKeys = countKeysGuarded(metadata, 0);
  if (totalKeys > MAX_METADATA_KEYS) {
    throw new TransactionError('MAK-L3-TRANSACTION-006', `Transaction metadata exceeds maximum key count (${totalKeys} > ${MAX_METADATA_KEYS})`);
  }
}

/** @param {unknown} transactionId */
function validateTransactionId(transactionId) {
  if (typeof transactionId !== 'string' || transactionId.length === 0) {
    throw new TransactionError('MAK-L3-TRANSACTION-006', 'Transaction id must be a non-empty string');
  }
  if (transactionId.length > MAX_TRANSACTION_ID_LENGTH) {
    throw new TransactionError('MAK-L3-TRANSACTION-006', `Transaction id exceeds maximum length (${transactionId.length} > ${MAX_TRANSACTION_ID_LENGTH})`);
  }
  if (BLOCKED_NAMES.has(transactionId)) {
    throw new TransactionError('MAK-L3-TRANSACTION-006', `Transaction id is forbidden: "${transactionId}"`);
  }
}

/** @param {unknown} name */
function validateParticipantName(name) {
  if (typeof name !== 'string' || name.length === 0) {
    throw new TransactionError('MAK-L3-TRANSACTION-002', 'Participant name must be a non-empty string');
  }
  if (BLOCKED_NAMES.has(name)) {
    throw new TransactionError('MAK-L3-TRANSACTION-002', `Participant name is forbidden: "${name}"`);
  }
}

const PARTICIPANT_METHODS = ['prepare', 'commit', 'rollback', 'snapshot', 'restore'];

/** @param {unknown} participant */
function validateParticipantShape(participant) {
  if (!isPlainObject(participant) && typeof participant !== 'object') {
    throw new TransactionError('MAK-L3-TRANSACTION-003', 'Participant must be an object');
  }
  if (!participant) {
    throw new TransactionError('MAK-L3-TRANSACTION-003', 'Participant must be an object');
  }
  for (const method of PARTICIPANT_METHODS) {
    const value = /** @type {Record<string, unknown>} */ (participant)[method];
    if (value !== undefined && typeof value !== 'function') {
      throw new TransactionError('MAK-L3-TRANSACTION-003', `Participant "${method}" must be a function when present`);
    }
  }
}

/**
 * Transaction Engine (M23) — runtime-local, deterministic unit-of-work
 * coordinator. Never opens a real database/Prisma transaction, never
 * persists to disk/backend/localStorage/sessionStorage/IndexedDB, never
 * uses a WebSocket/BroadcastChannel/worker. Coordinates host-registered
 * participants through a two-phase begin → prepare → commit (or
 * rollback) flow, entirely in memory.
 * @implements {import('../../types/transaction.js').ITransactionManager}
 */
export class TransactionEngine {
  /**
   * @param {Object} [options]
   * @param {() => number} [options.clock] Injectable clock (ms since epoch) — deterministic timing in tests.
   * @param {number} [options.maxActiveDurationMs] If set, transactions older than this are reported as `expired` (never force-rolled-back by a timer).
   */
  constructor(options = {}) {
    const { clock = () => Date.now(), maxActiveDurationMs } = options;
    if (typeof clock !== 'function') {
      throw new TransactionError('MAK-L3-TRANSACTION-001', 'TransactionEngine "clock" option must be a function');
    }
    this._clock = clock;
    this._maxActiveDurationMs = maxActiveDurationMs;
    /** @type {Map<string, import('../../types/transaction.js').TransactionParticipant>} */
    this._participants = new Map();
    /** @type {Map<string, Object>} */
    this._transactions = new Map();
    this._nextId = 1;
  }

  /**
   * @param {string} name
   * @param {import('../../types/transaction.js').TransactionParticipant} participant
   */
  registerParticipant(name, participant) {
    validateParticipantName(name);
    validateParticipantShape(participant);
    if (!this._participants.has(name) && this._participants.size >= MAX_PARTICIPANTS) {
      throw new TransactionError('MAK-L3-TRANSACTION-002', `Too many participants registered (> ${MAX_PARTICIPANTS})`);
    }
    this._participants.set(name, participant);
  }

  /** @param {string} name */
  unregisterParticipant(name) {
    validateParticipantName(name);
    this._participants.delete(name);
  }

  /**
   * Creates a local transaction in `active` status.
   * @param {import('../../types/transaction.js').BeginOptions} [options]
   * @returns {import('../../types/transaction.js').TransactionHandle}
   */
  begin(options = {}) {
    validateMetadata(options.metadata);

    const participantNames = options.participants ?? [...this._participants.keys()];
    for (const name of participantNames) {
      if (!this._participants.has(name)) {
        throw new TransactionError('MAK-L3-TRANSACTION-003', `Unknown participant referenced: "${name}"`);
      }
    }

    let activeCount = 0;
    for (const record of this._transactions.values()) {
      if (record.status === 'active') activeCount += 1;
    }
    if (activeCount >= MAX_ACTIVE_TRANSACTIONS) {
      throw new TransactionError('MAK-L3-TRANSACTION-007', `Too many active transactions (> ${MAX_ACTIVE_TRANSACTIONS})`);
    }

    let id = options.transactionId;
    if (id !== undefined) {
      validateTransactionId(id);
      if (this._transactions.has(id)) {
        throw new TransactionError('MAK-L3-TRANSACTION-006', `Transaction id already in use: "${id}"`);
      }
    } else {
      id = `tx-${this._nextId++}`;
    }

    const now = this._clock();
    const record = {
      id,
      status: 'active',
      participants: [...participantNames],
      metadata: deepClone(options.metadata ?? {}),
      createdAt: now,
      updatedAt: now,
    };
    this._transactions.set(id, record);
    return this._toHandle(record);
  }

  /**
   * Two-phase commit over the transaction's participants, in registration
   * order. If any `prepare` throws, every already-prepared participant is
   * rolled back (reverse order) and a controlled failure is returned. If
   * every `prepare` succeeds but a `commit` throws, already-committed
   * participants are compensated via their own `rollback` (best-effort)
   * and a controlled failure is returned. Never throws for these expected
   * outcomes — only for structural conditions (unknown/finalized
   * transaction).
   * @param {string} transactionId
   * @returns {Promise<import('../../types/transaction.js').TransactionResult>}
   */
  async commit(transactionId) {
    const record = this._getActiveOrThrow(transactionId);

    const prepared = [];
    for (const name of record.participants) {
      const participant = this._participants.get(name);
      if (!participant?.prepare) {
        prepared.push(name);
        continue;
      }
      try {
        await participant.prepare(this._toHandle(record));
        prepared.push(name);
      } catch (err) {
        const rollbackResults = await this._rollbackParticipants([...prepared].reverse(), record);
        record.status = 'rolledback';
        record.updatedAt = this._clock();
        return {
          success: false,
          transactionId,
          error: { code: PREPARE_FAILED_CODE, message: `Participant "${name}" failed to prepare: ${errorMessage(err)}` },
          participantResults: rollbackResults,
        };
      }
    }

    const committed = [];
    for (const name of record.participants) {
      const participant = this._participants.get(name);
      try {
        if (participant?.commit) await participant.commit(this._toHandle(record));
        committed.push({ name, success: true });
      } catch (err) {
        const compensation = await this._rollbackParticipants(committed.map((c) => c.name).reverse(), record);
        record.status = 'rolledback';
        record.updatedAt = this._clock();
        return {
          success: false,
          transactionId,
          error: { code: COMMIT_FAILED_CODE, message: `Participant "${name}" failed to commit: ${errorMessage(err)}` },
          participantResults: [...committed, { name, success: false, error: { message: errorMessage(err) } }, ...compensation],
        };
      }
    }

    record.status = 'committed';
    record.updatedAt = this._clock();
    return { success: true, transactionId, participantResults: committed };
  }

  /**
   * Rolls back a transaction. Idempotent when the transaction is already
   * `rolledback` (documented, per rule: "não pode ser rollbackada
   * novamente, salvo se contrato permitir idempotência"). Throws for an
   * unknown transaction or one already `committed` (cannot undo a commit).
   * @param {string} transactionId
   * @returns {Promise<import('../../types/transaction.js').TransactionResult>}
   */
  async rollback(transactionId) {
    const record = this._transactions.get(transactionId);
    if (!record) {
      throw new TransactionError('MAK-L3-TRANSACTION-004', `Unknown transaction: ${transactionId}`);
    }
    if (record.status === 'committed') {
      throw new TransactionError('MAK-L3-TRANSACTION-005', `Transaction "${transactionId}" is already committed`);
    }
    if (record.status === 'rolledback') {
      return { success: true, transactionId, participantResults: [], idempotent: true };
    }

    const results = await this._rollbackParticipants([...record.participants].reverse(), record);
    record.status = 'rolledback';
    record.updatedAt = this._clock();
    return { success: true, transactionId, participantResults: results };
  }

  /**
   * Begins a transaction, runs `fn(tx)`, commits on success, rolls back on
   * failure — never leaves an active transaction behind. Never throws for
   * `fn`'s own errors (captured in the returned result); only structural
   * `begin()` failures (e.g. limits exceeded) propagate synchronously.
   * @template T
   * @param {(tx: import('../../types/transaction.js').TransactionHandle) => Promise<T>} fn
   * @param {import('../../types/transaction.js').TxOptions} [options]
   * @returns {Promise<import('../../types/transaction.js').TransactionResult>}
   */
  async run(fn, options) {
    const tx = this.begin(options);
    let value;
    try {
      value = await fn(tx);
    } catch (err) {
      const rollbackResult = await this.rollback(tx.id);
      return {
        success: false,
        transactionId: tx.id,
        error: { code: RUN_FAILED_CODE, message: errorMessage(err) },
        participantResults: rollbackResult.participantResults,
      };
    }
    const commitResult = await this.commit(tx.id);
    return { ...commitResult, data: value };
  }

  /**
   * SSOT-literal (`ITransactionManager.runInTransaction`) — thin alias of
   * `run()` that throws on failure (matching `Promise<T>` with no
   * embedded error slot), consistent with `04-MODULE-CONTRACTS.md`'s note
   * that FE implementations may stub this BE-only interface.
   * @template T
   * @param {() => Promise<T>} fn
   * @param {import('../../types/transaction.js').TxOptions} [options]
   * @returns {Promise<T>}
   */
  async runInTransaction(fn, options) {
    const result = await this.run(() => fn(), options);
    if (!result.success) {
      throw new TransactionError(RUN_FAILED_CODE, result.error?.message ?? 'Transaction failed');
    }
    return /** @type {T} */ (result.data);
  }

  /** @param {string} transactionId */
  get(transactionId) {
    const record = this._transactions.get(transactionId);
    return record ? this._toHandle(record) : null;
  }

  list() {
    return [...this._transactions.values()].map((record) => this._toHandle(record));
  }

  /** Deep, independent snapshot of every tracked transaction. */
  snapshot() {
    return [...this._transactions.values()].map((record) => this._toHandle(record));
  }

  /** Clears all tracked transactions (testing/reset utility — participants are not notified). */
  clear() {
    this._transactions.clear();
  }

  /** @param {Object} record */
  _toHandle(record) {
    const expired =
      this._maxActiveDurationMs != null && record.status === 'active' && this._clock() - record.createdAt > this._maxActiveDurationMs;
    return deepClone({
      id: record.id,
      status: record.status,
      participants: record.participants,
      metadata: record.metadata,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      expired,
    });
  }

  /** @param {string} transactionId */
  _getActiveOrThrow(transactionId) {
    const record = this._transactions.get(transactionId);
    if (!record) {
      throw new TransactionError('MAK-L3-TRANSACTION-004', `Unknown transaction: ${transactionId}`);
    }
    if (record.status !== 'active') {
      throw new TransactionError('MAK-L3-TRANSACTION-005', `Transaction "${transactionId}" is already finalized (${record.status})`);
    }
    return record;
  }

  /**
   * @param {string[]} names
   * @param {Object} record
   */
  async _rollbackParticipants(names, record) {
    const results = [];
    for (const name of names) {
      const participant = this._participants.get(name);
      try {
        if (participant?.rollback) await participant.rollback(this._toHandle(record));
        results.push({ name, success: true });
      } catch (err) {
        results.push({ name, success: false, error: { message: errorMessage(err) } });
      }
    }
    return results;
  }
}

/** @param {unknown} err */
function errorMessage(err) {
  return err instanceof Error ? err.message : 'Transaction operation failed';
}

/**
 * @param {Object} [options]
 * @param {() => number} [options.clock]
 * @param {number} [options.maxActiveDurationMs]
 * @returns {TransactionEngine}
 */
export function createTransactionEngine(options) {
  return new TransactionEngine(options);
}

export { TransactionError };
