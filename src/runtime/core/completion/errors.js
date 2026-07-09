/**
 * @typedef {'MAK-L3-COMPLETION-001'|'MAK-L3-COMPLETION-002'} RuntimeCompletionErrorCode
 */

export class RuntimeCompletionError extends Error {
  /**
   * @param {RuntimeCompletionErrorCode} code
   * @param {string} message
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'RuntimeCompletionError';
    this.code = code;
    if (meta) this.meta = meta;
  }
}
