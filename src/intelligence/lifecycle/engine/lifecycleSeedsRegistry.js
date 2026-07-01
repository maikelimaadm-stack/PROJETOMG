export function buildLifecycleSeedsRegistry(groupId) {
  return Object.freeze({
    groupId,
    seeds: Object.freeze([
      Object.freeze({ id: "lifecycle-rules", label: "Regras de ciclo de vida", category: "policy" }),
      Object.freeze({ id: "archive-schedule", label: "Agenda de arquivamento", category: "schedule" }),
      Object.freeze({ id: "expunge-approval", label: "Aprovação de expurgo", category: "approval" }),
      Object.freeze({ id: "legal-hold", label: "Legal hold", category: "hold" }),
    ]),
    explainable: true,
  });
}

export default buildLifecycleSeedsRegistry;
