import { getPrismaClient } from "../../database/prismaClient.js";
import { MODULOS_PADRAO } from "./clienteModuloConstants.js";
import { clienteModuloRepository } from "./clienteModuloRepository.js";

export const seedClienteModulos = async (prisma = getPrismaClient()) => {
  const clientes = await prisma.cliente.findMany({ select: { id: true } });
  let seeded = 0;

  for (const cliente of clientes) {
    for (const modulo of MODULOS_PADRAO) {
      await prisma.clienteModulo.upsert({
        where: {
          cliente_id_modulo: {
            cliente_id: cliente.id,
            modulo,
          },
        },
        create: {
          cliente_id: cliente.id,
          modulo,
          ativo: modulo === "EMPRESAS",
        },
        update: {},
      });
    }
    seeded += 1;
  }

  return seeded;
};

export const clienteModuloService = {
  async list(scope) {
    return clienteModuloRepository.listByCliente(scope.clienteId);
  },

  async updateModulo(scope, modulo, ativo) {
    const normalized = String(modulo || "").trim().toUpperCase();
    if (!MODULOS_PADRAO.includes(normalized)) {
      const error = new Error(`Módulo inválido: ${modulo}`);
      error.statusCode = 400;
      throw error;
    }
    return clienteModuloRepository.upsert({
      clienteId: scope.clienteId,
      modulo: normalized,
      ativo,
    });
  },

  async isModuloAtivo(clienteId, modulo) {
    return clienteModuloRepository.isAtivo(clienteId, String(modulo || "").trim().toUpperCase());
  },
};
