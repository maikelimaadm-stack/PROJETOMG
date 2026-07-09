/**
 * @typedef {'MAK-L3-CACHE-001'|'MAK-L3-CACHE-002'|'MAK-L3-CACHE-003'|'MAK-L3-CACHE-004'|'MAK-L3-CACHE-005'} CacheErrorCode
 */

export class CacheError extends Error {
  /**
   * @param {CacheErrorCode} code
   * @param {string} message
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'CacheError';
    this.code = code;
    if (meta) this.meta = meta;
  }
}
