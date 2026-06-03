import { getPrismaClient } from "../../database/prismaClient.js";
import { CADCPS_APLICACAO, CADCPS_TIPOS, LEGACY_TIPO_TO_CADCPS } from "./cadcpsConstants.js";

const mapOpcoes = (opcoes = []) =>
  opcoes.map((opcao, index) => {
    const codigo = String(opcao.codigo ?? opcao.value ?? opcao.label ?? `opt_${index + 1}`);
    const descricao = String(opcao.descricao ?? opcao.label ?? codigo);
    return {
      codigo,
      descricao,
      ordem: opcao.ordem ?? index,
      ativo: opcao.ativo ?? true,
    };
  });

const resolveDefaultTelaIds = async (body) => {
  if (Array.isArray(body.tela_ids) && body.tela_ids.length) return body.tela_ids;
  const entityName = body.entity_name || "EmpresaCadastro";
  const prisma = getPrismaClient();
  const tela = await prisma.cadCpsTela.findFirst({
    where: { entity_name: entityName },
    select: { id: true },
  });
  if (!tela?.id) {
    const fallback = await prisma.cadCpsTela.findFirst({
      where: { codigo: "EMPRESAS" },
      select: { id: true },
    });
    return fallback?.id ? [fallback.id] : [];
  }
  return [tela.id];
};

/**
 * Aceita payloads legados (label, tipo text, opcoes value/label) nos endpoints CADCPS.
 */
export const normalizeLegacyCampoPayload = async (body = {}) => {
  const tipoRaw = String(body.tipo || "").trim();
  const tipo = LEGACY_TIPO_TO_CADCPS[tipoRaw] || tipoRaw;
  const nome = body.nome || body.label;
  const tela_ids = await resolveDefaultTelaIds(body);

  const aplicacao_modo =
    body.aplicacao_modo === "empresa" || body.empresa_id
      ? CADCPS_APLICACAO.ESPECIFICAS
      : body.aplicacao_modo || CADCPS_APLICACAO.TODAS;

  const empresa_ids = body.empresa_ids?.length
    ? body.empresa_ids
    : body.empresa_id
      ? [body.empresa_id]
      : undefined;

  const opcoes = body.opcoes?.length ? mapOpcoes(body.opcoes) : undefined;

  const normalized = {
    ...body,
    nome,
    tipo: CADCPS_TIPOS.includes(tipo) ? tipo : body.tipo,
    tela_ids,
    aplicacao_modo,
    ...(empresa_ids ? { empresa_ids } : {}),
    ...(opcoes ? { opcoes } : {}),
  };

  delete normalized.label;
  delete normalized.entity_name;
  return normalized;
};
