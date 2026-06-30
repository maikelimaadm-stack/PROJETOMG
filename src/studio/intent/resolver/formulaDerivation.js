import { DERIVATION_DOCUMENT_VERSION, INTENT_RESOLVER_VERSION } from "../contracts/intentContracts.js";
import { createDerivationMetadata } from "./derivationMetadata.js";
import { projectFormulaFromComputation } from "./projections/formulaProjection.js";
import { runComputationProjection } from "./projections/computationProjection.js";
import { buildResolverLineage } from "./lineage.js";

function stableDerivationId(intentId, kind, fieldId) {
  const raw = `${intentId}:${kind}:${fieldId}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i += 1) {
    hash = (hash * 31 + raw.charCodeAt(i)) >>> 0;
  }
  return `deriv-${hash.toString(16).padStart(8, "0")}`;
}

export function executeFormulaDerivation(planEntry, intentDocument, session, context) {
  const computationRef = planEntry.computationRefs[0];
  const derivationId = stableDerivationId(
    intentDocument.id,
    planEntry.derivationKind,
    computationRef.ownerFieldId
  );

  const metadata = createDerivationMetadata({
    derivationId,
    intentId: intentDocument.id,
    intentRevision: intentDocument.revision,
    businessObjectId: intentDocument.subject?.businessObjectId ?? "default",
    capabilityId: planEntry.capabilityId,
    artifactType: planEntry.artifactType,
    derivationKind: planEntry.derivationKind,
    generatedBy: session.initiatedBy,
    organizationId: context.snapshot?.organizationId,
    lineage: buildResolverLineage(intentDocument, session, derivationId),
  });

  const formulaDocument = projectFormulaFromComputation(computationRef, intentDocument, metadata);
  const pipeline = runComputationProjection(formulaDocument, {
    sampleVariables: computationRef.sampleVariables,
  });

  const derivationDocument = Object.freeze({
    schemaVersion: DERIVATION_DOCUMENT_VERSION,
    derivationId,
    intentId: intentDocument.id,
    intentRevision: intentDocument.revision,
    derivationKind: planEntry.derivationKind,
    status: pipeline.validation?.ok ? "completed" : "failed",
    outputs: Object.freeze([
      Object.freeze({
        artifactType: planEntry.artifactType,
        formulaDocumentId: formulaDocument.id,
        computationDocumentId: formulaDocument.computationDocumentId,
      }),
    ]),
    metadata,
    resolverVersion: INTENT_RESOLVER_VERSION,
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  });

  return Object.freeze({
    derivationDocument,
    metadata,
    formulaDocument,
    pipeline,
  });
}

export default executeFormulaDerivation;
