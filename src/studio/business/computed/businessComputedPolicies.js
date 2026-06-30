import {
  BUSINESS_COMPUTED_REGENERATION_POLICIES,
  BUSINESS_COMPUTED_SYNCHRONIZATION_POLICIES,
  BUSINESS_COMPUTED_ROLLBACK_POLICIES,
} from "../contracts/businessComputedContracts.js";

export function createBusinessComputedPolicies(partial = {}) {
  return Object.freeze({
    regenerationPolicy:
      partial.regenerationPolicy ?? BUSINESS_COMPUTED_REGENERATION_POLICIES[0],
    synchronizationPolicy:
      partial.synchronizationPolicy ?? BUSINESS_COMPUTED_SYNCHRONIZATION_POLICIES[0],
    rollbackPolicy: partial.rollbackPolicy ?? BUSINESS_COMPUTED_ROLLBACK_POLICIES[0],
    reusePolicy: partial.reusePolicy ?? "cross_entity",
    studioEditPolicy: partial.studioEditPolicy ?? "edit_asset_only",
    runtimePolicy: partial.runtimePolicy ?? "derived_projection_only",
  });
}

export default createBusinessComputedPolicies;
