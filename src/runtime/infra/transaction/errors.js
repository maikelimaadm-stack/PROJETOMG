/**
 * @typedef {'MAK-L3-TRANSACTION-001'|'MAK-L3-TRANSACTION-002'|'MAK-L3-TRANSACTION-003'|'MAK-L3-TRANSACTION-004'|'MAK-L3-TRANSACTION-005'|'MAK-L3-TRANSACTION-006'|'MAK-L3-TRANSACTION-007'} TransactionErrorCode
 */

export class TransactionError extends Error {
  /**
   * @param {TransactionErrorCode} code
   * @param {string} message
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'TransactionError';
    this.code = code;
    if (meta) this.meta = meta;
  }
}
