/**
 * Immutable session scope bound to RuntimeContext trace + tenant.
 */
export class SessionScope {
  /**
   * @param {Object} params
   * @param {import('../../types/uec.js').AccessScope} params.accessScope
   * @param {string} params.traceId
   * @param {string} params.tenantId
   */
  constructor({ accessScope, traceId, tenantId }) {
    this.accessScope = Object.freeze({ ...accessScope });
    this.traceId = traceId;
    this.tenantId = tenantId;
    Object.freeze(this);
  }
}
