export function createBusinessComputedSecurityContracts(partial = {}) {
  return Object.freeze({
    schemaVersion: "mak-business-computed-security-contracts-v1",
    accessPolicy: partial.accessPolicy ?? "organization_scoped",
    editPolicy: partial.editPolicy ?? "authorized_business_roles",
    runtimeExecutionPolicy: partial.runtimeExecutionPolicy ?? "derived_projection_only",
    bypassForbidden: true,
    designerCreationForbidden: true,
    directRuntimeMutationForbidden: true,
    requiredCapabilities: Object.freeze(partial.requiredCapabilities ?? ["capability.calculation"]),
  });
}

export default createBusinessComputedSecurityContracts;
