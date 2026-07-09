import { CacheError } from './errors.js';

/** Hard caps — guard against pathological cache usage. */
const MAX_CACHE_ENTRIES = 1000;
const MAX_KEY_LENGTH = 200;
const MAX_NAMESPACE_LENGTH = 100;
const MAX_VALUE_DEPTH = 8;

const DEFAULT_NAMESPACE = 'default';

/** Never allowed as a key/namespace, or nested inside a stored value — prototype-pollution guard. */
const BLOCKED_NAMES = new Set(['__proto__', 'constructor', 'prototype']);

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
 */
function validateValueShape(value, depth) {
  if (depth > MAX_VALUE_DEPTH) {
    throw new CacheError('MAK-L3-CACHE-004', `Cache value exceeds maximum depth (${MAX_VALUE_DEPTH})`);
  }
  if (Array.isArray(value)) {
    for (const item of value) validateValueShape(item, depth + 1);
    return;
  }
  if (isPlainObject(value)) {
    for (const key of Object.keys(value)) {
      if (BLOCKED_NAMES.has(key)) {
        throw new CacheError('MAK-L3-CACHE-004', `Cache value contains a forbidden key: "${key}"`);
      }
      validateValueShape(/** @type {Record<string, unknown>} */ (value)[key], depth + 1);
    }
  }
}

/** @param {unknown} key */
function validateKey(key) {
  if (typeof key !== 'string' || key.length === 0) {
    throw new CacheError('MAK-L3-CACHE-002', 'Cache key must be a non-empty string');
  }
  if (key.length > MAX_KEY_LENGTH) {
    throw new CacheError('MAK-L3-CACHE-002', `Cache key exceeds maximum length (${key.length} > ${MAX_KEY_LENGTH})`);
  }
  if (BLOCKED_NAMES.has(key)) {
    throw new CacheError('MAK-L3-CACHE-002', `Cache key is forbidden: "${key}"`);
  }
}

/** @param {unknown} namespace */
function validateNamespace(namespace) {
  if (typeof namespace !== 'string' || namespace.length === 0) {
    throw new CacheError('MAK-L3-CACHE-003', 'Cache namespace must be a non-empty string');
  }
  if (namespace.length > MAX_NAMESPACE_LENGTH) {
    throw new CacheError('MAK-L3-CACHE-003', `Cache namespace exceeds maximum length (${namespace.length} > ${MAX_NAMESPACE_LENGTH})`);
  }
  if (BLOCKED_NAMES.has(namespace)) {
    throw new CacheError('MAK-L3-CACHE-003', `Cache namespace is forbidden: "${namespace}"`);
  }
}

/** @param {string} namespace @param {string} key */
function entryKey(namespace, key) {
  return `${namespace}::${key}`;
}

/**
 * Cache Engine (M21) — deterministic, isolated, runtime-local key/value
 * store with optional TTL. Never persists to disk/backend/localStorage/
 * sessionStorage/IndexedDB, never queries Prisma/MMM. Each instance owns
 * a private entry map; namespaces are prefix-isolated key spaces within
 * that instance, accessible via `namespace()`.
 * @implements {import('../../types/cache.js').ICache}
 */
export class CacheEngine {
  /**
   * @param {Object} [options]
   * @param {() => number} [options.clock] Injectable clock (ms since epoch) — deterministic TTL in tests.
   */
  constructor(options = {}) {
    const { clock = () => Date.now() } = options;
    if (typeof clock !== 'function') {
      throw new CacheError('MAK-L3-CACHE-001', 'CacheEngine "clock" option must be a function');
    }
    this._clock = clock;
    /** @type {Map<string, { value: unknown, expiresAt: number | null }>} */
    this._entries = new Map();
  }

  /**
   * SSOT-literal (`ICache.get`) — reads a value from the default namespace.
   * Expired entries are treated as absent. Never mutates state.
   * @template T
   * @param {string} key
   * @returns {Promise<T | null>}
   */
  async get(key) {
    return this._getIn(DEFAULT_NAMESPACE, key);
  }

  /**
   * SSOT-literal (`ICache.set`) — writes a value into the default
   * namespace. Accepts either the SSOT positional `ttlSeconds` or an
   * options object `{ ttlMs }`.
   * @template T
   * @param {string} key
   * @param {T} value
   * @param {number | import('../../types/cache.js').CacheSetOptions} [options]
   * @returns {Promise<void>}
   */
  async set(key, value, options) {
    return this._setIn(DEFAULT_NAMESPACE, key, value, options);
  }

  /** @param {string} key */
  async has(key) {
    return this._hasIn(DEFAULT_NAMESPACE, key);
  }

  /** SSOT-literal (`ICache.delete`). @param {string} key */
  async delete(key) {
    return this._deleteIn(DEFAULT_NAMESPACE, key);
  }

  /**
   * Clears the whole cache (all namespaces) when called without an
   * argument, or only the given namespace.
   * @param {string} [namespaceName]
   */
  async clear(namespaceName) {
    if (namespaceName === undefined) {
      this._entries.clear();
      return;
    }
    validateNamespace(namespaceName);
    const prefix = `${namespaceName}::`;
    for (const key of [...this._entries.keys()]) {
      if (key.startsWith(prefix)) this._entries.delete(key);
    }
  }

