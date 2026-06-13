import dotenv from "dotenv";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const prisma = new PrismaClient();

/** Índices críticos para listagem/busca — consolidados das migrations Prisma + boot. */
const INDEX_STATEMENTS = [
  `CREATE EXTENSION IF NOT EXISTS pg_trgm`,
  `CREATE INDEX IF NOT EXISTS "Empresa_cliente_id_codempresa_idx" ON "Empresa"("cliente_id", "codempresa")`,
  `CREATE INDEX IF NOT EXISTS "Empresa_cliente_id_status_idx" ON "Empresa"("cliente_id", "status")`,
  `CREATE INDEX IF NOT EXISTS "Empresa_cliente_id_razao_social_idx" ON "Empresa"("cliente_id", "razao_social")`,
  `CREATE INDEX IF NOT EXISTS "Empresa_cliente_id_nome_fantasia_idx" ON "Empresa"("cliente_id", "nome_fantasia")`,
  `CREATE INDEX IF NOT EXISTS "Empresa_cliente_id_cpf_cnpj_idx" ON "Empresa"("cliente_id", "cpf_cnpj")`,
  `CREATE INDEX IF NOT EXISTS "Empresa_cliente_id_cidade_idx" ON "Empresa"("cliente_id", "cidade")`,
  `CREATE INDEX IF NOT EXISTS "Empresa_cliente_id_estado_idx" ON "Empresa"("cliente_id", "estado")`,
  `CREATE INDEX IF NOT EXISTS "Empresa_cliente_id_updatedAt_idx" ON "Empresa"("cliente_id", "updatedAt")`,
  `CREATE INDEX IF NOT EXISTS "Empresa_campos_personalizados_gin_idx" ON "Empresa" USING GIN ("campos_personalizados" jsonb_path_ops)`,
  `CREATE INDEX IF NOT EXISTS "Empresa_razao_social_trgm_idx" ON "Empresa" USING gin ("razao_social" gin_trgm_ops)`,
  `CREATE INDEX IF NOT EXISTS "Empresa_nome_fantasia_trgm_idx" ON "Empresa" USING gin ("nome_fantasia" gin_trgm_ops)`,
  `CREATE INDEX IF NOT EXISTS "Empresa_cpf_cnpj_trgm_idx" ON "Empresa" USING gin ("cpf_cnpj" gin_trgm_ops)`,
  `CREATE INDEX IF NOT EXISTS "Empresa_telefone_trgm_idx" ON "Empresa" USING gin ("telefone" gin_trgm_ops)`,
  `CREATE INDEX IF NOT EXISTS "Empresa_email_trgm_idx" ON "Empresa" USING gin ("email" gin_trgm_ops)`,
  `CREATE INDEX IF NOT EXISTS "Empresa_cidade_trgm_idx" ON "Empresa" USING gin ("cidade" gin_trgm_ops)`,
  `CREATE INDEX IF NOT EXISTS "Empresa_endereco_trgm_idx" ON "Empresa" USING gin ("endereco" gin_trgm_ops)`,
  `CREATE INDEX IF NOT EXISTS "Empresa_bairro_trgm_idx" ON "Empresa" USING gin ("bairro" gin_trgm_ops)`,
  `CREATE INDEX IF NOT EXISTS "Empresa_whatsapp_trgm_idx" ON "Empresa" USING gin ("whatsapp" gin_trgm_ops)`,
  `CREATE INDEX IF NOT EXISTS "CadCpsCampo_cliente_id_nome_idx" ON "CadCpsCampo"("cliente_id", "nome")`,
  `CREATE INDEX IF NOT EXISTS "CadCpsCampo_cliente_id_field_name_idx" ON "CadCpsCampo"("cliente_id", "field_name")`,
  `CREATE INDEX IF NOT EXISTS "CadCpsCampo_cliente_id_codigo_idx" ON "CadCpsCampo"("cliente_id", "codigo")`,
  `CREATE INDEX IF NOT EXISTS "CadCpsCampo_cliente_id_ordem_tabela_idx" ON "CadCpsCampo"("cliente_id", "ordem_tabela")`,
  `CREATE INDEX IF NOT EXISTS "CadCpsCampo_nome_trgm_idx" ON "CadCpsCampo" USING gin ("nome" gin_trgm_ops)`,
  `CREATE INDEX IF NOT EXISTS "RegistroAnexo_cliente_id_entity_name_record_id_idx" ON "RegistroAnexo"("cliente_id", "entity_name", "record_id")`,
];

export const PERFORMANCE_INDEX_NAMES = [
  "Empresa_cliente_id_codempresa_idx",
  "Empresa_cliente_id_status_idx",
  "Empresa_cliente_id_razao_social_idx",
  "Empresa_cliente_id_nome_fantasia_idx",
  "Empresa_cliente_id_cpf_cnpj_idx",
  "Empresa_cliente_id_cidade_idx",
  "Empresa_cliente_id_estado_idx",
  "Empresa_cliente_id_updatedAt_idx",
  "Empresa_campos_personalizados_gin_idx",
  "Empresa_razao_social_trgm_idx",
  "Empresa_nome_fantasia_trgm_idx",
  "Empresa_cpf_cnpj_trgm_idx",
  "Empresa_telefone_trgm_idx",
  "Empresa_email_trgm_idx",
  "Empresa_cidade_trgm_idx",
  "Empresa_endereco_trgm_idx",
  "Empresa_bairro_trgm_idx",
  "Empresa_whatsapp_trgm_idx",
  "CadCpsCampo_cliente_id_nome_idx",
  "CadCpsCampo_cliente_id_field_name_idx",
  "CadCpsCampo_cliente_id_codigo_idx",
  "CadCpsCampo_cliente_id_ordem_tabela_idx",
  "CadCpsCampo_nome_trgm_idx",
  "RegistroAnexo_cliente_id_entity_name_record_id_idx",
];

export const ensurePerformanceIndexes = async () => {
  if (!process.env.DATABASE_URL) {
    return { applied: false, reason: "DATABASE_URL ausente" };
  }

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
