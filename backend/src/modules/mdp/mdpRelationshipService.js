import { auditService } from "../audit/auditService.js";
import { assertCadastroAdminRole } from "../auth/cadastroRbac.js";
import { MDP_PLATFORM_VERSION_ID } from "./mdpEntityConstants.js";
import { mdpEntityRepository } from "./mdpEntityRepository.js";
import { mdpRelationshipRepository } from "./mdpRelationshipRepository.js";
import {
  serializeMdpRelationship,
  serializeMdpRelationshipListItem,
} from "./mdpRelationshipSerializer.js";

const withStatus = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
};

const assertCanMutateRow = (scope, row) => {
  if (!row) withStatus("Relacionamento não encontrado.", 404);
  if (row.scope === "platform" && row.cliente_id == null) {
    withStatus("Relacionamentos platform oficiais são imutáveis via API (MDP-3).", 403);
  }
  if (row.scope === "tenant" && row.cliente_id !== scope.clienteId) {
    withStatus("Relacionamento fora do escopo do tenant.", 403);
  }
};

const buildWhere = (query) => {
  const where = {};
  if (query.kind) where.kind = query.kind;
  if (query.relationshipType) where.relationship_type = query.relationshipType;
  if (query.dependencyClass) where.dependency_class = query.dependencyClass;
  if (query.enabled !== undefined) where.enabled = query.enabled;
  if (query.lifecycle) where.lifecycle = query.lifecycle;
  if (query.fromEntityId) where.from_entity = { entity_id: query.fromEntityId };
  if (query.toEntityId) where.to_entity = { entity_id: query.toEntityId };
  if (query.entityId) {
    where.OR = [
      { from_entity: { entity_id: query.entityId } },
      { to_entity: { entity_id: query.entityId } },
    ];
  }
  return where;
};

