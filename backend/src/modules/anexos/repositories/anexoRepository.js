import { getPrismaClient } from "../../../database/prismaClient.js";
import { memoryStore } from "../../../storage/memoryStore.js";

const executeWithFallback = async (prismaOperation, fallbackOperation) => {
  const prisma = getPrismaClient();
  if (!prisma) return fallbackOperation();
  try {
    return await prismaOperation(prisma);
  } catch {
    return fallbackOperation();
  }
};

export const anexoRepository = {
  async list({ entityName, recordId }) {
    return executeWithFallback(
      (prisma) =>
        prisma.registroAnexo.findMany({
          where: {
            ...(entityName ? { entity_name: entityName } : {}),
            ...(recordId ? { record_id: recordId } : {}),
          },
          orderBy: [{ createdAt: "desc" }],
        }),
      () => memoryStore.listAnexos({ entityName, recordId })
    );
  },

  async create(data) {
    return executeWithFallback(
      (prisma) => prisma.registroAnexo.create({ data }),
      () => memoryStore.createAnexo(data)
    );
  },

  async remove(id) {
    const result = await executeWithFallback(
      async (prisma) => {
        await prisma.registroAnexo.delete({ where: { id } });
        return true;
      },
      () => memoryStore.deleteAnexo(id)
    );
    return Boolean(result);
  },
};
