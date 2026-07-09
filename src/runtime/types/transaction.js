/**
 * @typedef {Object} TransactionParticipant
 * @property {(tx: TransactionHandle) => Promise<void>} [prepare]
 * @property {(tx: TransactionHandle) => Promise<void>} [commit]
 * @property {(tx: TransactionHandle) => Promise<void>} [rollback]
 * @property {() => unknown} [snapshot]
 * @property {(snapshot: unknown) => void} [restore]
 */

/**
 * @typedef {Object} TransactionHandle
 * @property {string} id
 * @property {'active'|'committed'|'rolledback'} status
 * @property {string[]} participants
 * @property {Record<string, unknown>} metadata
 * @property {number} createdAt
 * @property {number} updatedAt
 * @property {boolean} expired
 */

/**
 * @typedef {Object} BeginOptions
 * @property {string} [transactionId]
 * @property {string[]} [participants] Defaults to every currently registered participant.
 * @property {Record<string, unknown>} [metadata]
 */

/**
 * @typedef {Object} ParticipantOutcome
 * @property {string} name
 * @property {boolean} success
 * @property {{message: string}} [error]
 */

/**
 * @typedef {Object} TransactionResult
 * @property {boolean} success
 * @property {string} transactionId
 * @property {unknown} [data]
 * @property {{code: string, message: string}} [error]
 * @property {ParticipantOutcome[]} [participantResults]
 * @property {boolean} [idempotent]
 */

/**
 * @typedef {Object} TxOptions
 * @property {string} [transactionId]
 * @property {string[]} [participants]
 * @property {Record<string, unknown>} [metadata]
 */

/**
 * Transaction Engine (M23) — runtime-local unit-of-work coordinator. Never
 * opens a real database/Prisma transaction, never persists, never calls
 * the backend. Coordinates host-registered participants (each optionally
 * exposing prepare/commit/rollback/snapshot/restore) through a
 * deterministic two-phase begin → prepare → commit (or rollback) flow.
 * @typedef {Object} ITransactionManager
 * @property {<T>(fn: () => Promise<T>, options?: TxOptions) => Promise<T>} runInTransaction SSOT-literal (03-INTERFACES.md).
 */

export {};
