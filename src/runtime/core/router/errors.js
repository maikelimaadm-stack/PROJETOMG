/** @typedef {'MAK-L3-ROUTE-001'|'MAK-L3-ROUTE-002'|'MAK-L3-ROUTE-003'} RouteErrorCode */

export class RouteError extends Error {
  /**
   * @param {RouteErrorCode} code
   * @param {string} message
   */
  constructor(code, message) {
    super(message);
    this.name = 'RouteError';
    this.code = code;
  }
}
