import { auditService } from "../audit/auditService.js";
import { assertCadastroAdminRole } from "../auth/cadastroRbac.js";
import { MDP_PLATFORM_VERSION_ID } from "./mdpEntityConstants.js";
import { mdpEntityRepository } from "./mdpEntityRepository.js";
import { mdpFieldRepository } from "./mdpFieldRepository.js";
import { serializeMdpField, serializeMdpFieldListItem } from "./mdpFieldSerializer.js";

const withStatus = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
};

const assertCanMutateRow = (scope, row) => {
  if (!row) withStatus("Campo não encontrado.", 404);
  if (row.scope === "platform" && row.cliente_id == null) {
    withStatus("Campos platform oficiais são imutáveis via API (MDP-2).", 403);
  }
  if (row.scope === "tenant" && row.cliente_id !== scope.clienteId) {
    withStatus("Campo fora do escopo do tenant.", 403);
  }
  if (row.source === "native" || row.source === "system") {
    withStatus("Campos nativos/sistema não podem ser alterados via API.", 403);
  }
};

const buildFieldWhere = (query, clienteId) => {
  const where = {};
  if (query.source) where.source = query.source;
  if (query.fieldType) where.field_type = query.fieldType;
  if (query.lifecycle) where.lifecycle = query.lifecycle;
  if (query.active !== undefined) where.active = query.active;
  if (query.entityId) {
    where.entity = { entity_id: query.entityId };
  }
  if (query.moduleId) {
    where.entity = { ...(where.entity || {}), module_id: query.moduleId };
  }
  return where;
};

