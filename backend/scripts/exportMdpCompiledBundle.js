import { CRB_VERSION } from "../src/modules/mdp/mdpPublishConstants.js";

export const exportMdpCompiledBundle = async (prisma, { moduleId = "empresas", baseTemplateId = "modelobase1" } = {}) => {
  const bundle = await prisma.mdpCompiledBundle.findFirst({
    where: { module_id: moduleId, base_template_id: baseTemplateId },
    orderBy: { created_at: "desc" },
    include: {
      version: {
        select: {
          id: true,
          semver: true,
          revision: true,
          status: true,
          integrity_hash: true,
        },
      },
    },
  });

  if (!bundle) {
    return {
      exportedAt: new Date().toISOString(),
      version: "mdp-compiled-bundle-v1",
      moduleId,
      baseTemplateId,
      bundleCount: 0,
      bundle: null,
    };
  }

  return {
    exportedAt: new Date().toISOString(),
    version: "mdp-compiled-bundle-v1",
    crbVersion: CRB_VERSION,
    moduleId: bundle.module_id,
    baseTemplateId: bundle.base_template_id,
    bundleCount: 1,
    bundleId: bundle.bundle_id,
    versionId: bundle.version_id,
    contentHash: bundle.content_hash,
    integrityHash: bundle.integrity_hash,
    semver: bundle.version?.semver,
    revision: bundle.version?.revision,
    entityCount: bundle.payload?.meta?.entityCount ?? bundle.payload?.entities?.length ?? 0,
    fieldCount: bundle.payload?.meta?.fieldCount ?? bundle.payload?.fields?.length ?? 0,
    relationshipCount:
      bundle.payload?.meta?.relationshipCount ?? bundle.payload?.relationships?.length ?? 0,
    registryCount: bundle.payload?.meta?.registryCount ?? bundle.payload?.registry?.length ?? 0,
    hasDependencyGraph: Boolean(bundle.payload?.dependencyGraph?.nodes?.length),
    hasVersionGraph: Boolean(bundle.payload?.versionGraph?.versionId),
  };
};
