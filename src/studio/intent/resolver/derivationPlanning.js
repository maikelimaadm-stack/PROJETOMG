import {
  DERIVATION_KIND_COMPUTED_FIELD,
  DERIVATION_KIND_FORMULA,
  DERIVATION_KIND_WORKFLOW,
  ARTIFACT_TYPE_BUSINESS_COMPUTED_FIELD,
  ARTIFACT_TYPE_BUSINESS_WORKFLOW,
  ARTIFACT_TYPE_WORKFLOW_CONFIG,
} from "../contracts/intentContracts.js";
import { EXTENSION_DERIVATION_KINDS } from "../contracts/intentContracts.js";

export function planDerivations(intentDocument, capabilityResolution) {
  const plan = [];
  const extensionOnly = [];

  if (intentDocument.category === "Computation" && intentDocument.computations?.length) {
    plan.push(
      Object.freeze({
        derivationKind: DERIVATION_KIND_COMPUTED_FIELD,
        artifactType: ARTIFACT_TYPE_BUSINESS_COMPUTED_FIELD,
        projectionKind: DERIVATION_KIND_FORMULA,
        projectionArtifactType: "formula.document",
        capabilityId: "capability.calculation",
        computationRefs: intentDocument.computations,
        status: "planned",
      })
    );
  }

  if (intentDocument.category === "Process" && intentDocument.processes?.length) {
    plan.push(
      Object.freeze({
        derivationKind: DERIVATION_KIND_WORKFLOW,
        artifactType: ARTIFACT_TYPE_BUSINESS_WORKFLOW,
        projectionKind: DERIVATION_KIND_WORKFLOW,
        projectionArtifactType: ARTIFACT_TYPE_WORKFLOW_CONFIG,
        capabilityId: "capability.workflow",
        processRefs: intentDocument.processes,
        status: "planned",
      })
    );
  }

  for (const kind of EXTENSION_DERIVATION_KINDS) {
    extensionOnly.push(
      Object.freeze({
        derivationKind: kind,
        status: "extension_point_only",
        implemented: false,
      })
    );
  }

  return Object.freeze({
    executable: Object.freeze(plan),
    extensionPoints: Object.freeze(extensionOnly),
    capabilityResolution,
  });
}

export default planDerivations;
