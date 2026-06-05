import dotenv from "dotenv";
import { createMigrationPrisma } from "./migrationPrisma.js";
import { syncAllCodigoSequencias } from "../src/modules/sequencias/entidadeCodigoService.js";
import { syncAllIdGlobalSequencias } from "../src/modules/idGlobal/idGlobalService.js";

dotenv.config();

const run = async () => {
  const prisma = createMigrationPrisma();
  try {
    const [codigos, idGlobals] = await Promise.all([
      syncAllCodigoSequencias(prisma),
      syncAllIdGlobalSequencias(prisma),
    ]);
    console.log(`[repair] Sequências sincronizadas — código: ${codigos}, id_global: ${idGlobals} cliente(s).`);
  } finally {
    await prisma.$disconnect();
  }
};

run().catch((error) => {
  console.error("[repair] Falha:", error.message);
  process.exit(1);
});
