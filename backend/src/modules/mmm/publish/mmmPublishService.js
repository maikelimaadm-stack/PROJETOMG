import { mmmPublishRepository } from "./mmmPublishRepository.js";
import { runPublishPipeline, rollbackPublishedBundle } from "./mmmPublishPipeline.js";
import { verifySignature } from "./mmmPublishConstants.js";

const withStatus = (message, statusCode, code = "ERROR") => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  throw error;
};

const serializeDefinitionVersion = (row) => ({
  id: row.id,
  tenantId: row.tenant_id,
  moduleId: row.module_id,
  applicationId: row.application_id ?? undefined,
  semver: row.semver,
  revision: row.revision,
  status: row.status,
  pipelineVersion: row.pipeline_version,
  contentHash: row.content_hash,
  integrityHash: row.integrity_hash,
  signatureRef: row.signature_ref ?? undefined,
  objectCount: row.object_count,
  publishedAt: row.published_at?.toISOString(),
  publishedBy: row.published_by ?? undefined,
  bundles: (row.compiled_bundles ?? []).map((bundle) => ({
    bundleId: bundle.bundle_id,
    crbVersion: bundle.crb_version,
    contentHash: bundle.content_hash,
    integrityHash: bundle.integrity_hash,
    signatureRef: bundle.signature_ref ?? undefined,
  })),
});

export const mmmPublishService = {
  async publishScope(body, scope) {
    const tenantId = body.tenantId;
    if (tenantId !== scope.clienteId) {
      withStatus("tenantId forbidden for authenticated scope.", 403, "TENANT_FORBIDDEN");
    }
    if (!body.moduleId && !body.objectIds?.length) {
      withStatus("moduleId or objectIds required for publish scope.", 422, "VALIDATION_ERROR");
    }

    const actorId = scope.user?.login ?? scope.userId ?? null;
    const result = await runPublishPipeline({
      scope: {
        tenantId,
        moduleId: body.moduleId ?? "all",
        applicationId: body.applicationId,
        objectIds: body.objectIds,
        environment: body.environment,
      },
      clienteId: scope.clienteId,
      actorId,
      semver: body.semver,
      changelog: body.changelog,
      pinEnvironment: Boolean(body.environment),
    });

    return {
      accepted: true,
      status: "completed",
      ...result,
    };
  },

  async pinEnvironment(body, scope) {
    const tenantId = body.tenantId;
    if (tenantId !== scope.clienteId) withStatus("tenantId forbidden.", 403, "TENANT_FORBIDDEN");

    const version = await mmmPublishRepository.findVersionById(body.definitionVersionId);
    if (!version || version.cliente_id !== scope.clienteId) {
      withStatus("Definition version not found.", 404, "NOT_FOUND");
    }

    const bundle = version.compiled_bundles?.find((item) => item.module_id === body.moduleId);
    if (!bundle) withStatus("Compiled bundle not found for module.", 404, "BUNDLE_NOT_FOUND");

    const pin = await mmmPublishRepository.upsertEnvironmentPin({
      cliente_id: scope.clienteId,
      tenant_id: tenantId,
      module_id: body.moduleId,
      application_id: body.applicationId ?? null,
      environment: body.environment,
      base_template_id: body.baseTemplateId ?? version.base_template_id,
      definition_version_id: version.id,
      bundle_id: bundle.bundle_id,
      pinned_by: scope.user?.login ?? scope.userId ?? null,
    });

    return {
      environment: pin.environment,
      definitionVersionId: pin.definition_version_id,
      bundleId: pin.bundle_id,
      pinnedAt: pin.pinned_at.toISOString(),
    };
  },

  async rollback(body, scope) {
    const tenantId = body.tenantId;
    if (tenantId !== scope.clienteId) withStatus("tenantId forbidden.", 403, "TENANT_FORBIDDEN");

    return rollbackPublishedBundle({
      clienteId: scope.clienteId,
      tenantId,
      moduleId: body.moduleId,
      environment: body.environment,
      baseTemplateId: body.baseTemplateId,
      targetDefinitionVersionId: body.definitionVersionId,
      actorId: scope.user?.login ?? scope.userId ?? null,
    });
  },

  async listDefinitionVersions(query, scope) {
    const tenantId = query.tenantId ?? scope.clienteId;
    const { items, total } = await mmmPublishRepository.listVersions({
      clienteId: scope.clienteId,
      tenantId,
      moduleId: query.moduleId,
      skip: query.skip ?? 0,
      take: query.limit ?? 50,
    });
    return {
      items: items.map(serializeDefinitionVersion),
      total,
    };
  },

  async getBundle(bundleId, scope) {
    const prisma = (await import("../../../database/prismaClient.js")).getPrismaClient();
    const bundle = await prisma.mmmCompiledBundle.findUnique({ where: { bundle_id: bundleId } });
    if (!bundle || bundle.tenant_id !== scope.clienteId) {
      withStatus("Bundle not found.", 404, "NOT_FOUND");
    }
    const signatureValid = verifySignature(bundle.integrity_hash, bundle.signature_ref);
    return {
      bundleId: bundle.bundle_id,
      crbVersion: bundle.crb_version,
      contentHash: bundle.content_hash,
      integrityHash: bundle.integrity_hash,
      signatureRef: bundle.signature_ref,
      signatureValid,
      payload: bundle.payload,
    };
  },

  async getEnvironmentPin(query, scope) {
    const pin = await mmmPublishRepository.findEnvironmentPin({
      clienteId: scope.clienteId,
      tenantId: query.tenantId ?? scope.clienteId,
      moduleId: query.moduleId,
      environment: query.environment,
      baseTemplateId: query.baseTemplateId ?? "modelobase1",
    });
    if (!pin) withStatus("Environment pin not found.", 404, "NOT_FOUND");
    return {
      environment: pin.environment,
      moduleId: pin.module_id,
      definitionVersionId: pin.definition_version_id,
      bundleId: pin.bundle_id,
      pinnedAt: pin.pinned_at.toISOString(),
      pinnedBy: pin.pinned_by ?? undefined,
    };
  },
};
