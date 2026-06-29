import { auditService } from "../audit/auditService.js";
import { assertCadastroAdminRole } from "../auth/cadastroRbac.js";
import { DEFAULT_CAPABILITIES, MDP_PLATFORM_VERSION_ID } from "./mdpEntityConstants.js";
import { mdpEntityRepository } from "./mdpEntityRepository.js";
import {
  serializeMdpEntity,
  serializeMdpEntityListItem,
} from "./mdpEntitySerializer.js";

const withStatus = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
};

const normalizeCapabilitiesInput = (capabilities = {}) => ({
  layout: capabilities.layout ?? DEFAULT_CAPABILITIES.layout,
  field: capabilities.field ?? DEFAULT_CAPABILITIES.field,
  validation: capabilities.validation ?? DEFAULT_CAPABILITIES.validation,
  formula: capabilities.formula ?? DEFAULT_CAPABILITIES.formula,
  events: capabilities.events ?? DEFAULT_CAPABILITIES.events,
  actions: capabilities.actions ?? DEFAULT_CAPABILITIES.actions,
  workflow: capabilities.workflow ?? DEFAULT_CAPABILITIES.workflow,
  custom_fields: capabilities.customFields ?? DEFAULT_CAPABILITIES.custom_fields,
  attachments: capabilities.attachments ?? DEFAULT_CAPABILITIES.attachments,
});

const assertCanMutateRow = (scope, row) => {
  if (!row) withStatus("Entidade não encontrada.", 404);
  if (row.scope === "platform" && row.cliente_id == null) {
    assertCadastroAdminRole(scope);
    return;
  }
  if (row.scope === "tenant" && row.cliente_id !== scope.clienteId) {
    withStatus("Entidade fora do escopo do tenant.", 403);
  }
};

