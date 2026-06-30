import { BUSINESS_WORKFLOW_COMPATIBILITY_VERSION } from "../contracts/businessWorkflowContracts.js";

export function createBusinessWorkflowCompatibility(partial = {}) {
  return Object.freeze({
    compatibilityVersion: BUSINESS_WORKFLOW_COMPATIBILITY_VERSION,
    intentRevision: partial.intentRevision ?? 1,
    compatible: partial.compatible !== false,
    diagnostics: Object.freeze([...(partial.diagnostics ?? [])]),
  });
}

export function checkBusinessWorkflowCompatibility(workflow, context = {}) {
  const diagnostics = [];
  if (workflow.intentRevision !== context.intentRevision && context.intentRevision != null) {
    diagnostics.push({
      code: "BWF_INTENT_REVISION",
      severity: "warning",
      message: "Workflow derived from a different intent revision.",
    });
  }
  return createBusinessWorkflowCompatibility({
    intentRevision: context.intentRevision ?? workflow.intentRevision,
    compatible: !diagnostics.some((d) => d.severity === "blocking"),
    diagnostics,
  });
}

export default checkBusinessWorkflowCompatibility;
