/**
 * @typedef {Object} CacheSetOptions
 * @property {number} [ttlMs] Time-to-live in milliseconds. Absent/undefined means no expiration.
 */

/**
 * Cache Engine (M21) — deterministic, isolated, runtime-local key/value
 * store with optional TTL. Never persists to disk/backend/localStorage,
 * never queries Prisma/MMM. One instance owns one isolated cache;
 * namespaces are prefix-isolated key spaces within that instance.
 * @typedef {Object} ICache
 * @property {<T>(key: string) => Promise<T | null>} get SSOT-literal (03-INTERFACES.md).
 * @property {<T>(key: string, value: T, ttlSeconds?: number) => Promise<void>} set SSOT-literal.
 * @property {(key: string) => Promise<void>} delete SSOT-literal.
 * @property {(pattern: string) => Promise<void>} invalidatePattern SSOT-literal.
 */

export {};
