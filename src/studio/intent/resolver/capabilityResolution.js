import { getCapabilityById, listCapabilitiesForIntent } from "../catalog/capabilityCatalog.js";
import { CAPABILITY_CALCULATION, CAPABILITY_WORKFLOW } from "../contracts/intentContracts.js";

export function resolveCapabilities(intentDocument) {
  const required = intentDocument.capabilities ?? [];
  const resolved = [];
  const diagnostics = [];

  for (const binding of required) {
    const cap = getCapabilityById(binding.capabilityId);
    if (!cap) {
      diagnostics.push({
        code: "CAP_NOT_FOUND",
        severity: "blocking",
        message: `Capability not found: ${binding.capabilityId}`,
        capabilityId: binding.capabilityId,
      });
      continue;
    }
    if (!cap.licensed) {
      diagnostics.push({
        code: "CAP_UNLICENSED",
        severity: "blocking",
        message: `Capability not licensed: ${cap.label}`,
        capabilityId: binding.capabilityId,
      });
      continue;
    }
    resolved.push(Object.freeze({ ...cap, binding }));
  }

  if (intentDocument.category === "Computation" && !resolved.some((c) => c.capabilityId === CAPABILITY_CALCULATION)) {
    const calc = getCapabilityById(CAPABILITY_CALCULATION);
    if (calc) resolved.push(Object.freeze({ ...calc, binding: { capabilityId: CAPABILITY_CALCULATION, role: "requires" } }));
  }

  if (intentDocument.category === "Process" && !resolved.some((c) => c.capabilityId === CAPABILITY_WORKFLOW)) {
    const workflow = getCapabilityById(CAPABILITY_WORKFLOW);
    if (workflow) resolved.push(Object.freeze({ ...workflow, binding: { capabilityId: CAPABILITY_WORKFLOW, role: "requires" } }));
  }

  const available = listCapabilitiesForIntent(intentDocument);

  return Object.freeze({
    ok: diagnostics.every((d) => d.severity !== "blocking"),
    resolved: Object.freeze(resolved),
    available: Object.freeze(available),
    diagnostics: Object.freeze(diagnostics),
  });
}

export default resolveCapabilities;
