import dotenv from "dotenv";
import { createMigrationPrisma } from "./migrationPrisma.js";
import { syncAllCodigoSequencias } from "../src/modules/sequencias/entidadeCodigoService.js";

dotenv.config();

const run = async () => {
  const prisma = createMigrationPrisma();
  try {
    const synced = await syncAllCodigoSequencias(prisma);
    console.log(`[repair] Sequências de código sincronizadas para ${synced} cliente(s).`);
  } finally {
    await prisma.$disconnect();
  }
};

run().catch((error) => {
  console.error("[repair] Falha:", error.message);
  process.exit(1);
});
