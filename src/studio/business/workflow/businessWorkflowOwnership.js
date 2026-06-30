export function createBusinessWorkflowOwnership(partial = {}) {
  return Object.freeze({
    organizationId: partial.organizationId ?? null,
    ownerUnitId: partial.ownerUnitId ?? null,
    businessOwnerRoleId: partial.businessOwnerRoleId ?? "process_owner",
    stewardRoleId: partial.stewardRoleId ?? "operations_supervisor",
  });
}

export default createBusinessWorkflowOwnership;
