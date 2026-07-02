import { collectScopeObjects, resolveDependencyClosure, markObjectsPublished } from "./mmmPublishCollect.js";
import { validatePublishScope } from "./mmmPublishValidate.js";
import { normalizePublishGraph } from "./mmmPublishNormalize.js";
import { compileRegistries, assembleCrb } from "./mmmPublishCompile.js";
import { invalidatePublishCache } from "./mmmPublishCache.js";
import { mmmPublishRepository } from "./mmmPublishRepository.js";
import {
  MMM_CRB_VERSION,
  MMM_PUBLISH_PIPELINE_VERSION,
  MMM_SNAPSHOT_VERSION,
  DEFAULT_BASE_TEMPLATE_ID,
  hashPayload,
  buildBundleId,
  buildPublishSnapshotId,
  signIntegrityHash,
  PUBLISH_PHASES,
} from "./mmmPublishConstants.js";

const phaseResult = (phase, ok, detail = {}) => ({ phase, ok, ...detail });

export const runPublishPipeline = async ({
  scope,
  clienteId,
  actorId,
  semver = "1.0.0",
  changelog,
  pinEnvironment = false,
}) => {
  const {
    tenantId,
    moduleId = "all",
    applicationId,
    objectIds,
    environment,
    baseTemplateId = DEFAULT_BASE_TEMPLATE_ID,
  } = scope;

  const phases = [];

  // C-1 Collect
  const collected = await collectScopeObjects({
    clienteId,
    tenantId,
    moduleId: moduleId === "all" ? undefined : moduleId,
    applicationId,
    objectIds,
  });
  if (!collected.length) {
    const error = new Error("No publishable objects found in scope.");
    error.code = "PUBLISH_SCOPE_EMPTY";
    error.statusCode = 422;
    throw error;
  }
  phases.push(phaseResult("C-1", true, { count: collected.length }));

  // C-2 Resolve
  const { objects, violations: brokenRefViolations } = resolveDependencyClosure(collected);
  phases.push(phaseResult("C-2", brokenRefViolations.length === 0, { refs: brokenRefViolations.length }));

  // C-3..C-6 Validate
  await validatePublishScope({ objects, tenantId, brokenRefViolations });
  phases.push(phaseResult("C-3", true));
  phases.push(phaseResult("C-4", true));
  phases.push(phaseResult("C-5", true));
  phases.push(phaseResult("C-6", true));

  // C-7 Normalize
  const normalized = normalizePublishGraph(objects);
  phases.push(phaseResult("C-7", true, { objectCount: normalized.objectCount }));

  // C-8 Hash
  const contentHash = hashPayload(normalized.envelopes);
  phases.push(phaseResult("C-8", true, { contentHash }));

  // C-9..C-12 Compile
  const { registries, routes, menu } = compileRegistries(normalized.envelopes);
  phases.push(phaseResult("C-9", true));
  phases.push(phaseResult("C-10", true, { routes: routes.length }));
  phases.push(phaseResult("C-11", true, { permissions: registries.permission }));
  phases.push(phaseResult("C-12", true, { templates: registries.baseTemplate }));

  const revision = await mmmPublishRepository.findNextRevision({ clienteId, tenantId, moduleId });
  const parentVersion = await mmmPublishRepository.findLatestPublished({ clienteId, tenantId, moduleId });

  const integrityBase = {
    contentHash,
    registries,
    routes,
    menu,
    pipelineVersion: MMM_PUBLISH_PIPELINE_VERSION,
    crbVersion: MMM_CRB_VERSION,
  };
  const integrityHash = hashPayload(integrityBase);

  // C-13 Assemble CRB (pre-sign)
  let crb = assembleCrb({
    tenantId,
    moduleId,
    baseTemplateId,
    definitionVersionId: "pending",
    semver,
    revision,
    normalized,
    registries,
    routes,
    menu,
    contentHash,
    integrityHash,
    signatureRef: null,
    compiledBy: actorId,
  });
  phases.push(phaseResult("C-13", true));

  // C-14 Sign
  const signatureRef = signIntegrityHash(integrityHash);
  crb = { ...crb, signatureRef, bundleId: null };
  phases.push(phaseResult("C-14", true, { signatureRef }));

  // C-15 Persist
  const definitionVersion = await mmmPublishRepository.createVersion({
    cliente_id: clienteId,
    tenant_id: tenantId,
    module_id: moduleId,
    application_id: applicationId ?? null,
    base_template_id: baseTemplateId,
    semver,
    revision,
    pipeline_version: MMM_PUBLISH_PIPELINE_VERSION,
    status: "published",
    content_hash: contentHash,
    integrity_hash: integrityHash,
    signature_ref: signatureRef,
    parent_version_id: parentVersion?.id ?? null,
    scope,
    object_count: normalized.objectCount,
    published_at: new Date(),
    published_by: actorId ?? null,
    changelog: changelog ?? `Publish via MMM pipeline ${MMM_PUBLISH_PIPELINE_VERSION}`,
  });

  const bundleId = buildBundleId({
    tenantId,
    moduleId,
    definitionVersionId: definitionVersion.id,
    baseTemplateId,
  });
  crb = { ...crb, definitionVersionId: definitionVersion.id, bundleId };

  const bundle = await mmmPublishRepository.upsertBundle({
    bundle_id: bundleId,
    definition_version_id: definitionVersion.id,
    tenant_id: tenantId,
    module_id: moduleId,
    base_template_id: baseTemplateId,
    crb_version: MMM_CRB_VERSION,
    content_hash: contentHash,
    integrity_hash: integrityHash,
    signature_ref: signatureRef,
    payload: crb,
  });

  const snapshotPayload = {
    snapshotVersion: MMM_SNAPSHOT_VERSION,
    definitionVersionId: definitionVersion.id,
    bundleId,
    objects: normalized.envelopes,
    registries,
    routes,
    integrityHash,
  };
  const snapshot = await mmmPublishRepository.createSnapshot({
    snapshot_id: buildPublishSnapshotId({
      moduleId,
      definitionVersionId: definitionVersion.id,
      snapshotType: "backup",
    }),
    definition_version_id: definitionVersion.id,
    tenant_id: tenantId,
    module_id: moduleId,
    snapshot_type: "backup",
    integrity_hash: hashPayload(snapshotPayload),
    payload: snapshotPayload,
    created_by: actorId ?? null,
  });

  await markObjectsPublished(objects, actorId);

  await mmmPublishRepository.createPublishLog({
    definition_version_id: definitionVersion.id,
    cliente_id: clienteId,
    tenant_id: tenantId,
    module_id: moduleId,
    action: "publish",
    from_version_id: parentVersion?.id ?? null,
    to_version_id: definitionVersion.id,
    environment: environment ?? null,
    metadata: { bundleId, snapshotId: snapshot.snapshot_id, phases: PUBLISH_PHASES },
    usuario_id: actorId ?? null,
  });

  let environmentPin = null;
  if (pinEnvironment && environment) {
    environmentPin = await mmmPublishRepository.upsertEnvironmentPin({
      cliente_id: clienteId,
      tenant_id: tenantId,
      module_id: moduleId,
      application_id: applicationId ?? null,
      environment,
      base_template_id: baseTemplateId,
      definition_version_id: definitionVersion.id,
      bundle_id: bundleId,
      pinned_by: actorId ?? null,
    });
    await mmmPublishRepository.createPublishLog({
      definition_version_id: definitionVersion.id,
      cliente_id: clienteId,
      tenant_id: tenantId,
      module_id: moduleId,
      action: "pin",
      to_version_id: definitionVersion.id,
      environment,
      metadata: { bundleId },
      usuario_id: actorId ?? null,
    });
  }

  phases.push(phaseResult("C-15", true, { definitionVersionId: definitionVersion.id, bundleId }));

  // C-16 Invalidate cache
  const cacheResult = await invalidatePublishCache({ tenantId, moduleId, environment });
  phases.push(phaseResult("C-16", true, cacheResult));

  return {
    definitionVersionId: definitionVersion.id,
    revision,
    semver,
    bundleId,
    contentHash,
    integrityHash,
    signatureRef,
    snapshotId: snapshot.snapshot_id,
    environmentPin: environmentPin
      ? {
          environment: environmentPin.environment,
          bundleId: environmentPin.bundle_id,
          pinnedAt: environmentPin.pinned_at.toISOString(),
        }
      : null,
    phases,
    objectCount: normalized.objectCount,
  };
};

