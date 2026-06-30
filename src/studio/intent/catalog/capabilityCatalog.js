import {
  CAPABILITY_CALCULATION,
  CAPABILITY_WORKFLOW,
  DERIVATION_KIND_COMPUTED_FIELD,
  DERIVATION_KIND_FORMULA,
  DERIVATION_KIND_WORKFLOW,
} from "../contracts/intentContracts.js";

export const CAPABILITY_CATALOG_VERSION = "mak-capability-catalog-v1";

export const CAPABILITY_CATALOG = Object.freeze([
  Object.freeze({
    capabilityId: CAPABILITY_CALCULATION,
    label: "Calculation",
    derivationKinds: Object.freeze([DERIVATION_KIND_FORMULA, DERIVATION_KIND_COMPUTED_FIELD]),
    licensed: true,
    compatibleCategories: Object.freeze(["Computation", "Outcome"]),
  }),
  Object.freeze({
    capabilityId: CAPABILITY_WORKFLOW,
    label: "Business Workflow",
    derivationKinds: Object.freeze([DERIVATION_KIND_WORKFLOW]),
    licensed: true,
    compatibleCategories: Object.freeze(["Process"]),
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
