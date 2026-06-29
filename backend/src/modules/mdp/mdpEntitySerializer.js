const pick = (row, keys) =>
  keys.reduce((acc, key) => {
    if (row[key] !== undefined) acc[key] = row[key];
    return acc;
  }, {});

export const serializeMdpEntity = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    entityId: row.entity_id,
    moduleId: row.module_id,
    codigo: row.codigo,
    scope: row.scope,
    clienteId: row.cliente_id,
    entityKind: row.entity_kind,
    sortOrder: row.sort_order,
    iconKey: row.icon_key,
    extendsEntityId: row.extends_entity_id,
    originKind: row.origin_kind,
    originRef: row.origin_ref,
    isRuntimeModule: row.is_runtime_module,
    legacyEntityName: row.legacy_entity_name,
    permissionResourceKey: row.permission_resource_key,
    baseTemplateId: row.base_template_id,
    empresaScope: row.empresa_scope,
    lifecycle: row.lifecycle,
    versionId: row.version_id,
    persistence: row.persistence,
    labels: (row.labels || []).map((label) => ({
      locale: label.locale,
      singular: label.singular,
      plural: label.plural,
      description: label.description,
    })),
    capabilities: row.capabilities
      ? {
          layout: row.capabilities.layout,
          field: row.capabilities.field,
          validation: row.capabilities.validation,
          formula: row.capabilities.formula,
          events: row.capabilities.events,
          actions: row.capabilities.actions,
          workflow: row.capabilities.workflow,
          customFields: row.capabilities.custom_fields,
          attachments: row.capabilities.attachments,
        }
      : null,
    routes: (row.routes || []).map((route) => ({
      id: route.id,
      routePath: route.route_path,
      pageCode: route.page_code,
      clientTarget: route.client_target,
      menuSection: route.menu_section,
      sortOrder: route.sort_order,
      targetEntityId: route.target_entity_id,
    })),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export const serializeMdpEntityListItem = (row) => {
  const full = serializeMdpEntity(row);
  if (!full) return null;
  const defaultLabel =
    full.labels?.find((l) => l.locale === "pt-BR") || full.labels?.[0] || null;
  return {
    ...pick(full, [
      "id",
      "entityId",
      "moduleId",
      "codigo",
      "scope",
      "clienteId",
      "entityKind",
      "sortOrder",
      "legacyEntityName",
      "baseTemplateId",
      "empresaScope",
      "lifecycle",
      "isRuntimeModule",
    ]),
    label: defaultLabel?.singular || full.entityId,
    pluralLabel: defaultLabel?.plural || defaultLabel?.singular || full.entityId,
  };
};
