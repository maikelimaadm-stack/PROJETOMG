import { DERIVATION_DOCUMENT_VERSION, INTENT_RESOLVER_VERSION } from "../contracts/intentContracts.js";
import {
  DERIVATION_KIND_COMPUTED_FIELD,
  ARTIFACT_TYPE_BUSINESS_COMPUTED_FIELD,
  ARTIFACT_TYPE_FORMULA_PROJECTION,
} from "../../business/contracts/businessComputedContracts.js";
import { buildBusinessComputedAsset } from "../../business/computed/buildBusinessComputedAsset.js";
import { createFormulaProjectionFromComputedField } from "../../business/computed/projectFormulaFromComputedField.js";
import { createBusinessComputedPreview } from "../../business/computed/businessComputedPreview.js";
import { collectBusinessComputedDiagnostics } from "../../business/computed/businessComputedDiagnostics.js";
import { createBusinessComputedRuntimeProjection } from "../../business/computed/businessComputedRuntimeProjection.js";
import { runComputationProjection } from "./projections/computationProjection.js";

function stableDerivationId(intentId, kind, fieldId) {
  const raw = `${intentId}:${kind}:${fieldId}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i += 1) {
    hash = (hash * 31 + raw.charCodeAt(i)) >>> 0;
  }
  return `deriv-${hash.toString(16).padStart(8, "0")}`;
}

/**
 * Resolver execution: Intent → Business Computed Field → Formula → Computation (D-068).
 */
export function executeComputedFieldDerivation(planEntry, intentDocument, session, context) {
  const computationRef = planEntry.computationRefs[0];
  const ownerFieldId = computationRef.ownerFieldId ?? intentDocument.subject?.fieldId ?? "unknown";
  const derivationId = stableDerivationId(
    intentDocument.id,
    planEntry.derivationKind,
    ownerFieldId
  );

  const asset = buildBusinessComputedAsset({
    intentDocument,
    computationRef,
    session,
    derivationId,
    capabilityId: planEntry.capabilityId,
    resolverVersion: INTENT_RESOLVER_VERSION,
    organizationId: context.snapshot?.organizationId,
  });

  const formulaDocument = createFormulaProjectionFromComputedField(
    asset.businessComputedField,
    asset.metadata
  );

  const pipeline = runComputationProjection(formulaDocument, {
    sampleVariables: computationRef.sampleVariables,
  });

  const diagnostics = collectBusinessComputedDiagnostics(
    asset.validation,
    asset.compatibility,
    pipeline.validation
  );

  const preview = createBusinessComputedPreview(asset.businessComputedField, pipeline.preview);

  const runtimeProjection = createBusinessComputedRuntimeProjection(asset.businessComputedField, {
    formulaDocumentId: formulaDocument.id,
    computationDocumentId: formulaDocument.computationDocumentId,
    expressionAst: pipeline.expressionAst,
    preview: pipeline.preview,
  });

  const derivationDocument = Object.freeze({
    schemaVersion: DERIVATION_DOCUMENT_VERSION,
    derivationId,
    intentId: intentDocument.id,
    intentRevision: intentDocument.revision,
    derivationKind: DERIVATION_KIND_COMPUTED_FIELD,
    status: asset.validation.ok && pipeline.validation?.ok ? "completed" : "failed",
    outputs: Object.freeze([
      Object.freeze({
        artifactType: ARTIFACT_TYPE_BUSINESS_COMPUTED_FIELD,
        businessComputedFieldId: asset.businessComputedField.id,
        businessComputedDocumentId: asset.businessComputedDocument.id,
      }),
      Object.freeze({
        artifactType: ARTIFACT_TYPE_FORMULA_PROJECTION,
        formulaDocumentId: formulaDocument.id,
        computationDocumentId: formulaDocument.computationDocumentId,
        derivedFrom: asset.businessComputedField.id,
      }),
    ]),
    metadata: asset.metadata,
    resolverVersion: INTENT_RESOLVER_VERSION,
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  });

  return Object.freeze({
    businessComputedField: asset.businessComputedField,
    businessComputedDocument: asset.businessComputedDocument,
    derivationDocument,
    metadata: asset.metadata,
    formulaDocument,
    pipeline,
    validation: asset.validation,
    compatibility: asset.compatibility,
    explainability: asset.explainability,
    preview,
    runtimeProjection,
    diagnostics,
  });
}

export default executeComputedFieldDerivation;
