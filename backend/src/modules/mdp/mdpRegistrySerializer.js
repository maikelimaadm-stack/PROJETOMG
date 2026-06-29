import { DEFAULT_LOCALE } from "./mdpRegistryConstants.js";

export const serializeMdpRegistryEntry = (row) => {
  if (!row) return null;
  const defaultLabel =
    row.labels?.find((l) => l.locale === DEFAULT_LOCALE) || row.labels?.[0] || null;
  return {
    id: row.id,
    entryId: row.entry_id,
    entryType: row.entry_type,
    scope: row.scope,
    clienteId: row.cliente_id,
    moduleId: row.module_id,
    entityRowId: row.entity_row_id,
    entityId: row.entity?.entity_id ?? null,
    baseTemplateId: row.base_template_id,
    schemaVersion: row.schema_version,
    payload: row.payload,
    contentHash: row.content_hash,
    status: row.status,
    ownerKind: row.owner_kind,
    ownerRef: row.owner_ref,
    empresaScope: row.empresa_scope,
    lifecycle: row.lifecycle,
    sortOrder: row.sort_order,
    enabled: row.enabled,
    versionId: row.version_id,
    presentation: row.presentation,
    metadata: row.metadata,
    labels: (row.labels || []).map((label) => ({
      locale: label.locale,
      label: label.label,
      description: label.description,
      helpText: label.help_text,
    })),
    label: defaultLabel?.label || row.entry_id,
    description: defaultLabel?.description ?? null,
    bindings: (row.bindings || []).map((binding) => ({
      id: binding.id,
      bindingKind: binding.binding_kind,
      targetId: binding.target_id,
      targetRowId: binding.target_row_id,
      sortOrder: binding.sort_order,
    })),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
  };
};

export const serializeMdpRegistryListItem = (row) => {
  const full = serializeMdpRegistryEntry(row);
  if (!full) return null;
  return {
    id: full.id,
    entryId: full.entryId,
    entryType: full.entryType,
    moduleId: full.moduleId,
    entityId: full.entityId,
    scope: full.scope,
    status: full.status,
    enabled: full.enabled,
    label: full.label,
    baseTemplateId: full.baseTemplateId,
    contentHash: full.contentHash,
    lifecycle: full.lifecycle,
  };
};
