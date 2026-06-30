export function createBusinessComputedOwnership(partial = {}) {
  return Object.freeze({
    schemaVersion: "mak-business-computed-ownership-v1",
    ownerKind: "organization",
    organizationId: partial.organizationId ?? null,
    businessUnitId: partial.businessUnitId ?? partial.ownerUnitId ?? null,
    businessOwnerRoleId: partial.businessOwnerRoleId ?? null,
    userOwned: false,
    aiOwned: false,
    studioOwned: false,
    moduleOwned: false,
    belongsToBusiness: true,
    versionable: true,
    auditable: true,
    reusable: partial.reusable !== false,
    publishable: partial.publishable !== false,
    evolvable: true,
    shareable: partial.shareable !== false,
  });
}

export default createBusinessComputedOwnership;
