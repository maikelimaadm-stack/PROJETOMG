import { CAPABILITY_CALCULATION } from "../contracts/intentContracts.js";

export const CAPABILITY_CATALOG_VERSION = "mak-capability-catalog-v1";

export const CAPABILITY_CATALOG = Object.freeze([
  Object.freeze({
    capabilityId: CAPABILITY_CALCULATION,
    label: "Calculation",
    derivationKinds: Object.freeze(["compute.formula"]),
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
