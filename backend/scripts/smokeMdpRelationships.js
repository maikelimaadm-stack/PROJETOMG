import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { seedMdpPlatformEntities } from "./seedMdpPlatformEntities.js";
import { seedMdpFields } from "./seedMdpFields.js";
import { seedMdpRelationshipDictionary } from "./seedMdpRelationshipDictionary.js";
import { mdpRelationshipRepository } from "../src/modules/mdp/mdpRelationshipRepository.js";

dotenv.config();

const run = async () => {
  if (!process.env.DATABASE_URL) {
    console.log("[smoke-mdp-relationships] SKIP — DATABASE_URL ausente.");
    return;
  }

  const prisma = new PrismaClient();
  try {
    await seedMdpPlatformEntities(prisma);
    await seedMdpFields(prisma);
    const { relationships } = await seedMdpRelationshipDictionary(prisma);
    console.log(`[smoke-mdp-relationships] seeded=${relationships.seeded}/${relationships.total}`);

    const total = await prisma.mdpRelationship.count({ where: { lifecycle: "active" } });
    const physical = await prisma.mdpRelationship.count({
      where: { kind: "physical", lifecycle: "active" },
    });
    console.log(`[smoke-mdp-relationships] total=${total} physical=${physical}`);

    const empresasEntity = await prisma.mdpEntity.findFirst({
      where: { entity_id: "EmpresaCadastro", scope: "platform" },
    });
    const count = await mdpRelationshipRepository.countByEntity(empresasEntity.id);
    if (count < 5) throw new Error(`Esperado >= 5 relações para EmpresaCadastro, obtido ${count}.`);
    console.log("[smoke-mdp-relationships] OK");
  } finally {
    await prisma.$disconnect();
  }
};

run().catch((error) => {
  console.error("[smoke-mdp-relationships] FATAL:", error.message);
  process.exit(1);
});
