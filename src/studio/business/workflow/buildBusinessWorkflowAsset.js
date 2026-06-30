import {
  DERIVATION_KIND_WORKFLOW,
  ARTIFACT_TYPE_BUSINESS_WORKFLOW,
} from "../contracts/businessWorkflowContracts.js";
import { createBusinessWorkflowField, stableWorkflowId } from "./businessWorkflowField.js";
import { createBusinessWorkflowMetadata } from "./businessWorkflowMetadata.js";
import { buildBusinessWorkflowLineage } from "./businessWorkflowLineage.js";
import { buildBusinessWorkflowExplainability } from "./businessWorkflowExplainability.js";
import { checkBusinessWorkflowCompatibility } from "./businessWorkflowCompatibility.js";

export function buildBusinessWorkflowAsset(input) {
  const {
    intentDocument,
    processRef,
    session,
    derivationId,
    resolverVersion,
    organizationId,
  } = input;

  const processId = processRef.processId ?? processRef.ownerProcessId ?? "default-process";
  const workflowId = stableWorkflowId(intentDocument.id, processId);

  const lineage = buildBusinessWorkflowLineage(
    intentDocument,
    session,
    workflowId,
    derivationId
  );

  const metadata = createBusinessWorkflowMetadata({
    workflowId,
    intentId: intentDocument.id,
    intentRevision: intentDocument.revision,
    businessObjectId: intentDocument.subject?.businessObjectId ?? "default",
    capabilityId: input.capabilityId ?? "capability.workflow",
    artifactType: ARTIFACT_TYPE_BUSINESS_WORKFLOW,
    derivationKind: DERIVATION_KIND_WORKFLOW,
    generatedBy: session.initiatedBy,
    organizationId,
    lineage,
    derivationId,
    resolverVersion,
  });

  const created = createBusinessWorkflowField({
    id: workflowId,
    intentId: intentDocument.id,
    intentRevision: intentDocument.revision,
    businessProcessSummary: intentDocument.intentPhrase,
    processId,
    processRef,
    intentDocument,
    metadata,
    lineage,
    derivationId,
    resolverVersion,
    organizationId,
    generatedBy: session.initiatedBy,
    moduleId: processRef.moduleId ?? intentDocument.subject?.moduleId,
    entityId: processRef.entityId ?? intentDocument.subject?.entityId,
    approvers: processRef.approvers,
    slaPartial: { slaHours: processRef.slaHours, escalationRole: processRef.escalationRole },
  });

  const compatibility = checkBusinessWorkflowCompatibility(created.field, {
    intentRevision: intentDocument.revision,
  });

  const explainability = buildBusinessWorkflowExplainability(
    intentDocument,
    session,
    created.field,
    metadata
  );

  return Object.freeze({
    businessWorkflow: created.field,
    businessWorkflowDocument: created.document,
    metadata,
    validation: created.validation,
    compatibility,
    explainability,
  });
}

export default buildBusinessWorkflowAsset;
