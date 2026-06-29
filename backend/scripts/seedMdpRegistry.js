import {
  DEFAULT_LOCALE,
  EMPRESAS_REGISTRY_SEED,
  MDP_PLATFORM_VERSION_ID,
  REGISTRY_SCHEMA_VERSION,
  hashRegistryPayload,
} from "../src/modules/mdp/mdpRegistryConstants.js";

const resolveEntity = async (prisma, entityId, cache) => {
  if (!entityId) return null;
  if (cache.has(entityId)) return cache.get(entityId);
  const row = await prisma.mdpEntity.findFirst({
    where: {
      entity_id: entityId,
      OR: [{ scope: "platform", cliente_id: null }],
    },
  });
  if (!row) throw new Error(`Entidade ${entityId} ausente para seed MDP-4.`);
  cache.set(entityId, row);
  return row;
};

const resolveBindingTargetRowId = async (prisma, binding, cache) => {
  if (binding.binding_kind !== "entity") return null;
  const entity = await resolveEntity(prisma, binding.target_id, cache);
  return entity?.id ?? null;
};

export const seedMdpRegistry = async (prisma) => {
  const entityCache = new Map();
  let seeded = 0;

  for (const def of EMPRESAS_REGISTRY_SEED) {
    const existing = await prisma.mdpRegistryEntry.findFirst({
      where: {
        scope: "platform",
        entry_id: def.entry_id,
        cliente_id: null,
      },
    });
    if (existing) continue;

    const entity = def.entity_id
      ? await resolveEntity(prisma, def.entity_id, entityCache)
      : null;

    const payload = def.payload ?? {};
    const bindings = def.bindings ?? [];
    const resolvedBindings = [];
    for (const binding of bindings) {
      resolvedBindings.push({
        binding_kind: binding.binding_kind,
        target_id: binding.target_id,
        target_row_id: await resolveBindingTargetRowId(prisma, binding, entityCache),
        sort_order: binding.sort_order ?? resolvedBindings.length,
      });
    }

    await prisma.mdpRegistryEntry.create({
      data: {
        entry_id: def.entry_id,
        entry_type: def.entry_type,
        scope: "platform",
        cliente_id: null,
        module_id: def.module_id ?? null,
        entity_row_id: entity?.id ?? null,
        base_template_id: def.base_template_id ?? "modelobase1",
        schema_version: REGISTRY_SCHEMA_VERSION,
        payload,
        content_hash: hashRegistryPayload(payload),
        status: def.status ?? "draft",
        owner_kind: def.owner_kind ?? "platform",
        owner_ref: def.owner_ref ?? "platform",
        empresa_scope: def.empresa_scope ?? "none",
        lifecycle: "active",
        sort_order: def.sort_order ?? 0,
        enabled: def.enabled ?? true,
        version_id: MDP_PLATFORM_VERSION_ID,
        metadata: def.metadata ?? undefined,
        labels: {
          create: {
            locale: DEFAULT_LOCALE,
            label: def.label,
            description: def.description ?? null,
          },
        },
        bindings: resolvedBindings.length
          ? {
              create: resolvedBindings.map((b) => ({
                binding_kind: b.binding_kind,
                target_id: b.target_id,
                target_row_id: b.target_row_id,
                sort_order: b.sort_order,
              })),
            }
          : undefined,
      },
    });
    seeded += 1;
  }

  return { seeded, total: EMPRESAS_REGISTRY_SEED.length };
};
