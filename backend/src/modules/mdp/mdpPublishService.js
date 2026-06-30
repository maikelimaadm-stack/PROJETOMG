import { auditService } from "../audit/auditService.js";
import { assertCadastroAdminRole } from "../auth/cadastroRbac.js";
import { getPrismaClient } from "../../database/prismaClient.js";
import { MDP_PLATFORM_VERSION_ID, DEFAULT_LOCALE } from "./mdpEntityConstants.js";
import { mdpCompileService } from "./mdpCompileService.js";
import {
  CRB_VERSION,
  SNAPSHOT_VERSION,
  buildBundleId,
  buildSnapshotId,
  hashPayload,
} from "./mdpPublishConstants.js";
import { mdpPublishRepository } from "./mdpPublishRepository.js";
import { mdpRegistryRepository } from "./mdpRegistryRepository.js";

const withStatus = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
};

const serializeVersion = (row) => ({
  id: row.id,
  clienteId: row.cliente_id,
  moduleId: row.module_id,
  baseTemplateId: row.base_template_id,
  semver: row.semver,
  revision: row.revision,
  status: row.status,
  publishedAt: row.published_at,
  publishedBy: row.published_by,
  parentVersionId: row.parent_version_id,
  integrityHash: row.integrity_hash,
  signatureRef: row.signature_ref,
  changelog: row.changelog,
  bundles: (row.compiled_bundles || []).map((b) => ({
    id: b.id,
    bundleId: b.bundle_id,
    contentHash: b.content_hash,
    integrityHash: b.integrity_hash,
  })),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const serializeBundle = (row) => ({
  id: row.id,
  bundleId: row.bundle_id,
  versionId: row.version_id,
  moduleId: row.module_id,
  baseTemplateId: row.base_template_id,
  crbVersion: row.crb_version,
  contentHash: row.content_hash,
  integrityHash: row.integrity_hash,
  payload: row.payload,
  createdAt: row.created_at,
});

const serializeSnapshotListItem = (row) => ({
  id: row.id,
  snapshotId: row.snapshot_id,
  versionId: row.version_id,
  moduleId: row.module_id,
  snapshotType: row.snapshot_type,
  integrityHash: row.integrity_hash,
  signatureRef: row.signature_ref,
  expiresAt: row.expires_at,
  createdAt: row.created_at,
});

export const mdpPublishService = {
  async listVersions(query, scope) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 50;
    const clienteId = query.scope === "platform" ? null : scope.clienteId;
    const { items, total } = await mdpPublishRepository.listVersions({
      moduleId: query.moduleId,
      clienteId,
      baseTemplateId: query.baseTemplateId,
      status: query.status,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return {
      items: items.map(serializeVersion),
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  },

  async getVersion(id) {
    const row = await mdpPublishRepository.findVersionById(id);
    if (!row) withStatus("Versão não encontrada.", 404);
    return serializeVersion(row);
  },

  async createDraft(payload, scope) {
    assertCadastroAdminRole(scope);
    const clienteId = payload.scope === "platform" ? null : scope.clienteId;
    const revision = await mdpPublishRepository.findNextRevision({
      moduleId: payload.moduleId,
      clienteId,
      baseTemplateId: payload.baseTemplateId ?? "modelobase1",
    });

    const created = await mdpPublishRepository.createVersion({
      cliente_id: clienteId,
      module_id: payload.moduleId,
      base_template_id: payload.baseTemplateId ?? "modelobase1",
      semver: payload.semver ?? "0.1.0",
      revision,
      status: "draft",
      changelog: payload.changelog ?? null,
      parent_version_id: payload.parentVersionId ?? null,
    });

    return serializeVersion(created);
  },

  async compile({ moduleId, versionId, baseTemplateId, locale, draft }, scope) {
    const prisma = getPrismaClient();
    const versionRow =
      (versionId && (await mdpPublishRepository.findVersionById(versionId))) ||
      (await mdpPublishRepository.findLatestPublished({
          moduleId,
          clienteId: null,
          baseTemplateId: baseTemplateId ?? "modelobase1",
        })) ||
      (await mdpPublishRepository.findVersionById(MDP_PLATFORM_VERSION_ID));

    if (!versionRow) withStatus("Versão para compilação não encontrada.", 404);
    if (!draft && versionRow.status !== "published") {
      withStatus("Apenas versões published podem ser compiladas para runtime.", 403);
    }

    const { payload, contentHash, integrityHash } = await mdpCompileService.buildCrb(prisma, {
      moduleId,
      versionRow,
      baseTemplateId: baseTemplateId ?? versionRow.base_template_id ?? "modelobase1",
      locale: locale ?? DEFAULT_LOCALE,
    });

    if (!draft) {
      const bundle = await mdpPublishRepository.upsertBundle({
        bundle_id: buildBundleId({
          moduleId,
          versionId: versionRow.id,
          baseTemplateId: baseTemplateId ?? versionRow.base_template_id ?? "modelobase1",
        }),
        version_id: versionRow.id,
        module_id: moduleId,
        base_template_id: baseTemplateId ?? versionRow.base_template_id ?? "modelobase1",
        crb_version: CRB_VERSION,
        content_hash: contentHash,
        integrity_hash: integrityHash,
        payload,
      });
      return serializeBundle(bundle);
    }

    return {
      versionId: versionRow.id,
      moduleId,
      contentHash,
      integrityHash,
      payload,
      draft: true,
    };
  },

  async publish(payload, scope) {
    assertCadastroAdminRole(scope);
    const prisma = getPrismaClient();
    const clienteId = payload.scope === "platform" ? null : scope.clienteId;

    let versionRow = payload.versionId
      ? await mdpPublishRepository.findVersionById(payload.versionId)
      : null;

    if (!versionRow && payload.scope === "platform") {
      versionRow = await mdpPublishRepository.findVersionById(MDP_PLATFORM_VERSION_ID);
    }

    if (versionRow && versionRow.status === "published") {
      const existingBundle = await mdpPublishRepository.findBundle({
        versionId: versionRow.id,
        moduleId: payload.moduleId,
        baseTemplateId: payload.baseTemplateId ?? versionRow.base_template_id ?? "modelobase1",
      });
      if (existingBundle) {
        withStatus("Versão já publicada com bundle existente.", 409);
      }
    }

    if (!versionRow) {
      const revision = await mdpPublishRepository.findNextRevision({
        moduleId: payload.moduleId,
        clienteId,
        baseTemplateId: payload.baseTemplateId ?? "modelobase1",
      });
      versionRow = await mdpPublishRepository.createVersion({
        cliente_id: clienteId,
        module_id: payload.moduleId,
        base_template_id: payload.baseTemplateId ?? "modelobase1",
        semver: payload.semver ?? "1.0.0",
        revision,
        status: "draft",
        changelog: payload.changelog ?? "Publish via MDP-5",
        parent_version_id: payload.parentVersionId ?? MDP_PLATFORM_VERSION_ID,
      });
    }

    const baseTemplateId = payload.baseTemplateId ?? versionRow.base_template_id ?? "modelobase1";
    const { payload: crbPayload, contentHash, integrityHash } = await mdpCompileService.buildCrb(
      prisma,
      { moduleId: payload.moduleId, versionRow, baseTemplateId }
    );

    const published = await mdpPublishRepository.updateVersion(versionRow.id, {
      status: "published",
      published_at: new Date(),
      published_by: scope.userId,
      integrity_hash: integrityHash,
      semver: payload.semver ?? versionRow.semver,
    });

    const bundle = await mdpPublishRepository.upsertBundle({
      bundle_id: buildBundleId({ moduleId: payload.moduleId, versionId: published.id, baseTemplateId }),
      version_id: published.id,
      module_id: payload.moduleId,
      base_template_id: baseTemplateId,
      crb_version: CRB_VERSION,
      content_hash: contentHash,
      integrity_hash: integrityHash,
      payload: crbPayload,
    });

    const snapshotPayload = {
      snapshotVersion: SNAPSHOT_VERSION,
      moduleId: payload.moduleId,
      versionId: published.id,
      semver: published.semver,
      revision: published.revision,
      dictionary: {
        entities: crbPayload.entities,
        fields: crbPayload.fields,
        relationships: crbPayload.relationships,
        registry: crbPayload.registry,
      },
      dependencyGraph: crbPayload.dependencyGraph,
      versionGraph: crbPayload.versionGraph,
      integrityHash,
    };

    const snapshot = await mdpPublishRepository.createSnapshot({
      snapshot_id: buildSnapshotId({
        moduleId: payload.moduleId,
        versionId: published.id,
        snapshotType: payload.snapshotType ?? "backup",
      }),
      version_id: published.id,
      module_id: payload.moduleId,
      snapshot_type: payload.snapshotType ?? "backup",
      integrity_hash: hashPayload(snapshotPayload),
      payload: snapshotPayload,
      created_by: scope.userId,
    });

    await mdpPublishRepository.createPublishLog({
      version_id: published.id,
      cliente_id: clienteId,
      module_id: payload.moduleId,
      action: "publish",
      to_version_id: published.id,
      usuario_id: scope.userId,
      metadata: { bundleId: bundle.bundle_id, snapshotId: snapshot.snapshot_id },
    });

    if (payload.environment) {
      await mdpPublishRepository.upsertEnvironmentPin({
        cliente_id: clienteId,
        module_id: payload.moduleId,
        environment: payload.environment,
        base_template_id: baseTemplateId,
        version_id: published.id,
        pinned_by: scope.userId,
      });
    }

    if (payload.pinEnvironments?.length) {
      for (const env of payload.pinEnvironments) {
        await mdpPublishRepository.upsertEnvironmentPin({
          cliente_id: clienteId,
          module_id: payload.moduleId,
          environment: env,
          base_template_id: baseTemplateId,
          version_id: published.id,
          pinned_by: scope.userId,
        });
      }
    }

    await auditService.log({
      scope,
      entityName: "MdpDefinitionVersion",
      entityId: published.id,
      action: "MDP_PUBLISH",
      payload: { moduleId: payload.moduleId, revision: published.revision },
    });

    return {
      version: serializeVersion({ ...published, compiled_bundles: [bundle] }),
      bundle: serializeBundle(bundle),
      snapshot: serializeSnapshotListItem(snapshot),
    };
  },

  async rollback(payload, scope) {
    assertCadastroAdminRole(scope);
    const prisma = getPrismaClient();
    const clienteId = payload.scope === "platform" ? null : scope.clienteId;

    const targetVersion = await mdpPublishRepository.findVersionById(payload.targetVersionId);
    if (!targetVersion || targetVersion.status !== "published") {
      withStatus("Versão alvo para rollback deve estar published.", 404);
    }

    const currentVersion = payload.currentVersionId
      ? await mdpPublishRepository.findVersionById(payload.currentVersionId)
      : await mdpPublishRepository.findLatestPublished({
          moduleId: payload.moduleId,
          clienteId,
          baseTemplateId: payload.baseTemplateId ?? "modelobase1",
        });

    if (currentVersion) {
      await mdpPublishRepository.updateVersion(currentVersion.id, { status: "rolled_back" });
    }

    const revision = await mdpPublishRepository.findNextRevision({
      moduleId: payload.moduleId,
      clienteId,
      baseTemplateId: payload.baseTemplateId ?? targetVersion.base_template_id,
    });

    const rollbackVersion = await mdpPublishRepository.createVersion({
      cliente_id: clienteId,
      module_id: payload.moduleId,
      base_template_id: payload.baseTemplateId ?? targetVersion.base_template_id,
      semver: targetVersion.semver,
      revision,
      status: "published",
      published_at: new Date(),
      published_by: scope.userId,
      parent_version_id: targetVersion.id,
      changelog: payload.changelog ?? `Rollback to ${targetVersion.semver} rev ${targetVersion.revision}`,
      integrity_hash: targetVersion.integrity_hash,
    });

    const baseTemplateId = payload.baseTemplateId ?? targetVersion.base_template_id ?? "modelobase1";
    let bundlePayload;
    let contentHash;
    let integrityHash;

    if (payload.partial?.entryTypes?.length || payload.partial?.registryEntryIds?.length) {
      const { payload: crb, contentHash: ch, integrityHash: ih } = await mdpCompileService.buildCrb(
        prisma,
        { moduleId: payload.moduleId, versionRow: targetVersion, baseTemplateId }
      );
      const filteredRegistry = crb.registry.filter((entry) => {
        if (payload.partial.registryEntryIds?.length) {
          return payload.partial.registryEntryIds.includes(entry.entryId);
        }
        if (payload.partial.entryTypes?.length) {
          return payload.partial.entryTypes.includes(entry.entryType);
        }
        return true;
      });
      bundlePayload = { ...crb, registry: filteredRegistry, partialRollback: payload.partial };
      contentHash = hashPayload({ ...crb, registry: filteredRegistry });
      integrityHash = hashPayload(bundlePayload);
    } else {
      const existingBundle = await mdpPublishRepository.findBundle({
        versionId: targetVersion.id,
        moduleId: payload.moduleId,
        baseTemplateId,
      });
      if (existingBundle) {
        bundlePayload = existingBundle.payload;
        contentHash = existingBundle.content_hash;
        integrityHash = existingBundle.integrity_hash;
      } else {
        const compiled = await mdpCompileService.buildCrb(prisma, {
          moduleId: payload.moduleId,
          versionRow: targetVersion,
          baseTemplateId,
        });
        bundlePayload = compiled.payload;
        contentHash = compiled.contentHash;
        integrityHash = compiled.integrityHash;
      }
    }

    const bundle = await mdpPublishRepository.upsertBundle({
      bundle_id: buildBundleId({
        moduleId: payload.moduleId,
        versionId: rollbackVersion.id,
        baseTemplateId,
      }),
      version_id: rollbackVersion.id,
      module_id: payload.moduleId,
      base_template_id: baseTemplateId,
      crb_version: CRB_VERSION,
      content_hash: contentHash,
      integrity_hash: integrityHash,
      payload: bundlePayload,
    });

    await mdpPublishRepository.createPublishLog({
      version_id: rollbackVersion.id,
      cliente_id: clienteId,
      module_id: payload.moduleId,
      action: payload.partial ? "partial_rollback" : "rollback",
      from_version_id: currentVersion?.id ?? null,
      to_version_id: targetVersion.id,
      scope: payload.partial ?? null,
      usuario_id: scope.userId,
      metadata: { bundleId: bundle.bundle_id },
    });

    if (payload.environment || payload.pinEnvironments?.length) {
      const envs = payload.pinEnvironments ?? (payload.environment ? [payload.environment] : []);
      for (const env of envs) {
        await mdpPublishRepository.upsertEnvironmentPin({
          cliente_id: clienteId,
          module_id: payload.moduleId,
          environment: env,
          base_template_id: baseTemplateId,
          version_id: rollbackVersion.id,
          pinned_by: scope.userId,
        });
      }
    }

    return {
      version: serializeVersion({ ...rollbackVersion, compiled_bundles: [bundle] }),
      bundle: serializeBundle(bundle),
      rolledBackFrom: currentVersion?.id ?? null,
      rolledBackTo: targetVersion.id,
    };
  },

  async listSnapshots(query) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 50;
    const { items, total } = await mdpPublishRepository.listSnapshots({
      moduleId: query.moduleId,
      versionId: query.versionId,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return {
      items: items.map(serializeSnapshotListItem),
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  },

  async getSnapshot(id) {
    const row = await mdpPublishRepository.findSnapshotById(id);
    if (!row) withStatus("Snapshot não encontrado.", 404);
    return {
      ...serializeSnapshotListItem(row),
      payload: row.payload,
    };
  },

  async createSnapshot(payload, scope) {
    assertCadastroAdminRole(scope);
    const prisma = getPrismaClient();
    const versionRow = await mdpPublishRepository.findVersionById(payload.versionId);
    if (!versionRow) withStatus("Versão não encontrada.", 404);

    const { payload: crbPayload, integrityHash } = await mdpCompileService.buildCrb(prisma, {
      moduleId: payload.moduleId,
      versionRow,
      baseTemplateId: payload.baseTemplateId ?? versionRow.base_template_id,
    });

    const snapshotPayload = {
      snapshotVersion: SNAPSHOT_VERSION,
      moduleId: payload.moduleId,
      versionId: versionRow.id,
      ...crbPayload,
    };

    const snapshot = await mdpPublishRepository.createSnapshot({
      snapshot_id: buildSnapshotId({
        moduleId: payload.moduleId,
        versionId: versionRow.id,
        snapshotType: payload.snapshotType,
      }),
      version_id: versionRow.id,
      module_id: payload.moduleId,
      snapshot_type: payload.snapshotType,
      integrity_hash: hashPayload(snapshotPayload),
      signature_ref: payload.signatureRef ?? null,
      payload: snapshotPayload,
      expires_at: payload.expiresAt ? new Date(payload.expiresAt) : null,
      created_by: scope.userId,
    });

    return serializeSnapshotListItem(snapshot);
  },

  async pinEnvironment(payload, scope) {
    assertCadastroAdminRole(scope);
    const clienteId = payload.scope === "platform" ? null : scope.clienteId;
    const versionRow = await mdpPublishRepository.findVersionById(payload.versionId);
    if (!versionRow || versionRow.status !== "published") {
      withStatus("Apenas versões published podem ser pinadas.", 404);
    }

    const pin = await mdpPublishRepository.upsertEnvironmentPin({
      cliente_id: clienteId,
      module_id: payload.moduleId,
      environment: payload.environment,
      base_template_id: payload.baseTemplateId ?? "modelobase1",
      version_id: payload.versionId,
      pinned_by: scope.userId,
    });

    await mdpPublishRepository.createPublishLog({
      version_id: payload.versionId,
      cliente_id: clienteId,
      module_id: payload.moduleId,
      action: "deploy",
      usuario_id: scope.userId,
      metadata: { environment: payload.environment },
    });

    return pin;
  },

  async listEnvironmentPins(query, scope) {
    const clienteId = query.scope === "platform" ? null : scope.clienteId;
    const pins = await mdpPublishRepository.listEnvironmentPins({
      moduleId: query.moduleId,
      clienteId,
    });
    return pins.map((pin) => ({
      id: pin.id,
      moduleId: pin.module_id,
      environment: pin.environment,
      baseTemplateId: pin.base_template_id,
      versionId: pin.version_id,
      version: pin.version
        ? {
            semver: pin.version.semver,
            revision: pin.version.revision,
            status: pin.version.status,
            publishedAt: pin.version.published_at,
          }
        : null,
      pinnedAt: pin.pinned_at,
      pinnedBy: pin.pinned_by,
    }));
  },

  async introspect(query, scope) {
    const prisma = getPrismaClient();
    const moduleId = query.moduleId;
    const baseTemplateId = query.baseTemplateId ?? "modelobase1";
    const locale = query.locale ?? DEFAULT_LOCALE;
    const environment = query.environment ?? "production";

    const pin = moduleId
      ? await mdpPublishRepository.findEnvironmentPin({
          moduleId,
          environment,
          clienteId: query.scope === "platform" ? null : scope.clienteId,
          baseTemplateId,
        })
      : null;

    const versionRow =
      (query.versionId && (await mdpPublishRepository.findVersionById(query.versionId))) ||
      pin?.version ||
      (await mdpPublishRepository.findLatestPublished({
        moduleId,
        clienteId: null,
        baseTemplateId,
      })) ||
      (await mdpPublishRepository.findVersionById(MDP_PLATFORM_VERSION_ID));

    if (!versionRow) withStatus("Nenhuma versão disponível para introspect.", 404);

    const bundle = versionRow
      ? await mdpPublishRepository.findBundle({
          versionId: versionRow.id,
          moduleId,
          baseTemplateId,
        })
      : null;

    const [schemas, registryIntrospect] = await Promise.all([
      mdpRegistryRepository.listSchemas(),
      moduleId
        ? mdpRegistryRepository.countByType({ clienteId: scope.clienteId, moduleId })
        : Promise.resolve([]),
    ]);

    const summary = bundle?.payload ?? null;

    return {
      version: "mdp-introspect-v1",
      moduleId,
      baseTemplateId,
      locale,
      environment,
      pinnedVersion: pin
        ? { versionId: pin.version_id, environment: pin.environment }
        : null,
      versionInfo: {
        versionId: versionRow.id,
        semver: versionRow.semver,
        revision: versionRow.revision,
        status: versionRow.status,
        integrityHash: versionRow.integrity_hash,
      },
      entities: summary?.entities ?? [],
      fields: summary?.fields ?? [],
      relationships: summary?.relationships ?? [],
      registryEntries: summary?.registry ?? [],
      dependencyGraph: summary?.dependencyGraph ?? { nodes: [], edges: [] },
      versionGraph: summary?.versionGraph ?? null,
      templates: (summary?.registry ?? []).filter((e) =>
        ["base_template", "template"].includes(e.entryType)
      ),
      capabilities: summary?.entities?.map((e) => e.capabilities).filter(Boolean) ?? [],
      registrySchemas: schemas.map((s) => ({
        entryType: s.entry_type,
        schemaVersion: s.schema_version,
      })),
      registryCounts: registryIntrospect,
      bundleIntegrityHash: bundle?.integrity_hash ?? null,
      introspectedAt: new Date().toISOString(),
    };
  },
};
