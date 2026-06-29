import { MDP_RELATIONSHIP_IDS } from "../src/modules/mdp/mdpRelationshipConstants.js";

/**
 * Binds mdp_field.relation_entity hints and relationship_ref to MDP-3 rows.
 */
export const bindMdpFieldRelationshipRefs = async (prisma) => {
  const fieldsWithRelation = await prisma.mdpField.findMany({
    where: {
      OR: [{ relation_entity: { not: null } }, { relationship_ref: { not: null } }],
    },
  });

  let bound = 0;
  for (const field of fieldsWithRelation) {
    const targetEntityId = field.relation_entity;
    if (!targetEntityId) continue;

    const relationshipId =
      field.relationship_ref || `EmpresaCadastro.lookup_${field.field_name}`;
    let relationship = await prisma.mdpRelationship.findFirst({
      where: {
        relationship_id: relationshipId,
        OR: [
          { scope: "platform", cliente_id: null },
          { cliente_id: field.cliente_id },
        ],
      },
    });

    if (!relationship) {
      const fromEntity = await prisma.mdpEntity.findFirst({
        where: { id: field.entity_row_id },
      });
      const toEntity = await prisma.mdpEntity.findFirst({
        where: { entity_id: targetEntityId, scope: "platform", cliente_id: null },
      });
      if (!fromEntity || !toEntity) continue;

      relationship = await prisma.mdpRelationship.create({
        data: {
          relationship_id: relationshipId,
          from_entity_row_id: fromEntity.id,
          to_entity_row_id: toEntity.id,
          scope: field.scope === "tenant" ? "tenant" : "platform",
          cliente_id: field.cliente_id,
          kind: "logical",
          relationship_type: "one_to_many",
          semantics: "association",
          dependency: "optional",
          dependency_class: "data",
          cardinality: { minFrom: 0, maxFrom: 1, minTo: 0, maxTo: null },
          enabled: true,
          version_id: field.version_id,
          labels: {
            create: {
              locale: "pt-BR",
              label: `Lookup ${field.field_name}`,
              description: `Auto-bound from mdp_field.relation_entity`,
            },
          },
        },
      });
    }

    await prisma.mdpField.update({
      where: { id: field.id },
      data: { relationship_ref: relationship.relationship_id },
    });

    const existingBinding = await prisma.mdpRelationshipFieldBinding.findFirst({
      where: { relationship_row_id: relationship.id, field_row_id: field.id },
    });
    if (!existingBinding) {
      await prisma.mdpRelationshipFieldBinding.create({
        data: {
          relationship_row_id: relationship.id,
          field_row_id: field.id,
          from_field_name: field.field_name,
          binding_role: "lookup",
        },
      });
    }
    bound += 1;
  }

  const customFieldsRel = await prisma.mdpRelationship.findFirst({
    where: {
      relationship_id: MDP_RELATIONSHIP_IDS.empresaCustomFields,
      scope: "platform",
      cliente_id: null,
    },
  });
  if (customFieldsRel) {
    const customFields = await prisma.mdpField.findMany({
      where: { source: "custom", field_type: "relacao" },
    });
    for (const field of customFields) {
      if (!field.relationship_ref) {
        await prisma.mdpField.update({
          where: { id: field.id },
          data: { relationship_ref: customFieldsRel.relationship_id },
        });
      }
    }
  }

  return { bound, scanned: fieldsWithRelation.length };
};
