import { getPrismaClient } from "../../database/prismaClient.js";
import {
  buildScreenKey,
  parseScopeFromScreenKey,
  validatePreferenceConfig,
} from "./layoutValidators/index.js";

const withStatus = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const preferencesRepository = {
  async get({ scope, screenKey }) {
    const parsed = parseScopeFromScreenKey(screenKey);
    const record = await this.getByScope({ scope, ...parsed });
    if (!record) return null;
    return {
      config: record.preferencias_json,
      updatedAt: record.updatedAt,
    };
  },

  async getByScope({ scope, modulo, tela }) {
    const prisma = getPrismaClient();
    const normalizedModulo = String(modulo || "").trim().toLowerCase();
    const normalizedTela = String(tela || "").trim().toLowerCase();
    if (!normalizedModulo || !normalizedTela) {
      throw withStatus("Escopo de preferência inválido.", 400);
    }

    const record = await prisma.usuarioPreferencia.findFirst({
      where: {
        cliente_id: scope.clienteId,
        usuario_id: scope.userId,
        modulo: normalizedModulo,
        tela: normalizedTela,
      },
      select: {
        modulo: true,
        tela: true,
        versao_schema: true,
        preferencias_json: true,
        updatedAt: true,
      },
    });

    if (!record) return null;
    return record;
  },

  async listAllByScope({ scope }) {
    const prisma = getPrismaClient();
    const records = await prisma.usuarioPreferencia.findMany({
      where: {
        cliente_id: scope.clienteId,
        usuario_id: scope.userId,
      },
      orderBy: [{ modulo: "asc" }, { tela: "asc" }],
      select: {
        modulo: true,
        tela: true,
        versao_schema: true,
        preferencias_json: true,
        updatedAt: true,
      },
    });
    return records;
  },

  async upsert({ scope, screenKey, config, expectedUpdatedAt }) {
    const parsed = parseScopeFromScreenKey(screenKey);
    const record = await this.upsertByScope({
      scope,
      ...parsed,
      preferencias: config,
      expectedUpdatedAt,
    });
    return {
      config: record.preferencias_json,
      updatedAt: record.updatedAt,
    };
  },

  async upsertByScope({
    scope,
    modulo,
    tela,
    preferencias,
    versaoSchema,
    expectedUpdatedAt,
  }) {
    const prisma = getPrismaClient();
    const normalizedModulo = String(modulo || "").trim().toLowerCase();
    const normalizedTela = String(tela || "").trim().toLowerCase();
    if (!normalizedModulo || !normalizedTela) {
      throw withStatus("Escopo de preferência inválido.", 400);
    }
    if (preferencias == null || typeof preferencias !== "object") {
      throw withStatus("Configuração inválida.", 400);
    }

    const validatedConfig = validatePreferenceConfig({
      modulo: normalizedModulo,
      tela: normalizedTela,
      config: preferencias,
    });

    const detectedVersion =
      Number(versaoSchema) ||
      Number(validatedConfig?.version) ||
      Number(validatedConfig?.activeConfig?.version) ||
      1;

    const existing = await prisma.usuarioPreferencia.findFirst({
      where: {
        cliente_id: scope.clienteId,
        usuario_id: scope.userId,
        modulo: normalizedModulo,
        tela: normalizedTela,
      },
      select: {
        id: true,
        updatedAt: true,
      },
    });

    if (existing && expectedUpdatedAt) {
      const expectedTime = new Date(expectedUpdatedAt).getTime();
      const currentTime = existing.updatedAt ? new Date(existing.updatedAt).getTime() : 0;
      if (!Number.isFinite(expectedTime)) {
        throw withStatus("Marca de concorrência inválida.", 400);
      }
      if (expectedTime !== currentTime) {
        throw withStatus("Preferência foi alterada em outra aba/sessão.", 409);
      }
    }

    if (existing) {
      return prisma.usuarioPreferencia.update({
        where: { id: existing.id },
        data: {
          versao_schema: detectedVersion,
          preferencias_json: validatedConfig,
          config: validatedConfig,
          screen_key: buildScreenKey(normalizedModulo, normalizedTela),
          cliente_id: scope.clienteId,
        },
        select: {
          modulo: true,
          tela: true,
          versao_schema: true,
          preferencias_json: true,
          updatedAt: true,
        },
      });
    }

    const record = await prisma.usuarioPreferencia.create({
      create: {
        usuario_id: scope.userId,
        cliente_id: scope.clienteId,
        modulo: normalizedModulo,
        tela: normalizedTela,
        versao_schema: detectedVersion,
        preferencias_json: validatedConfig,
        screen_key: buildScreenKey(normalizedModulo, normalizedTela),
        config: validatedConfig,
      },
      select: {
        modulo: true,
        tela: true,
        versao_schema: true,
        preferencias_json: true,
        updatedAt: true,
      },
    });

    return record;
  },
};
