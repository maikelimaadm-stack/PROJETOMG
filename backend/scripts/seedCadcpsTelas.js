import dotenv from "dotenv";
import { getPrismaClient } from "../src/database/prismaClient.js";
import { repCps } from "../src/modules/cadcps/repCps.js";

dotenv.config();

const run = async () => {
  await repCps.ensureTelasSeed();
  const prisma = getPrismaClient();
  const count = await prisma.cadCpsTela.count({ where: { ativo: true } });
  console.log(`Seed telas CADCPS (registry): ${count} tela(s) ativa(s).`);
};

run()
  .catch((error) => {
    console.error("Falha ao popular telas CADCPS:", error.message);
    process.exit(1);
  })
  .finally(async () => {
    const { closePrismaClient } = await import("../src/database/prismaClient.js");
    await closePrismaClient();
  });
