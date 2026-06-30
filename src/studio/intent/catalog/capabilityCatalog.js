import {
  CAPABILITY_CALCULATION,
  DERIVATION_KIND_COMPUTED_FIELD,
  DERIVATION_KIND_FORMULA,
} from "../contracts/intentContracts.js";

export const CAPABILITY_CATALOG_VERSION = "mak-capability-catalog-v1";

export const CAPABILITY_CATALOG = Object.freeze([
  Object.freeze({
    capabilityId: CAPABILITY_CALCULATION,
    label: "Calculation",
    /** SSOT: both formula projection and Business Computed Field (D-064 §618-619) */
    derivationKinds: Object.freeze([DERIVATION_KIND_FORMULA, DERIVATION_KIND_COMPUTED_FIELD]),
    licensed: true,
    compatibleCategories: Object.freeze(["Computation", "Outcome"]),
  }),
]);

export function getCapabilityById(capabilityId) {
  return CAPABILITY_CATALOG.find((c) => c.capabilityId === capabilityId) ?? null;
}

export function listCapabilitiesForIntent(intentDocument) {
  const category = intentDocument.category;
  return CAPABILITY_CATALOG.filter((c) => c.compatibleCategories.includes(category));
}

export default CAPABILITY_CATALOG;
