/**
 * @typedef {'MAK-L3-EVENTBUS-001'|'MAK-L3-EVENTBUS-002'|'MAK-L3-EVENTBUS-003'|'MAK-L3-EVENTBUS-004'|'MAK-L3-EVENTBUS-005'|'MAK-L3-EVENTBUS-006'} EventBusErrorCode
 */

export class EventBusError extends Error {
  /**
   * @param {EventBusErrorCode} code
   * @param {string} message
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'EventBusError';
    this.code = code;
    if (meta) this.meta = meta;
  }
}
