import { getPrismaClient } from "../../database/prismaClient.js";

/** O(1) — next_id_global e count por cliente_id (índice), sem JOINs. */
export const getContadores = async (scope) => {
  const prisma = getPrismaClient();
  const [cliente, empresas] = await Promise.all([
    prisma.cliente.findUnique({
      where: { id: scope.clienteId },
      select: { next_id_global: true },
    }),
    prisma.empresa.count({
      where: { cliente_id: scope.clienteId },
    }),
  ]);

  return {
    empresas,
    registrosGlobais: Math.max(0, Number(cliente?.next_id_global ?? 1) - 1),
  };
};
