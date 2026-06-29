import { DEFAULT_LOCALE } from "../src/modules/mdp/mdpFieldConstants.js";

export const exportMdpFieldsRegistry = async (prisma) => {
  const fields = await prisma.mdpField.findMany({
    where: { lifecycle: "active" },
    include: {
      labels: { where: { locale: DEFAULT_LOCALE } },
      entity: { select: { entity_id: true, module_id: true } },
    },
    orderBy: [{ entity: { sort_order: "asc" } }, { sort_order: "asc" }],
  });

  const exportPayload = {
    exportedAt: new Date().toISOString(),
    version: "mdp-fields-v1",
    fieldCount: fields.length,
    nativeCount: fields.filter((f) => f.source === "native").length,
    customCount: fields.filter((f) => f.source === "custom").length,
    fields: fields.map((row) => ({
      id: row.id,
      fieldId: row.field_id,
      entityId: row.entity?.entity_id,
      moduleId: row.entity?.module_id,
      fieldName: row.field_name,
      source: row.source,
      fieldType: row.field_type,
      scope: row.scope,
      label: row.labels[0]?.label || row.field_name,
      baseTemplateId: row.base_template_id,
      lifecycle: row.lifecycle,
    })),
  };

  return exportPayload;
};
