import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import { seedMdpPlatformEntities } from "./seedMdpPlatformEntities.js";
import { seedMdpFields } from "./seedMdpFields.js";
import { exportMdpFieldsRegistry } from "./exportMdpFieldsRegistry.js";
import { mdpFieldRepository } from "../src/modules/mdp/mdpFieldRepository.js";
import { mdpFieldService } from "../src/modules/mdp/mdpFieldService.js";
import { mdpEntityRepository } from "../src/modules/mdp/mdpEntityRepository.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const exportPath = path.resolve(__dirname, "../../config/mdp-fields.export.json");

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const run = async () => {
  if (!process.env.DATABASE_URL) {
    console.log("[validate-mdp-fields] SKIP — DATABASE_URL ausente (CI frontend-only).");
    return;
  }

  const prisma = new PrismaClient();
  try {
    await seedMdpPlatformEntities(prisma);
    await seedMdpFields(prisma);

    const empresasEntity = await mdpEntityRepository.findByEntityId({
      entityId: "EmpresaCadastro",
      clienteId: "any-tenant",
    });
    assert(empresasEntity, "Entidade EmpresaCadastro ausente.");

    const nativeCount = await mdpFieldRepository.countNativeByEntity(empresasEntity.id);
    assert(nativeCount >= 19, `Esperado >= 19 campos nativos empresas, obtido ${nativeCount}.`);

    const exportPayload = await exportMdpFieldsRegistry(prisma);
    fs.writeFileSync(exportPath, `${JSON.stringify(exportPayload, null, 2)}\n`);
    assert(exportPayload.nativeCount >= 19, "Export deve incluir campos nativos empresas.");

    const list = await mdpFieldService.list(
      { page: 1, pageSize: 50, entityId: "EmpresaCadastro", source: "native" },
      { clienteId: "tenant-test", userId: "test", perfil: "ADMIN" }
    );
    assert(list.total >= 19, "API list deve retornar campos nativos platform.");

    console.log("[validate-mdp-fields] OK — seed, export e API validados.");
  } finally {
    await prisma.$disconnect();
  }
};

run().catch((error) => {
  console.error("[validate-mdp-fields] FATAL:", error.message);
  process.exit(1);
});
