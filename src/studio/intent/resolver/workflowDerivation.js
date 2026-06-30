import { DERIVATION_DOCUMENT_VERSION, INTENT_RESOLVER_VERSION } from "../contracts/intentContracts.js";
import {
  DERIVATION_KIND_WORKFLOW,
  ARTIFACT_TYPE_BUSINESS_WORKFLOW,
  ARTIFACT_TYPE_WORKFLOW_PROJECTION,
} from "../../business/contracts/businessWorkflowContracts.js";
import { buildBusinessWorkflowAsset } from "../../business/workflow/buildBusinessWorkflowAsset.js";
import { createWorkflowProjectionFromBusinessWorkflow } from "../../business/workflow/projectWorkflowFromBusinessWorkflow.js";
import { createBusinessWorkflowPreview } from "../../business/workflow/businessWorkflowPreview.js";
import { collectBusinessWorkflowDiagnostics } from "../../business/workflow/businessWorkflowDiagnostics.js";
import { createBusinessWorkflowRuntimeProjection } from "../../business/workflow/businessWorkflowRuntimeProjection.js";

function stableDerivationId(intentId, kind, processId) {
  const raw = `${intentId}:${kind}:${processId}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i += 1) {
    hash = (hash * 31 + raw.charCodeAt(i)) >>> 0;
  }
  return `deriv-${hash.toString(16).padStart(8, "0")}`;
}

export function executeWorkflowDerivation(planEntry, intentDocument, session, context) {
  const processRef = planEntry.processRefs[0];
  const processId = processRef.processId ?? processRef.ownerProcessId ?? "default-process";
  const derivationId = stableDerivationId(intentDocument.id, planEntry.derivationKind, processId);

  const asset = buildBusinessWorkflowAsset({
    intentDocument,
    processRef,
    session,
    derivationId,
    capabilityId: planEntry.capabilityId,
    resolverVersion: INTENT_RESOLVER_VERSION,
    organizationId: context.snapshot?.organizationId,
  });

  const workflowConfigDocument = createWorkflowProjectionFromBusinessWorkflow(
    asset.businessWorkflow,
    asset.metadata
  );

  const projectionValidation = Object.freeze({
    ok: Boolean(workflowConfigDocument.workflowDefinitions?.length),
    diagnostics: Object.freeze([]),
  });

  const diagnostics = collectBusinessWorkflowDiagnostics(
    asset.validation,
    asset.compatibility,
    projectionValidation
  );

  const preview = createBusinessWorkflowPreview(asset.businessWorkflow, {
    explainability: asset.explainability,
  });

  const runtimeProjection = createBusinessWorkflowRuntimeProjection(asset.businessWorkflow, {
    workflowConfigId: workflowConfigDocument.id,
    metadata: workflowConfigDocument.metadata,
  });

  const derivationDocument = Object.freeze({
    schemaVersion: DERIVATION_DOCUMENT_VERSION,
    derivationId,
    intentId: intentDocument.id,
    intentRevision: intentDocument.revision,
    derivationKind: DERIVATION_KIND_WORKFLOW,
    status: asset.validation.ok && projectionValidation.ok ? "completed" : "failed",
    outputs: Object.freeze([
      Object.freeze({
        artifactType: ARTIFACT_TYPE_BUSINESS_WORKFLOW,
        businessWorkflowId: asset.businessWorkflow.id,
        businessWorkflowDocumentId: asset.businessWorkflowDocument.id,
      }),
      Object.freeze({
        artifactType: ARTIFACT_TYPE_WORKFLOW_PROJECTION,
        workflowConfigDocumentId: workflowConfigDocument.id,
        derivedFrom: asset.businessWorkflow.id,
      }),
    ]),
    metadata: asset.metadata,
    resolverVersion: INTENT_RESOLVER_VERSION,
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  });

  return Object.freeze({
    businessWorkflow: asset.businessWorkflow,
    businessWorkflowDocument: asset.businessWorkflowDocument,
    derivationDocument,
    metadata: asset.metadata,
    workflowConfigDocument,
    projectionValidation,
    validation: asset.validation,
    compatibility: asset.compatibility,
    explainability: asset.explainability,
    preview,
    runtimeProjection,
    diagnostics,
  });
}

export default executeWorkflowDerivation;
