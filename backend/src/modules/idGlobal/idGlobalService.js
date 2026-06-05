import { getPrismaClient } from "../../database/prismaClient.js";

const runSerializableWithRetry = async (prisma, operation, attempts = 3) => {
  let currentAttempt = 0;
  while (currentAttempt < attempts) {
    try {
      return await prisma.$transaction((tx) => operation(tx), {
        isolationLevel: "Serializable",
      });
    } catch (error) {
      currentAttempt += 1;
      const isRetryable = String(error?.code || "") === "P2034";
      if (!isRetryable || currentAttempt >= attempts) {
        throw error;
      }
    }
  }
  throw new Error("Falha ao executar transação serializável para ID Global.");
};

export const reserveNextIdGlobal = async (tx, clienteId) => {
  const updated = await tx.cliente.update({
    where: { id: clienteId },
    data: { next_id_global: { increment: 1 } },
    select: { next_id_global: true },
  });
  return Number(updated.next_id_global) - 1;
};

export const registerRegistroGlobal = async (
  tx,
  { clienteId, idGlobal, entityName, registroId }
) => {
  await tx.registroGlobal.create({
    data: {
      cliente_id: clienteId,
      id_global: idGlobal,
      entity_name: entityName,
      registro_id: registroId,
    },
  });
};

export const createWithIdGlobal = async ({ clienteId, entityName, createRecord }) => {
  const prisma = getPrismaClient();
  return runSerializableWithRetry(prisma, async (tx) => {
    const idGlobal = await reserveNextIdGlobal(tx, clienteId);
    const record = await createRecord(tx, idGlobal);
    await registerRegistroGlobal(tx, {
      clienteId,
      idGlobal,
      entityName,
      registroId: record.id,
    });
    return record;
  });
};

export const countRegistrosGlobais = async (clienteId) => {
  const prisma = getPrismaClient();
  return prisma.registroGlobal.count({
    where: { cliente_id: clienteId },
  });
};

const OPERATIONAL_SOURCES = [
  {
    entityName: "Empresa",
    fetch: (prisma, clienteId) =>
      prisma.empresa.findMany({
        where: { cliente_id: clienteId },
        select: { id: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
    update: (tx, id, idGlobal) =>
      tx.empresa.update({ where: { id }, data: { id_global: idGlobal } }),
  },
  {
    entityName: "CadCpsCampo",
    fetch: (prisma, clienteId) =>
      prisma.cadCpsCampo.findMany({
        where: { cliente_id: clienteId },
        select: { id: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
    update: (tx, id, idGlobal) =>
      tx.cadCpsCampo.update({ where: { id }, data: { id_global: idGlobal } }),
  },
  {
    entityName: "CadastroRegistro",
    fetch: (prisma, clienteId) =>
      prisma.cadastroRegistro.findMany({
        where: { cliente_id: clienteId },
        select: { id: true, entity_name: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
    update: (tx, id, idGlobal) =>
      tx.cadastroRegistro.update({ where: { id }, data: { id_global: idGlobal } }),
    resolveEntityName: (row) => row.entity_name || "CadastroRegistro",
  },
  {
    entityName: "RegistroAnexo",
    fetch: (prisma, clienteId) =>
      prisma.registroAnexo.findMany({
        where: { cliente_id: clienteId },
        select: { id: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
    update: (tx, id, idGlobal) =>
      tx.registroAnexo.update({ where: { id }, data: { id_global: idGlobal } }),
  },
];

export const backfillClienteIdGlobal = async (clienteId) => {
  const prisma = getPrismaClient();
  const rows = [];

  for (const source of OPERATIONAL_SOURCES) {
    const records = await source.fetch(prisma, clienteId);
    for (const record of records) {
      rows.push({
        source,
        id: record.id,
        entityName: source.resolveEntityName?.(record) || source.entityName,
        createdAt: record.createdAt,
      });
    }
  }

  rows.sort((a, b) => {
    const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (diff !== 0) return diff;
    return String(a.id).localeCompare(String(b.id));
  });

  if (rows.length === 0) {
    return { clienteId, assigned: 0 };
  }

  await prisma.$transaction(async (tx) => {
    await tx.registroGlobal.deleteMany({ where: { cliente_id: clienteId } });

    let nextId = 1;
    for (const row of rows) {
      await row.source.update(tx, row.id, nextId);
      await registerRegistroGlobal(tx, {
        clienteId,
        idGlobal: nextId,
        entityName: row.entityName,
        registroId: row.id,
      });
      nextId += 1;
    }

    await tx.cliente.update({
      where: { id: clienteId },
      data: { next_id_global: nextId },
    });
  });

  return { clienteId, assigned: rows.length };
};

export const backfillAllClientesIdGlobal = async () => {
  const prisma = getPrismaClient();
  const clientes = await prisma.cliente.findMany({ select: { id: true } });
  const results = [];
  for (const cliente of clientes) {
    results.push(await backfillClienteIdGlobal(cliente.id));
  }
  return results;
};