  /**
   * SSOT-literal (`ICache.invalidatePattern`) — deletes every non-expired
   * key (in every namespace) whose key portion matches a simple glob
   * (`*` wildcard). No regex compilation from untrusted input.
   * @param {string} pattern
   */
  async invalidatePattern(pattern) {
    if (typeof pattern !== 'string' || pattern.length === 0) {
      throw new CacheError('MAK-L3-CACHE-002', 'invalidatePattern() requires a non-empty string pattern');
    }
    const regex = new RegExp(`^${pattern.split('*').map(escapeRegExp).join('.*')}$`);
    for (const [fullKey] of this._entries) {
      const key = fullKey.slice(fullKey.indexOf('::') + 2);
      if (regex.test(key)) this._entries.delete(fullKey);
    }
  }

  /**
   * Returns a deep, independent snapshot of every non-expired entry,
   * grouped by namespace: `{ [namespace]: { [key]: value } }`.
   */
  snapshot() {
    const now = this._clock();
    /** @type {Record<string, Record<string, unknown>>} */
    const out = {};
    for (const [fullKey, entry] of this._entries) {
      if (entry.expiresAt !== null && entry.expiresAt <= now) continue;
      const separatorIndex = fullKey.indexOf('::');
      const namespaceName = fullKey.slice(0, separatorIndex);
      const key = fullKey.slice(separatorIndex + 2);
      if (!out[namespaceName]) out[namespaceName] = {};
      out[namespaceName][key] = deepClone(entry.value);
    }
    return out;
  }

  /**
   * Counts non-expired entries — in the given namespace, or across the
   * whole cache when omitted.
   * @param {string} [namespaceName]
   */
  size(namespaceName) {
    const now = this._clock();
    let count = 0;
    const prefix = namespaceName !== undefined ? `${namespaceName}::` : null;
    for (const [fullKey, entry] of this._entries) {
      if (prefix && !fullKey.startsWith(prefix)) continue;
      if (entry.expiresAt !== null && entry.expiresAt <= now) continue;
      count += 1;
    }
    return count;
  }

  /**
   * Returns an ergonomic, namespace-bound accessor sharing the same
   * underlying entry map — isolates keys from every other namespace.
   * @param {string} name
   */
  namespace(name) {
    validateNamespace(name);
    return {
      get: (key) => this._getIn(name, key),
      set: (key, value, options) => this._setIn(name, key, value, options),
      has: (key) => this._hasIn(name, key),
      delete: (key) => this._deleteIn(name, key),
      clear: () => this.clear(name),
      size: () => this.size(name),
    };
  }

  /**
   * @param {string} namespaceName
   * @param {string} key
   */
  async _getIn(namespaceName, key) {
    validateNamespace(namespaceName);
    validateKey(key);
    const entry = this._entries.get(entryKey(namespaceName, key));
    if (!entry) return null;
    if (entry.expiresAt !== null && entry.expiresAt <= this._clock()) {
      this._entries.delete(entryKey(namespaceName, key));
      return null;
    }
    return deepClone(entry.value);
  }

  /**
   * @param {string} namespaceName
   * @param {string} key
   * @param {unknown} value
   * @param {number | import('../../types/cache.js').CacheSetOptions} [options]
   */
  async _setIn(namespaceName, key, value, options) {
    validateNamespace(namespaceName);
    validateKey(key);
    validateValueShape(value, 0);

    const fullKey = entryKey(namespaceName, key);
    if (!this._entries.has(fullKey) && this._entries.size >= MAX_CACHE_ENTRIES) {
      throw new CacheError('MAK-L3-CACHE-005', `Cache exceeds maximum entry count (> ${MAX_CACHE_ENTRIES})`);
    }

    let ttlMs;
    if (typeof options === 'number') {
      ttlMs = options * 1000; // SSOT-literal: positional ttlSeconds
    } else if (options && typeof options === 'object') {
      ttlMs = typeof options.ttlMs === 'number' ? options.ttlMs : undefined;
    }

    this._entries.set(fullKey, {
      value: deepClone(value),
      expiresAt: typeof ttlMs === 'number' ? this._clock() + ttlMs : null,
    });
  }

  /** @param {string} namespaceName @param {string} key */
  async _hasIn(namespaceName, key) {
    return (await this._getIn(namespaceName, key)) !== null;
  }

  /** @param {string} namespaceName @param {string} key */
  async _deleteIn(namespaceName, key) {
    validateNamespace(namespaceName);
    validateKey(key);
    this._entries.delete(entryKey(namespaceName, key));
  }
}

/** @param {string} value */
function escapeRegExp(value) {
  return value.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * @param {Object} [options]
 * @param {() => number} [options.clock]
 * @returns {CacheEngine}
 */
export function createCacheEngine(options) {
  return new CacheEngine(options);
}

export { CacheError };
