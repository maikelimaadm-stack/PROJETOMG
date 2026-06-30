import { KNOWLEDGE_RELATIONSHIP_KINDS } from "./knowledgeGraphContracts.js";

/** Relationship registry — semantic business relationships */
export const KNOWLEDGE_RELATIONSHIP_REGISTRY = Object.freeze(
  Object.values(KNOWLEDGE_RELATIONSHIP_KINDS).map((kind) =>
    Object.freeze({
      kind,
      businessFacing: true,
      technicalExposureForbidden: true,
      explainable: true,
    })
  )
);

export function getRelationshipDefinition(kind) {
  return KNOWLEDGE_RELATIONSHIP_REGISTRY.find((r) => r.kind === kind) ?? null;
}

export default KNOWLEDGE_RELATIONSHIP_REGISTRY;
