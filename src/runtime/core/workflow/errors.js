/** @typedef {'MAK-L3-WORKFLOW-001'|'MAK-L3-WORKFLOW-002'|'MAK-L3-WORKFLOW-003'|'MAK-L3-WORKFLOW-004'|'MAK-L3-WORKFLOW-005'|'MAK-L3-WORKFLOW-006'} WorkflowErrorCode */

export class WorkflowError extends Error {
  /**
   * @param {WorkflowErrorCode} code
   * @param {string} message
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'WorkflowError';
    this.code = code;
    if (meta) this.meta = meta;
  }
}
