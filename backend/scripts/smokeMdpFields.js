import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { seedMdpPlatformEntities } from "./seedMdpPlatformEntities.js";
import { seedMdpFields } from "./seedMdpFields.js";
import { mdpFieldRepository } from "../src/modules/mdp/mdpFieldRepository.js";

dotenv.config();

const run = async () => {
  if (!process.env.DATABASE_URL) {
    console.log("[smoke-mdp-fields] SKIP — DATABASE_URL ausente.");
    return;
  }

  const prisma = new PrismaClient();
  try {
    await seedMdpPlatformEntities(prisma);
    const { native } = await seedMdpFields(prisma);
    console.log(`[smoke-mdp-fields] native seeded=${native.seeded}/${native.total}`);

    const total = await prisma.mdpField.count({ where: { lifecycle: "active" } });
    const nativeTotal = await prisma.mdpField.count({
      where: { source: "native", lifecycle: "active" },
    });
    console.log(`[smoke-mdp-fields] total=${total} native=${nativeTotal}`);

    const sample = await mdpFieldRepository.list({
      clienteId: "any",
      where: { source: "native" },
      take: 3,
    });
    if (!sample.items.length) throw new Error("Nenhum campo nativo encontrado.");
    console.log(`[smoke-mdp-fields] sample=${sample.items.map((f) => f.field_name).join(", ")}`);
    console.log("[smoke-mdp-fields] OK");
  } finally {
    await prisma.$disconnect();
  }
};

run().catch((error) => {
  console.error("[smoke-mdp-fields] FATAL:", error.message);
  process.exit(1);
});
