import { getPrismaClient } from "../../database/prismaClient.js";

export const ENTITY_CODIGO_EMPRESA = "Empresa";
export const ENTITY_CODIGO_CADCPS = "CadCpsCampo";

const getMaxCodigoInUse = async (tx, clienteId, entityName) => {
  if (entityName === ENTITY_CODIGO_EMPRESA) {
    const agg = await tx.empresa.aggregate({
      where: { cliente_id: clienteId },
      _max: { codempresa: true },
    });
    return Number(agg._max.codempresa) || 0;
  }

  if (entityName === ENTITY_CODIGO_CADCPS) {
    const agg = await tx.cadCpsCampo.aggregate({
      where: { cliente_id: clienteId },
      _max: { codigo: true },
    });
    return Number(agg._max.codigo) || 0;
  }

  return 0;
};

/** next_codigo armazenado = próximo número a atribuir (primeiro registro = 1). */
export const ensureCodigoSequenciaFloor = async (tx, clienteId, entityName) => {
  const maxInUse = await getMaxCodigoInUse(tx, clienteId, entityName);
  const nextAssign = maxInUse + 1;

  await tx.$executeRaw`
    INSERT INTO "EntidadeCodigoSequencia" ("id", "cliente_id", "entity_name", "next_codigo", "createdAt", "updatedAt")
    VALUES (replace(gen_random_uuid()::text, '-', ''), ${clienteId}, ${entityName}, ${nextAssign}, NOW(), NOW())
    ON CONFLICT ("cliente_id", "entity_name") DO NOTHING
  `;

  await tx.$executeRaw`
    UPDATE "EntidadeCodigoSequencia"
    SET "next_codigo" = GREATEST("next_codigo", ${nextAssign}), "updatedAt" = NOW()
    WHERE "cliente_id" = ${clienteId} AND "entity_name" = ${entityName}
  `;
};

export const reserveNextCodigo = async (tx, clienteId, entityName) => {
  await tx.$executeRaw`
    INSERT INTO "EntidadeCodigoSequencia" ("id", "cliente_id", "entity_name", "next_codigo", "createdAt", "updatedAt")
    VALUES (replace(gen_random_uuid()::text, '-', ''), ${clienteId}, ${entityName}, 1, NOW(), NOW())
    ON CONFLICT ("cliente_id", "entity_name") DO NOTHING
  `;

  const rows = await tx.$queryRaw`
    UPDATE "EntidadeCodigoSequencia"
    SET "next_codigo" = "next_codigo" + 1, "updatedAt" = NOW()
    WHERE "cliente_id" = ${clienteId} AND "entity_name" = ${entityName}
    RETURNING ("next_codigo" - 1) AS assigned
  `;

  const assigned = Number(rows[0]?.assigned);
  if (!Number.isFinite(assigned) || assigned <= 0) {
    throw new Error(`Falha ao reservar código para ${entityName}.`);
  }

  return assigned;
};

export const reserveNextCodigoStandalone = async (clienteId, entityName) => {
  const prisma = getPrismaClient();
  return prisma.$transaction((tx) => reserveNextCodigo(tx, clienteId, entityName));
};

export const syncAllCodigoSequencias = async (prisma = getPrismaClient()) => {
  const clientes = await prisma.cliente.findMany({ select: { id: true } });
  let synced = 0;

  for (const cliente of clientes) {
    await prisma.$transaction(async (tx) => {
      for (const entityName of [ENTITY_CODIGO_EMPRESA, ENTITY_CODIGO_CADCPS]) {
        await ensureCodigoSequenciaFloor(tx, cliente.id, entityName);
      }
    });
    synced += 1;
  }

  return synced;
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
    const legacyNext = Number(row.next_codigo) || 1;
    await prisma.$executeRaw`
      INSERT INTO "EntidadeCodigoSequencia" ("id", "cliente_id", "entity_name", "next_codigo", "createdAt", "updatedAt")
      VALUES (replace(gen_random_uuid()::text, '-', ''), ${clienteId}, ${entityName}, ${legacyNext}, NOW(), NOW())
      ON CONFLICT ("cliente_id", "entity_name") DO UPDATE
        SET "next_codigo" = GREATEST("EntidadeCodigoSequencia"."next_codigo", EXCLUDED."next_codigo"),
            "updatedAt" = NOW()
    `;
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
  const synced = await syncAllCodigoSequencias(prisma);
  return empresa + cadcps + synced;
};
