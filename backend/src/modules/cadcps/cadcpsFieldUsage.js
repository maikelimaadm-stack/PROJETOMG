import { getPrismaClient } from "../../database/prismaClient.js";
import { CADCPS_APLICACAO, CADCPS_TIPO_TO_LEGACY } from "./cadcpsConstants.js";

const assertSafeFieldName = (fieldName) => {
  const safe = String(fieldName || "");
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(safe)) {
    const error = new Error(`Nome de campo inválido: ${fieldName}`);
    error.statusCode = 400;
    throw error;
  }
  return safe;
};

const extractFormulaFieldNames = (formula) => {
  const tokens = String(formula || "").match(/[a-zA-Z_][a-zA-Z0-9_]*|\d+(?:[.,]\d+)?|[()+\-*/]/g) || [];
  return tokens.filter((token) => /^[a-zA-Z_]/.test(token));
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

const countEmpresaRecordsUsingFields = async (prisma, { scope, fieldNames, empresaIds }) => {
  const trackedFields = fieldNames.map(assertSafeFieldName).filter(Boolean);
  if (trackedFields.length === 0) return 0;

  const fieldConditions = trackedFields.map(buildFieldHasValueSql).join(" OR ");
  let sql = `
    SELECT COUNT(*)::int AS count
    FROM "Empresa"
    WHERE cliente_id = $1
  `;
  const params = [scope.clienteId];

  if (empresaIds?.length) {
    const placeholders = empresaIds.map((_, index) => `$${index + 2}`).join(", ");
    sql += ` AND id IN (${placeholders})`;
    params.push(...empresaIds);
  }

  sql += ` AND (${fieldConditions})`;
  const result = await prisma.$queryRawUnsafe(sql, ...params);
  return Number(result[0]?.count ?? 0);
};

/**
 * Conta registros que utilizam o campo (valores em Empresa.campos_personalizados).
 */
export const countCampoUsage = async (campo, scope) => {
  const prisma = getPrismaClient();
  const legacyTipo = CADCPS_TIPO_TO_LEGACY[campo.tipo] || campo.tipo;
  const dependencyFields =
    legacyTipo === "calculado" ? extractFormulaFieldNames(campo.formula) : [];
  const trackedFields = Array.from(new Set([campo.field_name, ...dependencyFields])).filter(Boolean);

  const linkedToEmpresas = (campo.telas || []).some(
    (tela) => tela.entity_name === "EmpresaCadastro" || tela.codigo === "EMPRESAS"
  );
  if (!linkedToEmpresas) return 0;

  const empresaIds =
    campo.aplicacao_modo === CADCPS_APLICACAO.ESPECIFICAS
      ? campo.empresa_ids || campo.empresas_vinculadas?.map((e) => e.id) || []
      : null;

  return countEmpresaRecordsUsingFields(prisma, {
    scope,
    fieldNames: trackedFields,
    empresaIds: empresaIds?.length ? empresaIds : null,
  });
};

export const assertCampoNotInUse = async (campo, scope, actionLabel) => {
  const usageCount = await countCampoUsage(campo, scope);
  if (usageCount > 0) {
    const error = new Error(
      `Campo "${campo.nome}" possui ${usageCount} registro(s) vinculado(s) e não pode ser ${actionLabel}.`
    );
    error.statusCode = 409;
    throw error;
  }
};
