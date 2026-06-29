import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import { seedMdpPlatformEntities } from "./seedMdpPlatformEntities.js";
import { seedMdpFields } from "./seedMdpFields.js";
import { seedMdpRelationshipDictionary } from "./seedMdpRelationshipDictionary.js";
import { exportMdpRelationshipsRegistry } from "./exportMdpRelationshipsRegistry.js";
import { mdpRelationshipRepository } from "../src/modules/mdp/mdpRelationshipRepository.js";
import { mdpRelationshipService } from "../src/modules/mdp/mdpRelationshipService.js";
import { MDP_RELATIONSHIP_IDS } from "../src/modules/mdp/mdpRelationshipConstants.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const exportPath = path.resolve(__dirname, "../../config/mdp-relationships.export.json");

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const run = async () => {
  if (!process.env.DATABASE_URL) {
    console.log("[validate-mdp-relationships] SKIP — DATABASE_URL ausente (CI frontend-only).");
    return;
  }

  const prisma = new PrismaClient();
  try {
    await seedMdpPlatformEntities(prisma);
    await seedMdpFields(prisma);
    await seedMdpRelationshipDictionary(prisma);

    const empresasEntity = await prisma.mdpEntity.findFirst({
      where: { entity_id: "EmpresaCadastro", scope: "platform", cliente_id: null },
    });
    assert(empresasEntity, "Entidade EmpresaCadastro ausente.");

    const physicalCount = await mdpRelationshipRepository.countPhysicalByEntity(empresasEntity.id);
    assert(physicalCount >= 3, `Esperado >= 3 relações físicas Empresas, obtido ${physicalCount}.`);

    const clienteRel = await mdpRelationshipRepository.findByRelationshipId({
      relationshipId: MDP_RELATIONSHIP_IDS.empresaCliente,
      clienteId: "any",
    });
    assert(clienteRel?.kind === "physical", "Relação EmpresaCadastro.cliente inválida.");

    const exportPayload = await exportMdpRelationshipsRegistry(prisma);
    fs.writeFileSync(exportPath, `${JSON.stringify(exportPayload, null, 2)}\n`);
    assert(exportPayload.physicalCount >= 3, "Export deve incluir relações físicas.");

    const list = await mdpRelationshipService.list(
      { page: 1, pageSize: 20, entityId: "EmpresaCadastro" },
      { clienteId: "tenant-test", userId: "test", perfil: "ADMIN" }
    );
    assert(list.total >= 5, "API list deve retornar relações EmpresaCadastro.");

    console.log("[validate-mdp-relationships] OK — seed, export e API validados.");
  } finally {
    await prisma.$disconnect();
  }
};

run().catch((error) => {
  console.error("[validate-mdp-relationships] FATAL:", error.message);
  process.exit(1);
});
