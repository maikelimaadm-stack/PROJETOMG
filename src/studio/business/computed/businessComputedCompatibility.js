import { BUSINESS_COMPUTED_COMPATIBILITY_VERSION } from "../contracts/businessComputedContracts.js";

export function createBusinessComputedCompatibility(partial = {}) {
  return Object.freeze({
    compatibilityVersion: partial.compatibilityVersion ?? BUSINESS_COMPUTED_COMPATIBILITY_VERSION,
    resolverVersion: partial.resolverVersion ?? null,
    intentRevision: partial.intentRevision ?? 1,
    formulaProjectionVersion: partial.formulaProjectionVersion ?? "mak-formula-document-v1",
    supportedDerivationKinds: Object.freeze(
      partial.supportedDerivationKinds ?? ["compute.computed_field"]
    ),
    breakingChanges: Object.freeze(partial.breakingChanges ?? []),
  });
}

export function checkBusinessComputedCompatibility(asset, context = {}) {
  const diagnostics = [];
  if (asset.compatibility?.compatibilityVersion !== BUSINESS_COMPUTED_COMPATIBILITY_VERSION) {
    diagnostics.push({
      code: "COMPAT_VERSION_MISMATCH",
      message: "Business Computed Field compatibility version mismatch.",
      severity: "warning",
    });
  }
  if (
    context.intentRevision != null &&
    asset.compatibility?.intentRevision != null &&
    context.intentRevision !== asset.compatibility.intentRevision
  ) {
    diagnostics.push({
      code: "INTENT_REVISION_DRIFT",
      message: "Intent revision drift detected — regeneration recommended.",
      severity: "info",
    });
  }
  return Object.freeze({
    ok: diagnostics.every((d) => d.severity !== "blocking"),
    diagnostics: Object.freeze(diagnostics),
  });
}

export default createBusinessComputedCompatibility;
