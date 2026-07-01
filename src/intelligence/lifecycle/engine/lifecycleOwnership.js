import { LIFECYCLE_OWNERSHIP } from "./dataLifecycleContracts.js";

export function resolveLifecycleOwnership(groupId, ctx) {
  return Object.freeze({
    groupId,
    ownerClientId: ctx.ownerClientId ?? null,
    authorizedTenantIds: ctx.authorizedTenantIds ?? [],
    ...LIFECYCLE_OWNERSHIP,
    explainable: true,
  });
}

export default resolveLifecycleOwnership;
