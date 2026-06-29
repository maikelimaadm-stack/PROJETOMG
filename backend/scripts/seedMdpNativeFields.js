import {
  buildStableFieldId,
  DEFAULT_LOCALE,
  EMPRESAS_NATIVE_FIELD_DEFS,
  MDP_FIELD_ENTITY_IDS,
  MDP_PLATFORM_VERSION_ID,
} from "../src/modules/mdp/mdpFieldConstants.js";
import { MDP_ENTITY_IDS } from "../src/modules/mdp/mdpEntityConstants.js";

export const seedMdpNativeFields = async (prisma) => {
  const empresasEntity = await prisma.mdpEntity.findFirst({
    where: { entity_id: MDP_FIELD_ENTITY_IDS.empresas, scope: "platform", cliente_id: null },
  });
  if (!empresasEntity) {
    throw new Error("MDP entity EmpresaCadastro ausente — execute seed MDP-1 primeiro.");
  }

  let seeded = 0;
  for (const def of EMPRESAS_NATIVE_FIELD_DEFS) {
    const fieldId = buildStableFieldId(MDP_FIELD_ENTITY_IDS.empresas, def.field_name);
    const existing = await prisma.mdpField.findFirst({
      where: { scope: "platform", field_id: fieldId, cliente_id: null },
    });
    if (existing) continue;

    await prisma.mdpField.create({
      data: {
        field_id: fieldId,
        entity_row_id: empresasEntity.id,
        field_name: def.field_name,
        source: def.source || "native",
        field_type: def.field_type,
        scope: "platform",
        cliente_id: null,
        active: true,
        required: def.required ?? false,
        read_only: def.read_only ?? false,
        visible_form: def.visible_form ?? true,
        visible_table: def.visible_table ?? false,
        use_mask: def.use_mask ?? false,
        sort_order: def.sort_order ?? 0,
        table_order: def.sort_order ?? 0,
        base_template_id: "modelobase1",
        lifecycle: "active",
        version_id: MDP_PLATFORM_VERSION_ID,
        labels: {
          create: {
            locale: DEFAULT_LOCALE,
            label: def.label,
          },
        },
      },
    });
    seeded += 1;
  }

  return { entityId: MDP_ENTITY_IDS.empresas, seeded, total: EMPRESAS_NATIVE_FIELD_DEFS.length };
};
