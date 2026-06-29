import { DEFAULT_LOCALE } from "./mdpEntityConstants.js";
import { CRB_VERSION, hashPayload } from "./mdpPublishConstants.js";

const buildDependencyGraph = ({ entities, fields, relationships, registry }) => {
  const nodes = [];
  const edges = [];

  for (const entity of entities) {
    nodes.push({ kind: "entity", id: entity.entityId });
  }
  for (const field of fields) {
    nodes.push({ kind: "field", id: field.fieldId, entityId: field.entityId });
  }
  for (const rel of relationships) {
    nodes.push({ kind: "relationship", id: rel.relationshipId });
    edges.push({
      kind: "relationship",
      from: rel.fromEntityId,
      to: rel.toEntityId,
      relationshipId: rel.relationshipId,
    });
  }
  for (const entry of registry) {
    nodes.push({ kind: "registry", id: entry.entryId, entryType: entry.entryType });
    for (const binding of entry.bindings || []) {
      edges.push({
        kind: "binding",
        from: entry.entryId,
        to: binding.targetId,
        bindingKind: binding.bindingKind,
      });
    }
  }

  return { nodes, edges };
};

const buildVersionGraph = (versionRow, parentRow) => ({
  versionId: versionRow.id,
  semver: versionRow.semver,
  revision: versionRow.revision,
  status: versionRow.status,
  parentVersionId: versionRow.parent_version_id,
  parent: parentRow
    ? { versionId: parentRow.id, semver: parentRow.semver, revision: parentRow.revision }
    : null,
});

const serializeEntity = (row) => ({
  id: row.id,
  entityId: row.entity_id,
  moduleId: row.module_id,
  entityKind: row.entity_kind,
  baseTemplateId: row.base_template_id,
  lifecycle: row.lifecycle,
  persistence: row.persistence,
  labels: row.labels,
  capabilities: row.capabilities,
  routes: row.routes,
});

const serializeField = (row) => ({
  id: row.id,
  fieldId: row.field_id,
  fieldName: row.field_name,
  entityId: row.entity?.entity_id,
  source: row.source,
  fieldType: row.field_type,
  baseTemplateId: row.base_template_id,
  labels: row.labels,
  options: row.options,
});

const serializeRelationship = (row) => ({
  id: row.id,
  relationshipId: row.relationship_id,
  fromEntityId: row.from_entity?.entity_id,
  toEntityId: row.to_entity?.entity_id,
  kind: row.kind,
  relationshipType: row.relationship_type,
  enabled: row.enabled,
  baseTemplateId: row.base_template_id,
});

const serializeRegistryEntry = (row) => ({
  id: row.id,
  entryId: row.entry_id,
  entryType: row.entry_type,
  moduleId: row.module_id,
  entityId: row.entity?.entity_id,
  status: row.status,
  enabled: row.enabled,
  baseTemplateId: row.base_template_id,
  contentHash: row.content_hash,
  payload: row.payload,
  bindings: (row.bindings || []).map((b) => ({
    bindingKind: b.binding_kind,
    targetId: b.target_id,
  })),
  labels: row.labels,
});

export const mdpCompileService = {
  async compileModuleSnapshot(prisma, { moduleId, versionRow, baseTemplateId = "modelobase1", locale = DEFAULT_LOCALE }) {
    const versionId = versionRow.id;

    const entities = await prisma.mdpEntity.findMany({
      where: {
        module_id: moduleId,
        lifecycle: "active",
        version_id: versionId,
        base_template_id: baseTemplateId,
        OR: [{ scope: "platform", cliente_id: null }],
      },
      include: {
        labels: { where: { locale } },
        capabilities: true,
        routes: { orderBy: { sort_order: "asc" } },
      },
      orderBy: { sort_order: "asc" },
    });

    const entityRowIds = entities.map((e) => e.id);

    const fields = entityRowIds.length
      ? await prisma.mdpField.findMany({
          where: {
            entity_row_id: { in: entityRowIds },
            lifecycle: "active",
            version_id: versionId,
            OR: [{ scope: "platform", cliente_id: null }],
          },
          include: {
            labels: { where: { locale } },
            options: { orderBy: { sort_order: "asc" } },
            entity: { select: { entity_id: true } },
          },
          orderBy: [{ sort_order: "asc" }, { field_name: "asc" }],
        })
      : [];

    const relationships = entityRowIds.length
      ? await prisma.mdpRelationship.findMany({
          where: {
            lifecycle: "active",
            version_id: versionId,
            base_template_id: baseTemplateId,
            OR: [
              { from_entity_row_id: { in: entityRowIds } },
              { to_entity_row_id: { in: entityRowIds } },
            ],
          },
          include: {
            from_entity: { select: { entity_id: true } },
            to_entity: { select: { entity_id: true } },
          },
          orderBy: { sort_order: "asc" },
        })
      : [];

    const registry = await prisma.mdpRegistryEntry.findMany({
      where: {
        module_id: moduleId,
        lifecycle: "active",
        version_id: versionId,
        base_template_id: baseTemplateId,
        status: "published",
        OR: [{ scope: "platform", cliente_id: null }],
      },
      include: {
        labels: { where: { locale } },
        bindings: { orderBy: { sort_order: "asc" } },
        entity: { select: { entity_id: true } },
      },
      orderBy: [{ sort_order: "asc" }, { entry_id: "asc" }],
    });

    const serializedEntities = entities.map(serializeEntity);
    const serializedFields = fields.map(serializeField);
    const serializedRelationships = relationships.map(serializeRelationship);
    const serializedRegistry = registry.map(serializeRegistryEntry);

    const parentRow = versionRow.parent_version_id
      ? await prisma.mdpDefinitionVersion.findUnique({
          where: { id: versionRow.parent_version_id },
        })
      : null;

    const dictionary = {
      entities: serializedEntities,
      fields: serializedFields,
      relationships: serializedRelationships,
      registry: serializedRegistry,
    };

    const dependencyGraph = buildDependencyGraph({
      entities: serializedEntities,
      fields: serializedFields,
      relationships: serializedRelationships,
      registry: serializedRegistry,
    });

    const versionGraph = buildVersionGraph(versionRow, parentRow);

    return {
      dictionary,
      dependencyGraph,
      versionGraph,
    };
  },

  async buildCrb(prisma, { moduleId, versionRow, baseTemplateId = "modelobase1", locale = DEFAULT_LOCALE }) {
    const { dictionary, dependencyGraph, versionGraph } = await this.compileModuleSnapshot(prisma, {
      moduleId,
      versionRow,
      baseTemplateId,
      locale,
    });

    const payload = {
      crbVersion: CRB_VERSION,
      moduleId,
      baseTemplateId,
      versionId: versionRow.id,
      semver: versionRow.semver,
      revision: versionRow.revision,
      status: versionRow.status,
      compiledAt: new Date().toISOString(),
      locale,
      ...dictionary,
      dependencyGraph,
      versionGraph,
      meta: {
        entityCount: dictionary.entities.length,
        fieldCount: dictionary.fields.length,
        relationshipCount: dictionary.relationships.length,
        registryCount: dictionary.registry.length,
        signatureReady: true,
      },
    };

    const contentHash = hashPayload(dictionary);
    const integrityHash = hashPayload(payload);

    return { payload, contentHash, integrityHash };
  },
};
