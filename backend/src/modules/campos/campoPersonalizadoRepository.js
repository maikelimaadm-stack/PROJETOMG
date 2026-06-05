import { getPrismaClient } from "../../database/prismaClient.js";
import { createWithIdGlobal } from "../idGlobal/idGlobalService.js";
import { auditService } from "../audit/auditService.js";

const buildApplicableFieldsWhere = (scope, entityName) => {
  const and = [{ cliente_id: scope.clienteId }, { entity_name: entityName }];
  const or = [{ empresa_id: null }];

  if (scope.selectedEmpresaId) {
    or.push({ empresa_id: scope.selectedEmpresaId });
  } else if (!scope.acessoGlobal && scope.allowedEmpresaIds?.length) {
    or.push({ empresa_id: { in: scope.allowedEmpresaIds } });
  } else if (scope.acessoGlobal) {
    or.push({ empresa_id: { not: null } });
  }

  and.push({ OR: or });
  return { AND: and };
};

const resolveEmpresaForCampo = async (prisma, scope, payload) => {
  const aplicacaoModo = payload.aplicacao_modo || (payload.empresa_id ? "empresa" : "todas");
  if (aplicacaoModo === "todas" || !payload.empresa_id) {
    return { empresa_id: null, codempresa: null, nome_empresa: null };
  }

  const empresaId = payload.empresa_id || scope.selectedEmpresaId;
  if (!empresaId) {
    const error = new Error("Empresa é obrigatória para campos específicos.");
    error.statusCode = 400;
    throw error;
  }

  if (!scope.acessoGlobal && !scope.allowedEmpresaIds.includes(empresaId)) {
    const error = new Error("Sem permissão para criar campo nesta empresa.");
    error.statusCode = 403;
    throw error;
  }

  const empresa = await prisma.empresa.findFirst({
    where: { id: empresaId, cliente_id: scope.clienteId },
    select: { id: true, codempresa: true, razao_social: true },
  });
  if (!empresa) {
    const error = new Error("Empresa inválida para este cliente.");
    error.statusCode = 404;
    throw error;
  }

  return {
    empresa_id: empresa.id,
    codempresa: empresa.codempresa,
    nome_empresa: empresa.razao_social,
  };
};

const assertFieldNameUnique = async (prisma, { scope, entityName, fieldName, empresaId, excludeId }) => {
  const existing = await prisma.campoPersonalizado.findFirst({
    where: {
      cliente_id: scope.clienteId,
      entity_name: entityName,
      field_name: fieldName,
      empresa_id: empresaId,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    select: { id: true, label: true },
  });
  if (existing) {
    const scopeLabel = empresaId ? "nesta empresa" : "global do cliente";
    const error = new Error(`Já existe o campo "${existing.label}" ${scopeLabel}.`);
    error.statusCode = 409;
    throw error;
  }
};

const extractFormulaFieldNames = (formula) => {
  const tokens = String(formula || "").match(/[a-zA-Z_][a-zA-Z0-9_]*|\d+(?:[.,]\d+)?|[()+\-*/]/g) || [];
  return tokens.filter((token) => /^[a-zA-Z_]/.test(token));
};

const assertSafeFieldName = (fieldName) => {
  const safe = String(fieldName || "");
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(safe)) {
    const error = new Error(`Nome de campo inválido: ${fieldName}`);
    error.statusCode = 400;
    throw error;
  }
  return safe;
};

const buildFieldHasValueSql = (fieldName) => {
  const safe = assertSafeFieldName(fieldName);
  return `(
    campos_personalizados ? '${safe}'
    AND (
      CASE jsonb_typeof(campos_personalizados->'${safe}')
        WHEN 'string' THEN COALESCE(NULLIF(btrim(campos_personalizados->>'${safe}'), ''), NULL) IS NOT NULL
        WHEN 'number' THEN true
        WHEN 'boolean' THEN true
        WHEN 'array' THEN jsonb_array_length(campos_personalizados->'${safe}') > 0
        WHEN 'object' THEN campos_personalizados->'${safe}' <> '{}'::jsonb
        ELSE false
      END
    )
  )`;
};

const countRecordsUsingField = async (
  prisma,
  { scope, entityName, fieldName, campoEmpresaId, formula, tipo }
) => {
  const dependencyFields =
    tipo === "calculado" ? extractFormulaFieldNames(formula) : [];
  const trackedFields = Array.from(new Set([fieldName, ...dependencyFields]))
    .map(assertSafeFieldName)
    .filter(Boolean);

  if (trackedFields.length === 0) return 0;

  const fieldConditions = trackedFields.map(buildFieldHasValueSql).join(" OR ");

  if (entityName === "EmpresaCadastro") {
    let sql = `
      SELECT COUNT(*)::int AS count
      FROM "Empresa"
      WHERE cliente_id = $1
    `;
    const params = [scope.clienteId];
    if (campoEmpresaId) {
      params.push(campoEmpresaId);
      sql += ` AND id = $${params.length}`;
    }
    sql += ` AND (${fieldConditions})`;
    const result = await prisma.$queryRawUnsafe(sql, ...params);
    return Number(result[0]?.count ?? 0);
  }

  let sql = `
    SELECT COUNT(*)::int AS count
    FROM "CadastroRegistro"
    WHERE cliente_id = $1 AND entity_name = $2
  `;
  const params = [scope.clienteId, entityName];
  if (campoEmpresaId) {
    params.push(campoEmpresaId);
    sql += ` AND empresa_id = $${params.length}`;
  }
  sql += ` AND (${fieldConditions})`;
  const result = await prisma.$queryRawUnsafe(sql, ...params);
  return Number(result[0]?.count ?? 0);
};

