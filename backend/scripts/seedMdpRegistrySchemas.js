import {
  REGISTRY_SCHEMA_STUBS,
} from "../src/modules/mdp/mdpRegistryConstants.js";

export const seedMdpRegistrySchemas = async (prisma) => {
  let seeded = 0;
  for (const stub of REGISTRY_SCHEMA_STUBS) {
    await prisma.mdpRegistrySchema.upsert({
      where: {
        entry_type_schema_version: {
          entry_type: stub.entry_type,
          schema_version: stub.schema_version,
        },
      },
      create: {
        entry_type: stub.entry_type,
        schema_version: stub.schema_version,
        json_schema: stub.json_schema,
        active: true,
      },
      update: {
        json_schema: stub.json_schema,
        active: true,
      },
    });
    seeded += 1;
  }
  return { seeded, total: REGISTRY_SCHEMA_STUBS.length };
};
