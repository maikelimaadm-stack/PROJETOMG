export function buildLifecyclePersistenceSeedsRegistry(groupId) {
  return Object.freeze({
    groupId,
    seeds: Object.freeze([
      Object.freeze({ id: "durable-store", label: "Persistência durável", category: "persistence" }),
      Object.freeze({ id: "approval-workflow", label: "Workflow de aprovação", category: "approval" }),
      Object.freeze({ id: "execution-queue", label: "Fila de execução", category: "queue" }),
    ]),
    explainable: true,
  });
}

export default buildLifecyclePersistenceSeedsRegistry;
