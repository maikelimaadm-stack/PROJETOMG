import { getPrismaClient } from "../../database/prismaClient.js";
import { randomUUID } from "node:crypto";
import {
  buildScreenKey,
  parseScopeFromScreenKey,
  validatePreferenceConfig,
} from "./layoutValidators/index.js";
import {
  buildSectionPatch,
  deepMergePreferenceObjects,
  getPreferenceRevision,
  stampPreferenceMetadata,
  toObjectOrEmpty,
} from "./preferencesMerge.js";

const withStatus = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const withConflictDetails = (message, details) => {
  const error = withStatus(message, 409);
  error.details = details;
  return error;
};

const MISSING_COLUMNS_REGEX =
  /(Usuari[oó]Preferencia\.(modulo|tela|versao_schema|preferencias_json))|(column [`"]?(modulo|tela|versao_schema|preferencias_json)[`"]? does not exist)/i;

const isLegacyFallbackEnabled = () =>
  ["1", "true", "yes", "on"].includes(
    String(process.env.PREFERENCES_ALLOW_LEGACY_FALLBACK || "")
      .trim()
      .toLowerCase()
  );

const isMissingScopedColumnsError = (error) => {
  if (!error) return false;
  if (String(error.code || "") === "P2022") return true;
  return MISSING_COLUMNS_REGEX.test(String(error.message || ""));
};

const assertLegacyFallbackAllowed = () => {
  if (isLegacyFallbackEnabled()) return;
  throw withStatus(
    "Schema de preferências desatualizado. Execute a migration 20260624140500_user_screen_preferences e desative o fallback legado.",
    503
  );
};

const toScreenKey = (modulo, tela) =>
  buildScreenKey(String(modulo || "").trim().toLowerCase(), String(tela || "").trim().toLowerCase());

const mapLegacyRecordToScoped = (record) => {
  const parsed = parseScopeFromScreenKey(record?.screen_key);
  const config = toObjectOrEmpty(record?.config);
  return {
    modulo: parsed.modulo,
    tela: parsed.tela,
    versao_schema:
      Number(config?.version) ||
      Number(config?.activeConfig?.version) ||
      1,
    preferencias_json: stampPreferenceMetadata(config, {
      revision: getPreferenceRevision(config),
      updatedAt: config?.meta?.updatedAt || record?.updatedAt || null,
    }),
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

const LEGACY_SELECT_COLUMNS = `
  "id",
  "screen_key",
  "config",
  "updatedAt"
`;

const findLegacyByScreenKey = async (prisma, { scope, screenKey }) => {
  const rows = await prisma.$queryRawUnsafe(
    `
      SELECT ${LEGACY_SELECT_COLUMNS}
      FROM "UsuarioPreferencia"
      WHERE "cliente_id" = $1
        AND "usuario_id" = $2
        AND "screen_key" = $3
      ORDER BY "updatedAt" DESC
      LIMIT 1
    `,
    scope.clienteId,
    scope.userId,
    screenKey
  );
  return Array.isArray(rows) && rows.length ? rows[0] : null;
};

const listAllLegacyByScope = async (prisma, { scope }) => {
  const rows = await prisma.$queryRawUnsafe(
    `
      SELECT ${LEGACY_SELECT_COLUMNS}
      FROM "UsuarioPreferencia"
      WHERE "cliente_id" = $1
        AND "usuario_id" = $2
      ORDER BY "screen_key" ASC
    `,
    scope.clienteId,
    scope.userId
  );
  return Array.isArray(rows) ? rows : [];
};

const saveLegacyByScreenKey = async ({
  prisma,
  scope,
  screenKey,
  mergedConfig,
  expectedUpdatedAt,
  expectedRevision,
}) => {
  const existing = await findLegacyByScreenKey(prisma, { scope, screenKey });
  const existingConfig = toObjectOrEmpty(existing?.config);
  const currentRevision = getPreferenceRevision(existingConfig);

  if (existing && expectedRevision != null) {
    const parsedExpectedRevision = Number(expectedRevision);
    if (!Number.isFinite(parsedExpectedRevision) || parsedExpectedRevision < 0) {
      throw withStatus("Revisão esperada inválida.", 400);
    }
    if (currentRevision !== Math.floor(parsedExpectedRevision)) {
      throw withConflictDetails("Preferência foi alterada em outra aba/sessão.", {
        currentPreferences: existingConfig,
        currentRevision,
        currentUpdatedAt: existing.updatedAt || null,
      });
    }
  }

  if (existing && expectedUpdatedAt) {
    const expectedTime = new Date(expectedUpdatedAt).getTime();
    const currentTime = existing.updatedAt ? new Date(existing.updatedAt).getTime() : 0;
    if (!Number.isFinite(expectedTime)) {
      throw withStatus("Marca de concorrência inválida.", 400);
    }
    if (expectedTime !== currentTime) {
      throw withConflictDetails("Preferência foi alterada em outra aba/sessão.", {
        currentPreferences: existingConfig,
        currentRevision,
        currentUpdatedAt: existing.updatedAt || null,
      });
    }
  }

  const nextRevision = existing ? currentRevision + 1 : 1;
  const nextConfig = stampPreferenceMetadata(mergedConfig, {
    revision: nextRevision,
    updatedAt: new Date().toISOString(),
  });
  const recordId =
    (existing?.id && String(existing.id).trim()) ||
    `pref_${randomUUID().replace(/-/g, "")}`;
  const configJson = JSON.stringify(nextConfig);

  await prisma.$executeRawUnsafe(
    `
      INSERT INTO "UsuarioPreferencia"
      ("id", "usuario_id", "cliente_id", "screen_key", "config", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT ("usuario_id", "screen_key")
      DO UPDATE
      SET
        "config" = EXCLUDED."config",
        "cliente_id" = EXCLUDED."cliente_id",
        "updatedAt" = CURRENT_TIMESTAMP
    `,
    recordId,
    scope.userId,
    scope.clienteId,
    screenKey,
    configJson
  );

  return findLegacyByScreenKey(prisma, { scope, screenKey });
};

export const preferencesRepository = {
  async get({ scope, screenKey }) {
    const parsed = parseScopeFromScreenKey(screenKey);
    const record = await this.getByScope({ scope, ...parsed });
    if (!record) return null;
    const revision = getPreferenceRevision(record.preferencias_json);
    return {
      config: record.preferencias_json,
      updatedAt: record.updatedAt,
      revision,
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
      const config = toObjectOrEmpty(record.preferencias_json);
      return {
        ...record,
        preferencias_json: config,
        revision: getPreferenceRevision(config),
      };
    } catch (error) {
      if (!isMissingScopedColumnsError(error)) throw error;
      assertLegacyFallbackAllowed();
      const legacy = await findLegacyByScreenKey(prisma, {
        scope,
        screenKey: toScreenKey(normalizedModulo, normalizedTela),
      });
      if (!legacy) return null;
      const mapped = mapLegacyRecordToScoped(legacy);
      return {
        ...mapped,
        revision: getPreferenceRevision(mapped.preferencias_json),
      };
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
      return records.map((record) => {
        const config = toObjectOrEmpty(record.preferencias_json);
        return {
          ...record,
          preferencias_json: config,
          revision: getPreferenceRevision(config),
        };
      });
    } catch (error) {
      if (!isMissingScopedColumnsError(error)) throw error;
      assertLegacyFallbackAllowed();
      const legacy = await listAllLegacyByScope(prisma, { scope });
      return selectMostRecentByScope(legacy.map(mapLegacyRecordToScoped)).map((record) => ({
        ...record,
        revision: getPreferenceRevision(record.preferencias_json),
      }));
    }
  },

  async upsert({ scope, screenKey, config, expectedUpdatedAt, expectedRevision }) {
    const parsed = parseScopeFromScreenKey(screenKey);
    const record = await this.upsertByScope({
      scope,
      ...parsed,
      preferencias: config,
      expectedUpdatedAt,
      expectedRevision,
    });
    return {
      config: record.preferencias_json,
      updatedAt: record.updatedAt,
      revision: record.revision,
    };
  },

  async patchByScope({
    scope,
    modulo,
    tela,
    section,
    patch,
    expectedUpdatedAt,
    expectedRevision,
    versaoSchema,
  }) {
    const normalizedSection = String(section || "").trim();
    if (!normalizedSection) {
      throw withStatus("Seção de patch inválida.", 400);
    }
    if (patch == null || typeof patch !== "object" || Array.isArray(patch)) {
      throw withStatus("Patch inválido.", 400);
    }
    return this.upsertByScope({
      scope,
      modulo,
      tela,
      preferencias: buildSectionPatch({ section: normalizedSection, patch }),
      expectedUpdatedAt,
      expectedRevision,
      versaoSchema,
    });
  },

  async upsertByScope({
    scope,
    modulo,
    tela,
    preferencias,
    versaoSchema,
    expectedUpdatedAt,
    expectedRevision,
  }) {
    const prisma = getPrismaClient();
    const normalizedModulo = String(modulo || "").trim().toLowerCase();
    const normalizedTela = String(tela || "").trim().toLowerCase();
    if (!normalizedModulo || !normalizedTela) {
      throw withStatus("Escopo de preferência inválido.", 400);
    }
    if (preferencias == null || typeof preferencias !== "object" || Array.isArray(preferencias)) {
      throw withStatus("Configuração inválida.", 400);
    }
    const incomingPatch = toObjectOrEmpty(preferencias);
    const validatedPatch = validatePreferenceConfig({
      modulo: normalizedModulo,
      tela: normalizedTela,
      config: incomingPatch,
    });

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
          preferencias_json: true,
        },
      });
      const currentConfig = toObjectOrEmpty(existing?.preferencias_json);
      const currentRevision = getPreferenceRevision(currentConfig);

      if (existing && expectedRevision != null) {
        const parsedExpectedRevision = Number(expectedRevision);
        if (!Number.isFinite(parsedExpectedRevision) || parsedExpectedRevision < 0) {
          throw withStatus("Revisão esperada inválida.", 400);
        }
        if (currentRevision !== Math.floor(parsedExpectedRevision)) {
          throw withConflictDetails("Preferência foi alterada em outra aba/sessão.", {
            currentPreferences: currentConfig,
            currentRevision,
            currentUpdatedAt: existing.updatedAt || null,
          });
        }
      }

      if (existing && expectedUpdatedAt) {
        const expectedTime = new Date(expectedUpdatedAt).getTime();
        const currentTime = existing.updatedAt ? new Date(existing.updatedAt).getTime() : 0;
        if (!Number.isFinite(expectedTime)) {
          throw withStatus("Marca de concorrência inválida.", 400);
        }
        if (expectedTime !== currentTime) {
          throw withConflictDetails("Preferência foi alterada em outra aba/sessão.", {
            currentPreferences: currentConfig,
            currentRevision,
            currentUpdatedAt: existing.updatedAt || null,
          });
        }
      }

      const mergedConfig = toObjectOrEmpty(
        deepMergePreferenceObjects(currentConfig, validatedPatch)
      );
      const nextRevision = existing ? currentRevision + 1 : 1;
      const persistedConfig = stampPreferenceMetadata(mergedConfig, {
        revision: nextRevision,
        updatedAt: new Date().toISOString(),
      });
      const detectedVersion =
        Number(versaoSchema) ||
        Number(persistedConfig?.version) ||
        Number(persistedConfig?.activeConfig?.version) ||
        1;

      if (existing) {
        const updateAttempt = await prisma.usuarioPreferencia.updateMany({
          where: {
            id: existing.id,
            updatedAt: existing.updatedAt || undefined,
          },
          data: {
            versao_schema: detectedVersion,
            preferencias_json: persistedConfig,
            config: persistedConfig,
            screen_key: scopedScreenKey,
            cliente_id: scope.clienteId,
          },
        });
        if (updateAttempt.count === 0) {
          const latest = await prisma.usuarioPreferencia.findUnique({
            where: { id: existing.id },
            select: {
              preferencias_json: true,
              updatedAt: true,
            },
          });
          const latestConfig = toObjectOrEmpty(latest?.preferencias_json);
          throw withConflictDetails("Preferência foi alterada em outra aba/sessão.", {
            currentPreferences: latestConfig,
            currentRevision: getPreferenceRevision(latestConfig),
            currentUpdatedAt: latest?.updatedAt || null,
          });
        }

        const updated = await prisma.usuarioPreferencia.findUnique({
          where: { id: existing.id },
          select: {
            modulo: true,
            tela: true,
            versao_schema: true,
            preferencias_json: true,
            updatedAt: true,
          },
        });
        if (!updated) {
          throw withStatus("Falha ao salvar preferência.", 500);
        }
        return {
          ...updated,
          revision: getPreferenceRevision(updated.preferencias_json),
        };
      }

      const created = await prisma.usuarioPreferencia.create({
        data: {
          usuario_id: scope.userId,
          cliente_id: scope.clienteId,
          modulo: normalizedModulo,
          tela: normalizedTela,
          versao_schema: detectedVersion,
          preferencias_json: persistedConfig,
          screen_key: scopedScreenKey,
          config: persistedConfig,
        },
        select: {
          modulo: true,
          tela: true,
          versao_schema: true,
          preferencias_json: true,
          updatedAt: true,
        },
      });
      return {
        ...created,
        revision: getPreferenceRevision(created.preferencias_json),
      };
    } catch (error) {
      if (!isMissingScopedColumnsError(error)) throw error;
      assertLegacyFallbackAllowed();
      const legacyExisting = await findLegacyByScreenKey(prisma, {
        scope,
        screenKey: scopedScreenKey,
      });
      const legacyCurrentConfig = toObjectOrEmpty(legacyExisting?.config);
      const legacyCurrentRevision = getPreferenceRevision(legacyCurrentConfig);
      if (legacyExisting && expectedRevision != null) {
        const parsedExpectedRevision = Number(expectedRevision);
        if (!Number.isFinite(parsedExpectedRevision) || parsedExpectedRevision < 0) {
          throw withStatus("Revisão esperada inválida.", 400);
        }
        if (legacyCurrentRevision !== Math.floor(parsedExpectedRevision)) {
          throw withConflictDetails("Preferência foi alterada em outra aba/sessão.", {
            currentPreferences: legacyCurrentConfig,
            currentRevision: legacyCurrentRevision,
            currentUpdatedAt: legacyExisting.updatedAt || null,
          });
        }
      }
      const mergedLegacyConfig = toObjectOrEmpty(
        deepMergePreferenceObjects(legacyCurrentConfig, validatedPatch)
      );
      const legacyRecord = await saveLegacyByScreenKey({
        prisma,
        scope,
        screenKey: scopedScreenKey,
        mergedConfig: mergedLegacyConfig,
        expectedUpdatedAt,
        expectedRevision,
      });
      if (!legacyRecord) {
        throw withStatus("Falha ao salvar preferência no modo legado.", 500);
      }

      const mapped = mapLegacyRecordToScoped(legacyRecord);
      mapped.versao_schema =
        Number(versaoSchema) ||
        Number(mapped.preferencias_json?.version) ||
        Number(mapped.preferencias_json?.activeConfig?.version) ||
        1;
      mapped.revision = getPreferenceRevision(mapped.preferencias_json);
      return mapped;
    }
  },
};
