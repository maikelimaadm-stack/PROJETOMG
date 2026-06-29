import { DEFAULT_LOCALE } from "./mdpEntityConstants.js";

export const serializeMdpRelationship = (row) => {
  if (!row) return null;
  const defaultLabel =
    row.labels?.find((l) => l.locale === DEFAULT_LOCALE) || row.labels?.[0] || null;
  return {
    id: row.id,
    relationshipId: row.relationship_id,
    fromEntityRowId: row.from_entity_row_id,
    toEntityRowId: row.to_entity_row_id,
    fromEntityId: row.from_entity?.entity_id ?? null,
    toEntityId: row.to_entity?.entity_id ?? null,
    fromModuleId: row.from_entity?.module_id ?? null,
    toModuleId: row.to_entity?.module_id ?? null,
    scope: row.scope,
    clienteId: row.cliente_id,
    kind: row.kind,
    relationshipType: row.relationship_type,
    semantics: row.semantics,
    dependency: row.dependency,
    dependencyClass: row.dependency_class,
    cardinality: row.cardinality,
    fkMapping: row.fk_mapping,
    inheritanceParentEntityId: row.inheritance_parent_entity_id,
    empresaScoped: row.empresa_scoped,
    enabled: row.enabled,
    baseTemplateId: row.base_template_id,
    lifecycle: row.lifecycle,
    sortOrder: row.sort_order,
    versionId: row.version_id,
    presentation: row.presentation,
    metadata: row.metadata,
    label: defaultLabel?.label || row.relationship_id,
    labels: (row.labels || []).map((l) => ({
      locale: l.locale,
      label: l.label,
      description: l.description,
      helpText: l.help_text,
    })),
    fieldBindings: (row.field_bindings || []).map((b) => ({
      id: b.id,
      fieldRowId: b.field_row_id,
      fieldId: b.field?.field_id ?? null,
      fieldName: b.field?.field_name ?? b.from_field_name,
      fromFieldName: b.from_field_name,
      toFieldName: b.to_field_name,
      bindingRole: b.binding_role,
    })),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export const serializeMdpRelationshipListItem = (row) => {
  const full = serializeMdpRelationship(row);
  if (!full) return null;
  return {
    id: full.id,
    relationshipId: full.relationshipId,
    fromEntityId: full.fromEntityId,
    toEntityId: full.toEntityId,
    kind: full.kind,
    relationshipType: full.relationshipType,
    semantics: full.semantics,
    dependencyClass: full.dependencyClass,
    enabled: full.enabled,
    label: full.label,
    lifecycle: full.lifecycle,
    baseTemplateId: full.baseTemplateId,
  };
};
