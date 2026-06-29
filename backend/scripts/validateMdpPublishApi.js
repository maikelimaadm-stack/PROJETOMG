import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import { seedMdpPublishEngine } from "./seedMdpPublishEngine.js";
import { exportMdpCompiledBundle } from "./exportMdpCompiledBundle.js";
import { mdpPublishService } from "../src/modules/mdp/mdpPublishService.js";
import { MDP_PLATFORM_VERSION_ID } from "../src/modules/mdp/mdpEntityConstants.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const exportPath = path.resolve(__dirname, "../../config/mdp-compiled-bundle.export.json");

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const run = async () => {
  if (!process.env.DATABASE_URL) {
    console.log("[validate-mdp-publish] SKIP — DATABASE_URL ausente (CI frontend-only).");
    return;
  }

  const prisma = new PrismaClient();
  try {
    const { publish } = await seedMdpPublishEngine(prisma);
    assert(publish?.bundle?.integrityHash, "Publish deve gerar CRB com integrityHash.");

    const exportPayload = await exportMdpCompiledBundle(prisma);
    fs.writeFileSync(exportPath, `${JSON.stringify(exportPayload, null, 2)}\n`);
    assert(exportPayload.bundleCount >= 1, "Export deve incluir bundle empresas.");
    assert(exportPayload.entityCount >= 1, "CRB deve incluir entidades.");
    assert(exportPayload.registryCount >= 1, "CRB deve incluir registry entries.");

    const versions = await mdpPublishService.listVersions(
      { moduleId: "empresas", page: 1, pageSize: 10, scope: "platform" },
      { clienteId: "platform", userId: "test", perfil: "ADMIN" }
    );
    assert(versions.total >= 1, "API versions deve retornar histórico.");

    const introspect = await mdpPublishService.introspect(
      { moduleId: "empresas", environment: "production", scope: "platform" },
      { clienteId: "platform", userId: "test", perfil: "ADMIN" }
    );
    assert(introspect.versionInfo?.versionId, "Introspect unificado deve retornar versão pinada.");

    const pins = await mdpPublishService.listEnvironmentPins(
      { moduleId: "empresas", scope: "platform" },
      { clienteId: "platform", userId: "test", perfil: "ADMIN" }
    );
    assert(pins.length >= 3, "Deve haver pins dev/qa/prod.");

    console.log("[validate-mdp-publish] OK — publish, CRB, snapshots, pins validados.");
  } finally {
    await prisma.$disconnect();
  }
};

run().catch((error) => {
  console.error("[validate-mdp-publish] FATAL:", error.message);
  process.exit(1);
});
