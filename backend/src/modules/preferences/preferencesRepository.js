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

const MISSING_COLUMNS_REGEX = /Usuari[oó]Preferencia\.(modulo|tela|versao_schema|preferencias_json)/i;

const isMissingScopedColumnsError = (error) => {
  if (!error) return false;
  if (String(error.code || "") === "P2022") return true;
  return MISSING_COLUMNS_REGEX.test(String(error.message || ""));
};

const toScreenKey = (modulo, tela) =>
  buildScreenKey(String(modulo || "").trim().toLowerCase(), String(tela || "").trim().toLowerCase());

const mapLegacyRecordToScoped = (record) => {
  const parsed = parseScopeFromScreenKey(record?.screen_key);
  const config = record?.config && typeof record.config === "object" ? record.config : {};
  return {
    modulo: parsed.modulo,
    tela: parsed.tela,
    versao_schema:
      Number(config?.version) ||
      Number(config?.activeConfig?.version) ||
      1,
    preferencias_json: config,
    updatedAt: record?.updatedAt || null,
  };
};

const toTime = (value) => {
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
};

const selectMostRecentByScope = (records = []) => {
  const map = new Map();
  records.forEach((record) => {
    const key = `${record.modulo}.${record.tela}`;
    const current = map.get(key);
    if (!current || toTime(record.updatedAt) >= toTime(current.updatedAt)) {
      map.set(key, record);
    }
  });
  return [...map.values()];
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

    try {
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
    } catch (error) {
      if (!isMissingScopedColumnsError(error)) throw error;
      const legacy = await prisma.usuarioPreferencia.findFirst({
        where: {
          cliente_id: scope.clienteId,
          usuario_id: scope.userId,
          screen_key: toScreenKey(normalizedModulo, normalizedTela),
        },
        select: {
          screen_key: true,
          config: true,
          updatedAt: true,
        },
      });
      if (!legacy) return null;
      return mapLegacyRecordToScoped(legacy);
    }
  },

  async listAllByScope({ scope }) {
    const prisma = getPrismaClient();
    try {
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
    } catch (error) {
      if (!isMissingScopedColumnsError(error)) throw error;
      const legacy = await prisma.usuarioPreferencia.findMany({
        where: {
          cliente_id: scope.clienteId,
          usuario_id: scope.userId,
        },
        orderBy: [{ screen_key: "asc" }],
        select: {
          screen_key: true,
          config: true,
          updatedAt: true,
        },
      });
      return selectMostRecentByScope(legacy.map(mapLegacyRecordToScoped));
    }
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

    const scopedScreenKey = toScreenKey(normalizedModulo, normalizedTela);
    try {
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
            screen_key: scopedScreenKey,
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

      return prisma.usuarioPreferencia.create({
        data: {
          usuario_id: scope.userId,
          cliente_id: scope.clienteId,
          modulo: normalizedModulo,
          tela: normalizedTela,
          versao_schema: detectedVersion,
          preferencias_json: validatedConfig,
          screen_key: scopedScreenKey,
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
    } catch (error) {
      if (!isMissingScopedColumnsError(error)) throw error;
      const existingLegacy = await prisma.usuarioPreferencia.findFirst({
        where: {
          cliente_id: scope.clienteId,
          usuario_id: scope.userId,
          screen_key: scopedScreenKey,
        },
        select: {
          id: true,
          updatedAt: true,
        },
      });

      if (existingLegacy && expectedUpdatedAt) {
        const expectedTime = new Date(expectedUpdatedAt).getTime();
        const currentTime = existingLegacy.updatedAt ? new Date(existingLegacy.updatedAt).getTime() : 0;
        if (!Number.isFinite(expectedTime)) {
          throw withStatus("Marca de concorrência inválida.", 400);
        }
        if (expectedTime !== currentTime) {
          throw withStatus("Preferência foi alterada em outra aba/sessão.", 409);
        }
      }

      let legacyRecord;
      if (existingLegacy) {
        legacyRecord = await prisma.usuarioPreferencia.update({
          where: { id: existingLegacy.id },
          data: {
            config: validatedConfig,
            screen_key: scopedScreenKey,
            cliente_id: scope.clienteId,
          },
          select: {
            screen_key: true,
            config: true,
            updatedAt: true,
          },
        });
      } else {
        legacyRecord = await prisma.usuarioPreferencia.create({
          data: {
            usuario_id: scope.userId,
            cliente_id: scope.clienteId,
            screen_key: scopedScreenKey,
            config: validatedConfig,
          },
          select: {
            screen_key: true,
            config: true,
            updatedAt: true,
          },
        });
      }

      const mapped = mapLegacyRecordToScoped(legacyRecord);
      mapped.versao_schema = detectedVersion;
      return mapped;
    }
  },
};
