export function createBusinessWorkflowDiagnostic(code, message, severity = "blocking", extra = {}) {
  return Object.freeze({ code, message, severity, ...extra });
}

export function validateBusinessWorkflow(workflow) {
  const diagnostics = [];
  if (!workflow?.id) diagnostics.push(createBusinessWorkflowDiagnostic("BWF_MISSING_ID", "Business Workflow id is required."));
  if (!workflow?.businessProcessSummary) {
    diagnostics.push(createBusinessWorkflowDiagnostic("BWF_MISSING_SUMMARY", "Business process summary is required."));
  }
  if (!workflow?.states?.length || workflow.states.length < 2) {
    diagnostics.push(createBusinessWorkflowDiagnostic("BWF_MISSING_STATES", "At least two business states are required."));
  }
  if (!workflow?.transitions?.length) {
    diagnostics.push(createBusinessWorkflowDiagnostic("BWF_MISSING_TRANSITIONS", "Business transitions are required."));
  }
  if (workflow?.metadata?.studioOwned === true) {
    diagnostics.push(createBusinessWorkflowDiagnostic("BWF_STUDIO_OWNED", "Business Workflow must not be studio-owned."));
  }
  if (workflow?.metadata?.belongsToBusiness !== true) {
    diagnostics.push(createBusinessWorkflowDiagnostic("BWF_NOT_BUSINESS_ASSET", "Business Workflow must belong to business."));
  }
  return Object.freeze({ ok: diagnostics.every((d) => d.severity !== "blocking"), diagnostics: Object.freeze(diagnostics) });
}

export default validateBusinessWorkflow;
