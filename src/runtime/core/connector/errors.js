/**
 * @typedef {'MAK-L3-CONNECTOR-001'|'MAK-L3-CONNECTOR-002'|'MAK-L3-CONNECTOR-003'|'MAK-L3-CONNECTOR-004'|'MAK-L3-CONNECTOR-005'|'MAK-L3-CONNECTOR-006'|'MAK-L3-CONNECTOR-007'|'MAK-L3-CONNECTOR-008'|'MAK-L3-CONNECTOR-009'|'MAK-L3-CONNECTOR-010'} ConnectorErrorCode
 */

export class ConnectorError extends Error {
  /**
   * @param {ConnectorErrorCode} code
   * @param {string} message
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'ConnectorError';
    this.code = code;
    if (meta) this.meta = meta;
  }
}
