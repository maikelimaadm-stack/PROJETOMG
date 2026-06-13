import dotenv from "dotenv";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const prisma = new PrismaClient();

const INDEX_STATEMENTS = [
  `CREATE INDEX IF NOT EXISTS "Empresa_cliente_id_codempresa_idx" ON "Empresa"("cliente_id", "codempresa")`,
  `CREATE INDEX IF NOT EXISTS "Empresa_cliente_id_status_idx" ON "Empresa"("cliente_id", "status")`,
  `CREATE INDEX IF NOT EXISTS "Empresa_cliente_id_razao_social_idx" ON "Empresa"("cliente_id", "razao_social")`,
  `CREATE INDEX IF NOT EXISTS "Empresa_telefone_trgm_idx" ON "Empresa" USING gin ("telefone" gin_trgm_ops)`,
  `CREATE INDEX IF NOT EXISTS "Empresa_email_trgm_idx" ON "Empresa" USING gin ("email" gin_trgm_ops)`,
  `CREATE INDEX IF NOT EXISTS "Empresa_cidade_trgm_idx" ON "Empresa" USING gin ("cidade" gin_trgm_ops)`,
  `CREATE INDEX IF NOT EXISTS "Empresa_endereco_trgm_idx" ON "Empresa" USING gin ("endereco" gin_trgm_ops)`,
  `CREATE INDEX IF NOT EXISTS "Empresa_bairro_trgm_idx" ON "Empresa" USING gin ("bairro" gin_trgm_ops)`,
  `CREATE INDEX IF NOT EXISTS "Empresa_whatsapp_trgm_idx" ON "Empresa" USING gin ("whatsapp" gin_trgm_ops)`,
  `CREATE INDEX IF NOT EXISTS "CadCpsCampo_cliente_id_ordem_tabela_idx" ON "CadCpsCampo"("cliente_id", "ordem_tabela")`,
  `CREATE INDEX IF NOT EXISTS "RegistroAnexo_cliente_id_entity_name_record_id_idx" ON "RegistroAnexo"("cliente_id", "entity_name", "record_id")`,
];

export const PERFORMANCE_INDEX_NAMES = [
  "Empresa_cliente_id_codempresa_idx",
  "Empresa_cliente_id_status_idx",
  "Empresa_cliente_id_razao_social_idx",
  "Empresa_telefone_trgm_idx",
  "Empresa_email_trgm_idx",
  "Empresa_cidade_trgm_idx",
  "Empresa_endereco_trgm_idx",
  "Empresa_bairro_trgm_idx",
  "Empresa_whatsapp_trgm_idx",
  "CadCpsCampo_cliente_id_ordem_tabela_idx",
  "RegistroAnexo_cliente_id_entity_name_record_id_idx",
];

export const ensurePerformanceIndexes = async () => {
  if (!process.env.DATABASE_URL) {
    return { applied: false, reason: "DATABASE_URL ausente" };
  }

  await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);

  for (const sql of INDEX_STATEMENTS) {
    await prisma.$executeRawUnsafe(sql);
  }

  const rows = await prisma.$queryRaw`
    SELECT indexname
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = ANY(${PERFORMANCE_INDEX_NAMES})
  `;
  const found = rows.map((row) => row.indexname);
  const missing = PERFORMANCE_INDEX_NAMES.filter((name) => !found.includes(name));

  return {
    applied: missing.length === 0,
    expected: PERFORMANCE_INDEX_NAMES.length,
    found: found.length,
    missing,
    names: found,
  };
};

const isMain =
  process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isMain) {
  ensurePerformanceIndexes()
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
      if (!result.applied) process.exit(1);
    })
    .catch((error) => {
      console.error(`Falha ao garantir índices de performance: ${error.message}`);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