export const mdpRelationshipService = {
  async list(query, scope) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 50;
    const { items, total } = await mdpRelationshipRepository.list({
      clienteId: scope.clienteId,
      where: buildWhere(query),
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return {
      items: items.map(serializeMdpRelationshipListItem),
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  },

  async getById(id, scope) {
    const row = await mdpRelationshipRepository.findById({ id, clienteId: scope.clienteId });
    if (!row) withStatus("Relacionamento não encontrado.", 404);
    return serializeMdpRelationship(row);
  },

  async create(payload, scope) {
    assertCadastroAdminRole(scope);

    const fromEntity = await mdpEntityRepository.findByEntityId({
      entityId: payload.fromEntityId,
      clienteId: scope.clienteId,
    });
    const toEntity = await mdpEntityRepository.findByEntityId({
      entityId: payload.toEntityId,
      clienteId: scope.clienteId,
    });
    if (!fromEntity || !toEntity) {
      withStatus("Entidades from/to devem existir no Entity Dictionary.", 404);
    }

    const existing = await mdpRelationshipRepository.findByRelationshipId({
      relationshipId: payload.relationshipId,
      clienteId: scope.clienteId,
    });
    if (existing) withStatus("relationshipId já registrado.", 409);

    const created = await mdpRelationshipRepository.create({
      relationship_id: payload.relationshipId,
      from_entity_row_id: fromEntity.id,
      to_entity_row_id: toEntity.id,
      scope: "tenant",
      cliente_id: scope.clienteId,
      kind: payload.kind ?? "logical",
      relationship_type: payload.relationshipType,
      semantics: payload.semantics ?? "association",
      dependency: payload.dependency ?? "restrict",
      dependency_class: payload.dependencyClass ?? "data",
      cardinality: payload.cardinality,
      fk_mapping: payload.fkMapping ?? undefined,
      inheritance_parent_entity_id: payload.inheritanceParentEntityId ?? null,
      empresa_scoped: payload.empresaScoped ?? false,
      enabled: payload.enabled ?? true,
      base_template_id: payload.baseTemplateId ?? "modelobase1",
      sort_order: payload.sortOrder ?? 999,
      presentation: payload.presentation ?? undefined,
      metadata: payload.metadata ?? undefined,
      version_id: MDP_PLATFORM_VERSION_ID,
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
    });

    if (payload.fieldBindings?.length) {
      const prisma = (await import("../../database/prismaClient.js")).getPrismaClient();
      await mdpRelationshipRepository.syncFieldBindings(prisma, created.id, payload.fieldBindings);
    }

    const full = await mdpRelationshipRepository.findById({
      id: created.id,
      clienteId: scope.clienteId,
    });
    await mdpRelationshipRepository.createAudit({
      relationship_row_id: created.id,
      cliente_id: scope.clienteId,
      action: "create",
      before: null,
      after: serializeMdpRelationship(full),
      usuario_id: scope.userId,
    });
    await auditService.log({
      scope,
      entityName: "MdpRelationship",
      entityId: created.id,
      action: "MDP_RELATIONSHIP_CREATE",
      payload: { relationshipId: created.relationship_id },
    });

    return serializeMdpRelationship(full);
  },

  async update(id, payload, scope) {
    assertCadastroAdminRole(scope);
    const current = await mdpRelationshipRepository.findById({ id, clienteId: scope.clienteId });
    assertCanMutateRow(scope, current);

    const data = {
      ...(payload.kind !== undefined ? { kind: payload.kind } : {}),
      ...(payload.relationshipType !== undefined
        ? { relationship_type: payload.relationshipType }
        : {}),
      ...(payload.semantics !== undefined ? { semantics: payload.semantics } : {}),
      ...(payload.dependency !== undefined ? { dependency: payload.dependency } : {}),
      ...(payload.dependencyClass !== undefined
        ? { dependency_class: payload.dependencyClass }
        : {}),
      ...(payload.cardinality !== undefined ? { cardinality: payload.cardinality } : {}),
      ...(payload.fkMapping !== undefined ? { fk_mapping: payload.fkMapping } : {}),
      ...(payload.inheritanceParentEntityId !== undefined
        ? { inheritance_parent_entity_id: payload.inheritanceParentEntityId }
        : {}),
      ...(payload.empresaScoped !== undefined ? { empresa_scoped: payload.empresaScoped } : {}),
      ...(payload.enabled !== undefined ? { enabled: payload.enabled } : {}),
      ...(payload.baseTemplateId !== undefined ? { base_template_id: payload.baseTemplateId } : {}),
      ...(payload.sortOrder !== undefined ? { sort_order: payload.sortOrder } : {}),
      ...(payload.presentation !== undefined ? { presentation: payload.presentation } : {}),
      ...(payload.metadata !== undefined ? { metadata: payload.metadata } : {}),
      updated_by: scope.userId,
    };

    await mdpRelationshipRepository.update(id, data);

    if (payload.labels?.length) {
      const prisma = (await import("../../database/prismaClient.js")).getPrismaClient();
      for (const label of payload.labels) {
        await prisma.mdpRelationshipLabel.upsert({
          where: {
            relationship_row_id_locale: {
              relationship_row_id: id,
              locale: label.locale,
            },
          },
          create: {
            relationship_row_id: id,
            locale: label.locale,
            label: label.label,
            description: label.description ?? null,
            help_text: label.helpText ?? null,
          },
          update: {
            label: label.label,
            description: label.description ?? null,
            help_text: label.helpText ?? null,
          },
        });
      }
    }

    if (payload.fieldBindings) {
      const prisma = (await import("../../database/prismaClient.js")).getPrismaClient();
      await mdpRelationshipRepository.syncFieldBindings(prisma, id, payload.fieldBindings);
    }

    const updated = await mdpRelationshipRepository.findById({ id, clienteId: scope.clienteId });
    await mdpRelationshipRepository.createAudit({
      relationship_row_id: id,
      cliente_id: scope.clienteId,
      action: "update",
      before: serializeMdpRelationship(current),
      after: serializeMdpRelationship(updated),
      usuario_id: scope.userId,
    });
    await auditService.log({
      scope,
      entityName: "MdpRelationship",
      entityId: id,
      action: "MDP_RELATIONSHIP_UPDATE",
      payload: { relationshipId: updated.relationship_id },
    });

    return serializeMdpRelationship(updated);
  },

  async remove(id, scope) {
    assertCadastroAdminRole(scope);
    const current = await mdpRelationshipRepository.findById({ id, clienteId: scope.clienteId });
    assertCanMutateRow(scope, current);

    const archived = await mdpRelationshipRepository.update(id, {
      lifecycle: "archived",
      enabled: false,
      updated_by: scope.userId,
    });

    await mdpRelationshipRepository.createAudit({
      relationship_row_id: id,
      cliente_id: scope.clienteId,
      action: "archive",
      before: serializeMdpRelationship(current),
      after: serializeMdpRelationship(archived),
      usuario_id: scope.userId,
    });
    await auditService.log({
      scope,
      entityName: "MdpRelationship",
      entityId: id,
      action: "MDP_RELATIONSHIP_ARCHIVE",
      payload: { relationshipId: archived.relationship_id },
    });

    return serializeMdpRelationship(archived);
  },
};
