import { getPrismaClient } from "../../../database/prismaClient.js";
import { auditService } from "../../audit/auditService.js";
import { createWithIdGlobal } from "../../idGlobal/idGlobalService.js";

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
        codempresa: true,
        razao_social: true,
      },
    });
    if (!empresa) {
      const error = new Error("Empresa inválida para anexo.");
      error.statusCode = 404;
      throw error;
    }

    const created = await createWithIdGlobal({
      clienteId: scope.clienteId,
      entityName: "RegistroAnexo",
      createRecord: (tx, idGlobal) =>
        tx.registroAnexo.create({
          data: {
            id_global: idGlobal,
            entity_name: data.entity_name,
            record_id: data.record_id || null,
            attachment_name: data.attachment_name || null,
            file_name: data.file_name,
            file_url: data.file_url,
            file_type: data.file_type || null,
            file_size: data.file_size ?? null,
            storage_path: data.storage_path || null,
            empresa_id: empresaId,
            codempresa: empresa.codempresa,
            nome_empresa: empresa.razao_social,
            cliente_id: scope.clienteId,
          },
        }),
    });
    await auditService.log({
      scope,
      entityName: "RegistroAnexo",
      action: "CREATE",
      entityId: created.id,
      idGlobal: created.id_global,
      empresaId: empresa.id,
      codigoEmpresa: empresa.codempresa,
      nomeEmpresa: empresa.razao_social,
      payload: {
        id_global: created.id_global,
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
        codempresa: true,
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
      codigoEmpresa: current.codempresa,
      nomeEmpresa: current.nome_empresa,
      payload: { id: current.id },
    });
    return true;
  },
};
