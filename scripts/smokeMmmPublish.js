#!/usr/bin/env node
/**
 * Smoke test — MMM Publish Engine v2 (Program 4.04)
 */
import { PUBLISH_PHASES, signIntegrityHash, verifySignature } from "../backend/src/modules/mmm/publish/mmmPublishConstants.js";
import { normalizePublishGraph } from "../backend/src/modules/mmm/publish/mmmPublishNormalize.js";
import { compileRegistries, assembleCrb } from "../backend/src/modules/mmm/publish/mmmPublishCompile.js";

const sampleRows = [
  {
    object_id: "550e8400-e29b-41d4-a716-446655440010",
    object_type: "layout",
    tenant_id: "smoke-tenant",
    envelope_version: "mmm-envelope-v1",
    scope: { moduleId: "empresas" },
    status: "approved",
    payload: { code: "empresas_layout", routePath: "/empresas" },
    lineage: { source: "system" },
    dependencies: null,
    labels: [{ locale: "pt-BR", label: "Layout Empresas" }],
    revision: 1,
    content_hash: "hash1",
    module_id: "empresas",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    object_id: "550e8400-e29b-41d4-a716-446655440011",
    object_type: "field",
    tenant_id: "smoke-tenant",
    envelope_version: "mmm-envelope-v1",
    scope: { moduleId: "empresas" },
    status: "approved",
    payload: { code: "razao_social", dataType: "string" },
    lineage: { source: "system" },
    dependencies: null,
    labels: [{ locale: "pt-BR", label: "Razão Social" }],
    revision: 1,
    content_hash: "hash2",
    module_id: "empresas",
    created_at: new Date(),
    updated_at: new Date(),
  },
];

const run = async () => {
  console.log("MMM publish smoke — pipeline phases", PUBLISH_PHASES.join(", "));
  const normalized = normalizePublishGraph(sampleRows);
  console.log(`✓ Normalized ${normalized.objectCount} objects`);

  const { registries, routes } = compileRegistries(normalized.envelopes);
  console.log(`✓ Compiled registries layout=${Object.keys(registries.layout).length} routes=${routes.length}`);

  const integrityHash = "smoke-integrity";
  const signatureRef = signIntegrityHash(integrityHash);
  if (!verifySignature(integrityHash, signatureRef)) throw new Error("Signature verification failed");
  console.log("✓ Bundle signature round-trip");

  const crb = assembleCrb({
    tenantId: "smoke-tenant",
    moduleId: "empresas",
    baseTemplateId: "modelobase1",
    definitionVersionId: "dv-smoke",
    semver: "1.0.0",
    revision: 1,
    normalized,
    registries,
    routes,
    menu: [],
    contentHash: "smoke-content",
    integrityHash,
    signatureRef,
    compiledBy: "smoke",
  });
  console.log(`✓ CRB assembled crbVersion=${crb.crbVersion} objects=${crb.objects.length}`);
  console.log("\nMMM publish smoke PASSED");
};

run().catch((error) => {
  console.error("MMM publish smoke FAILED:", error);
  process.exit(1);
});
