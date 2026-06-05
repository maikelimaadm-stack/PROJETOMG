import { getPrismaClient } from "../../database/prismaClient.js";

export const ENTITY_CODIGO_EMPRESA = "Empresa";
export const ENTITY_CODIGO_CADCPS = "CadCpsCampo";

export const reserveNextCodigo = async (tx, clienteId, entityName) => {
  const sequence = await tx.entidadeCodigoSequencia.upsert({
    where: {
      cliente_id_entity_name: {
        cliente_id: clienteId,
        entity_name: entityName,
      },
    },
    create: {
      cliente_id: clienteId,
      entity_name: entityName,
      next_codigo: 2,
    },
    update: {
      next_codigo: { increment: 1 },
    },
    select: { next_codigo: true },
  });
  return Number(sequence.next_codigo) - 1;
};

export const reserveNextCodigoStandalone = async (clienteId, entityName) => {
  const prisma = getPrismaClient();
  return prisma.$transaction((tx) => reserveNextCodigo(tx, clienteId, entityName));
};

const tableExists = async (prisma, tableName) => {
  const rows = await prisma.$queryRaw`
    SELECT 1 AS ok
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = ${tableName}
    LIMIT 1
  `;
  return rows.length > 0;
};

const migrateTableToEntidade = async (prisma, tableName, entityName) => {
  const exists = await tableExists(prisma, tableName);
  if (!exists) return 0;

  const legacyRows = await prisma.$queryRawUnsafe(
    `SELECT "cliente_id", "next_codigo" FROM "${tableName}"`
  );
  let migrated = 0;

  for (const row of legacyRows) {
    const clienteId = row.cliente_id;
    const nextCodigo = Number(row.next_codigo) || 1;
    const current = await prisma.entidadeCodigoSequencia.findUnique({
      where: {
        cliente_id_entity_name: { cliente_id: clienteId, entity_name: entityName },
      },
      select: { next_codigo: true },
    });
    const resolvedNext = Math.max(Number(current?.next_codigo) || 0, nextCodigo);
    await prisma.entidadeCodigoSequencia.upsert({
      where: {
        cliente_id_entity_name: { cliente_id: clienteId, entity_name: entityName },
      },
      create: {
        cliente_id: clienteId,
        entity_name: entityName,
        next_codigo: resolvedNext,
      },
      update: {
        next_codigo: resolvedNext,
      },
    });
    migrated += 1;
  }

  return migrated;
};

export const migrateLegacyCodigoSequencias = async (prisma = getPrismaClient()) => {
  const empresa = await migrateTableToEntidade(
    prisma,
    "EmpresaCodigoSequencia",
    ENTITY_CODIGO_EMPRESA
  );
  const cadcps = await migrateTableToEntidade(
    prisma,
    "CadCpsCodigoSequencia",
    ENTITY_CODIGO_CADCPS
  );
  return empresa + cadcps;
};
