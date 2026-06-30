import { COMPATIBILITY_VERSION } from "../contracts/intentContracts.js";

export function checkCapabilityCompatibility(capabilityResolution, intentDocument) {
  const diagnostics = [];
  const subject = intentDocument.subject ?? {};

  for (const cap of capabilityResolution.resolved ?? []) {
    for (const kind of cap.derivationKinds ?? []) {
      if (kind === "compute.formula" && !subject.fieldId) {
        diagnostics.push({
          code: "COMPAT_FIELD",
          severity: "blocking",
          message: "Formula derivation requires a target field.",
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
