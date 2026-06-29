import { auditService } from "../audit/auditService.js";
import { assertCadastroAdminRole } from "../auth/cadastroRbac.js";
import {
  MDP_PLATFORM_VERSION_ID,
  MDP_REGISTRY_ENTRY_TYPES,
  REGISTRY_SCHEMA_VERSION,
  hashRegistryPayload,
} from "./mdpRegistryConstants.js";
import { mdpEntityRepository } from "./mdpEntityRepository.js";
import { mdpRegistryRepository } from "./mdpRegistryRepository.js";
import {
  serializeMdpRegistryEntry,
  serializeMdpRegistryListItem,
} from "./mdpRegistrySerializer.js";

const withStatus = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
};

const assertCanMutateRow = (scope, row) => {
  if (!row) withStatus("Entrada de registry não encontrada.", 404);
  if (row.scope === "platform" && row.cliente_id == null) {
    withStatus("Entradas platform oficiais são imutáveis via API (MDP-4).", 403);
  }
  if (row.scope === "tenant" && row.cliente_id !== scope.clienteId) {
    withStatus("Entrada fora do escopo do tenant.", 403);
  }
};

const buildWhere = (query) => {
  const where = {};
  if (query.entryType) where.entry_type = query.entryType;
  if (query.moduleId) where.module_id = query.moduleId;
  if (query.baseTemplateId) where.base_template_id = query.baseTemplateId;
  if (query.status) where.status = query.status;
  if (query.enabled !== undefined) where.enabled = query.enabled;
  if (query.lifecycle) where.lifecycle = query.lifecycle;
  if (query.entityId) {
    where.entity = { entity_id: query.entityId };
  }
  return where;
};

const resolveEntityRowId = async (entityId, clienteId) => {
  if (!entityId) return null;
  const entity = await mdpEntityRepository.findByEntityId({ entityId, clienteId });
  if (!entity) withStatus("Entidade alvo não encontrada no Entity Dictionary.", 404);
  return entity.id;
};