export const mdpFieldService = {
  async list(query, scope) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 50;
    const { items, total } = await mdpFieldRepository.list({
      clienteId: scope.clienteId,
      where: buildFieldWhere(query, scope.clienteId),
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: [{ sort_order: "asc" }, { field_name: "asc" }],
    });
    return {
      items: items.map(serializeMdpFieldListItem),
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  },

  async getById(id, scope) {
    const row = await mdpFieldRepository.findById({ id, clienteId: scope.clienteId });
    if (!row) withStatus("Campo não encontrado.", 404);
    return serializeMdpField(row);
  },

  async create(payload, scope) {
    assertCadastroAdminRole(scope);
    if (payload.source === "native" || payload.source === "system") {
      withStatus("Campos nativos/sistema são gerenciados por seed oficial.", 403);
    }

    const entity = await mdpEntityRepository.findByEntityId({
      entityId: payload.entityId,
      clienteId: scope.clienteId,
    });
    if (!entity) withStatus("Entidade alvo não encontrada no Entity Dictionary.", 404);

    const existing = await mdpFieldRepository.findByFieldName({
      fieldName: payload.fieldName,
      entityRowId: entity.id,
      clienteId: scope.clienteId,
    });
    if (existing) withStatus("fieldName já registrado para esta entidade.", 409);

    const created = await mdpFieldRepository.create({
      field_id: payload.fieldId,
      entity_row_id: entity.id,
      field_name: payload.fieldName,
      source: payload.source ?? "custom",
      field_type: payload.fieldType,
      scope: "tenant",
      cliente_id: scope.clienteId,
      active: payload.active ?? true,
      required: payload.required ?? false,
      read_only: payload.readOnly ?? false,
      searchable: payload.searchable ?? true,
      filterable: payload.filterable ?? true,
      exportable: payload.exportable ?? true,
      auditable: payload.auditable ?? true,
      visible_form: payload.visibleForm ?? true,
      visible_table: payload.visibleTable ?? false,
      visible_report: payload.visibleReport ?? false,
      empresa_applicability: payload.empresaApplicability ?? "all",
      placeholder: payload.placeholder ?? null,
      formula: payload.formula ?? null,
      calculation_builder: payload.calculationBuilder ?? undefined,
      use_mask: payload.useMask ?? false,
      mask_text: payload.maskText ?? null,
      use_decimal: payload.useDecimal ?? false,
      decimal_places: payload.decimalPlaces ?? 2,
      table_order: payload.tableOrder ?? 999,
      column_width: payload.columnWidth ?? 160,
      relation_entity: payload.relationEntity ?? null,
      options_label_field: payload.optionsLabelField ?? null,
      options_value_field: payload.optionsValueField ?? null,
      validation_ref: payload.validationRef ?? null,
      formula_ref: payload.formulaRef ?? null,
      relationship_ref: payload.relationshipRef ?? null,
      presentation: payload.presentation ?? undefined,
      base_template_id: payload.baseTemplateId ?? "modelobase1",
      sort_order: payload.sortOrder ?? 999,
      version_id: MDP_PLATFORM_VERSION_ID,
      created_by: scope.userId,
      updated_by: scope.userId,
      labels: {
        create: (payload.labels || []).map((l) => ({
          locale: l.locale,
          label: l.label,
          description: l.description ?? null,
          help_text: l.helpText ?? null,
          placeholder: l.placeholder ?? null,
        })),
      },
    });

    if (payload.telaIds?.length || payload.empresaIds?.length || payload.options?.length) {
      const prisma = (await import("../../database/prismaClient.js")).getPrismaClient();
      await mdpFieldRepository.syncRelations(prisma, created.id, {
        tela_ids: payload.telaIds || [],
        empresa_ids: payload.empresaIds || [],
        opcoes: (payload.options || []).map((o) => ({
          codigo: o.code,
          descricao: o.label,
          ordem: o.sortOrder,
          ativo: o.active,
        })),
        empresa_applicability: payload.empresaApplicability ?? "all",
      });
    }

    const full = await mdpFieldRepository.findById({ id: created.id, clienteId: scope.clienteId });
    await mdpFieldRepository.createAudit({
      field_row_id: created.id,
      cliente_id: scope.clienteId,
      action: "create",
      before: null,
      after: serializeMdpField(full),
      usuario_id: scope.userId,
    });
    await auditService.log({
      scope,
      entityName: "MdpField",
      entityId: created.id,
      action: "MDP_FIELD_CREATE",
      payload: { fieldId: created.field_id, fieldName: created.field_name },
    });

    return serializeMdpField(full);
  },

  async update(id, payload, scope) {
    assertCadastroAdminRole(scope);
    const current = await mdpFieldRepository.findById({ id, clienteId: scope.clienteId });
    assertCanMutateRow(scope, current);

    const data = {
      ...(payload.fieldType !== undefined ? { field_type: payload.fieldType } : {}),
      ...(payload.active !== undefined ? { active: payload.active } : {}),
      ...(payload.required !== undefined ? { required: payload.required } : {}),
      ...(payload.readOnly !== undefined ? { read_only: payload.readOnly } : {}),
      ...(payload.searchable !== undefined ? { searchable: payload.searchable } : {}),
      ...(payload.filterable !== undefined ? { filterable: payload.filterable } : {}),
      ...(payload.exportable !== undefined ? { exportable: payload.exportable } : {}),
      ...(payload.auditable !== undefined ? { auditable: payload.auditable } : {}),
      ...(payload.visibleForm !== undefined ? { visible_form: payload.visibleForm } : {}),
      ...(payload.visibleTable !== undefined ? { visible_table: payload.visibleTable } : {}),
      ...(payload.visibleReport !== undefined ? { visible_report: payload.visibleReport } : {}),
      ...(payload.empresaApplicability !== undefined
        ? { empresa_applicability: payload.empresaApplicability }
        : {}),
      ...(payload.placeholder !== undefined ? { placeholder: payload.placeholder } : {}),
      ...(payload.formula !== undefined ? { formula: payload.formula } : {}),
      ...(payload.calculationBuilder !== undefined
        ? { calculation_builder: payload.calculationBuilder }
        : {}),
      ...(payload.useMask !== undefined ? { use_mask: payload.useMask } : {}),
      ...(payload.maskText !== undefined ? { mask_text: payload.maskText } : {}),
      ...(payload.useDecimal !== undefined ? { use_decimal: payload.useDecimal } : {}),
      ...(payload.decimalPlaces !== undefined ? { decimal_places: payload.decimalPlaces } : {}),
      ...(payload.tableOrder !== undefined ? { table_order: payload.tableOrder } : {}),
      ...(payload.columnWidth !== undefined ? { column_width: payload.columnWidth } : {}),
      ...(payload.relationEntity !== undefined ? { relation_entity: payload.relationEntity } : {}),
      ...(payload.validationRef !== undefined ? { validation_ref: payload.validationRef } : {}),
      ...(payload.formulaRef !== undefined ? { formula_ref: payload.formulaRef } : {}),
      ...(payload.relationshipRef !== undefined ? { relationship_ref: payload.relationshipRef } : {}),
      ...(payload.presentation !== undefined ? { presentation: payload.presentation } : {}),
      ...(payload.baseTemplateId !== undefined ? { base_template_id: payload.baseTemplateId } : {}),
      ...(payload.sortOrder !== undefined ? { sort_order: payload.sortOrder } : {}),
      updated_by: scope.userId,
    };

    await mdpFieldRepository.update(id, data);

    if (payload.labels?.length) {
      const prisma = (await import("../../database/prismaClient.js")).getPrismaClient();
      for (const label of payload.labels) {
        await mdpFieldRepository.upsertLabel(prisma, id, {
          locale: label.locale,
          label: label.label,
          description: label.description,
          placeholder: label.placeholder,
        });
      }
    }

    if (payload.telaIds || payload.empresaIds || payload.options || payload.empresaApplicability) {
      const prisma = (await import("../../database/prismaClient.js")).getPrismaClient();
      await mdpFieldRepository.syncRelations(prisma, id, {
        tela_ids: payload.telaIds,
        empresa_ids: payload.empresaIds,
        opcoes: (payload.options || []).map((o) => ({
          codigo: o.code,
          descricao: o.label,
          ordem: o.sortOrder,
          ativo: o.active,
        })),
        empresa_applicability: payload.empresaApplicability ?? current.empresa_applicability,
      });
    }

    const updated = await mdpFieldRepository.findById({ id, clienteId: scope.clienteId });
    await mdpFieldRepository.createAudit({
      field_row_id: id,
      cliente_id: scope.clienteId,
      action: "update",
      before: serializeMdpField(current),
      after: serializeMdpField(updated),
      usuario_id: scope.userId,
    });
    await auditService.log({
      scope,
      entityName: "MdpField",
      entityId: id,
      action: "MDP_FIELD_UPDATE",
      payload: { fieldId: updated.field_id },
    });

    return serializeMdpField(updated);
  },

  async remove(id, scope) {
    assertCadastroAdminRole(scope);
    const current = await mdpFieldRepository.findById({ id, clienteId: scope.clienteId });
    assertCanMutateRow(scope, current);

    const archived = await mdpFieldRepository.update(id, {
      lifecycle: "archived",
      active: false,
      updated_by: scope.userId,
    });

    await mdpFieldRepository.createAudit({
      field_row_id: id,
      cliente_id: scope.clienteId,
      action: "archive",
      before: serializeMdpField(current),
      after: serializeMdpField(archived),
      usuario_id: scope.userId,
    });
    await auditService.log({
      scope,
      entityName: "MdpField",
      entityId: id,
      action: "MDP_FIELD_ARCHIVE",
      payload: { fieldId: archived.field_id },
    });

    return serializeMdpField(archived);
  },
};
