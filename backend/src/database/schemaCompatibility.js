/**
 * Verifica compatibilidade entre Prisma/PostgreSQL em runtime.
 * Usado para fallback seguro quando colunas opcionais ainda não existem.
 */
import { getPrismaClient } from "./prismaClient.js";

let cached = null;

export const probeSchemaCompatibility = async (prisma = null) => {
  if (cached) return cached;
  const client = prisma || getPrismaClient();

  const columns = await client.$queryRaw`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Cliente'
      AND column_name IN ('total_empresas', 'total_cadcps_campos')
  `;
  const names = new Set(columns.map((row) => row.column_name));

  const indexRows = await client.$queryRaw`
    SELECT indexname
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'PermissaoEmpresa_usuario_id_idx'
  `;

  cached = {
    counterColumnsReady: names.has("total_empresas") && names.has("total_cadcps_campos"),
    hasPermissaoUsuarioIndex: indexRows.length > 0,
    clienteColumnsFound: [...names],
  };
  return cached;
};

export const resetSchemaCompatibilityCache = () => {
  cached = null;
};

export const hasCounterColumns = () => cached?.counterColumnsReady === true;