export const mdpEntityService = {
  async list(query, scope) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 50;
    const runtimeOnly =
      query.runtimeOnly === true ||
      query.runtimeOnly === "true" ||
      query.runtimeOnly === undefined;
    const { items, total } = await mdpEntityRepository.list({
      clienteId: scope.clienteId,
      filters: {
        moduleId: query.moduleId,
        lifecycle: query.lifecycle ?? "active",
        entityKind: query.entityKind,
        runtimeOnly,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return {
      items: items.map(serializeMdpEntityListItem),
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  },

  async getById(id, scope) {
    const row = await mdpEntityRepository.findById({ id, clienteId: scope.clienteId });
    if (!row) withStatus("Entidade não encontrada.", 404);
    return serializeMdpEntity(row);
  },

  async create(payload, scope) {
    assertCadastroAdminRole(scope);
    if (payload.scope === "platform") {
      withStatus("Entidades platform são gerenciadas por seed oficial.", 403);
    }
    const version = await mdpEntityRepository.findPlatformVersion(MDP_PLATFORM_VERSION_ID);
    if (!version) withStatus("Versão MDP platform ausente — execute seed MDP.", 503);

    const existing = await mdpEntityRepository.findByEntityId({
      entityId: payload.entityId,
      clienteId: scope.clienteId,
    });
    if (existing) withStatus("entityId já registrado para este tenant.", 409);

    const created = await mdpEntityRepository.create({
      entity_id: payload.entityId,
      module_id: payload.moduleId,
      codigo: payload.codigo,
      scope: "tenant",
      cliente_id: scope.clienteId,
      entity_kind: payload.entityKind ?? "business",
      sort_order: payload.sortOrder ?? 999,
      icon_key: payload.iconKey ?? null,
      extends_entity_id: payload.extendsEntityId ?? null,
      origin_kind: payload.originKind ?? "tenant",
      origin_ref: payload.originRef ?? scope.clienteId,
      is_runtime_module: payload.isRuntimeModule ?? false,
      legacy_entity_name: payload.legacyEntityName ?? payload.entityId,
      permission_resource_key: payload.permissionResourceKey ?? payload.moduleId,
      base_template_id: payload.baseTemplateId ?? "modelobase1",
      empresa_scope: payload.empresaScope ?? "none",
      lifecycle: payload.lifecycle ?? "active",
      version_id: MDP_PLATFORM_VERSION_ID,
      persistence: payload.persistence,
      created_by: scope.userId,
      updated_by: scope.userId,
      labels: {
        create: (payload.labels || []).map((label) => ({
          locale: label.locale,
          singular: label.singular,
          plural: label.plural,
          description: label.description ?? null,
        })),
      },
      capabilities: {
        create: normalizeCapabilitiesInput(payload.capabilities),
      },
      routes: {
        create: (payload.routes || []).map((route, index) => ({
          route_path: route.routePath,
          page_code: route.pageCode ?? null,
          client_target: route.clientTarget ?? "all",
          menu_section: route.menuSection ?? null,
          sort_order: route.sortOrder ?? index,
          target_entity_id: route.targetEntityId ?? null,
        })),
      },
    });

    await mdpEntityRepository.createAudit({
      entity_id: created.id,
      action: "create",
      before: null,
      after: serializeMdpEntity(created),
      usuario_id: scope.userId,
    });
    await auditService.log({
      scope,
      entityName: "MdpEntity",
      entityId: created.id,
      action: "MDP_ENTITY_CREATE",
      payload: { entityId: created.entity_id, moduleId: created.module_id },
    });

    return serializeMdpEntity(created);
  },

  async update(id, payload, scope) {
    assertCadastroAdminRole(scope);
    const current = await mdpEntityRepository.findById({ id, clienteId: scope.clienteId });
    assertCanMutateRow(scope, current);
    if (current.scope === "platform") {
      withStatus("Entidades platform oficiais são imutáveis via API (MDP-1).", 403);
    }

    const data = {
      ...(payload.moduleId !== undefined ? { module_id: payload.moduleId } : {}),
      ...(payload.codigo !== undefined ? { codigo: payload.codigo } : {}),
      ...(payload.entityKind !== undefined ? { entity_kind: payload.entityKind } : {}),
      ...(payload.sortOrder !== undefined ? { sort_order: payload.sortOrder } : {}),
      ...(payload.iconKey !== undefined ? { icon_key: payload.iconKey } : {}),
      ...(payload.extendsEntityId !== undefined
        ? { extends_entity_id: payload.extendsEntityId }
        : {}),
      ...(payload.isRuntimeModule !== undefined
        ? { is_runtime_module: payload.isRuntimeModule }
        : {}),
      ...(payload.legacyEntityName !== undefined
        ? { legacy_entity_name: payload.legacyEntityName }
        : {}),
      ...(payload.permissionResourceKey !== undefined
        ? { permission_resource_key: payload.permissionResourceKey }
        : {}),
      ...(payload.baseTemplateId !== undefined
        ? { base_template_id: payload.baseTemplateId }
        : {}),
      ...(payload.empresaScope !== undefined ? { empresa_scope: payload.empresaScope } : {}),
      ...(payload.lifecycle !== undefined ? { lifecycle: payload.lifecycle } : {}),
      ...(payload.persistence !== undefined ? { persistence: payload.persistence } : {}),
      updated_by: scope.userId,
    };

    const updated = await mdpEntityRepository.update(id, {
      ...data,
      ...(payload.capabilities
        ? {
            capabilities: {
              upsert: {
                create: normalizeCapabilitiesInput(payload.capabilities),
                update: normalizeCapabilitiesInput(payload.capabilities),
              },
            },
          }
        : {}),
    });

    await mdpEntityRepository.createAudit({
      entity_id: id,
      action: "update",
      before: serializeMdpEntity(current),
      after: serializeMdpEntity(updated),
      usuario_id: scope.userId,
    });
    await auditService.log({
      scope,
      entityName: "MdpEntity",
      entityId: id,
      action: "MDP_ENTITY_UPDATE",
      payload: { entityId: updated.entity_id },
    });

    return serializeMdpEntity(updated);
  },

  async remove(id, scope) {
    assertCadastroAdminRole(scope);
    const current = await mdpEntityRepository.findById({ id, clienteId: scope.clienteId });
    assertCanMutateRow(scope, current);
    if (current.scope === "platform") {
      withStatus("Entidades platform oficiais não podem ser removidas.", 403);
    }

    const archived = await mdpEntityRepository.update(id, {
      lifecycle: "archived",
      updated_by: scope.userId,
    });

    await mdpEntityRepository.createAudit({
      entity_id: id,
      action: "archive",
      before: serializeMdpEntity(current),
      after: serializeMdpEntity(archived),
      usuario_id: scope.userId,
    });
    await auditService.log({
      scope,
      entityName: "MdpEntity",
      entityId: id,
      action: "MDP_ENTITY_ARCHIVE",
      payload: { entityId: archived.entity_id },
    });

    return serializeMdpEntity(archived);
  },
};