export const rollbackPublishedBundle = async ({
  clienteId,
  tenantId,
  moduleId,
  environment,
  baseTemplateId = DEFAULT_BASE_TEMPLATE_ID,
  targetDefinitionVersionId,
  actorId,
}) => {
  const currentPin = await mmmPublishRepository.findEnvironmentPin({
    clienteId,
    tenantId,
    moduleId,
    environment,
    baseTemplateId,
  });
  if (!currentPin) {
    const error = new Error("No environment pin found for rollback.");
    error.statusCode = 404;
    error.code = "PIN_NOT_FOUND";
    throw error;
  }

  const targetVersion = targetDefinitionVersionId
    ? await mmmPublishRepository.findVersionById(targetDefinitionVersionId)
    : currentPin.definition_version?.parent_version ?? null;

  if (!targetVersion) {
    const error = new Error("Target definition version not found for rollback.");
    error.statusCode = 404;
    error.code = "VERSION_NOT_FOUND";
    throw error;
  }

  const targetBundle = targetVersion.compiled_bundles?.find(
    (item) => item.module_id === moduleId && item.base_template_id === baseTemplateId
  );
  if (!targetBundle) {
    const error = new Error("Target compiled bundle not found.");
    error.statusCode = 404;
    error.code = "BUNDLE_NOT_FOUND";
    throw error;
  }

  const pin = await mmmPublishRepository.upsertEnvironmentPin({
    cliente_id: clienteId,
    tenant_id: tenantId,
    module_id: moduleId,
    environment,
    base_template_id: baseTemplateId,
    definition_version_id: targetVersion.id,
    bundle_id: targetBundle.bundle_id,
    pinned_by: actorId ?? null,
  });

  await mmmPublishRepository.createPublishLog({
    definition_version_id: targetVersion.id,
    cliente_id: clienteId,
    tenant_id: tenantId,
    module_id: moduleId,
    action: "rollback",
    from_version_id: currentPin.definition_version_id,
    to_version_id: targetVersion.id,
    environment,
    metadata: { bundleId: targetBundle.bundle_id },
    usuario_id: actorId ?? null,
  });

  await invalidatePublishCache({ tenantId, moduleId, environment });

  return {
    environment,
    definitionVersionId: targetVersion.id,
    bundleId: targetBundle.bundle_id,
    signatureRef: targetBundle.signature_ref,
    pinnedAt: pin.pinned_at.toISOString(),
  };
};
