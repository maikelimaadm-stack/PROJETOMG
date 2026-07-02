import { getPrismaClient } from "../../../database/prismaClient.js";

export const mmmPublishRepository = {
  async findNextRevision({ clienteId, tenantId, moduleId }) {
    const prisma = getPrismaClient();
    const latest = await prisma.mmmDefinitionVersion.findFirst({
      where: { cliente_id: clienteId, tenant_id: tenantId, module_id: moduleId },
      orderBy: { revision: "desc" },
    });
    return (latest?.revision ?? 0) + 1;
  },

  async findLatestPublished({ clienteId, tenantId, moduleId }) {
    const prisma = getPrismaClient();
    return prisma.mmmDefinitionVersion.findFirst({
      where: {
        cliente_id: clienteId,
        tenant_id: tenantId,
        module_id: moduleId,
        status: "published",
      },
      orderBy: [{ revision: "desc" }, { published_at: "desc" }],
      include: { compiled_bundles: true },
    });
  },

  async findVersionById(id) {
    const prisma = getPrismaClient();
    return prisma.mmmDefinitionVersion.findUnique({
      where: { id },
      include: { compiled_bundles: true, parent_version: true },
    });
  },

  async createVersion(data) {
    const prisma = getPrismaClient();
    return prisma.mmmDefinitionVersion.create({ data });
  },

  async upsertBundle(data) {
    const prisma = getPrismaClient();
    return prisma.mmmCompiledBundle.upsert({
      where: {
        definition_version_id_module_id_base_template_id: {
          definition_version_id: data.definition_version_id,
          module_id: data.module_id,
          base_template_id: data.base_template_id,
        },
      },
      create: data,
      update: {
        bundle_id: data.bundle_id,
        content_hash: data.content_hash,
        integrity_hash: data.integrity_hash,
        signature_ref: data.signature_ref,
        payload: data.payload,
        crb_version: data.crb_version,
      },
    });
  },

  async findBundle({ definitionVersionId, moduleId, baseTemplateId }) {
    const prisma = getPrismaClient();
    return prisma.mmmCompiledBundle.findUnique({
      where: {
        definition_version_id_module_id_base_template_id: {
          definition_version_id: definitionVersionId,
          module_id: moduleId,
          base_template_id: baseTemplateId,
        },
      },
    });
  },

  async createSnapshot(data) {
    const prisma = getPrismaClient();
    return prisma.mmmPublishSnapshot.create({ data });
  },

  async upsertEnvironmentPin(data) {
    const prisma = getPrismaClient();
    return prisma.mmmEnvironmentPin.upsert({
      where: {
        cliente_id_tenant_id_module_id_environment_base_template_id: {
          cliente_id: data.cliente_id,
          tenant_id: data.tenant_id,
          module_id: data.module_id,
          environment: data.environment,
          base_template_id: data.base_template_id,
        },
      },
      create: data,
      update: {
        definition_version_id: data.definition_version_id,
        bundle_id: data.bundle_id,
        pinned_at: new Date(),
        pinned_by: data.pinned_by,
        application_id: data.application_id ?? null,
      },
    });
  },

  async findEnvironmentPin({ clienteId, tenantId, moduleId, environment, baseTemplateId }) {
    const prisma = getPrismaClient();
    return prisma.mmmEnvironmentPin.findUnique({
      where: {
        cliente_id_tenant_id_module_id_environment_base_template_id: {
          cliente_id: clienteId,
          tenant_id: tenantId,
          module_id: moduleId,
          environment,
          base_template_id: baseTemplateId,
        },
      },
      include: {
        definition_version: {
          include: {
            compiled_bundles: true,
            parent_version: { include: { compiled_bundles: true } },
          },
        },
      },
    });
  },

  async listVersions({ clienteId, tenantId, moduleId, skip = 0, take = 50 }) {
    const prisma = getPrismaClient();
    const where = {
      cliente_id: clienteId,
      tenant_id: tenantId,
      ...(moduleId ? { module_id: moduleId } : {}),
    };
    const [items, total] = await Promise.all([
      prisma.mmmDefinitionVersion.findMany({
        where,
        orderBy: [{ revision: "desc" }],
        skip,
        take,
        include: {
          compiled_bundles: {
            select: {
              id: true,
              bundle_id: true,
              content_hash: true,
              integrity_hash: true,
              signature_ref: true,
            },
          },
        },
      }),
      prisma.mmmDefinitionVersion.count({ where }),
    ]);
    return { items, total };
  },

  async createPublishLog(data) {
    const prisma = getPrismaClient();
    return prisma.mmmPublishLog.create({ data });
  },

  async listPublishLogs({ clienteId, moduleId, take = 50 }) {
    const prisma = getPrismaClient();
    return prisma.mmmPublishLog.findMany({
      where: { cliente_id: clienteId, ...(moduleId ? { module_id: moduleId } : {}) },
      orderBy: { created_at: "desc" },
      take,
    });
  },
};
