export function diffBusinessWorkflows(previous, next) {
  const fields = [];
  if (previous.businessProcessSummary !== next.businessProcessSummary) fields.push("businessProcessSummary");
  if (JSON.stringify(previous.states) !== JSON.stringify(next.states)) fields.push("states");
  if (JSON.stringify(previous.transitions) !== JSON.stringify(next.transitions)) fields.push("transitions");
  if (JSON.stringify(previous.assignments) !== JSON.stringify(next.assignments)) fields.push("assignments");
  return Object.freeze({ changed: fields.length > 0, fields: Object.freeze(fields) });
}

export function prepareBusinessWorkflowRollback(previousWorkflow) {
  return Object.freeze({
    ok: Boolean(previousWorkflow),
    rollbackTargetId: previousWorkflow?.id ?? null,
    revision: previousWorkflow?.revision ?? null,
  });
}

export default diffBusinessWorkflows;
