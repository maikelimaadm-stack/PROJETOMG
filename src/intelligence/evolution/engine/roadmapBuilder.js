import { createEvolutionRoadmap, upsertEvolutionRoadmap } from "./evolutionEngineStore.js";
import { appendEvolutionAuditEntry } from "./evolutionAuditTrail.js";

export function buildEvolutionRoadmap(input) {
  const roadmap = createEvolutionRoadmap({
    tenantId: input.tenantId,
    title: input.title ?? "Roteiro de evolução da empresa",
    phases: input.phases ?? [
      Object.freeze({ order: 1, label: "Fundamentar operação", status: "active" }),
      Object.freeze({ order: 2, label: "Organizar conhecimento", status: "planned" }),
      Object.freeze({ order: 3, label: "Evoluir capacidades", status: "planned" }),
    ],
    milestones: input.milestones ?? [],
  });
  upsertEvolutionRoadmap(roadmap);
  appendEvolutionAuditEntry({
    tenantId: roadmap.tenantId,
    action: "roadmap_created",
    entityId: roadmap.roadmapId,
    entityType: "roadmap",
  });
  return roadmap;
}

export default buildEvolutionRoadmap;