const sanitizeCampoPayload = (payload = {}) => {
  const {
    aplicacao_modo: _aplicacaoModo,
    empresa_id: _empresaIdFromPayload,
    ...rest
  } = payload;
  return rest;
};

export const createCampoPersonalizadoRepository = (entityName) => ({
  async list({ scope, mode = "aplicavel" }) {
    const prisma = getPrismaClient();
    const where =
      mode === "config"
        ? { cliente_id: scope.clienteId, entity_name: entityName }
        : buildApplicableFieldsWhere(scope, entityName);

    return prisma.campoPersonalizado.findMany({
      where,
      orderBy: [{ ordem_tabela: "asc" }, { label: "asc" }],
    });
  },

  async create({ scope, payload }) {
    const prisma = getPrismaClient();
    const empresaScope = await resolveEmpresaForCampo(prisma, scope, payload);
    const data = sanitizeCampoPayload(payload);

    await assertFieldNameUnique(prisma, {
      scope,
      entityName,
      fieldName: data.field_name,
      empresaId: empresaScope.empresa_id,
    });

    const created = await createWithIdGlobal({
      clienteId: scope.clienteId,
      entityName: "CampoPersonalizado",
      createRecord: (tx, idGlobal) =>
        tx.campoPersonalizado.create({
          data: {
            ...data,
            ...empresaScope,
            id_global: idGlobal,
            cliente_id: scope.clienteId,
            entity_name: entityName,
            tenant_id: scope.clienteId,
          },
        }),
    });

    void auditService.log({
      scope,
      entityName: "CampoPersonalizado",
      action: "CREATE",
      entityId: created.id,
      idGlobal: created.id_global,
      empresaId: created.empresa_id,
      codigoEmpresa: created.codempresa,
      nomeEmpresa: created.nome_empresa,
      payload: {
        id_global: created.id_global,
        field_name: created.field_name,
        label: created.label,
        aplicacao: created.empresa_id ? "empresa" : "global",
      },
    });

    return created;
  },

  async update({ scope, id, payload }) {
    const prisma = getPrismaClient();
    const current = await prisma.campoPersonalizado.findFirst({
      where: { id, cliente_id: scope.clienteId, entity_name: entityName },
    });
    if (!current) return null;

    const usageCount = await countRecordsUsingField(prisma, {
      scope,
      entityName,
      fieldName: current.field_name,
      campoEmpresaId: current.empresa_id,
      formula: current.formula,
      tipo: current.tipo,
    });
    if (usageCount > 0) {
      const error = new Error(
        `Campo "${current.label}" possui ${usageCount} registro(s) vinculado(s) e não pode ser editado.`
      );
      error.statusCode = 409;
      throw error;
    }

    const empresaScope = await resolveEmpresaForCampo(prisma, scope, {
      ...current,
      ...payload,
      aplicacao_modo: payload.aplicacao_modo ?? (payload.empresa_id ? "empresa" : current.empresa_id ? "empresa" : "todas"),
      empresa_id: payload.empresa_id ?? current.empresa_id,
    });
    const data = sanitizeCampoPayload(payload);

    if (data.field_name && data.field_name !== current.field_name) {
      await assertFieldNameUnique(prisma, {
        scope,
        entityName,
        fieldName: data.field_name,
        empresaId: empresaScope.empresa_id,
        excludeId: current.id,
      });
    }

    const updated = await prisma.campoPersonalizado.update({
      where: { id: current.id },
      data: {
        ...data,
        ...empresaScope,
      },
    });

    void auditService.log({
      scope,
      entityName: "CampoPersonalizado",
      action: "UPDATE",
      entityId: updated.id,
      empresaId: updated.empresa_id,
      codigoEmpresa: updated.codempresa,
      nomeEmpresa: updated.nome_empresa,
      payload: { field_name: updated.field_name, label: updated.label },
    });

    return updated;
  },

  async remove({ scope, id }) {
    const prisma = getPrismaClient();
    const current = await prisma.campoPersonalizado.findFirst({
      where: { id, cliente_id: scope.clienteId, entity_name: entityName },
    });
    if (!current) return false;

    const usageCount = await countRecordsUsingField(prisma, {
      scope,
      entityName,
      fieldName: current.field_name,
      campoEmpresaId: current.empresa_id,
      formula: current.formula,
      tipo: current.tipo,
    });
    if (usageCount > 0) {
      const error = new Error(
        `Campo "${current.label}" possui ${usageCount} registro(s) vinculado(s) e não pode ser excluído.`
      );
      error.statusCode = 409;
      throw error;
    }

    await prisma.campoPersonalizado.delete({ where: { id: current.id } });
    void auditService.log({
      scope,
      entityName: "CampoPersonalizado",
      action: "DELETE",
      entityId: current.id,
      empresaId: current.empresa_id,
      codigoEmpresa: current.codempresa,
      nomeEmpresa: current.nome_empresa,
      payload: { id: current.id, field_name: current.field_name },
    });
    return true;
  },

  async countUsage({ scope, id }) {
    const prisma = getPrismaClient();
    const current = await prisma.campoPersonalizado.findFirst({
      where: { id, cliente_id: scope.clienteId, entity_name: entityName },
      select: { field_name: true, empresa_id: true, formula: true, tipo: true },
    });
    if (!current) return 0;
    return countRecordsUsingField(prisma, {
      scope,
      entityName,
      fieldName: current.field_name,
      campoEmpresaId: current.empresa_id,
      formula: current.formula,
      tipo: current.tipo,
    });
  },
});
