import { retrieveAdoptionsByContext } from "./adoptionRetrieval.js";
import { ADOPTION_OWNERSHIP } from "./adoptionEngineContracts.js";

export function getAdoptionRegistry(tenantId = "default") {
  const retrieved = retrieveAdoptionsByContext(tenantId);
  return Object.freeze({
    tenantId,
    registryAt: new Date().toISOString(),
    adoptions: retrieved.adoptions,
    plans: retrieved.plans,
    milestones: retrieved.milestones,
    outcomes: retrieved.outcomes,
    ownership: ADOPTION_OWNERSHIP,
    explainable: true,
  });
}

export default getAdoptionRegistry;
