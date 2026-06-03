import { getPrismaClient } from "../../database/prismaClient.js";
import {
  CADCPS_APLICACAO,
  CADCPS_TIPOS,
  LEGACY_TIPO_TO_CADCPS,
  normalizeCadcpsTipo,
} from "./cadcpsConstants.js";

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

const resolveDefaultTelaId = async (body) => {
  if (body.tela_id) return String(body.tela_id);
  if (Array.isArray(body.tela_ids) && body.tela_ids.length) return String(body.tela_ids[0]);

  const entityName = body.entity_name || "EmpresaCadastro";
  const prisma = getPrismaClient();
  const tela = await prisma.cadCpsTela.findFirst({
    where: { entity_name: entityName },
    select: { id: true },
  });
  if (tela?.id) return tela.id;

  const fallback = await prisma.cadCpsTela.findFirst({
    where: { codigo: "EMPRESAS" },
    select: { id: true },
  });
  return fallback?.id ? String(fallback.id) : "";
};

/**
 * Aceita payloads legados (label, tipo text, opcoes value/label) nos endpoints CADCPS.
 */
export const normalizeLegacyCampoPayload = async (body = {}) => {
  const tipoRaw = String(body.tipo || "").trim();
  let tipo = LEGACY_TIPO_TO_CADCPS[tipoRaw] || tipoRaw;
  if (tipoRaw === "number") {
    tipo = body.usar_decimal ? "decimal" : "inteiro";
  }
  tipo = CADCPS_TIPOS.includes(tipo) ? tipo : normalizeCadcpsTipo(tipo);
  const nome = body.nome || body.label;
  const tela_id = await resolveDefaultTelaId(body);

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
    ...(nome !== undefined ? { nome } : {}),
    ...(tipoRaw ? { tipo } : {}),
    ...(body.tela_id || body.tela_ids?.length ? { tela_id } : {}),
    ...(body.aplicacao_modo !== undefined || body.empresa_id
      ? { aplicacao_modo }
      : {}),
    ...(empresa_ids ? { empresa_ids } : {}),
    ...(opcoes ? { opcoes } : {}),
  };

  delete normalized.label;
  delete normalized.entity_name;
  delete normalized.tela_ids;
  return normalized;
};
