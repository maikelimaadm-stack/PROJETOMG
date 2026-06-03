import dotenv from "dotenv";
import { getPrismaClient } from "../src/database/prismaClient.js";
import { CADCPS_TELAS_SEED } from "../src/modules/cadcps/cadcpsConstants.js";

dotenv.config();

const run = async () => {
  const prisma = getPrismaClient();
  for (const tela of CADCPS_TELAS_SEED) {
    await prisma.cadCpsTela.upsert({
      where: { codigo: tela.codigo },
      create: { ...tela },
      update: {
        nome: tela.nome,
        entity_name: tela.entity_name,
        ordem: tela.ordem,
        ativo: true,
      },
    });
  }
  const count = await prisma.cadCpsTela.count({ where: { ativo: true } });
  console.log(`Seed telas CADCPS: ${count} tela(s) ativa(s).`);
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
