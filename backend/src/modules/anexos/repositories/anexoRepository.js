import { getPrismaClient } from "../../../database/prismaClient.js";

const EMPTY_RESULT_COMPANY_ID = "__no_company_permission__";

const buildScopeWhere = (scope, extra = {}) => {
  const and = [{ cliente_id: scope.clienteId }];

  if (scope.selectedEmpresaId) {
    and.push({ empresa_id: scope.selectedEmpresaId });
  } else if (!scope.acessoGlobal) {
    and.push({
      empresa_id: {
        in: scope.allowedEmpresaIds.length > 0 ? scope.allowedEmpresaIds : [EMPTY_RESULT_COMPANY_ID],
      },
    });
  }

  if (extra && Object.keys(extra).length > 0) {
    and.push(extra);
  }

  if (and.length === 1) return and[0];
  return { AND: and };
};

export const anexoRepository = {
  async list({ scope, entityName, recordId }) {
    const prisma = getPrismaClient();
    return prisma.registroAnexo.findMany({
      where: buildScopeWhere(scope, {
        ...(entityName ? { entity_name: entityName } : {}),
        ...(recordId ? { record_id: recordId } : {}),
      }),
      orderBy: [{ createdAt: "desc" }],
    });
  },

  async create(data, scope) {
    const prisma = getPrismaClient();
    const empresaId = data.empresa_id || scope.selectedEmpresaId || null;
    if (!scope.acessoGlobal && empresaId && !scope.allowedEmpresaIds.includes(empresaId)) {
      throw new Error("Sem permissão para anexar nesta empresa.");
    }

    return prisma.registroAnexo.create({
      data: {
        ...data,
        empresa_id: empresaId,
        cliente_id: scope.clienteId,
        tenant_id: scope.clienteId,
      },
    });
  },

  async remove(id, scope) {
    const prisma = getPrismaClient();
    const current = await prisma.registroAnexo.findFirst({
      where: buildScopeWhere(scope, { id }),
      select: { id: true },
    });
    if (!current) return false;
    await prisma.registroAnexo.delete({ where: { id: current.id } });
    return true;
  },
};
