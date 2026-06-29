import {
  DEFAULT_LOCALE,
  MDP_PLATFORM_VERSION_ID,
  PLATFORM_RELATIONSHIP_DEFS,
  SYSTEM_ENTITY_DEFS,
} from "../src/modules/mdp/mdpRelationshipConstants.js";

const upsertSystemEntity = async (prisma, def) => {
  const existing = await prisma.mdpEntity.findFirst({
    where: { scope: "platform", entity_id: def.entity_id, cliente_id: null },
  });
  if (existing) return existing;

  return prisma.mdpEntity.create({
    data: {
      entity_id: def.entity_id,
      module_id: def.module_id,
      codigo: def.codigo,
      scope: "platform",
      cliente_id: null,
      entity_kind: def.entity_kind,
      sort_order: 999,
      legacy_entity_name: def.legacy_entity_name,
      permission_resource_key: def.module_id,
      base_template_id: "modelobase1",
      empresa_scope: "none",
      is_runtime_module: false,
      lifecycle: "active",
      version_id: MDP_PLATFORM_VERSION_ID,
      persistence: def.persistence,
      labels: {
        create: {
          locale: DEFAULT_LOCALE,
          singular: def.labels.singular,
          plural: def.labels.plural,
          description: def.labels.description ?? null,
        },
      },
      capabilities: {
        create: {
          layout: false,
          field: false,
          validation: false,
          formula: false,
          events: false,
          actions: false,
          workflow: false,
          custom_fields: false,
          attachments: false,
        },
      },
    },
  });
};

export const seedMdpRelationships = async (prisma) => {
  for (const def of SYSTEM_ENTITY_DEFS) {
    await upsertSystemEntity(prisma, def);
  }

  const entityCache = new Map();
  const resolveEntity = async (entityId) => {
    if (entityCache.has(entityId)) return entityCache.get(entityId);
    const row = await prisma.mdpEntity.findFirst({
      where: {
        entity_id: entityId,
        OR: [{ scope: "platform", cliente_id: null }],
      },
    });
    if (!row) throw new Error(`Entidade ${entityId} ausente para seed MDP-3.`);
    entityCache.set(entityId, row);
    return row;
  };

  let seeded = 0;
  for (const def of PLATFORM_RELATIONSHIP_DEFS) {
    const existing = await prisma.mdpRelationship.findFirst({
      where: {
        scope: "platform",
        relationship_id: def.relationship_id,
        cliente_id: null,
      },
    });
    if (existing) continue;

    const fromEntity = await resolveEntity(def.from_entity_id);
    const toEntity = await resolveEntity(def.to_entity_id);

    await prisma.mdpRelationship.create({
      data: {
        relationship_id: def.relationship_id,
        from_entity_row_id: fromEntity.id,
        to_entity_row_id: toEntity.id,
        scope: "platform",
        cliente_id: null,
        kind: def.kind,
        relationship_type: def.relationship_type,
        semantics: def.semantics,
        dependency: def.dependency ?? "restrict",
        dependency_class: def.dependency_class ?? "data",
        cardinality: def.cardinality,
        fk_mapping: def.fk_mapping ?? undefined,
        inheritance_parent_entity_id: def.inheritance_parent_entity_id ?? null,
        empresa_scoped: def.empresa_scoped ?? false,
        enabled: def.enabled ?? true,
        base_template_id: "modelobase1",
        lifecycle: "active",
        sort_order: def.sort_order ?? 0,
        version_id: MDP_PLATFORM_VERSION_ID,
        metadata: def.metadata ?? undefined,
        labels: {
          create: {
            locale: DEFAULT_LOCALE,
            label: def.label,
            description: def.description ?? null,
          },
        },
      },
    });
    seeded += 1;
  }

  return { seeded, total: PLATFORM_RELATIONSHIP_DEFS.length };
};
