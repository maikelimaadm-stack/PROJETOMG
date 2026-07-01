import { PERSISTENCE_OWNERSHIP } from "./lifecyclePersistenceContracts.js";

export function resolvePersistenceOwnership(groupId, ctx) {
  return Object.freeze({ groupId, ...PERSISTENCE_OWNERSHIP, explainable: true, ownerClientId: ctx?.ownerClientId ?? null });
}

export default resolvePersistenceOwnership;
