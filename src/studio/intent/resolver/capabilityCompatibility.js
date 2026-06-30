import {
  COMPATIBILITY_VERSION,
  DERIVATION_KIND_COMPUTED_FIELD,
  DERIVATION_KIND_FORMULA,
} from "../contracts/intentContracts.js";

const COMPUTATION_DERIVATION_KINDS = Object.freeze([
  DERIVATION_KIND_FORMULA,
  DERIVATION_KIND_COMPUTED_FIELD,
]);

export function checkCapabilityCompatibility(capabilityResolution, intentDocument) {
  const diagnostics = [];
  const subject = intentDocument.subject ?? {};
  const hasTargetField =
    Boolean(subject.fieldId && subject.fieldId !== "unknown") ||
    intentDocument.computations?.some((c) => Boolean(c.ownerFieldId));

  for (const cap of capabilityResolution.resolved ?? []) {
    for (const kind of cap.derivationKinds ?? []) {
      if (COMPUTATION_DERIVATION_KINDS.includes(kind) && !hasTargetField) {
        diagnostics.push({
          code: "COMPAT_FIELD",
          severity: "blocking",
          message: "Computation derivation requires a target field.",
          derivationKind: kind,
        });
      }
    }
  }

  const blocking = diagnostics.some((d) => d.severity === "blocking");

  return Object.freeze({
    ok: !blocking,
    compatible: !blocking,
    compatibilityVersion: COMPATIBILITY_VERSION,
    diagnostics: Object.freeze(diagnostics),
  });
}

export default checkCapabilityCompatibility;
