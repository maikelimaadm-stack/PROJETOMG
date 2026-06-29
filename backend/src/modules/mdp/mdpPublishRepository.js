import { getPrismaClient } from "../../database/prismaClient.js";

export const mdpPublishRepository = {
  async findVersionById(id) {
    const prisma = getPrismaClient();
    return prisma.mdpDefinitionVersion.findUnique({
      where: { id },
      include: { parent_version: true },
    });
  },

  async findLatestPublished({ moduleId, clienteId = null, baseTemplateId = "modelobase1" }) {
    const prisma = getPrismaClient();
    return prisma.mdpDefinitionVersion.findFirst({
      where: {
        module_id: moduleId,
        cliente_id: clienteId,
        base_template_id: baseTemplateId,
        status: "published",
      },
      orderBy: [{ revision: "desc" }, { published_at: "desc" }],
    });
  },

  async findNextRevision({ moduleId, clienteId = null, baseTemplateId = "modelobase1" }) {
    const prisma = getPrismaClient();
    const latest = await prisma.mdpDefinitionVersion.findFirst({
      where: { module_id: moduleId, cliente_id: clienteId, base_template_id: baseTemplateId },
      orderBy: { revision: "desc" },
    });
    return (latest?.revision ?? 0) + 1;
  },

  async listVersions({ moduleId, clienteId, baseTemplateId, status, skip = 0, take = 50 }) {
    const prisma = getPrismaClient();
    const where = {
      module_id: moduleId,
      ...(clienteId !== undefined ? { cliente_id: clienteId } : {}),
      ...(baseTemplateId ? { base_template_id: baseTemplateId } : {}),
      ...(status ? { status } : {}),
    };
    const [items, total] = await Promise.all([
      prisma.mdpDefinitionVersion.findMany({
        where,
        orderBy: [{ revision: "desc" }, { created_at: "desc" }],
        skip,
        take,
        include: {
          compiled_bundles: { select: { id: true, bundle_id: true, content_hash: true, integrity_hash: true } },
        },
      }),
      prisma.mdpDefinitionVersion.count({ where }),
    ]);
    return { items, total };
  },

  async createVersion(data) {
    const prisma = getPrismaClient();
    return prisma.mdpDefinitionVersion.create({ data });
  },

  async updateVersion(id, data) {
    const prisma = getPrismaClient();
    return prisma.mdpDefinitionVersion.update({ where: { id }, data });
  },

  async upsertBundle(data) {
    const prisma = getPrismaClient();
    return prisma.mdpCompiledBundle.upsert({
      where: {
        version_id_module_id_base_template_id: {
          version_id: data.version_id,
          module_id: data.module_id,
          base_template_id: data.base_template_id,
        },
      },
      create: data,
      update: {
        bundle_id: data.bundle_id,
        content_hash: data.content_hash,
        integrity_hash: data.integrity_hash,
        payload: data.payload,
        crb_version: data.crb_version,
      },
    });
  },

  async findBundle({ versionId, moduleId, baseTemplateId = "modelobase1" }) {
    const prisma = getPrismaClient();
    return prisma.mdpCompiledBundle.findUnique({
      where: {
        version_id_module_id_base_template_id: {
          version_id: versionId,
          module_id: moduleId,
          base_template_id: baseTemplateId,
        },
      },
    });
  },

  async createSnapshot(data) {
    const prisma = getPrismaClient();
    return prisma.mdpSnapshot.create({ data });
  },

  async listSnapshots({ moduleId, versionId, skip = 0, take = 50 }) {
    const prisma = getPrismaClient();
    const where = {
      module_id: moduleId,
      ...(versionId ? { version_id: versionId } : {}),
    };
    const [items, total] = await Promise.all([
      prisma.mdpSnapshot.findMany({
        where,
        orderBy: { created_at: "desc" },
        skip,
        take,
      }),
      prisma.mdpSnapshot.count({ where }),
    ]);
    return { items, total };
  },

  async findSnapshotById(id) {
    const prisma = getPrismaClient();
    return prisma.mdpSnapshot.findUnique({ where: { id } });
  },

  async createPublishLog(data) {
    const prisma = getPrismaClient();
    return prisma.mdpPublishLog.create({ data });
  },

  async upsertEnvironmentPin(data) {
    const prisma = getPrismaClient();
    return prisma.mdpEnvironmentPin.upsert({
      where: {
        cliente_id_module_id_environment_base_template_id: {
          cliente_id: data.cliente_id,
          module_id: data.module_id,
          environment: data.environment,
          base_template_id: data.base_template_id,
        },
      },
      create: data,
      update: {
        version_id: data.version_id,
        pinned_at: new Date(),
        pinned_by: data.pinned_by,
      },
    });
  },

  async listEnvironmentPins({ moduleId, clienteId }) {
    const prisma = getPrismaClient();
    return prisma.mdpEnvironmentPin.findMany({
      where: {
        module_id: moduleId,
        ...(clienteId !== undefined ? { cliente_id: clienteId } : {}),
      },
      orderBy: [{ environment: "asc" }, { base_template_id: "asc" }],
      include: {
        version: {
          select: { id: true, semver: true, revision: true, status: true, published_at: true },
        },
      },
    });
  },

  async findEnvironmentPin({ moduleId, environment, clienteId = null, baseTemplateId = "modelobase1" }) {
    const prisma = getPrismaClient();
    return prisma.mdpEnvironmentPin.findUnique({
      where: {
        cliente_id_module_id_environment_base_template_id: {
          cliente_id: clienteId,
          module_id: moduleId,
          environment,
          base_template_id: baseTemplateId,
        },
      },
      include: { version: true },
    });
  },
};
