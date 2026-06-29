import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { seedMdpPlatformEntities } from "./seedMdpPlatformEntities.js";
import { exportMdpEntitiesRegistry } from "./exportMdpEntitiesRegistry.js";
import { mdpEntityRepository } from "../src/modules/mdp/mdpEntityRepository.js";
import { mdpEntityService } from "../src/modules/mdp/mdpEntityService.js";

dotenv.config();

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const run = async () => {
  if (!process.env.DATABASE_URL) {
    console.log("[validate-mdp-entities] SKIP — DATABASE_URL ausente (CI frontend-only).");
    return;
  }

  const prisma = new PrismaClient();
  try {
    await seedMdpPlatformEntities(prisma);
    const exportResult = await exportMdpEntitiesRegistry(prisma);
    assert(exportResult.registryCount >= 2, "Esperado >= 2 entidades runtime platform.");

    const empresas = await mdpEntityRepository.findByEntityId({
      entityId: "EmpresaCadastro",
      clienteId: "any-tenant",
    });
    assert(empresas?.module_id === "empresas", "Seed empresas inválido.");
    assert(empresas?.legacy_entity_name === "EmpresaCadastro", "legacyEntityName empresas inválido.");

    const cadcps = await mdpEntityRepository.findByEntityId({
      entityId: "CadcpsFieldCatalog",
      clienteId: "any-tenant",
    });
    assert(cadcps?.entity_kind === "meta", "cadcps deve ser entityKind meta.");
    assert(cadcps?.legacy_entity_name === "CadCpsCampo", "legacyEntityName cadcps inválido.");

    const runtimeCount = await mdpEntityRepository.countRuntimeModules();
    assert(runtimeCount === 2, `runtime modules=${runtimeCount}, esperado 2.`);

    const list = await mdpEntityService.list(
      { page: 1, pageSize: 20, runtimeOnly: true },
      { clienteId: "tenant-test", userId: "test", perfil: "ADMIN" }
    );
    assert(list.total >= 2, "Listagem deve incluir entidades platform.");

    console.log("[validate-mdp-entities] OK — seed, export e isolamento platform validados.");
  } finally {
    await prisma.$disconnect();
  }
};

run().catch((error) => {
  console.error("[validate-mdp-entities] FATAL:", error.message);
  process.exit(1);
});
