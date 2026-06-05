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

const sequenceKey = (clienteId, entityName) => ({
  cliente_id_entity_name: { cliente_id: clienteId, entity_name: entityName },
});

/** next_codigo armazenado = próximo código a gerar + 1 (primeiro registro usa 2 → retorna 1). */
export const ensureCodigoSequenciaFloor = async (tx, clienteId, entityName) => {
  const maxInUse = await getMaxCodigoInUse(tx, clienteId, entityName);
  const floorStored = maxInUse + 2;

  const current = await tx.entidadeCodigoSequencia.findUnique({
    where: sequenceKey(clienteId, entityName),
    select: { next_codigo: true },
  });

  if (!current) {
    await tx.entidadeCodigoSequencia.create({
      data: {
        cliente_id: clienteId,
        entity_name: entityName,
        next_codigo: Math.max(2, floorStored),
      },
    });
    return;
  }

  if (Number(current.next_codigo) < floorStored) {
    await tx.entidadeCodigoSequencia.update({
      where: sequenceKey(clienteId, entityName),
      data: { next_codigo: floorStored },
    });
  }
};

export const reserveNextCodigo = async (tx, clienteId, entityName) => {
  await ensureCodigoSequenciaFloor(tx, clienteId, entityName);

  const sequence = await tx.entidadeCodigoSequencia.upsert({
    where: sequenceKey(clienteId, entityName),
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

  const assigned = Number(sequence.next_codigo) - 1;

  if (entityName === ENTITY_CODIGO_EMPRESA) {
    const exists = await tx.empresa.findFirst({
      where: { cliente_id: clienteId, codempresa: assigned },
      select: { id: true },
    });
    if (exists) {
      await ensureCodigoSequenciaFloor(tx, clienteId, entityName);
      return reserveNextCodigo(tx, clienteId, entityName);
    }
  }

  if (entityName === ENTITY_CODIGO_CADCPS) {
    const exists = await tx.cadCpsCampo.findFirst({
      where: { cliente_id: clienteId, codigo: assigned },
      select: { id: true },
    });
    if (exists) {
      await ensureCodigoSequenciaFloor(tx, clienteId, entityName);
      return reserveNextCodigo(tx, clienteId, entityName);
    }
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
    const nextCodigo = Number(row.next_codigo) || 1;
    const current = await prisma.entidadeCodigoSequencia.findUnique({
      where: sequenceKey(clienteId, entityName),
      select: { next_codigo: true },
    });
    const resolvedNext = Math.max(Number(current?.next_codigo) || 0, nextCodigo);
    await prisma.entidadeCodigoSequencia.upsert({
      where: sequenceKey(clienteId, entityName),
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
  const synced = await syncAllCodigoSequencias(prisma);
  return empresa + cadcps + synced;
};
