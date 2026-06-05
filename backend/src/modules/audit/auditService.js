import { getPrismaClient } from "../../database/prismaClient.js";

export const auditService = {
  async log({
    scope,
    entityName,
    action,
    entityId = null,
    idGlobal = null,
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
          codempresa: codigoEmpresa,
          nome_empresa: nomeEmpresa,
          entity_name: entityName,
          entity_id: entityId,
          id_global: idGlobal,
          action,
          payload:
            idGlobal != null
              ? {
                  ...(payload && typeof payload === "object" ? payload : {}),
                  id_global: idGlobal,
                }
              : payload,
        },
      });
    } catch (error) {
      // Auditoria não deve impedir a operação principal.
      console.warn("[audit] Falha ao registrar log:", error.message);
    }
  },
};