export const mdpRegistryService = {
  async list(query, scope) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 50;
    const { items, total } = await mdpRegistryRepository.list({
      clienteId: scope.clienteId,
      where: buildWhere(query),
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return {
      items: items.map(serializeMdpRegistryListItem),
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  },

  async getById(id, scope) {
    const row = await mdpRegistryRepository.findById({ id, clienteId: scope.clienteId });
    if (!row) withStatus("Entrada de registry não encontrada.", 404);
    return serializeMdpRegistryEntry(row);
  },

  async introspect(query, scope) {
    const [schemas, counts, totalEntries] = await Promise.all([
      mdpRegistryRepository.listSchemas(),
      mdpRegistryRepository.countByType({
        clienteId: scope.clienteId,
        moduleId: query.moduleId,
      }),
      query.moduleId
        ? mdpRegistryRepository.countByModule({ clienteId: scope.clienteId, moduleId: query.moduleId })
        : mdpRegistryRepository.list({
            clienteId: scope.clienteId,
            take: 1,
          }).then((r) => r.total),
    ]);

    const schemaByType = Object.fromEntries(
      schemas.map((s) => [s.entry_type, { schemaVersion: s.schema_version, jsonSchema: s.json_schema }])
    );

    return {
      version: "mdp-metadata-registry-v1",
      registrySchemaVersion: REGISTRY_SCHEMA_VERSION,
      entryTypes: MDP_REGISTRY_ENTRY_TYPES.map((entryType) => ({
        entryType,
        schema: schemaByType[entryType] ?? null,
        counts: counts.filter((c) => c.entryType === entryType),
      })),
      totals: {
        entries: totalEntries,
        schemas: schemas.length,
        entryTypesSupported: MDP_REGISTRY_ENTRY_TYPES.length,
      },
      moduleId: query.moduleId ?? null,
      introspectedAt: new Date().toISOString(),
    };
  },

  async create(payload, scope) {
    assertCadastroAdminRole(scope);

    const existing = await mdpRegistryRepository.findByEntryId({
      entryId: payload.entryId,
      clienteId: scope.clienteId,
    });
    if (existing) withStatus("entryId já registrado.", 409);

    const entityRowId = await resolveEntityRowId(payload.entityId, scope.clienteId);
    const schemaVersion = payload.schemaVersion ?? REGISTRY_SCHEMA_VERSION;
    const contentHash = hashRegistryPayload(payload.payload);

    const created = await mdpRegistryRepository.create({
      entry_id: payload.entryId,
      entry_type: payload.entryType,
      scope: "tenant",
      cliente_id: scope.clienteId,
      module_id: payload.moduleId ?? null,
      entity_row_id: entityRowId,
      base_template_id: payload.baseTemplateId ?? "modelobase1",
      schema_version: schemaVersion,
      payload: payload.payload,
      content_hash: contentHash,
      status: payload.status ?? "draft",
      owner_kind: payload.ownerKind ?? "tenant",
      owner_ref: payload.ownerRef ?? scope.clienteId,
      empresa_scope: payload.empresaScope ?? "none",
      lifecycle: "active",
      sort_order: payload.sortOrder ?? 999,
      enabled: payload.enabled ?? true,
      version_id: MDP_PLATFORM_VERSION_ID,
      presentation: payload.presentation ?? undefined,
      metadata: payload.metadata ?? undefined,
      created_by: scope.userId,
      updated_by: scope.userId,
      labels: {
        create: (payload.labels || []).map((l) => ({
          locale: l.locale,
          label: l.label,
          description: l.description ?? null,
          help_text: l.helpText ?? null,
        })),
      },
      bindings: payload.bindings?.length
        ? {
            create: payload.bindings.map((b, index) => ({
              binding_kind: b.bindingKind,
              target_id: b.targetId,
              target_row_id: b.targetRowId ?? null,
              sort_order: b.sortOrder ?? index,
            })),
          }
        : undefined,
    });

    const full = await mdpRegistryRepository.findById({ id: created.id, clienteId: scope.clienteId });
    await mdpRegistryRepository.createAudit({
      entry_row_id: created.id,
      cliente_id: scope.clienteId,
      action: "create",
      before: null,
      after: serializeMdpRegistryEntry(full),
      usuario_id: scope.userId,
    });
    await auditService.log({
      scope,
      entityName: "MdpRegistryEntry",
      entityId: created.id,
      action: "MDP_REGISTRY_CREATE",
      payload: { entryId: created.entry_id, entryType: created.entry_type },
    });

    return serializeMdpRegistryEntry(full);
  },

  async update(id, payload, scope) {
    assertCadastroAdminRole(scope);
    const current = await mdpRegistryRepository.findById({ id, clienteId: scope.clienteId });
    assertCanMutateRow(scope, current);

    const entityRowId =
      payload.entityId !== undefined
        ? await resolveEntityRowId(payload.entityId, scope.clienteId)
        : undefined;

    const data = {
      ...(payload.moduleId !== undefined ? { module_id: payload.moduleId } : {}),
      ...(entityRowId !== undefined ? { entity_row_id: entityRowId } : {}),
      ...(payload.payload !== undefined
        ? {
            payload: payload.payload,
            content_hash: hashRegistryPayload(payload.payload),
          }
        : {}),
      ...(payload.schemaVersion !== undefined ? { schema_version: payload.schemaVersion } : {}),
      ...(payload.status !== undefined ? { status: payload.status } : {}),
      ...(payload.ownerKind !== undefined ? { owner_kind: payload.ownerKind } : {}),
      ...(payload.ownerRef !== undefined ? { owner_ref: payload.ownerRef } : {}),
      ...(payload.empresaScope !== undefined ? { empresa_scope: payload.empresaScope } : {}),
      ...(payload.enabled !== undefined ? { enabled: payload.enabled } : {}),
      ...(payload.baseTemplateId !== undefined ? { base_template_id: payload.baseTemplateId } : {}),
      ...(payload.sortOrder !== undefined ? { sort_order: payload.sortOrder } : {}),
      ...(payload.presentation !== undefined ? { presentation: payload.presentation } : {}),
      ...(payload.metadata !== undefined ? { metadata: payload.metadata } : {}),
      updated_by: scope.userId,
    };

    await mdpRegistryRepository.update(id, data);

    if (payload.labels?.length) {
      const prisma = (await import("../../database/prismaClient.js")).getPrismaClient();
      for (const label of payload.labels) {
        await mdpRegistryRepository.upsertLabel(prisma, id, label);
      }
    }

    if (payload.bindings) {
      const prisma = (await import("../../database/prismaClient.js")).getPrismaClient();
      await mdpRegistryRepository.syncBindings(prisma, id, payload.bindings);
    }

    const full = await mdpRegistryRepository.findById({ id, clienteId: scope.clienteId });
    await mdpRegistryRepository.createAudit({
      entry_row_id: id,
      cliente_id: scope.clienteId,
      action: "update",
      before: serializeMdpRegistryEntry(current),
      after: serializeMdpRegistryEntry(full),
      usuario_id: scope.userId,
    });

    return serializeMdpRegistryEntry(full);
  },

  async remove(id, scope) {
    assertCadastroAdminRole(scope);
    const current = await mdpRegistryRepository.findById({ id, clienteId: scope.clienteId });
    assertCanMutateRow(scope, current);

    const archived = await mdpRegistryRepository.update(id, {
      lifecycle: "archived",
      enabled: false,
      updated_by: scope.userId,
    });

    await mdpRegistryRepository.createAudit({
      entry_row_id: id,
      cliente_id: scope.clienteId,
      action: "archive",
      before: serializeMdpRegistryEntry(current),
      after: serializeMdpRegistryEntry(archived),
      usuario_id: scope.userId,
    });

    return { id, archived: true };
  },
};
