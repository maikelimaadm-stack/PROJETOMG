import { getPrismaClient } from "../../../database/prismaClient.js";
import { memoryStore } from "../../../storage/memoryStore.js";

const normalizeEmpresa = (item = {}) => ({
  ...item,
  campos_personalizados: item.campos_personalizados || {},
});

const executeWithFallback = async (prismaOperation, fallbackOperation) => {
  const prisma = getPrismaClient();
  if (!prisma) return fallbackOperation();
  try {
    return await prismaOperation(prisma);
  } catch {
    return fallbackOperation();
  }
};

export const empresaRepository = {
  async list() {
    const items = await executeWithFallback(
      (prisma) => prisma.empresa.findMany({ orderBy: [{ codigo_empresa: "asc" }] }),
      () => memoryStore.listEmpresas()
    );
    return items.map(normalizeEmpresa);
  },

  async getById(id) {
    return executeWithFallback(
      (prisma) => prisma.empresa.findUnique({ where: { id } }),
      () => memoryStore.getEmpresa(id)
    );
  },

  async create(data) {
    return executeWithFallback(
      (prisma) => prisma.empresa.create({ data }),
      () => memoryStore.createEmpresa(data)
    );
  },

  async update(id, data) {
    return executeWithFallback(
      (prisma) => prisma.empresa.update({ where: { id }, data }),
      () => memoryStore.updateEmpresa(id, data)
    );
  },

  async remove(id) {
    const result = await executeWithFallback(
      async (prisma) => {
        await prisma.empresa.delete({ where: { id } });
        return true;
      },
      () => memoryStore.deleteEmpresa(id)
    );
    return Boolean(result);
  },

  async listCampos() {
    return executeWithFallback(
      (prisma) => prisma.campoPersonalizado.findMany({ orderBy: [{ ordem_tabela: "asc" }] }),
      () => memoryStore.listCampos()
    );
  },

  async createCampo(data) {
    return executeWithFallback(
      (prisma) => prisma.campoPersonalizado.create({ data }),
      () => memoryStore.createCampo(data)
    );
  },

  async updateCampo(id, data) {
    return executeWithFallback(
      (prisma) => prisma.campoPersonalizado.update({ where: { id }, data }),
      () => memoryStore.updateCampo(id, data)
    );
  },

  async removeCampo(id) {
    const result = await executeWithFallback(
      async (prisma) => {
        await prisma.campoPersonalizado.delete({ where: { id } });
        return true;
      },
      () => memoryStore.deleteCampo(id)
    );
    return Boolean(result);
  },
};
