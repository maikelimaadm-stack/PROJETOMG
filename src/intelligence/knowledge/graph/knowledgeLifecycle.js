import { KNOWLEDGE_LIFECYCLE_STATES } from "./knowledgeGraphContracts.js";

export function assignKnowledgeLifecycle(state = "linked") {
  return KNOWLEDGE_LIFECYCLE_STATES.includes(state) ? state : "linked";
}

export default assignKnowledgeLifecycle;
