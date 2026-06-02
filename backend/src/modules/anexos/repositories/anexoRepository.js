import { getPrismaClient } from "../../../database/prismaClient.js";
import { auditService } from "../../audit/auditService.js";

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
    if (!empresaId) {
      const error = new Error("empresa_id é obrigatório para anexos.");
      error.statusCode = 400;
      throw error;
    }
    if (!scope.acessoGlobal && !scope.allowedEmpresaIds.includes(empresaId)) {
      const error = new Error("Sem permissão para anexar nesta empresa.");
      error.statusCode = 403;
      throw error;
    }

    const empresa = await prisma.empresa.findFirst({
      where: {
        id: empresaId,
        cliente_id: scope.clienteId,
      },
      select: {
        id: true,
        codigo_empresa: true,
        razao_social: true,
      },
    });
    if (!empresa) {
      const error = new Error("Empresa inválida para anexo.");
      error.statusCode = 404;
      throw error;
    }

    const created = await prisma.registroAnexo.create({
      data: {
        ...data,
        empresa_id: empresaId,
        codigo_empresa: empresa.codigo_empresa,
        nome_empresa: empresa.razao_social,
        cliente_id: scope.clienteId,
        tenant_id: scope.clienteId,
      },
    });
    await auditService.log({
      scope,
      entityName: "RegistroAnexo",
      action: "CREATE",
      entityId: created.id,
      empresaId: empresa.id,
      codigoEmpresa: empresa.codigo_empresa,
      nomeEmpresa: empresa.razao_social,
      payload: {
        entity_name: created.entity_name,
        record_id: created.record_id,
        file_name: created.file_name,
      },
    });
    return created;
  },

  async remove(id, scope) {
    const prisma = getPrismaClient();
    const current = await prisma.registroAnexo.findFirst({
      where: buildScopeWhere(scope, { id }),
      select: {
        id: true,
        empresa_id: true,
        codigo_empresa: true,
        nome_empresa: true,
      },
    });
    if (!current) return false;
    await prisma.registroAnexo.delete({ where: { id: current.id } });
    await auditService.log({
      scope,
      entityName: "RegistroAnexo",
      action: "DELETE",
      entityId: current.id,
      empresaId: current.empresa_id,
      codigoEmpresa: current.codigo_empresa,
      nomeEmpresa: current.nome_empresa,
      payload: { id: current.id },
    });
    return true;
  },
};
