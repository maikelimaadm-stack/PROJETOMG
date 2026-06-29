import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { seedMdpPublishEngine } from "./seedMdpPublishEngine.js";

dotenv.config();

const run = async () => {
  if (!process.env.DATABASE_URL) {
    console.log("[smoke-mdp-publish] SKIP — DATABASE_URL ausente.");
    return;
  }

  const prisma = new PrismaClient();
  try {
    const { publish } = await seedMdpPublishEngine(prisma);
    console.log(
      `[smoke-mdp-publish] version=${publish.version.id} bundle=${publish.bundle.bundleId}`
    );

    const bundleCount = await prisma.mdpCompiledBundle.count();
    const snapshotCount = await prisma.mdpSnapshot.count();
    const pinCount = await prisma.mdpEnvironmentPin.count({ where: { module_id: "empresas" } });

    if (bundleCount < 1) throw new Error("Esperado >= 1 compiled bundle.");
    if (snapshotCount < 1) throw new Error("Esperado >= 1 snapshot.");
    if (pinCount < 3) throw new Error("Esperado >= 3 environment pins.");

    console.log(
      `[smoke-mdp-publish] bundles=${bundleCount} snapshots=${snapshotCount} pins=${pinCount} OK`
    );
  } finally {
    await prisma.$disconnect();
  }
};

run().catch((error) => {
  console.error("[smoke-mdp-publish] FATAL:", error.message);
  process.exit(1);
});
