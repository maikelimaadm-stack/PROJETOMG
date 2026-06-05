import { getPrismaClient } from "../../database/prismaClient.js";

export const clienteModuloRepository = {
  async listByCliente(clienteId) {
    const prisma = getPrismaClient();
    return prisma.clienteModulo.findMany({
      where: { cliente_id: clienteId },
      orderBy: { modulo: "asc" },
    });
  },

  async upsert({ clienteId, modulo, ativo }) {
    const prisma = getPrismaClient();
    return prisma.clienteModulo.upsert({
      where: {
        cliente_id_modulo: {
          cliente_id: clienteId,
          modulo,
        },
      },
      create: {
        cliente_id: clienteId,
        modulo,
        ativo: Boolean(ativo),
      },
      update: {
        ativo: Boolean(ativo),
      },
    });
  },

  async isAtivo(clienteId, modulo) {
    const prisma = getPrismaClient();
    const row = await prisma.clienteModulo.findUnique({
      where: {
        cliente_id_modulo: {
          cliente_id: clienteId,
          modulo,
        },
      },
      select: { ativo: true },
    });
    return row?.ativo ?? false;
  },
};
