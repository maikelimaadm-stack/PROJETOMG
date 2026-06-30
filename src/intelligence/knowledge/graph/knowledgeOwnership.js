import { KNOWLEDGE_OWNERSHIP } from "./knowledgeGraphContracts.js";

export function createKnowledgeOwnership(tenantId) {
  return Object.freeze({
    tenantId,
    ...KNOWLEDGE_OWNERSHIP,
  });
}

export default createKnowledgeOwnership;
