import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import dotenv from "dotenv";
import { getPrismaClient, closePrismaClient } from "../src/database/prismaClient.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");

const registryTargets = [
  path.join(repoRoot, "config/cadastro-modules.registry.json"),
  path.join(repoRoot, "backend/config/cadastro-modules.registry.json"),
];
const exportTarget = path.join(repoRoot, "config/mdp-entities.export.json");

const toRegistryEntry = (row) => {
  const label =
    row.labels?.find((item) => item.locale === "pt-BR") || row.labels?.[0] || null;
  return {
    moduleId: row.module_id,
    codigo: row.codigo,
    nome: label?.singular || row.entity_id,
    entityName: row.legacy_entity_name || row.entity_id,
    ordem: row.sort_order,
    ativo: row.lifecycle === "active",
    mdpEntityId: row.entity_id,
    entityKind: row.entity_kind,
    baseTemplateId: row.base_template_id,
  };
};

const toExportPayload = (rows) =>
  rows.map((row) => ({
    id: row.id,
    entityId: row.entity_id,
    moduleId: row.module_id,
    codigo: row.codigo,
    scope: row.scope,
    entityKind: row.entity_kind,
    sortOrder: row.sort_order,
    legacyEntityName: row.legacy_entity_name,
    baseTemplateId: row.base_template_id,
    empresaScope: row.empresa_scope,
    lifecycle: row.lifecycle,
    persistence: row.persistence,
    labels: row.labels,
    capabilities: row.capabilities,
    routes: row.routes,
  }));

export const exportMdpEntitiesRegistry = async (prisma = getPrismaClient()) => {
  const rows = await prisma.mdpEntity.findMany({
    where: {
      scope: "platform",
      cliente_id: null,
      is_runtime_module: true,
      lifecycle: "active",
    },
    include: {
      labels: true,
      capabilities: true,
      routes: { orderBy: { sort_order: "asc" } },
    },
    orderBy: { sort_order: "asc" },
  });

  const registry = rows.map(toRegistryEntry);
  const exportPayload = toExportPayload(rows);

  await fs.mkdir(path.dirname(exportTarget), { recursive: true });
  await fs.writeFile(exportTarget, `${JSON.stringify(exportPayload, null, 2)}\n`, "utf8");

  for (const target of registryTargets) {
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, `${JSON.stringify(registry, null, 2)}\n`, "utf8");
  }

  return { registryCount: registry.length, exportCount: exportPayload.length };
};

const run = async () => {
  const prisma = getPrismaClient();
  const result = await exportMdpEntitiesRegistry(prisma);
  console.log(
    `[mdp-export] ${result.registryCount} módulo(s) runtime exportados para registry + mdp-entities.export.json`
  );
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  run()
    .catch((error) => {
      console.error("[mdp-export] FATAL:", error.message);
      process.exit(1);
    })
    .finally(async () => {
      await closePrismaClient();
    });
}
