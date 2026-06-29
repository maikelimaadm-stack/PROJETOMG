import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import { seedMdpPlatformEntities } from "./seedMdpPlatformEntities.js";
import { seedMdpFields } from "./seedMdpFields.js";
import { seedMdpRelationshipDictionary } from "./seedMdpRelationshipDictionary.js";
import { seedMdpRegistryDictionary } from "./seedMdpRegistryDictionary.js";
import { exportMdpMetadataRegistry } from "./exportMdpMetadataRegistry.js";
import { mdpRegistryRepository } from "../src/modules/mdp/mdpRegistryRepository.js";
import { mdpRegistryService } from "../src/modules/mdp/mdpRegistryService.js";
import { MDP_REGISTRY_ENTRY_TYPES } from "../src/modules/mdp/mdpRegistryConstants.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const exportPath = path.resolve(__dirname, "../../config/mdp-metadata-registry.export.json");

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const run = async () => {
  if (!process.env.DATABASE_URL) {
    console.log("[validate-mdp-metadata-registry] SKIP — DATABASE_URL ausente (CI frontend-only).");
    return;
  }

  const prisma = new PrismaClient();
  try {
    await seedMdpPlatformEntities(prisma);
    await seedMdpFields(prisma);
    await seedMdpRelationshipDictionary(prisma);
    const { schemas, entries } = await seedMdpRegistryDictionary(prisma);
    assert(schemas.seeded >= MDP_REGISTRY_ENTRY_TYPES.length, "Schemas incompletos.");
    assert(entries.seeded > 0 || entries.total > 0, "Entries ausentes.");

    const publishedCount = await mdpRegistryRepository.countPublishedByTypes({
      clienteId: "any",
      moduleId: "empresas",
      entryTypes: ["layout", "field_config", "validation"],
    });
    assert(publishedCount >= 3, `Esperado >= 3 entries published empresas, obtido ${publishedCount}.`);

    const exportPayload = await exportMdpMetadataRegistry(prisma);
    fs.writeFileSync(exportPath, `${JSON.stringify(exportPayload, null, 2)}\n`);
    assert(exportPayload.empresasLayoutCount >= 1, "Export deve incluir layout empresas.");
    assert(exportPayload.empresasFieldConfigCount >= 1, "Export deve incluir field_config empresas.");
    assert(exportPayload.empresasValidationCount >= 1, "Export deve incluir validation empresas.");

    const list = await mdpRegistryService.list(
      { page: 1, pageSize: 50, moduleId: "empresas" },
      { clienteId: "tenant-test", userId: "test", perfil: "ADMIN" }
    );
    assert(list.total >= 10, "API list deve retornar entries empresas.");

    const introspect = await mdpRegistryService.introspect(
      { moduleId: "empresas" },
      { clienteId: "tenant-test", userId: "test", perfil: "ADMIN" }
    );
    assert(introspect.entryTypes.length === MDP_REGISTRY_ENTRY_TYPES.length, "Introspect incompleto.");

    console.log("[validate-mdp-metadata-registry] OK — seed, export, API e introspect validados.");
  } finally {
    await prisma.$disconnect();
  }
};

run().catch((error) => {
  console.error("[validate-mdp-metadata-registry] FATAL:", error.message);
  process.exit(1);
});
