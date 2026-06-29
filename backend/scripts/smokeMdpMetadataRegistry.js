import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { seedMdpPlatformEntities } from "./seedMdpPlatformEntities.js";
import { seedMdpFields } from "./seedMdpFields.js";
import { seedMdpRelationshipDictionary } from "./seedMdpRelationshipDictionary.js";
import { seedMdpRegistryDictionary } from "./seedMdpRegistryDictionary.js";
import { mdpRegistryRepository } from "../src/modules/mdp/mdpRegistryRepository.js";
import { MDP_REGISTRY_ENTRY_TYPES } from "../src/modules/mdp/mdpRegistryConstants.js";

dotenv.config();

const run = async () => {
  if (!process.env.DATABASE_URL) {
    console.log("[smoke-mdp-metadata-registry] SKIP — DATABASE_URL ausente.");
    return;
  }

  const prisma = new PrismaClient();
  try {
    await seedMdpPlatformEntities(prisma);
    await seedMdpFields(prisma);
    await seedMdpRelationshipDictionary(prisma);
    const { schemas, entries } = await seedMdpRegistryDictionary(prisma);
    console.log(
      `[smoke-mdp-metadata-registry] schemas=${schemas.seeded}/${schemas.total} entries=${entries.seeded}/${entries.total}`
    );

    const total = await prisma.mdpRegistryEntry.count({ where: { lifecycle: "active" } });
    const published = await prisma.mdpRegistryEntry.count({
      where: { lifecycle: "active", status: "published" },
    });
    console.log(`[smoke-mdp-metadata-registry] total=${total} published=${published}`);

    const schemaCount = await prisma.mdpRegistrySchema.count({ where: { active: true } });
    if (schemaCount < MDP_REGISTRY_ENTRY_TYPES.length) {
      throw new Error(`Esperado >= ${MDP_REGISTRY_ENTRY_TYPES.length} schemas, obtido ${schemaCount}.`);
    }

    const empresasCount = await mdpRegistryRepository.countByModule({
      clienteId: "any",
      moduleId: "empresas",
    });
    if (empresasCount < 10) {
      throw new Error(`Esperado >= 10 entries empresas, obtido ${empresasCount}.`);
    }

    console.log("[smoke-mdp-metadata-registry] OK");
  } finally {
    await prisma.$disconnect();
  }
};

run().catch((error) => {
  console.error("[smoke-mdp-metadata-registry] FATAL:", error.message);
  process.exit(1);
});
