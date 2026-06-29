import { DEFAULT_LOCALE } from "../src/modules/mdp/mdpEntityConstants.js";

export const exportMdpRelationshipsRegistry = async (prisma) => {
  const relationships = await prisma.mdpRelationship.findMany({
    where: { lifecycle: "active" },
    include: {
      labels: { where: { locale: DEFAULT_LOCALE } },
      from_entity: { select: { entity_id: true, module_id: true } },
      to_entity: { select: { entity_id: true, module_id: true } },
    },
    orderBy: [{ sort_order: "asc" }, { relationship_id: "asc" }],
  });

  return {
    exportedAt: new Date().toISOString(),
    version: "mdp-relationships-v1",
    relationshipCount: relationships.length,
    physicalCount: relationships.filter((r) => r.kind === "physical").length,
    logicalCount: relationships.filter((r) => r.kind === "logical").length,
    enabledCount: relationships.filter((r) => r.enabled).length,
    relationships: relationships.map((row) => ({
      id: row.id,
      relationshipId: row.relationship_id,
      fromEntityId: row.from_entity?.entity_id,
      toEntityId: row.to_entity?.entity_id,
      kind: row.kind,
      relationshipType: row.relationship_type,
      semantics: row.semantics,
      dependencyClass: row.dependency_class,
      enabled: row.enabled,
      label: row.labels[0]?.label || row.relationship_id,
      baseTemplateId: row.base_template_id,
      lifecycle: row.lifecycle,
    })),
  };
};
