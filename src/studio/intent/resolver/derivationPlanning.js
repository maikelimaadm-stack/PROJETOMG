import { DERIVATION_KIND_FORMULA } from "../contracts/intentContracts.js";
import { EXTENSION_DERIVATION_KINDS } from "../contracts/intentContracts.js";

export function planDerivations(intentDocument, capabilityResolution) {
  const plan = [];
  const extensionOnly = [];

  if (intentDocument.category === "Computation" && intentDocument.computations?.length) {
    plan.push(
      Object.freeze({
        derivationKind: DERIVATION_KIND_FORMULA,
        artifactType: "formula.document",
        capabilityId: "capability.calculation",
        computationRefs: intentDocument.computations,
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
