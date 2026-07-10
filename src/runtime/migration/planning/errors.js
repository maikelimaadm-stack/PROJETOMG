/**
 * @typedef {'MAK-L3-MIGRATION-PLAN-001'|'MAK-L3-MIGRATION-PLAN-002'|'MAK-L3-MIGRATION-PLAN-003'} MigrationPlanningErrorCode
 */

/**
 * Structural/configuration failures of the migration planning layer (invalid
 * option, prototype-pollution attempt, disallowed readiness escalation) are
 * thrown as this typed error. The planning layer is pure and passive: it never
 * migrates anything, never touches real data or the backend — it only builds
 * deterministic, plain plan/readiness/risk/rollback models.
 */
export class MigrationPlanningError extends Error {
  /**
   * @param {MigrationPlanningErrorCode} code
   * @param {string} message
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'MigrationPlanningError';
    this.code = code;
    if (meta) this.meta = meta;
  }
}
