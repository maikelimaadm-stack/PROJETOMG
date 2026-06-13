import { getPrismaClient } from "../../database/prismaClient.js";
import { runTransactionWithRetry } from "../../database/transactionRetry.js";

const ID_GLOBAL_FLOOR_TABLES = ["RegistroGlobal", "Empresa", "CadCpsCampo"];

const isMissingRelationError = (error, relationName = "") => {
  const message = `${error?.message || ""} ${error?.meta?.message || ""}`.toLowerCase();
  const relation = String(relationName || "").toLowerCase();
  const relationHint = relation ? message.includes(relation) : true;

  return (
    error?.meta?.code === "42P01" ||
    (error?.code === "P2021" && relationHint) ||
    ((message.includes("does not exist") || message.includes("não existe")) &&
      (message.includes("relation") || message.includes("table")) &&
      relationHint)
  );
};

export const syncClienteIdGlobalFloor = async (tx, clienteId) => {
  let maxAssignedIdGlobal = 0;

  for (const tableName of ID_GLOBAL_FLOOR_TABLES) {
    try {
      const rows = await tx.$queryRawUnsafe(
        `SELECT COALESCE(MAX("id_global"), 0) AS max_id FROM "${tableName}" WHERE "cliente_id" = $1`,
        clienteId
      );
      const currentMax = Number(rows?.[0]?.max_id) || 0;
      maxAssignedIdGlobal = Math.max(maxAssignedIdGlobal, currentMax);
    } catch (error) {
      // Ambientes legados podem não ter todas as tabelas auxiliares de id_global.
      if (!isMissingRelationError(error, tableName)) {
        throw error;
      }
    }
  }

  const nextAssign = Math.max(1, maxAssignedIdGlobal + 1);

  await tx.$executeRaw`
    UPDATE "Cliente"
    SET "next_id_global" = GREATEST("next_id_global", ${nextAssign}), "updatedAt" = NOW()
    WHERE "id" = ${clienteId}
  `;
};

export const reserveNextIdGlobal = async (tx, clienteId) => {
  const reserveOnce = async () => {
    const rows = await tx.$queryRaw`
      UPDATE "Cliente"
      SET "next_id_global" = "next_id_global" + 1, "updatedAt" = NOW()
      WHERE "id" = ${clienteId}
      RETURNING ("next_id_global" - 1) AS assigned
    `;
    return Number(rows[0]?.assigned);
  };

  let assigned = await reserveOnce();
  if (Number.isFinite(assigned) && assigned > 0) {
    return assigned;
  }

  // Auto-recuperação para sequências defasadas/cliente ausente em cenários legados.
  await syncClienteIdGlobalFloor(tx, clienteId);
  assigned = await reserveOnce();
  if (!Number.isFinite(assigned) || assigned <= 0) {
    throw new Error("Falha ao reservar ID Global.");
  }
  return assigned;
};

export const registerRegistroGlobal = async (
  tx,
  { clienteId, idGlobal, entityName, registroId }
) => {
  try {
    await tx.registroGlobal.create({
      data: {
        cliente_id: clienteId,
        id_global: idGlobal,
        entity_name: entityName,
        registro_id: registroId,
      },
    });
  } catch (error) {
    // Compatibilidade com bancos antigos sem tabela RegistroGlobal.
    if (!isMissingRelationError(error, "RegistroGlobal")) {
      throw error;
    }
  }
};

export const createWithIdGlobal = async ({ clienteId, entityName, createRecord }) => {
  const prisma = getPrismaClient();
  return runTransactionWithRetry(prisma, async (tx) => {
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

export const syncAllIdGlobalSequencias = async (prisma = getPrismaClient()) => {
  const clientes = await prisma.cliente.findMany({ select: { id: true } });
  for (const cliente of clientes) {
    await prisma.$transaction((tx) => syncClienteIdGlobalFloor(tx, cliente.id));
  }
  return clientes.length;
};
