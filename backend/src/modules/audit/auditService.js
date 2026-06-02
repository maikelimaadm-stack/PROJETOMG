import { getPrismaClient } from "../../database/prismaClient.js";

export const auditService = {
  async log({
    scope,
    entityName,
    action,
    entityId = null,
    empresaId = null,
    codigoEmpresa = null,
    nomeEmpresa = null,
    payload = null,
  }) {
    if (!scope?.clienteId || !scope?.userId) return;

    const prisma = getPrismaClient();
    try {
      await prisma.auditLog.create({
        data: {
          cliente_id: scope.clienteId,
          usuario_id: scope.userId,
          empresa_id: empresaId,
          codigo_empresa: codigoEmpresa,
          nome_empresa: nomeEmpresa,
          entity_name: entityName,
          entity_id: entityId,
          action,
          payload,
        },
      });
    } catch (error) {
      // Auditoria não deve impedir a operação principal.
      console.warn("[audit] Falha ao registrar log:", error.message);
    }
  },
};

