import dotenv from "dotenv";
import { getPrismaClient, closePrismaClient } from "../src/database/prismaClient.js";
import { seedMdpPlatformEntities } from "./seedMdpPlatformEntities.js";

dotenv.config();

const run = async () => {
  const prisma = getPrismaClient();
  const count = await seedMdpPlatformEntities(prisma);
  console.log(`[mdp-seed] ${count} entidade(s) platform registradas.`);
};

run()
  .catch((error) => {
    console.error("[mdp-seed] FATAL:", error.message);
    process.exit(1);
  })
  .finally(async () => {
    await closePrismaClient();
  });
