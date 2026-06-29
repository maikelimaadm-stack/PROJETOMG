import { DEFAULT_LOCALE } from "../src/modules/mdp/mdpEntityConstants.js";
import { MDP_REGISTRY_ENTRY_TYPES } from "../src/modules/mdp/mdpRegistryConstants.js";

export const exportMdpMetadataRegistry = async (prisma) => {
  const entries = await prisma.mdpRegistryEntry.findMany({
    where: { lifecycle: "active" },
    include: {
      labels: { where: { locale: DEFAULT_LOCALE } },
      bindings: { orderBy: { sort_order: "asc" } },
      entity: { select: { entity_id: true, module_id: true } },
    },
    orderBy: [{ sort_order: "asc" }, { entry_id: "asc" }],
  });

  const schemas = await prisma.mdpRegistrySchema.findMany({
    where: { active: true },
    orderBy: [{ entry_type: "asc" }],
  });

  const byType = Object.fromEntries(
    MDP_REGISTRY_ENTRY_TYPES.map((entryType) => [
      entryType,
      entries.filter((e) => e.entry_type === entryType).length,
    ])
  );

  const empresasEntries = entries.filter((e) => e.module_id === "empresas");
  const publishedEmpresas = empresasEntries.filter((e) => e.status === "published");

  return {
    exportedAt: new Date().toISOString(),
    version: "mdp-metadata-registry-v1",
    entryCount: entries.length,
    schemaCount: schemas.length,
    entryTypesSupported: MDP_REGISTRY_ENTRY_TYPES.length,
    empresasCount: empresasEntries.length,
    empresasPublishedCount: publishedEmpresas.length,
    empresasLayoutCount: publishedEmpresas.filter((e) => e.entry_type === "layout").length,
    empresasFieldConfigCount: publishedEmpresas.filter((e) => e.entry_type === "field_config").length,
    empresasValidationCount: publishedEmpresas.filter((e) => e.entry_type === "validation").length,
    countsByType: byType,
    schemas: schemas.map((s) => ({
      entryType: s.entry_type,
      schemaVersion: s.schema_version,
    })),
    entries: entries.map((row) => ({
      id: row.id,
      entryId: row.entry_id,
      entryType: row.entry_type,
      moduleId: row.module_id,
      entityId: row.entity?.entity_id ?? null,
      status: row.status,
      enabled: row.enabled,
      baseTemplateId: row.base_template_id,
      contentHash: row.content_hash,
      label: row.labels[0]?.label || row.entry_id,
      bindings: (row.bindings || []).map((b) => ({
        bindingKind: b.binding_kind,
        targetId: b.target_id,
      })),
    })),
  };
};
