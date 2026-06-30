import { BUSINESS_WORKFLOW_LINEAGE_VERSION } from "../contracts/businessWorkflowContracts.js";

export function buildBusinessWorkflowLineage(intentDocument, session, workflowId, derivationId) {
  return Object.freeze([
    Object.freeze({
      nodeType: "business_intent",
      nodeId: intentDocument.id,
      revision: intentDocument.revision,
      label: intentDocument.intentPhrase,
    }),
    Object.freeze({
      nodeType: "resolver_session",
      nodeId: session.resolverSessionId,
      label: "Intent Resolver",
    }),
    Object.freeze({
      nodeType: "derivation",
      nodeId: derivationId,
      label: "Business Workflow derivation",
    }),
    Object.freeze({
      nodeType: "business_workflow",
      nodeId: workflowId,
      schemaVersion: BUSINESS_WORKFLOW_LINEAGE_VERSION,
      label: "Business Workflow Asset",
    }),
  ]);
}

export default buildBusinessWorkflowLineage;
